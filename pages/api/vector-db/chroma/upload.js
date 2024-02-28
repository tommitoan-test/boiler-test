import multer from "multer";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Chroma } from "langchain/vectorstores/chroma";
import { Document } from "langchain/document";
import fs from "fs";
import CHROMA_DB_COLLECTION_NAME from "@/config/chromaDbCollectionConfig";

const upload = multer({ dest: "uploads/" });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  upload.single("pdfFile")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfFilePath = req.file.path;
    const { appId, uploadId, filename } = req.body;

    try {
      // Load the document
      const loader = new PDFLoader(pdfFilePath);
      const docs = await loader.load();

      // Split the text into chunks for embedding and vector storage
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 0,
      });
      const splitResult = await textSplitter.splitDocuments(docs);

      const embeddings = new OpenAIEmbeddings();

      // Prepare documents with additional metadata for Chroma
      const documents = splitResult.map((doc) => {
        return new Document({
          metadata: {
            ...doc.metadata,
            appId: appId,
            uploadId: uploadId,
            filename: filename,
          },
          pageContent: doc.pageContent,
        });
      });

      // Embed and store the PDF documents in Chroma
      const vectorStore = await Chroma.fromDocuments(documents, embeddings, {
        collectionName: CHROMA_DB_COLLECTION_NAME,
      });

      // Delete the file from the /uploads folder
      fs.unlink(pdfFilePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });

      res.status(200).json({ message: "PDF file processed successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  });
};
