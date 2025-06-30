import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
      ? "linear-gradient(90deg, #a21caf 0%, #7c3aed 100%)"
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
  background: linear-gradient(90deg, #a21caf 0%, #7c3aed 100%);
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
    background: linear-gradient(90deg, #7c3aed 0%, #a21caf 100%);
    transform: translateY(-2px) scale(1.03);
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
    if (!fields.email || !fields.password) {
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
        navigate("/analytics");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] relative overflow-hidden">
      {/* Background gradient beam */}
      <div
        className="absolute inset-0 rotate-45 opacity-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #6B21A8 50%, transparent 100%)",
          filter: "blur(80px)",
          transform: "translateY(-50%) rotate(-45deg) scale(2)",
        }}
      />
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-[#121212]/50 backdrop-blur-[1px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <Card
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Toggle>
            <ToggleButton $active={mode === "login"} onClick={() => setMode("login")}>Login</ToggleButton>
            <ToggleButton $active={mode === "signup"} onClick={() => setMode("signup")}>Sign Up</ToggleButton>
          </Toggle>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
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
              />
              <Label $active={focus.email || fields.email !== ""}>Email</Label>
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
              />
              <Label $active={focus.password || fields.password !== ""}>Password</Label>
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
                />
                <Label $active={focus.confirmPassword || fields.confirmPassword !== ""}>Confirm Password</Label>
              </InputGroup>
            )}
            <GradientButton type="submit" disabled={loading}>
              {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
            </GradientButton>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginSignupPage; 