import { useState, useEffect } from "react";
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
import Stack from './Stack';
import bgVideo from '../bg.mp4';
import investor1 from './assets/investor/investor1.jpeg';
import investor2 from './assets/investor/investor2.jpeg';
import investor3 from './assets/investor/investor3.jpeg';
import investor4 from './assets/investor/investor4.jpeg';
import startup1 from './assets/startup/startup1.png';
import startup2 from './assets/startup/startup2.png';
import startup3 from './assets/startup/startup3.jpeg';
import startup4 from './assets/startup/startup4.png';

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
  color:rgb(57, 11, 103);
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
  background: linear-gradient(135deg,rgb(27, 8, 72) 0%,rgb(32, 9, 54) 50%,rgb(33, 14, 51) 100%);
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
    background: "linear-gradient(90deg, transparent 0%, #6B21A8 50%, transparent 100%)"
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
    background: linear-gradient(135deg,rgb(25, 9, 62) 0%,rgb(37, 4, 68) 50%,rgb(36, 6, 65) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
  }
  .modal-desc {
    font-size: 1.1rem;
    color:rgb(20, 8, 70);
    margin-bottom: 2rem;
  }
  .modal-btn {
    background: linear-gradient(135deg,rgb(17, 3, 52) 0%,rgb(52, 18, 84) 100%);
    color: #fff;
    border: none;
    border-radius: 1.5rem;
    padding: 0.75rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(18, 3, 54, 0.15);
    transition: all 0.2s;
  }
  .modal-btn:hover {
    background: linear-gradient(135deg,rgb(51, 11, 88) 0%,rgb(25, 11, 59) 100%);
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

function TinderPage() {
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
  useEffect(() => {
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
  useEffect(() => {
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
        // Static image arrays
        const investorImages = [investor1, investor2, investor3, investor4];
        const startupImages = [startup1, startup2, startup3, startup4];
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
              image: investorImages[idx % investorImages.length],
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
            let imageUrl = "https://source.unsplash.com/400x300/?startup";
            if (item.photo) {
              imageUrl = `data:image/jpeg;base64,${item.photo}`;
            } else if (item.logo) {
              imageUrl = item.logo;
            } else if (item.image) {
              imageUrl = item.image;
            }
            return {
              id: item.userId || item._id || idx,
              name: item.companyName || item.name || "Startup",
              type: "startup",
              company: item.companyName || item.name || "",
              description: item.description || "",
<<<<<<< HEAD
              image: imageUrl,
=======
              image: startupImages[idx % startupImages.length],
>>>>>>> 4d12ccf7b7adc8acee5bd3a9052d895cc29bcce4
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

  // Map profiles to Stack's expected format
  const images = profiles.map((profile) => ({
    id: profile.id,
    img: profile.image,
    name: profile.name,
    company: profile.company
  }));

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
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        src={bgVideo}
      />
      {/* Overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1e1b4b]/80 via-[#312e81]/70 to-[#0f172a]/80 z-10 pointer-events-none" />
      <GlobalStyle className="pt-20 min-h-screen relative flex flex-col items-center justify-center z-20">
      {/* Match Modal */}
      <AnimatePresence>
        {showMatchModal && matchedProfile && (
          <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="bg-gradient-to-br from-purple-700/80 to-blue-700/80 rounded-3xl p-10 shadow-2xl border border-purple-400/30 text-center max-w-md w-full">
                <h2 className="section-title mb-2">It's a Match!</h2>
                <p className="text-lg text-purple-200 mb-6">
                  You matched with <span className="font-semibold text-white">{matchedProfile.name}</span>
                </p>
                <img
                  src={matchedProfile.image}
                  alt={matchedProfile.name}
                  className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-purple-400/40 shadow-lg object-cover"
                />
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="mt-4 px-6 py-2 bg-purple-600/80 hover:bg-purple-700/90 text-white rounded-full font-semibold shadow-md transition"
                >
                  Continue
                </button>
              </div>
          </motion.div>
          )}
        </AnimatePresence>
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <h1 className="section-title text-center mb-2">
            {userRole === 'startup' ? 'Discover Investors' : 'Discover Startups'}
          </h1>
          <p className="section-description text-center mb-8">
            Swipe right to like, left to pass
          </p>
          {/* Stack Card UI */}
          <div className="flex justify-center mt-8 mb-8">
            <Stack
              randomRotation={true}
              sensitivity={180}
              sendToBackOnClick={false}
              cardDimensions={{ width: 340, height: 480 }}
              cardsData={images}
              onSwipeLeft={handleDislike}
              onSwipeRight={handleLike}
              onCardClick={(card) => navigate(`/analytics/${card.id}`)}
            />
          </div>
        </div>
      </GlobalStyle>
    </>
  );
}

export default TinderPage; 
