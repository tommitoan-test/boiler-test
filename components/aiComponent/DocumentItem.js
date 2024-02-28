import React, { useState } from "react";
import { IoMdTrash } from "react-icons/io";
import Router from "next/router";

const DocumentItem = ({ content }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id, uploadId) => {
    setIsDeleting(true);

    const vecDelete = await fetch(
      `/api/vector-db/pinecone/vectorDelete?uploadId=${uploadId}`,
      { method: "DELETE" }
    );

    if (vecDelete.ok) {
      const response = await fetch(
        `/api/db/my-documents/delete-document?id=${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setIsDeleting(false);

      if (response.ok) {
        Router.reload();
      }
    } else {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <span>{content.fileName ? content.fileName : content.uploadId}</span>
      <button
        className="text-red-500 hover:text-red-600"
        onClick={() => handleDelete(content.id, content.uploadId)}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : <IoMdTrash className="mr-2" />}
      </button>
    </div>
  );
};

export default DocumentItem;
