import CHROMA_DB_COLLECTION_NAME from "@/config/chromaDbCollectionConfig";
import { Chroma } from "langchain/vectorstores/chroma";

export default async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).end();
  }

  const { uploadId } = req.query;
  if (!uploadId) {
    return res.status(400).json({ message: "uploadId is required" });
  }

  try {
    const embeddings = new OpenAIEmbeddings();
    const chromaClient = new Chroma(embeddings, {
      collectionName: CHROMA_DB_COLLECTION_NAME,
    });

    // Delete vectors based on the filter criteria
    await chromaClient.delete({
      filter: { uploadId: uploadId },
    });

    return res.status(200).json({ message: "Vector deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
