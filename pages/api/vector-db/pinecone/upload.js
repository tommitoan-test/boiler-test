import multer from "multer";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/document";

const upload = multer({ dest: "uploads/" });
const maxFiles = 10; // Maximum number of files

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const pineconeClient = new PineconeClient();
    await pineconeClient.init({
      environment: process.env.PINECONE_ENVIRONMENT,
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = process.env.VECTOR_DB_INDEX_NAME;

    try {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const uploadId = req.body[`uploadId${i}`];
        const filename = req.body[`filename${i}`];

        let loader;
        switch (file.mimetype) {
          case "application/pdf":
            loader = new PDFLoader(file.path);
            break;
          case "text/plain":
            loader = new TextLoader(file.path);
            break;
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            loader = new DocxLoader(file.path);
            break;
          case "text/csv":
            loader = new CSVLoader(file.path);
            break;
          case "application/json":
            loader = new JSONLoader(file.path);
            break;
          default:
            continue; // Skip unsupported file types
        }

        const docs = await loader.load();

        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 500,
          chunkOverlap: 0,
        });
        const splitResult = await textSplitter.splitDocuments(docs);

        const embeddings = new OpenAIEmbeddings();
        const index = pineconeClient.Index(indexName);

        const documents = splitResult.map((doc) => {
          return new Document({
            metadata: {
              ...doc.metadata,
              appId: req.body.appId, // Assuming appId is sent in the body
              uploadId: uploadId,
              filename: filename,
            },
            pageContent: doc.pageContent,
          });
        });

        await PineconeStore.fromDocuments(documents, embeddings, {
          pineconeIndex: index,
          textKey: "text",
        });

        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
      }

      res.status(200).json({ message: "Files processed successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  });
};
