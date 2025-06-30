import  { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  Smile,
  Paperclip,
  Image,
  File,
  Link,
  MoreVertical,
  Search,
  Phone,
  Video,
  Check,
  CheckCheck,
  Star,
} from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { io, Socket } from "socket.io-client";
import investor1 from './assets/investor/investor1.jpeg';
import investor2 from './assets/investor/investor2.jpeg';
import investor3 from './assets/investor/investor3.jpeg';
import investor4 from './assets/investor/investor4.jpeg';
import startup1 from './assets/startup/startup1.png';
import startup2 from './assets/startup/startup2.png';
import startup3 from './assets/startup/startup3.jpeg';
import startup4 from './assets/startup/startup4.png';

const StyledChatPage = styled.div`
  background: linear-gradient(
    135deg,
    rgba(13, 13, 13, 0.95) 0%,
    rgba(49, 16, 97, 0.95) 100%
  );

  .chat-container {
    background: rgba(18, 18, 18, 0.75);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(139, 92, 246, 0.18);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15),
      0 4px 16px 0 rgba(139, 92, 246, 0.1);
    overflow: hidden;
  }

  .chat-sidebar {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(16px);
    border-right: 1px solid rgba(139, 92, 246, 0.15);
  }

  .contact-card {
    transition: all 0.3s ease;
    background: rgba(139, 92, 246, 0.03);
    border: 1px solid transparent;

    &:hover {
      background: rgba(139, 92, 246, 0.1);
      border-color: rgba(139, 92, 246, 0.2);
      transform: translateY(-1px);
    }

    &.active {
      background: rgba(139, 92, 246, 0.15);
      border-color: rgba(139, 92, 246, 0.3);
    }
  }

  .message-bubble {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(139, 92, 246, 0.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &.sent {
      background: linear-gradient(
        135deg,
        rgba(139, 92, 246, 0.15) 0%,
        rgba(139, 92, 246, 0.05) 100%
      );
      border-color: rgba(139, 92, 246, 0.2);
    }
  }

  .message-input-container {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(139, 92, 246, 0.1);
    transition: all 0.3s ease;

    &:focus-within {
      border-color: rgba(139, 92, 246, 0.4);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15),
        0 0 0 2px rgba(139, 92, 246, 0.2);
    }
  }

  .message-input {
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .emoji-picker-container {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 10px;
    animation: fadeIn 0.2s ease;
  }

  .attachment-preview {
    background: rgba(139, 92, 246, 0.1);
    border: 1px dashed rgba(139, 92, 246, 0.3);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(139, 92, 246, 0.15);
      border-color: rgba(139, 92, 246, 0.4);
    }
  }

  .search-input {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.15);
    transition: all 0.3s ease;

    &:focus {
      border-color: rgba(139, 92, 246, 0.3);
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
    }
  }

  .chat-header {
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(139, 92, 246, 0.15);
    backdrop-filter: blur(12px);
  }

  .action-button {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(139, 92, 246, 0.1);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .send-button {
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
      opacity: 0.7;
    }
  }

  .online-indicator {
    box-shadow: 0 0 0 2px #121212, 0 0 0 4px rgba(16, 185, 129, 0.3);
    animation: pulse 2s infinite;
  }

  .messages-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(139, 92, 246, 0.3) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(139, 92, 246, 0.3);
      border-radius: 3px;
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 2px #121212, 0 0 0 4px rgba(16, 185, 129, 0.3);
    }
    70% {
      box-shadow: 0 0 0 2px #121212, 0 0 0 6px rgba(16, 185, 129, 0);
    }
    100% {
      box-shadow: 0 0 0 2px #121212, 0 0 0 4px rgba(16, 185, 129, 0.3);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  attachments?: {
    type: "file" | "image" | "link";
    name: string;
    url: string;
  }[];
}

interface ChatContact {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  status: "online" | "offline";
  lastMessage: string;
  unread: number;
  tags: string[];
  investmentFocus?: string[];
  portfolioSize?: string;
  meetingStatus?: string;
  lastActive?: string;
}

const ChatPage: React.FC = () => {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [userRole, setUserRole] = useState<"startup" | "investor" | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    // Get user ID from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUserId(decoded.userId);
        // Join socket room with user ID
        newSocket.emit("join", decoded.userId);
        console.log("Joined socket with userId:", decoded.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket || !userId) return;

    // Listen for new messages from others
    socket.on("newMessage", (message) => {
      console.log("Received new message:", message);
      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.some((msg) => msg._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });

      // Mark message as read
      socket.emit("messageRead", {
        messageId: message._id,
        senderId: message.senderId,
      });
    });

    // Listen for sent message confirmation
    socket.on("messageSent", (confirmedMessage) => {
      console.log("Message confirmed by server:", confirmedMessage);
      setMessages((prev) => {
        const messageExists = prev.some(
          (msg) => msg._id === confirmedMessage._id
        );
        if (messageExists) return prev;

        return prev.map((msg) =>
          // Replace temporary message with confirmed one from server
          msg._id?.startsWith("temp-") &&
          msg.senderId === confirmedMessage.senderId &&
          msg.text === confirmedMessage.text
            ? { ...confirmedMessage }
            : msg
        );
      });
    });

    // Listen for message status updates
    socket.on("messageStatus", ({ messageId, status }) => {
      console.log("Message status update:", messageId, status);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
      );
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSent");
      socket.off("messageStatus");
      socket.off("error");
    };
  }, [socket, userId]);

  // Load chat history when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    const loadChatHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3001/api/messages/${activeChat}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:3001/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
        fetchContacts(data.role, token);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchContacts = async (role: string, token: string) => {
    try {
      setLoading(true);
      const endpoint = role === "startup" ? "/api/investors" : "/api/startups";
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Static image arrays
        const investorImages = [investor1, investor2, investor3, investor4];
        const startupImages = [startup1, startup2, startup3, startup4];
        const mappedContacts = data.profiles.map((profile: any, idx: number) => ({
          id: profile.userId || profile._id,
          name: role === "startup" ? profile.fullName : profile.companyName,
          role: role === "startup" ? profile.role : "Startup",
          company: role === "startup" ? profile.company : profile.industry,
          avatar:
            role === "startup"
              ? investorImages[idx % investorImages.length]
              : startupImages[idx % startupImages.length],
          status: "online",
          lastMessage: "Click to start chatting",
          unread: 0,
          tags: profile.tags || [],
          investmentFocus: profile.investmentFocus,
          portfolioSize: profile.portfolioSize,
          meetingStatus: "Not connected",
          lastActive: "Just now",
        }));
        setContacts(mappedContacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && attachments.length === 0) return;
    if (!socket || !activeChat || !userId) {
      console.error("Missing required data:", {
        socket: !!socket,
        activeChat,
        userId,
      });
      return;
    }

    try {
      // Upload attachments first if any
      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => ({
          type: file.type.startsWith("image/") ? "image" as const : "file" as const,
          name: file.name,
          url: URL.createObjectURL(file),
        }))
      );

      // Create the new message with a temporary ID
      const tempId = `temp-${Date.now()}`;
      const newMessage = {
        _id: tempId,
        senderId: userId,
        receiverId: activeChat.toString(),
        text: messageInput.trim(),
        timestamp: new Date(),
        status: "sent" as const,
        attachments: uploadedAttachments,
      };

      console.log("Sending message:", newMessage);

      // Add message to local state immediately
      setMessages((prev) => [...prev, newMessage]);

      // Emit message through socket
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId: activeChat.toString(),
        text: messageInput.trim(),
        attachments: uploadedAttachments,
      });

      // Clear input and attachments
      setMessageInput("");
      setAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    // Handle typing indicator
    if (socket && activeChat && userId) {
      socket.emit("typing", { senderId: userId, receiverId: activeChat });

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        socket.emit("stopTyping", { senderId: userId, receiverId: activeChat });
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessageInput((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.company.toLowerCase().includes(searchLower) ||
      contact.role.toLowerCase().includes(searchLower) ||
      (contact.tags &&
        contact.tags.some((tag) => tag.toLowerCase().includes(searchLower))) ||
      (contact.investmentFocus &&
        contact.investmentFocus.some((focus) =>
          focus.toLowerCase().includes(searchLower)
        ))
    );
  });

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const activeContact = contacts.find((c) => c.id === activeChat);

  const handleInvestClick = () => {
    navigate("/payments", {
      state: {
        startupId: activeChat,
        startupName: activeContact?.name,
        startupCompany: activeContact?.company,
      },
    });
  };

  return (
    <StyledChatPage className="pt-16 min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
      <div className="relative z-10 max-w-8xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="chat-container rounded-2xl overflow-hidden h-[calc(100vh-12rem)] flex"
        >
          {/* Chat Sidebar */}
          <div className="chat-sidebar w-80 flex-shrink-0 flex flex-col">
            <div className="p-6 border-b border-purple-900/20">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-4"
              >
                {userRole === "startup" ? "Investors" : "Startups"}
              </motion.h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full pl-10 pr-4 py-3 rounded-xl text-gray-200 text-sm"
                />
              </div>
              <p className="text-gray-400 text-sm mt-4 flex items-center">
                <Star className="w-4 h-4 text-purple-400 mr-2" />
                {loading
                  ? "Loading contacts..."
                  : `${contacts.length} contacts available`}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 messages-container">
              <AnimatePresence>
                {filteredContacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`contact-card p-4 rounded-xl mb-2 cursor-pointer ${
                      activeChat === contact.id ? "active" : ""
                    }`}
                    onClick={() => setActiveChat(contact.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <motion.img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/20"
                          whileHover={{ scale: 1.1 }}
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                            contact.status === "online"
                              ? "online-indicator bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-200 font-medium">
                          {contact.name}
                        </h3>
                        <p className="text-purple-400/80 text-sm">
                          {contact.company}
                        </p>
                      </div>
                      {contact.unread > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {contact.unread}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat Main Area */}
          <div className="flex-1 flex flex-col">
            {activeContact ? (
              <>
                {/* Chat Header */}
                <div className="chat-header p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.img
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/20"
                      whileHover={{ scale: 1.1 }}
                    />
                    <div>
                      <h3 className="text-gray-200 font-medium flex items-center">
                        {activeContact.name}
                        {activeContact.status === "online" && (
                          <span className="ml-2 text-xs text-green-400">
                            ● Online
                          </span>
                        )}
                      </h3>
                      <p className="text-purple-400/80 text-sm">
                        {isTyping ? (
                          <span className="typing-indicator">typing...</span>
                        ) : (
                          activeContact.company
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {userRole !== 'startup' && (
                      <motion.button
                        onClick={handleInvestClick}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="invest-button px-6 py-2 rounded-full bg-gradient-to-r from-purple-600/80 to-purple-800/80 text-white font-medium backdrop-blur-sm border border-purple-500/30 shadow-lg relative overflow-hidden"
                        style={{
                          WebkitBackdropFilter: "blur(8px)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <span className="relative z-10">Invest Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-800/20 animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-purple-600/10 transform rotate-180" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="action-button p-2 rounded-full text-purple-400"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 messages-container">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message._id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${
                          message.senderId === userId
                            ? "justify-end"
                            : "justify-start"
                        } mb-4`}
                      >
                        <div
                          className={`message-bubble rounded-xl px-4 py-2 max-w-[70%] ${
                            message.senderId === userId ? "sent" : ""
                          }`}
                        >
                          {message.attachments?.map((attachment, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="mb-2"
                            >
                              {attachment.type === "image" ? (
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="rounded-lg max-w-full hover:opacity-90 transition-opacity cursor-pointer"
                                />
                              ) : (
                                <div className="flex items-center space-x-2 p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors cursor-pointer">
                                  <File className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm text-gray-200">
                                    {attachment.name}
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {message.text && (
                            <p className="text-gray-200">{message.text}</p>
                          )}
                          <div className="flex items-center justify-end space-x-2 mt-1">
                            <span className="text-gray-400 text-xs">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            {message.senderId === userId &&
                              getMessageStatusIcon(message.status)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4">
                  <AnimatePresence>
                    {attachments.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex flex-wrap gap-2 mb-4"
                      >
                        {attachments.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="attachment-preview rounded-lg p-2 flex items-center space-x-2"
                          >
                            <File className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-gray-200">
                              {file.name}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeAttachment(index)}
                              className="text-gray-400 hover:text-purple-400"
                            >
                              ×
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <form onSubmit={handleSendMessage} className="relative">
                    <div className="message-input-container flex items-center space-x-2 rounded-xl p-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-purple-400 hover:text-purple-300"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-purple-400 hover:text-purple-300"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="w-5 h-5" />
                      </motion.button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        className="hidden"
                      />
                      <input
                        type="text"
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="message-input flex-1 px-4 py-2 text-gray-200"
                      />
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="send-button text-white rounded-xl px-6 py-2"
                        disabled={
                          !messageInput.trim() && attachments.length === 0
                        }
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="emoji-picker-container"
                        >
                          <Picker
                            data={data}
                            onEmojiSelect={handleEmojiSelect}
                            theme="dark"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <MessageSquare className="w-16 h-16 text-purple-400/20 mx-auto mb-4" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-200 text-xl font-medium mb-2"
                  >
                    No Chat Selected
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-purple-400"
                  >
                    Select a contact to start chatting
                  </motion.p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      <style>{`
        .invest-button {
          transition: all 0.3s ease;
        }
        .invest-button:hover {
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.4);
        }
        .invest-button::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #8b5cf6, #6d28d9);
          z-index: -1;
          border-radius: 9999px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .invest-button:hover::before {
          opacity: 1;
        }
        @keyframes glow {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 0.4;
          }
        }
      `}</style>
    </StyledChatPage>
  );
};

export default ChatPage;
