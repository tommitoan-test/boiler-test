import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Chroma } from "langchain/vectorstores/chroma";
import { AIMessage, HumanMessage } from "langchain/schema";
import { makeChain } from "../../../../lib/makeChain";
import CHROMA_DB_COLLECTION_NAME from "@/config/chromaDbCollectionConfig";

export default async (req, res) => {
  const { question, history, appId } = req.body;

  if (!question) {
    return res.status(400).json({ message: "Question is required" });
  }

  const sanitizedQuestion = question.trim().replaceAll("\n", " ");

  try {
    const vectorStore = await Chroma.fromExistingCollection(
      new OpenAIEmbeddings({}),
      {
        collectionName: CHROMA_DB_COLLECTION_NAME,
      }
    );

    // create chain
    const chain = makeChain(vectorStore);

    const pastMessages = history.map((message, i) => {
      if (i % 2 === 0) {
        return new HumanMessage(message);
      } else {
        return new AIMessage(message);
      }
    });

    // Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: pastMessages,
    });

    res.status(200).json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
};
