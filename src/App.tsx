import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navigation from "./components/Navigation";
import ResourcesPage from "./components/ResourcesPage";
import AnalyticsPage from "./components/AnalyticsPage";
import LandingPage from "./components/LandingPage";
import ChatPage from "./components/ChatPage";
import TinderPage from "./components/TinderPage";
import RoleSelectionPage from "./components/RoleSelectionPage";
import StartupDetailsPage from "./components/StartupDetailsPage";
import InvestorDetailsPage from "./components/InvestorDetailsPage";
import ProfileEditPage from "./components/ProfileEditPage";
import PageTransition from "./components/PageTransition";
import LoginSignupPage from "./components/LoginSignupPage";
import VoiceStartupAdvisor from "./components/VoiceStartupAdvisor";
import PaymentPage from "./components/PaymentPage";
import PaymentsPage from "./components/PaymentsPage";
import UpgradeModal from './components/UpgradeModal';
import InvestorAnalyticsPage from "./components/InvestorAnalyticsPage.tsx";

const AppContent = () => {
  const location = useLocation();
  const showNavigation =
    location.pathname !== "/" &&
    location.pathname !== "/login" &&
    location.pathname !== "/signup" &&
    location.pathname !== "/role-selection" &&
    location.pathname !== "/startup-details" &&
    location.pathname !== "/investor-details";

  // Show upgrade modal only when explicitly requested via sessionStorage
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  React.useEffect(() => {
    if (sessionStorage.getItem("showUpgradeModal") === "1") {
      // Check if user already has Premium plan
      const currentPlan = localStorage.getItem("currentPlan");
      if (currentPlan === "Premium") {
        // Don't show upgrade modal for Premium users
        sessionStorage.removeItem("showUpgradeModal");
        return;
      }

      setTimeout(() => {
        setShowUpgradeModal(true);
        sessionStorage.removeItem("showUpgradeModal");
      }, 1500);
    }
  }, [location.pathname]); // Re-run when location changes
  const handleCloseUpgradeModal = () => {
    setShowUpgradeModal(false);
    sessionStorage.setItem("upgradeModalDismissed", "1");
  };

  return (
    <div className="relative min-h-screen bg-[#121212]">
      {showNavigation && <Navigation />}
      <UpgradeModal open={showUpgradeModal} onClose={handleCloseUpgradeModal} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginSignupPage />
              </PageTransition>
            }
          />
          <Route
            path="/signup"
            element={
              <PageTransition>
                <LoginSignupPage />
              </PageTransition>
            }
          />
          <Route
            path="/role-selection"
            element={
              <PageTransition>
                <RoleSelectionPage />
              </PageTransition>
            }
          />
          <Route
            path="/startup-details"
            element={
              <PageTransition>
                <StartupDetailsPage />
              </PageTransition>
            }
          />
          <Route
            path="/investor-details"
            element={
              <PageTransition>
                <InvestorDetailsPage />
              </PageTransition>
            }
          />
          <Route
            path="/profile"
            element={
              <PageTransition>
                <ProfileEditPage />
              </PageTransition>
            }
          />
          <Route
            path="/analytics"
            element={
              <PageTransition>
                <AnalyticsPage />
              </PageTransition>
            }
          />
          <Route
            path="/analytics/:startupId"
            element={
              <PageTransition>
                <AnalyticsPage />
              </PageTransition>
            }
          />
          <Route
            path="/resources"
            element={
              <PageTransition>
                <ResourcesPage />
              </PageTransition>
            }
          />
          <Route
            path="/chatbot"
            element={
              <PageTransition>
                <div className="pt-20 min-h-screen bg-[#121212] relative">
                  <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-100">
                      Chatbot
                    </h1>
                    <p className="mt-4 text-gray-400">Coming soon...</p>
                  </div>
                </div>
              </PageTransition>
            }
          />
          <Route
            path="/voice-advisor"
            element={
              <PageTransition>
                <div className="min-h-screen bg-[#121212]">
                  <VoiceStartupAdvisor />
                </div>
              </PageTransition>
            }
          />
          <Route
            path="/chat"
            element={
              <PageTransition>
                <ChatPage />
              </PageTransition>
            }
          />
          <Route
            path="/tinder"
            element={
              <PageTransition>
                <TinderPage />
              </PageTransition>
            }
          />
          <Route
            path="/payment"
            element={
              <PageTransition>
                <PaymentPage />
              </PageTransition>
            }
          />
          <Route
            path="/payments"
            element={
              <PageTransition>
                <PaymentsPage />
              </PageTransition>
            }
          />
          <Route
            path="/investor-analytics"
            element={
              <PageTransition>
                <InvestorAnalyticsPage />
              </PageTransition>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
