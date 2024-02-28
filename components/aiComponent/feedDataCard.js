import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useRef } from "react";
import DocumentItem from "./DocumentItem";

const FeedDataCard = ({}) => {
  const [statusMsg, setStatusMsg] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [appContent, setAppContent] = useState([]);
  const [reload, setReload] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsDataLoading(true);
    const fetchContentEntries = async () => {
      setIsDataLoading(true);
      const response = await fetch(`/api/db/my-documents/get-all-documents`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const appContent = await response.json();

      console.log(response);
      setAppContent(appContent);
      setIsDataLoading(false);
    };

    fetchContentEntries();
  }, [reload]);

  const handleFileChange = async (event) => {
    setStatusMsg("Uploading & Processing files...");
    const files = Array.from(event.target.files); // Convert FileList to array
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`file${index}`, file);

      const appContentEntry = {
        uploadId: uuidv4(),
        fileName: file.name,
        createdAt: new Date(),
      };

      console.log(appContentEntry);
      formData.append(`uploadId${index}`, appContentEntry.uploadId);
      formData.append(`filename${index}`, appContentEntry.fileName);
    });

    try {
      const response = await fetch("/api/vector-db/pinecone/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);

      files.forEach(async (file) => {
        console.log(file.name);
        await createContentEntry({
          uploadId: uuidv4(),
          fileName: file.name,
          createdAt: new Date(),
        });
      });

      setStatusMsg("Files Processed");
      setReload(!reload);
      fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  async function createContentEntry(appContent) {
    const response = await fetch("/api/db/my-documents/create-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appContent),
    });

    console.log(response);
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className="card w-4/5 p-8 my-4 bg-white rounded-lg shadow-md 
    relative z-10 border border-gray-200"
      >
        <p className="text-xl">Upload Documents Here</p>
        <div className="mt-4">
          <label htmlFor="appTitle" className="text-xs font-bold">
            Supported Files (.pdf, .txt, .docx, .csv, .json), Select single or
            multiple files
          </label>
          <form>
            <input
              type="file"
              accept=".pdf, .txt, .docx, .csv, .json"
              onChange={handleFileChange}
              ref={fileInputRef}
              multiple
            />
          </form>
        </div>

        <div className="py-2">
          {isDataLoading ? (
            <>
              <p>Loading App Content...</p>
            </>
          ) : null}
          {appContent.map((content, index) => (
            <DocumentItem key={index} content={content} />
          ))}
        </div>

        <div className="flex justify-end mt-4 space-x-2"></div>
        <div className="text-sm mt-2">{statusMsg}</div>
      </div>
    </div>
  );
};

export default FeedDataCard;
