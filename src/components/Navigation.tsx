import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Zap, User, LogOut } from "lucide-react";

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get user info from token
  useEffect(() => {
    const getUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:3001/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUserEmail(data.user.email);
          }
        } catch (error) {
          console.error('Failed to get user info:', error);
        }
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navItems = [
    { name: "Analytics", path: "/analytics" },
    { name: "Chatbot", path: "/voice-advisor" },
    { name: "Resources", path: "/resources" },
    { name: "Chat", path: "/chat" },
    { name: "Tinder-style interface", path: "/tinder" },
    { name: "Payments", path: "/payments" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-md shadow-lg border-b border-purple-900/30"
          : "bg-black/60 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Zap className="w-6 h-6 text-purple-300 group-hover:text-purple-400 transition-colors duration-200" />
            </div>
            <span className="text-xl font-semibold text-white">TechFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "text-purple-400"
                    : "text-gray-300 hover:text-purple-400"
                }`}
              >
                <span className="relative">
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-full h-0.5 bg-purple-400 transform origin-left transition-transform duration-200 ${
                      location.pathname === item.path
                        ? "scale-x-100"
                        : "scale-x-0"
                    }`}
                  />
                </span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {userEmail ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-900/30 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-sm">{userEmail.split('@')[0]}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-purple-900/30 rounded-lg shadow-lg py-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-purple-400 hover:bg-purple-900/20 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      to="/payments"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-purple-400 hover:bg-purple-900/20 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>Payments</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-purple-900/30 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 pb-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "text-purple-400 bg-purple-900/20"
                    : "text-gray-300 hover:text-purple-400 hover:bg-purple-900/10"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile user menu */}
            {userEmail ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-purple-900/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <Link
                  to="/payments"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-purple-900/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Payments
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-red-400 hover:bg-red-900/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-purple-400 hover:bg-purple-900/10 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;