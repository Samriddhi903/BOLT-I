import React, { useState } from "react";
import {
  motion,
  PanInfo,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Heart,
  X,
  Star,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  Award,
  Globe,
  CheckCircle,
} from "lucide-react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Card = styled(motion.div)`
  position: absolute;
  width: 100%;
  max-width: 420px;
  height: 580px;
  background: rgba(18, 18, 18, 0.95);
  border: 2px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18),
    0 4px 16px 0 rgba(139, 92, 246, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 2.5rem;
  overflow: hidden;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:active {
    cursor: grabbing;
  }

  &:hover {
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25),
      0 6px 20px 0 rgba(139, 92, 246, 0.15);
  }
`;

const CardImage = styled.div<{ $imageUrl: string }>`
  width: 100%;
  height: 65%;
  background-image: url(${(props) => props.$imageUrl});
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.1) 0%,
      transparent 50%
    );
    pointer-events: none;
  }
`;

const CardContent = styled.div`
  padding: 2rem;
  height: 35%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ActionButton = styled(motion.button)<{ $variant: "like" | "dislike" }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${(props) =>
    props.$variant === "like"
      ? "linear-gradient(135deg, #10b981, #059669)"
      : "linear-gradient(135deg, #ef4444, #dc2626)"};
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3),
    0 2px 10px
      ${(props) =>
        props.$variant === "like"
          ? "rgba(16, 185, 129, 0.3)"
          : "rgba(239, 68, 68, 0.3)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4),
      0 4px 15px
        ${(props) =>
          props.$variant === "like"
            ? "rgba(16, 185, 129, 0.4)"
            : "rgba(239, 68, 68, 0.4)"};
  }
`;

const StatsCard = styled(motion.div)`
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
`;

const Tag = styled.span`
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #c084fc;
  font-size: 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.5);
    transform: translateY(-1px);
  }
`;

const GradientText = styled.h1`
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
`;

const FloatingParticles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`;

const Particle = styled.div<{ $delay: number }>`
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(139, 92, 246, 0.3);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
  animation-delay: ${(props) => props.$delay}s;
`;

const GlowEffect = styled.div`
  position: relative;
  
  &::before {
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
  
  &:hover::before {
    opacity: 0.3;
  }
`;

// CSS Animations
const GlobalStyle = styled.div`
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

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
`;

const MatchModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(18, 18, 18, 0.7);
  backdrop-filter: blur(8px);

  .modal-content {
    background: rgba(18, 18, 18, 0.95);
    border: 2px solid rgba(139, 92, 246, 0.3);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18),
      0 4px 16px 0 rgba(139, 92, 246, 0.1);
    border-radius: 2.5rem;
    padding: 3rem 2.5rem;
    text-align: center;
    max-width: 400px;
    width: 100%;
    color: #fff;
  }
  .modal-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
  }
  .modal-desc {
    font-size: 1.1rem;
    color: #c4b5fd;
    margin-bottom: 2rem;
  }
  .modal-btn {
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
    color: #fff;
    border: none;
    border-radius: 1.5rem;
    padding: 0.75rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
    transition: all 0.2s;
  }
  .modal-btn:hover {
    background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%);
    transform: scale(1.05);
  }
`;

interface CardData {
  id: number;
  name: string;
  type: "startup" | "investor";
  company: string;
  description: string;
  image: string;
  stage?: string;
  industry?: string;
  funding?: string;
  teamSize?: number;
  revenue?: string;
  investmentFocus?: string[];
  portfolioSize?: string;
  tags: string[];
}

const TinderPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [likedCards, setLikedCards] = useState<number[]>([]);
  const [dislikedCards, setDislikedCards] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<"startup" | "investor" | null>(null);
  const [profiles, setProfiles] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<CardData | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const navigate = useNavigate();

  // Get user role from backend using token
  React.useEffect(() => {
    const getUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserRole(null);
        return;
      }
      try {
        const res = await fetch("http://localhost:3001/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user profile");
        const data = await res.json();
        if (data.role === "startup" || data.role === "investor") {
          setUserRole(data.role);
        } else {
          setUserRole(null);
        }
      } catch (err) {
        setUserRole(null);
      }
    };
    getUserRole();
  }, []);

  // Fetch profiles from backend based on user role
  React.useEffect(() => {
    if (!userRole) return;
    setLoading(true);
    setError(null);
    const fetchProfiles = async () => {
      try {
        let endpoint = "";
        if (userRole === "startup") {
          endpoint = "http://localhost:3001/api/investors";
        } else {
          endpoint = "http://localhost:3001/api/startups";
        }
        const token = localStorage.getItem("token");
        const res = await fetch(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await res.json();
        // Map backend data to CardData format if needed
        const mapped = (data.profiles || data).map((item: any, idx: number) => {
          if (userRole === "startup") {
            // Investor profile
            return {
              id: item.userId || item._id || idx,
              name: item.name || item.fullName || item.email || "Investor",
              type: "investor",
              company: item.company || item.firm || "",
              description: item.bio || item.description || "",
              image:
                item.avatar ||
                item.image ||
                "https://randomuser.me/api/portraits/men/1.jpg",
              investmentFocus: Array.isArray(item.investmentFocus)
                ? item.investmentFocus
                : typeof item.investmentFocus === "string" &&
                  item.investmentFocus.length > 0
                    ? [item.investmentFocus]
                : [],
              portfolioSize: item.portfolioSize || "",
              tags: item.tags || [],
            };
          } else {
            // Startup profile
            return {
              id: item.userId || item._id || idx,
              name: item.companyName || item.name || "Startup",
              type: "startup",
              company: item.companyName || item.name || "",
              description: item.description || "",
              image:
                item.logo ||
                item.image ||
                "https://source.unsplash.com/400x300/?startup",
              stage: item.stage || "",
              industry: item.industry || "",
              funding: item.fundingNeeded || "",
              teamSize: item.teamSize || 0,
              revenue: item.monthlyRevenue ? `$${item.monthlyRevenue} ARR` : "",
              tags: item.tags || [],
            };
          }
        });
        setProfiles(mapped);
        setCurrentIndex(0);
      } catch (err: any) {
        setError(err.message || "Error loading profiles");
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [userRole]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      handleLike();
    } else if (info.offset.x < -swipeThreshold) {
      handleDislike();
    }
  };

  const handleLike = async () => {
    setDirection(1);
    setLikedCards((prev) => [...prev, profiles[currentIndex].id]);
    // Call backend to record like and check for match
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/match/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ targetUserId: profiles[currentIndex].id }),
      });
      const data = await res.json();
      if (data.matched) {
        setMatchedProfile(profiles[currentIndex]);
        setShowMatchModal(true);
        // Wait for 3 seconds before moving to next card
        setTimeout(() => {
          setShowMatchModal(false);
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setDirection(0);
            x.set(0);
          }, 300);
        }, 3000);
        return;
      }
    } catch (err) {
      // Optionally handle error
    }
    // If no match, proceed normally
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(0);
      x.set(0);
    }, 200);
  };

  const handleDislike = () => {
    setDirection(-1);
    setDislikedCards((prev) => [...prev, profiles[currentIndex].id]);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(0);
      x.set(0);
    }, 200);
  };

  const handleStartOver = () => {
    setCurrentIndex(0);
    setLikedCards([]);
    setDislikedCards([]);
    setDirection(0);
    setShowMatchModal(false);
    setMatchedProfile(null);
    x.set(0);
  };

  const currentCard = profiles[currentIndex];

  // Debug log for state
  console.log("TinderPage state:", { profiles, loading, error, userRole });

  if (!userRole || loading) {
    return (
      <GlobalStyle className="pt-20 min-h-screen bg-[#121212] relative flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-bold text-gray-100 mb-4"
          >
            Loading...
          </motion.div>
        </div>
      </GlobalStyle>
    );
  }

  if (error) {
    return (
      <GlobalStyle className="pt-20 min-h-screen bg-[#121212] relative flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-bold text-red-400 mb-4"
          >
            {error}
          </motion.div>
        </div>
      </GlobalStyle>
    );
  }

  if (profiles.length === 0) {
    return (
      <GlobalStyle className="pt-20 min-h-screen bg-[#121212] relative flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-bold text-gray-400 mb-4"
          >
            No profiles found. Try creating another user of the opposite role!
          </motion.div>
        </div>
      </GlobalStyle>
    );
  }

  if (!currentCard) {
    return (
      <GlobalStyle className="pt-20 min-h-screen bg-[#121212] relative flex items-center justify-center">
        {/* Background effects */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
            filter: "blur(100px)",
          }}
        />

        {/* Floating particles */}
        <FloatingParticles>
          <Particle $delay={0} style={{ top: "20%", left: "10%" }} />
          <Particle $delay={2} style={{ top: "60%", left: "80%" }} />
          <Particle $delay={4} style={{ top: "80%", left: "20%" }} />
          <Particle $delay={1} style={{ top: "30%", left: "70%" }} />
          <Particle $delay={3} style={{ top: "70%", left: "30%" }} />
        </FloatingParticles>

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Award className="w-12 h-12 text-purple-400" />
              </motion.div>
              <GradientText className="text-5xl font-bold">
                All Caught Up!
              </GradientText>
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Sparkles className="w-12 h-12 text-purple-400" />
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-gray-400 text-xl mb-8 font-light"
            >
              You've seen all available{" "}
              {userRole === "startup" ? "investors" : "startups"}. Check back
              later for new opportunities.
            </motion.p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            onClick={handleStartOver}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl font-medium transition-all shadow-lg hover:shadow-purple-500/25 hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Start Over</span>
            </div>
          </motion.button>
        </div>
      </GlobalStyle>
    );
  }

  return (
    <>
      {/* Match Modal */}
      <AnimatePresence>
        {showMatchModal && matchedProfile && (
          <MatchModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-content">
              <CheckCircle className="mx-auto mb-4 text-green-400" size={56} />
              <div className="modal-title">It's a Match!</div>
              <div className="modal-desc">
                You and{" "}
                <span className="font-bold text-purple-300">
                  {matchedProfile.name}
                </span>{" "}
                have liked each other.
                <br />
                Start a conversation now!
              </div>
            </div>
          </MatchModal>
        )}
      </AnimatePresence>
      <GlobalStyle className="pt-20 min-h-screen bg-[#121212] relative overflow-hidden">
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
        <FloatingParticles>
          <Particle $delay={0} style={{ top: "20%", left: "10%" }} />
          <Particle $delay={2} style={{ top: "60%", left: "80%" }} />
          <Particle $delay={4} style={{ top: "80%", left: "20%" }} />
          <Particle $delay={1} style={{ top: "30%", left: "70%" }} />
          <Particle $delay={3} style={{ top: "70%", left: "30%" }} />
        </FloatingParticles>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
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
                <Target className="w-10 h-10 text-purple-400" />
              </motion.div>
              <GradientText className="text-4xl font-bold">
                {userRole === "startup"
                  ? "Find Investors"
                  : "Discover Startups"}
              </GradientText>
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Globe className="w-10 h-10 text-purple-400" />
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-gray-400 text-lg font-light"
            >
              Swipe right to like, left to pass
            </motion.p>
          </motion.div>

          {/* Enhanced Card Container */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-md h-[580px]">
              <Card
                drag="x"
                dragConstraints={{ left: -200, right: 200 }}
                onDragEnd={handleDragEnd}
                animate={{
                  x: direction * 500,
                  opacity: direction !== 0 ? 0 : 1,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={() => {
                  if (
                    userRole === "investor" &&
                    currentCard.type === "startup" &&
                    currentCard.id
                  ) {
                    navigate(`/analytics/${currentCard.id}`);
                  }
                }}
                style={{
                  x,
                  rotate,
                  opacity,
                  zIndex: 10,
                  cursor:
                    userRole === "investor" && currentCard.type === "startup"
                      ? "pointer"
                      : "grab",
                }}
              >
                <CardImage $imageUrl={currentCard.image}>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-600/20 rounded-full backdrop-blur-sm">
                        <Building2 className="w-5 h-5 text-purple-300" />
                      </div>
                      <span className="text-white font-bold text-lg">
                        {currentCard.company}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentCard.tags
                        .slice(0, 3)
                        .map((tag: string, index: number) => (
                          <Tag key={index}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                </CardImage>

                <CardContent>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-3">
                      {currentCard.name}
                    </h2>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6">
                      {currentCard.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    {currentCard.type === "startup" ? (
                      <>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="p-1.5 bg-purple-600/20 rounded-full">
                            <Users className="w-4 h-4 text-purple-300" />
                          </div>
                          <span className="font-medium">
                            {currentCard.teamSize} team
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="p-1.5 bg-green-600/20 rounded-full">
                            <DollarSign className="w-4 h-4 text-green-300" />
                          </div>
                          <span className="font-medium">
                            {currentCard.revenue}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="p-1.5 bg-blue-600/20 rounded-full">
                            <TrendingUp className="w-4 h-4 text-blue-300" />
                          </div>
                          <span className="font-medium">
                            {currentCard.stage}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="p-1.5 bg-yellow-600/20 rounded-full">
                            <Star className="w-4 h-4 text-yellow-300" />
                          </div>
                          <span className="font-medium">
                            {currentCard.portfolioSize}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="p-1.5 bg-purple-600/20 rounded-full">
                            <Building2 className="w-4 h-4 text-purple-300" />
                          </div>
                          <span className="font-medium">
                            {Array.isArray(currentCard.investmentFocus)
                              ? currentCard.investmentFocus
                                  .slice(0, 2)
                                  .join(", ")
                              : ""}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Action buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-8"
              >
                <ActionButton
                  $variant="dislike"
                  onClick={handleDislike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="glow-effect"
                >
                  <X className="w-8 h-8" />
                </ActionButton>
                
                <ActionButton
                  $variant="like"
                  onClick={handleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="glow-effect"
                >
                  <Heart className="w-8 h-8" />
                </ActionButton>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center mt-12"
          >
            <StatsCard className="inline-block">
              <div className="flex justify-center gap-12 text-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-green-400 font-bold text-xl">
                      {likedCards.length}
                    </div>
                  </div>
                  <div className="text-gray-400 font-medium">Liked</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="text-red-400 font-bold text-xl">
                      {dislikedCards.length}
                    </div>
                  </div>
                  <div className="text-gray-400 font-medium">Passed</div>
                </div>
              </div>
            </StatsCard>
          </motion.div>
        </div>
      </GlobalStyle>
    </>
  );
};

export default TinderPage; 
