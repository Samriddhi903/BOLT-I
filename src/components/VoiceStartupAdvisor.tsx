import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Database,
  Sparkles,
  Zap,
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";

// Type declarations for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: number;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
}

interface BusinessData {
  companyName: string;
  industry: string;
  stage: string;
  monthlyRevenue: number;
  burnRate: number;
  teamSize: number;
  customerCount: number;
  churnRate: number;
  cac: number;
  ltv: number;
  marketSize: number;
  lastUpdated: string;
}

interface VoiceStartupAdvisorProps {
  businessId?: string;
}

const StyledVoiceAdvisor = styled.div`
  .avatar-container {
    position: relative;
    width: 240px;
    height: 240px;
    margin: 0 auto;
  }

  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.3),
      0 0 80px rgba(139, 92, 246, 0.1), inset 0 0 40px rgba(255, 255, 255, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(139, 92, 246, 0.3);
  }

  .avatar.speaking {
    animation: speakingPulse 2s ease-in-out infinite;
    box-shadow: 0 0 60px rgba(139, 92, 246, 0.5),
      0 0 120px rgba(139, 92, 246, 0.2),
      inset 0 0 40px rgba(255, 255, 255, 0.15);
    border-color: rgba(139, 92, 246, 0.6);
  }

  .avatar.listening {
    animation: listeningPulse 2.5s ease-in-out infinite;
    box-shadow: 0 0 50px rgba(16, 185, 129, 0.4),
      0 0 100px rgba(16, 185, 129, 0.2), inset 0 0 40px rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.5);
  }

  .avatar-icon {
    font-size: 5rem;
    color: white;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    transition: all 0.3s ease;
  }

  .avatar.speaking .avatar-icon {
    animation: iconBounce 1s ease-in-out infinite;
  }

  .speech-bubbles {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .speech-bubble {
    position: absolute;
    width: 12px;
    height: 12px;
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.9),
      rgba(168, 85, 247, 0.8)
    );
    border-radius: 50%;
    animation: speechBubble 2s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
  }

  .speech-bubble:nth-child(1) {
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    animation-delay: 0s;
  }

  .speech-bubble:nth-child(2) {
    top: -60px;
    left: 65%;
    animation-delay: 0.3s;
  }

  .speech-bubble:nth-child(3) {
    top: -60px;
    left: 35%;
    animation-delay: 0.6s;
  }

  .speech-bubble:nth-child(4) {
    top: -40px;
    left: 75%;
    animation-delay: 0.9s;
  }

  .speech-bubble:nth-child(5) {
    top: -40px;
    left: 25%;
    animation-delay: 1.2s;
  }

  @keyframes speakingPulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }

  @keyframes listeningPulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.12);
    }
  }

  @keyframes iconBounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  @keyframes speechBubble {
    0%,
    100% {
      opacity: 0;
      transform: translateY(0) scale(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-15px) scale(1);
    }
  }

  .message-bubble {
    background: rgba(18, 18, 18, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18),
      0 4px 16px 0 rgba(139, 92, 246, 0.1);
    transition: all 0.3s ease;
  }

  .message-bubble:hover {
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25),
      0 6px 20px 0 rgba(139, 92, 246, 0.15);
  }

  .user-message {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.2) 0%,
      rgba(168, 85, 247, 0.15) 100%
    );
    border: 1px solid rgba(139, 92, 246, 0.3);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18),
      0 4px 16px 0 rgba(139, 92, 246, 0.15);
  }

  .bot-message {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(139, 92, 246, 0.2);
    backdrop-filter: blur(16px);
  }

  .input-container {
    background: rgba(18, 18, 18, 0.9);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(139, 92, 246, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18),
      0 4px 16px 0 rgba(139, 92, 246, 0.1);
  }

  .voice-button {
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
  }

  .voice-button:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
  }

  .voice-button.listening {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    animation: listeningButton 1.5s ease-in-out infinite;
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
  }

  @keyframes listeningButton {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .send-button {
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
  }

  .send-button:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
  }

  .gradient-text {
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
  }

  .status-badge {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
    transition: all 0.3s ease;
  }

  .status-badge:hover {
    border-color: rgba(139, 92, 246, 0.4);
    box-shadow: 0 6px 20px rgba(31, 38, 135, 0.15);
  }

  .quick-prompt {
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.2);
    backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .quick-prompt:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(139, 92, 246, 0.3) rgba(139, 92, 246, 0.1);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(139, 92, 246, 0.1);
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.5);
  }

  .floating-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(139, 92, 246, 0.3);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }

  .particle:nth-child(1) {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }

  .particle:nth-child(2) {
    top: 60%;
    left: 80%;
    animation-delay: 2s;
  }

  .particle:nth-child(3) {
    top: 80%;
    left: 20%;
    animation-delay: 4s;
  }

  .particle:nth-child(4) {
    top: 30%;
    left: 70%;
    animation-delay: 1s;
  }

  .particle:nth-child(5) {
    top: 70%;
    left: 30%;
    animation-delay: 3s;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
      opacity: 0.8;
    }
  }

  .glow-effect {
    position: relative;
  }

  .glow-effect::before {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #8b5cf6, #a855f7, #c084fc, #8b5cf6);
    border-radius: inherit;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .glow-effect:hover::before {
    opacity: 0.3;
  }
`;

const VoiceStartupAdvisor: React.FC<VoiceStartupAdvisorProps> = ({
  businessId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [userBusinessId, setUserBusinessId] = useState<string | null>(null);
  const [audioOutputEnabled, setAudioOutputEnabled] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] =
    useState(true);
  const [speechRecognitionError, setSpeechRecognitionError] = useState<
    string | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get user's business ID from their profile
  const getUserBusinessId = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No authentication token found, using demo data");
        return "demo-business-123";
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.businessId) {
          console.log("Found user business ID:", userData.businessId);
          return userData.businessId;
        }
      }
    } catch (error) {
      console.error("Error getting user business ID:", error);
    }

    console.log("Using demo business ID");
    return "demo-business-123";
  };

  // Initialize speech recognition and load user data
  useEffect(() => {
    const initializeData = async () => {
      // Get the user's business ID
      const businessIdToUse = businessId || (await getUserBusinessId());
      setUserBusinessId(businessIdToUse);

      // Load business data
      await loadBusinessData(businessIdToUse);
    };

    initializeData();

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setSpeechRecognitionError(null);
        console.log("Speech recognition started");
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech recognition result:", transcript);
        setInputMessage(transcript);
        setIsListening(false);
        setSpeechRecognitionError(null);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        // Handle specific error types
        if (event.error === "network") {
          const errorMsg = "Voice input requires HTTPS. Try typing instead!";
          setSpeechRecognitionError(errorMsg);
          setSpeechRecognitionSupported(false);
          console.log("Network error - speech recognition requires HTTPS");
        } else if (event.error === "not-allowed") {
          const errorMsg =
            "Microphone access denied. Please allow microphone access.";
          setSpeechRecognitionError(errorMsg);
          console.log("Microphone access denied");
        } else if (event.error === "no-speech") {
          const errorMsg = "No speech detected. Please try again.";
          setSpeechRecognitionError(errorMsg);
          console.log("No speech detected");
        } else {
          const errorMsg =
            "Voice input not available. Please type your message.";
          setSpeechRecognitionError(errorMsg);
          setSpeechRecognitionSupported(false);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended");
      };
    } else {
      console.log("Speech recognition not supported in this browser");
      setSpeechRecognitionSupported(false);
      setSpeechRecognitionError("Voice input not supported in this browser");
    }
  }, [businessId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load business data from MongoDB (with authentication)
  const loadBusinessData = async (businessIdToUse: string) => {
    try {
      console.log("Loading business data for ID:", businessIdToUse);
      const token = localStorage.getItem("token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/business/${businessIdToUse}`, {
        headers,
      });

      console.log("Business data response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Business data loaded:", data);
        setBusinessData(data);
      } else {
        console.log("Business data response not ok, using fallback");
        throw new Error("Response not ok");
      }
    } catch (error) {
      console.error("Failed to load business data:", error);
      // Demo data fallback
      const fallbackData = {
        companyName: "TechStartup Inc",
        industry: "SaaS",
        stage: "Series A",
        monthlyRevenue: 45000,
        burnRate: 25000,
        teamSize: 12,
        customerCount: 1200,
        churnRate: 5.2,
        cac: 150,
        ltv: 2400,
        marketSize: 50000000,
        lastUpdated: new Date().toISOString(),
      };
      console.log("Using fallback business data:", fallbackData);
      setBusinessData(fallbackData);
    }
  };

  // Enhanced Gemini API call with business context
  const callGeminiAPI = async (
    userMessage: string,
    businessContext: BusinessData | null
  ) => {
    console.log("Calling Gemini API with message:", userMessage);
    console.log("Business context being sent:", businessContext);

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/gemini-voice", {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: userMessage,
        businessData: businessContext,
        businessId: userBusinessId,
      }),
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);

    // The backend always returns a message, even in fallback mode
    if (data.message) {
      console.log("Returning message:", data.message);
      return data.message;
    }

    // Only throw error if there's no message in the response
    throw new Error("No response message received");
  };

  // Eleven Labs Text-to-Speech
  const speakWithElevenLabs = async (text: string) => {
    if (!voiceEnabled) return;

    setIsLoadingAudio(true);
    setIsSpeaking(true);

    try {
      const response = await fetch("/api/elevenlabs-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Text-to-speech error:", error);
      setIsSpeaking(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now(),
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    console.log("handleSendMessage called with:", userMessage);
    console.log("Current business data:", businessData);

    try {
      console.log("About to call callGeminiAPI");
      const response = await callGeminiAPI(userMessage, businessData);
      console.log("callGeminiAPI returned:", response);

      // Add bot response to chat
      const botMsg: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);

      // Only generate audio if audio output is enabled
      if (audioOutputEnabled && voiceEnabled) {
        try {
          await speakWithElevenLabs(response);
        } catch (audioError) {
          console.error("Audio generation failed:", audioError);
          // Don't show error to user, just continue without audio
        }
      }
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      setVoiceEnabled(!voiceEnabled);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "How can I reduce my customer acquisition cost?",
    "What's the best strategy to improve my churn rate?",
    "When should I consider raising my next funding round?",
    "How can I optimize my pricing strategy?",
    "What metrics should I focus on for growth?",
  ];

  return (
    <StyledVoiceAdvisor className="pt-20 min-h-screen bg-[#121212] relative">
      {/* Enhanced background effects */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
          filter: "blur(100px)",
        }}
      />

      {/* Floating particles */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Hidden audio element for Eleven Labs playback */}
      <audio ref={audioRef} style={{ display: "none" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Brain className="w-10 h-10 text-purple-400" />
            </motion.div>
            <h1 className="text-5xl font-bold gradient-text">
              AI Startup Advisor
            </h1>
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Sparkles className="w-10 h-10 text-purple-400" />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-gray-400 text-xl mb-6 font-light"
          >
            Your intelligent business companion with voice capabilities
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex items-center justify-center space-x-6"
          >
            <div className="status-badge rounded-full px-6 py-3">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300 text-sm font-medium">
                  Powered by Gemini & Eleven Labs
                </span>
              </div>
            </div>
            {businessData && (
              <div className="status-badge rounded-full px-6 py-3">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300 text-sm font-medium">
                    Connected to {businessData.companyName}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Enhanced Centered Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="flex justify-center mb-12"
        >
          <div className="avatar-container glow-effect">
            <div
              className={`avatar ${
                isSpeaking ? "speaking" : isListening ? "listening" : ""
              }`}
            >
              <Bot className="avatar-icon" />
              {(isSpeaking || isLoadingAudio) && (
                <div className="speech-bubbles">
                  <div className="speech-bubble"></div>
                  <div className="speech-bubble"></div>
                  <div className="speech-bubble"></div>
                  <div className="speech-bubble"></div>
                  <div className="speech-bubble"></div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Status Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex justify-center space-x-8 mb-10"
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAudioOutputEnabled(!audioOutputEnabled)}
              className={`p-4 rounded-full transition-all status-badge ${
                audioOutputEnabled
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : "bg-gray-600/20 text-gray-400 border-gray-500/40"
              }`}
              title={
                audioOutputEnabled
                  ? "Voice output enabled"
                  : "Voice output disabled"
              }
            >
              {audioOutputEnabled ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </button>
            <span className="text-gray-400 text-sm font-medium">
              {audioOutputEnabled ? "Voice Output On" : "Voice Output Off"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (isListening) {
                  recognitionRef.current?.stop();
                } else {
                  recognitionRef.current?.start();
                }
              }}
              disabled={!recognitionRef.current || !speechRecognitionSupported}
              className={`p-4 rounded-full transition-all voice-button glow-effect ${
                isListening ? "listening" : ""
              } ${
                !speechRecognitionSupported
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              title={
                !speechRecognitionSupported
                  ? "Voice input not available"
                  : "Click to speak"
              }
            >
              {isListening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
            <span className="text-gray-400 text-sm font-medium">
              {!speechRecognitionSupported
                ? "Voice Input Unavailable"
                : isListening
                ? "Listening..."
                : "Voice Input"}
            </span>
          </div>
        </motion.div>

        {/* Enhanced Error Messages */}
        <AnimatePresence>
          {speechRecognitionError && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="text-center mb-8"
            >
              <div className="bg-red-500/20 border border-red-500/40 rounded-2xl px-6 py-4 inline-block backdrop-blur-sm">
                <span className="text-red-400 text-sm font-medium">
                  {speechRecognitionError}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Messages Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="max-w-4xl mx-auto mb-10"
        >
          <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar p-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{
                  opacity: 0,
                  x: message.type === "user" ? 30 : -30,
                  scale: 0.9,
                }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-4 max-w-[85%] ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      message.type === "user"
                        ? "bg-purple-600"
                        : "bg-gradient-to-r from-purple-600 to-purple-700"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-6 h-6 text-white" />
                    ) : (
                      <Bot className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div
                    className={`message-bubble rounded-2xl px-6 py-4 ${
                      message.type === "user" ? "user-message" : "bot-message"
                    }`}
                  >
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-base">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-3 ${
                        message.type === "user"
                          ? "text-purple-300"
                          : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="message-bubble bot-message rounded-2xl px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                      <span className="text-gray-300 font-medium">
                        Analyzing your business data...
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(isSpeaking || isLoadingAudio) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="message-bubble bot-message rounded-2xl px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {isLoadingAudio ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                          <span className="text-gray-300 font-medium">
                            Generating speech...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-gray-300 font-medium">
                            Speaking...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        {/* Enhanced Quick Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="max-w-5xl mx-auto mb-10"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                onClick={() => setInputMessage(prompt)}
                className="quick-prompt px-6 py-3 rounded-2xl text-sm transition-all text-gray-300 hover:text-white font-medium"
                disabled={isLoading}
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="input-container rounded-2xl p-8">
            <div className="flex space-x-6">
              <textarea
                ref={chatInputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your business or speak to me..."
                className="flex-1 bg-black/40 text-gray-200 placeholder-gray-400 rounded-2xl px-6 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-purple-500/30 text-base"
                rows={3}
                disabled={isLoading}
              />
              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="send-button text-white px-8 py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-medium"
                >
                  <Send className="w-6 h-6" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </StyledVoiceAdvisor>
  );
};

export default VoiceStartupAdvisor;
