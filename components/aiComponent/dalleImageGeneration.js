import React, { useState } from "react";

const DalleImageGeneration = () => {
  const [inputValue, setInputValue] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateImage = async () => {
    setLoading(true);
    const requestBody = {
      model: "dall-e-3",
      prompt: inputValue,
      n: 1,
      size: "1024x1024",
    };

    try {
      const response = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setImageUrl(data.data[0].url);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. See console for more details. "+ error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <div className="flex-1 p-4">
        <h2 className="text-xl font-semibold mb-3">
          Generate Image with Dalle3
        </h2>
        <input
          type="text"
          className="border border-gray-300 rounded p-2 mb-3 w-full"
          placeholder="Enter description for image"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white rounded px-4 py-2"
          onClick={handleGenerateImage}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      <div className="flex-1 p-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Generated from Dalle3"
            className="max-w-full h-auto rounded"
          />
        )}
      </div>
    </div>
  );
};

export default DalleImageGeneration;
