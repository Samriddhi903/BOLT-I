import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import loginSignupVideo from '../loginsignup.mp4';
import { User, Lock, LogIn, UserPlus } from 'lucide-react';

const Card = styled(motion.div)`
  background: rgba(18, 18, 18, 0.85);
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(16px);
  border-radius: 2rem;
  padding: 2.5rem 2rem;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
`;

const Toggle = styled.div`
  display: flex;
  background: rgba(139, 92, 246, 0.08);
  border-radius: 9999px;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const ToggleButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.75rem 0;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#fff" : "#a78bfa")};
  background: ${({ $active }) =>
    $active
      ? "#7c3aed"
      : "transparent"};
  transition: background 0.2s, color 0.2s;
  border: none;
  outline: none;
  cursor: pointer;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1rem 0.5rem 1rem;
  background: rgba(0,0,0,0.25);
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  border-radius: 1rem;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
  &:focus {
    border-color: #a78bfa;
  }
`;

const Label = styled.label<{ $active?: boolean }>`
  position: absolute;
  left: 1rem;
  top: ${({ $active }) => ($active ? "0.5rem" : "1.1rem")};
  font-size: ${({ $active }) => ($active ? "0.85rem" : "1rem")};
  color: #a78bfa;
  pointer-events: none;
  transition: all 0.2s;
  background: transparent;
`;

const GradientButton = styled.button`
  width: 100%;
  padding: 0.85rem 0;
  background: #7c3aed;
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 1rem;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px 0 rgba(139, 92, 246, 0.18);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, opacity 0.2s;
  &:hover:not(:disabled) {
    background: #6d28d9;
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 16px 0 rgba(124, 58, 237, 0.18);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fields, setFields] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [focus, setFocus] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus({ ...focus, [e.target.name]: true });
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus({ ...focus, [e.target.name]: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!fields.email || !fields.password || (mode === 'signup' && !fields.confirmPassword)) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (mode === "signup" && fields.password !== fields.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fields.email,
          password: fields.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.removeItem('startupDetails');
      localStorage.removeItem('investorDetails');

      // Navigate based on action type
      if (mode === "signup") {
        navigate("/role-selection");
      } else {
        sessionStorage.setItem('showUpgradeModal', '1');
        navigate("/voice-advisor");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        src={loginSignupVideo}
      />
      {/* Dark purple tint overlay for readability */}
      <div className="fixed inset-0 z-10 pointer-events-none" style={{
        background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 100%)',
        opacity: 0.93,
        mixBlendMode: 'multiply',
        backdropFilter: 'blur(2px)'
      }} />
      {/* Subtle overlay for depth (optional, like ResourcesPage) */}
      <div className="absolute inset-0 bg-[#121212]/50 backdrop-blur-[1px] pointer-events-none z-20" />
      <div className="relative z-30 w-full max-w-md mx-auto flex flex-col items-center">
        <h1 className="text-5xl font-extrabold text-center mb-2 bg-gradient-to-r from-white to-white bg-clip-text text-transparent font-poppins drop-shadow-none tracking-tight" style={{letterSpacing: '-0.03em'}}>PitchNest</h1>
        <p className="text-lg text-white font-medium text-center mb-8 font-poppins" style={{letterSpacing: '-0.01em'}}>Welcome to the future of startup & investor connections</p>
        {/* Toggle: white text, white underline for active */}
        <div className="flex w-full justify-center gap-2 mb-8">
          <button
            className={`px-6 py-2 text-lg font-semibold font-poppins transition-colors border-b-2 ${mode === 'login' ? 'border-white text-white' : 'border-transparent text-white/60 hover:text-white'}`}
            style={{background: 'none', outline: 'none', boxShadow: 'none'}}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`px-6 py-2 text-lg font-semibold font-poppins transition-colors border-b-2 ${mode === 'signup' ? 'border-white text-white' : 'border-transparent text-white/60 hover:text-white'}`}
            style={{background: 'none', outline: 'none', boxShadow: 'none'}}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm w-full max-w-md"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"/></svg>
            {error}
          </motion.div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-6 mt-2">
          <InputGroup>
            <Input
              name="email"
              type="email"
              value={fields.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              disabled={loading}
              style={{ paddingLeft: '1rem', background: 'transparent', border: '1.5px solid #fff', color: '#fff', fontSize: '1.1rem', borderRadius: '0.75rem', boxShadow: 'none' }}
              className="focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
            <Label $active={focus.email || fields.email !== ""} style={{ color: '#fff' }}>Email</Label>
          </InputGroup>
          <InputGroup>
            <Input
              name="password"
              type="password"
              value={fields.password}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              disabled={loading}
              style={{ paddingLeft: '1rem', background: 'transparent', border: '1.5px solid #fff', color: '#fff', fontSize: '1.1rem', borderRadius: '0.75rem', boxShadow: 'none' }}
              className="focus:ring-2 focus:ring-white focus:border-white transition-all"
            />
            <Label $active={focus.password || fields.password !== ""} style={{ color: '#fff' }}>Password</Label>
          </InputGroup>
          {mode === "signup" && (
            <InputGroup>
              <Input
                name="confirmPassword"
                type="password"
                value={fields.confirmPassword}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                disabled={loading}
                style={{ paddingLeft: '1rem', background: 'transparent', border: '1.5px solid #fff', color: '#fff', fontSize: '1.1rem', borderRadius: '0.75rem', boxShadow: 'none' }}
                className="focus:ring-2 focus:ring-white focus:border-white transition-all"
              />
              <Label $active={focus.confirmPassword || fields.confirmPassword !== ""} style={{ color: '#fff' }}>Confirm Password</Label>
            </InputGroup>
          )}
          <GradientButton type="submit" disabled={loading} className="flex items-center justify-center gap-2 mt-2 w-full text-lg font-bold font-poppins shadow-lg rounded-xl transition-all" style={{background: '#fff', color: '#121212', borderRadius: '0.75rem', boxShadow: '0 4px 24px 0 #fff4'}}>
            {loading ? (
              <span>Loading...</span>
            ) : mode === "login" ? (
              <>
                <LogIn className="w-5 h-5" /> Login
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Sign Up
              </>
            )}
          </GradientButton>
        </form>
      </div>
    </div>
  );
};

export default LoginSignupPage; 