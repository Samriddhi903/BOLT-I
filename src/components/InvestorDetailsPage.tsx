import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Star, DollarSign, Building2, Users, ArrowRight, Briefcase } from "lucide-react";

const FormCard = styled(motion.div)`
  background: rgba(18, 18, 18, 0.85);
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(16px);
  border-radius: 2rem;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #e5e7eb;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  border-radius: 0.75rem;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;

  &:focus {
    border-color: rgba(139, 92, 246, 0.4);
  }

  &::placeholder {
    color: #6b7280;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  border-radius: 0.75rem;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;

  &:focus {
    border-color: rgba(139, 92, 246, 0.4);
  }

  option {
    background: #1f2937;
    color: #fff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  border-radius: 0.75rem;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
  resize: vertical;
  min-height: 100px;

  &:focus {
    border-color: rgba(139, 92, 246, 0.4);
  }

  &::placeholder {
    color: #6b7280;
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #a21caf 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 1rem;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const InvestorDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    role: "",
    portfolioSize: "",
    investmentFocus: "",
    preferredStages: "",
    description: "",
    website: "",
    location: "",
    linkedin: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Store investor details in backend
      const response = await fetch('http://localhost:3001/api/user/investor-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save investor details');
      }

      // Navigate to analytics page
      sessionStorage.setItem('showUpgradeModal', '1');
      navigate('/analytics');

    } catch (error) {
      console.error('Error saving investor details:', error);
      navigate('/analytics');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] relative overflow-hidden">
      {/* Background gradient effects */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(45deg, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0) 100%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <Star className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100">
              Tell Us About Your Investment Profile
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Help us understand your investment preferences so we can connect you with the right startups and opportunities.
          </p>
        </motion.div>

        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <InputGroup>
                <Label>Full Name *</Label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </InputGroup>

              <InputGroup>
                <Label>Company/Organization</Label>
                <Input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your company or organization"
                />
              </InputGroup>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputGroup>
                <Label>Role/Title</Label>
                <Input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g., Partner, Principal, Angel Investor"
                />
              </InputGroup>

              <InputGroup>
                <Label>Portfolio Size</Label>
                <Select
                  name="portfolioSize"
                  value={formData.portfolioSize}
                  onChange={handleChange}
                >
                  <option value="">Select portfolio size</option>
                  <option value="<$1M">Less than $1M</option>
                  <option value="$1M-$10M">$1M - $10M</option>
                  <option value="$10M-$50M">$10M - $50M</option>
                  <option value="$50M-$100M">$50M - $100M</option>
                  <option value="$100M-$500M">$100M - $500M</option>
                  <option value=">$500M">More than $500M</option>
                </Select>
              </InputGroup>
            </div>

            <InputGroup>
              <Label>Investment Focus *</Label>
              <Select
                name="investmentFocus"
                value={formData.investmentFocus}
                onChange={handleChange}
                required
              >
                <option value="">Select investment focus</option>
                <option value="SaaS">SaaS</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-commerce">E-commerce</option>
                <option value="AI/ML">AI/ML</option>
                <option value="EdTech">EdTech</option>
                <option value="Food Tech">Food Tech</option>
                <option value="Consumer Tech">Consumer Tech</option>
                <option value="Marketplaces">Marketplaces</option>
                <option value="Other">Other</option>
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>Preferred Stages</Label>
              <Select
                name="preferredStages"
                value={formData.preferredStages}
                onChange={handleChange}
              >
                <option value="">Select preferred stages</option>
                <option value="Pre-seed">Pre-seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C">Series C</option>
                <option value="Growth">Growth</option>
                <option value="All Stages">All Stages</option>
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>Investment Philosophy *</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your investment philosophy, what you look for in startups, and how you prefer to work with founders..."
                required
              />
            </InputGroup>

            <div className="grid md:grid-cols-2 gap-4">
              <InputGroup>
                <Label>Website</Label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </InputGroup>

              <InputGroup>
                <Label>LinkedIn Profile</Label>
                <Input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </InputGroup>
            </div>

            <InputGroup>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </InputGroup>

            <SubmitButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Complete Setup
              <ArrowRight className="w-4 h-4" />
            </SubmitButton>
          </form>
        </FormCard>
      </div>
    </div>
  );
};

export default InvestorDetailsPage; 