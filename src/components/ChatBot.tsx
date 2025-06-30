import React, { useState, useEffect } from "react";
import { Database, Zap } from "lucide-react";

const ChatBot: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => setIsVoiceAvailable(true))
        .catch(() => setIsVoiceAvailable(false));
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="text-center pt-8 pb-12">
        <h1 className="text-3xl font-bold mb-8">
          Your Intelligent Business Companion with Voice Capabilities
        </h1>

        {/* Status badges */}
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-purple-500/20">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300">
              Powered by Gemini & Eleven Labs
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-green-500/20">
            <Database className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Connected to TechStartup Inc</span>
          </div>
        </div>
      </div>

      {/* Spline Scene Container */}
      <div className="flex-1 flex justify-center items-center">
        <div className="w-[400px] h-[400px] relative">
          <spline-viewer
            url="https://prod.spline.design/r9k4d9I6eMZdr-V0/scene.splinecode"
            class="w-full h-full"
          ></spline-viewer>

          {/* Voice status overlay */}
          {!isVoiceAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <span className="text-white bg-black/50 px-4 py-2 rounded-lg">
                Voice Input Unavailable
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Controls */}
      <div className="flex justify-center gap-4 py-8">
        <button className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors">
          Voice Input {isVoiceAvailable ? "On" : "Off"}
        </button>
        <button className="px-6 py-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
          Type Instead
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
