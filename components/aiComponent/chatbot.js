import { useState, useEffect, useRef } from "react";

const Chatbot = ({}) => {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    const savedChatHistory = localStorage.getItem("nextjs-ai-boilerplate");
    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory));
    }
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  async function chatNow(query) {
    if (query.trim() === "") {
      return;
    }

    setQuery("");

    // Add user's query and an initial response entry to the chat history
    setChatHistory((prevChatHistory) => [
      ...prevChatHistory,
      { text: query, sender: "user" },
      { text: "", sender: "bot" },
    ]);

    try {
      const isStream = true; //change this value based on your need
      if (isStream) {
        await streamChat();
      } else {
        await nonStreamChat(chatHistory);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }

  const streamChat = async () => {
    const response = await fetch("/api/chat/chat-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: query,
        history: chatHistory.map((message) => message.text),
      }),
    });

    const body = response.body;
    if (!body) return;

    const reader = body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const newChunk = Buffer.from(value).toString("utf-8");

      // Introduce a slight delay for each chunk
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Update the chat history with the new chunk using a state updater function
      setChatHistory((prevChatHistory) => {
        const lastIndex = prevChatHistory.length - 1;
        const updatedChatHistory = [...prevChatHistory];
        const currentText = updatedChatHistory[lastIndex].text;
        updatedChatHistory[lastIndex] = {
          ...updatedChatHistory[lastIndex],
          text: currentText + newChunk,
        };
        return updatedChatHistory;
      });
    }

    // Update local storage after the entire stream is processed
    setChatHistory((prevChatHistory) => {
      localStorage.setItem(
        "nextjs-ai-boilerplate",
        JSON.stringify(prevChatHistory)
      );
      return prevChatHistory;
    });
  };

  const nonStreamChat = async (newChatHistory) => {
    try {
      const response = await fetch("/api/chat/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: query,
          history: chatHistory.map((message) => message.text),
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        const updatedChatHistory = newChatHistory.slice(0, -1); // Remove the last "loading" message
        updatedChatHistory.push({ text: responseData.text, sender: "bot" });
        setChatHistory(updatedChatHistory);
        localStorage.setItem(
          "nextjs-ai-boilerplate",
          JSON.stringify(updatedChatHistory)
        );
      } else {
        console.error("Error:", responseData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="card w-full lg:w-3/5 p-4 my-4 bg-white rounded-lg border border-slate-500 relative z-10 h-5/6">
        <p className="text-xl">Chat with Document</p>
        <div className="mt-2"></div>

        <div className="flex flex-col" style={{ height: "65vh" }}>
          <div
            ref={chatHistoryRef}
            className="chat-history mt-4 overflow-y-auto flex-grow flex flex-col"
            style={{ maxHeight: "calc(80vh - 150px)" }}
          >
            {chatHistory.map(
              (message, index) =>
                message.text && (
                  <div
                    key={index}
                    className={`chat-bubble text-sm py-2 px-4 rounded-md mb-2 mr-4 ${
                      message.sender === "user"
                        ? "bg-gray-200 self-end"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                )
            )}
          </div>

          <div className="flex mt-1 space-x-2">
            <input
              id="query"
              type="text"
              className="flex-grow p-2 border border-gray-300 rounded-l-md text-sm"
              placeholder="type your query"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              required
              autoComplete="off"
              style={{ height: "2.5rem" }}
            />

            <div className="mt-0 ml-2 lg:mt-0">
              <div
                onClick={() => chatNow(query)}
                className={`relative flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 
          before:rounded-full before:bg-blue-600 before:transition before:duration-300 hover:before:scale-105 
          active:duration-75 active:before:scale-95 sm:w-max cursor-pointer`}
              >
                <span className="relative text-sm font-semibold text-white">
                  Send
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
