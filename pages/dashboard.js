import React, { useState } from "react";
import LandingLayout from "@/components/landingPage/landingLayout";
import LandingHeader from "@/components/landingPage/landingHeader";
import SEO from "@/components/additional/seo";
import DashboardHero from "@/components/dashboard/DashboardHero";
import FeedDataCard from "@/components/aiComponent/feedDataCard";
import Chatbot from "@/components/aiComponent/chatbot";
import DalleImageGeneration from "@/components/aiComponent/dalleImageGeneration";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <>
      <LandingLayout>
        <SEO />
        <LandingHeader />
        <main className="space-y-10 mb-10">
          <DashboardHero />

          <div className="flex justify-center gap-4 mb-5">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                activeTab === "feed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("feed")}
            >
              Load data using Langchain
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                activeTab === "chat"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              Chat with the loaded data
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                activeTab === "image-gen"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab("image-gen")}
            >
              Image generation with Dalle-3
            </button>
          </div>

          <div className="bg-white rounded-lg px-6 py-2">
            {activeTab === "feed" && <FeedDataCard />}
            {activeTab === "chat" && <Chatbot />}
            {activeTab === "image-gen" && <DalleImageGeneration />}
          </div>
        </main>
      </LandingLayout>
    </>
  );
}
