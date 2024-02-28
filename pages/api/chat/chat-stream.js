import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { AIMessage, HumanMessage } from "langchain/schema";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";

//If you are deploying on Verce, we need to have edge APIs to support streaming.
//If not deploying on Vercel, you can ignore this variable 'runtime'
export const runtime = "edge"; 

export default async (req, res) => {
  const { question, history, appId } = await req.json();

  if (!question) {
    return res.status(400).json({ message: "Question is required" });
  }

  const sanitizedQuestion = question.trim().replaceAll("\n", " ");

  const { stream, handlers } = LangChainStream();

  const pineconeClient = new PineconeClient();
  await pineconeClient.init({
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pineconeClient.Index(process.env.VECTOR_DB_INDEX_NAME);

  /* create vectorstore */
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}),
    {
      pineconeIndex: index,
      textKey: "text",
      //namespace: your_name_space,
    }
  );

  const llm = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: "gpt-3.5-turbo", //change this to gpt-4 if you have access
    streaming: true,
  });

  const questionModel = new ChatOpenAI({});

  const chain = ConversationalRetrievalQAChain.fromLLM(
    llm,
    vectorStore.asRetriever(),
    {
      verbose: true,
      questionGeneratorChainOptions: {
        llm: questionModel,
      },
    }
  );

  const pastMessages = history.map((message, i) => {
    if (i % 2 === 0) {
      return new HumanMessage(message);
    } else {
      return new AIMessage(message);
    }
  });

  chain
    .call(
      {
        question: sanitizedQuestion,
        chat_history: pastMessages,
      },
      [handlers]
    )
    .catch((e) => {
      console.error(e.message);
    });

  return new StreamingTextResponse(stream);
};
