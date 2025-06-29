import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  User,
  Building2,
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Globe,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Camera,
  Edit3,
  Shield,
  Settings,
  Bell,
  Palette,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";

const ProfileContainer = styled(motion.div)`
  background: rgba(18, 18, 18, 0.85);
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(16px);
  border-radius: 2rem;
  overflow: hidden;
`;

const TabButton = styled(motion.button)<{ $active: boolean }>`
  padding: 1rem 2rem;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.15))' 
    : 'transparent'};
  border: 1px solid ${props => props.$active 
    ? 'rgba(139, 92, 246, 0.4)' 
    : 'rgba(139, 92, 246, 0.15)'};
  color: ${props => props.$active ? '#c084fc' : '#9ca3af'};
  border-radius: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.3);
    color: #c084fc;
  }
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

const SaveButton = styled(motion.button)`
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
  display: flex;
  align-items: center;
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

const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl})` 
    : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(139, 92, 246, 0.5);
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1.5px solid rgba(139, 92, 246, 0.18);
  border-radius: 0.75rem;
  min-height: 3rem;

  &:focus-within {
    border-color: rgba(139, 92, 246, 0.4);
  }
`;

const Tag = styled.span`
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #c084fc;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MonthCard = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(139, 92, 246, 0.18);
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
`;

interface UserProfile {
  id: string;
  email: string;
  role: 'startup' | 'investor';
  createdAt: string;
  lastLogin?: string;
}

interface StartupProfile {
  companyName: string;
  industry: string;
  stage: string;
  description: string;
  teamSize?: number;
  monthlyRevenue?: number;
  fundingNeeded?: string;
  website?: string;
  location?: string;
  logo?: string;
  tags?: string[];
}

interface InvestorProfile {
  fullName: string;
  company?: string;
  role?: string;
  portfolioSize?: string;
  investmentFocus: string[];
  preferredStages?: string;
  description: string;
  website?: string;
  location?: string;
  linkedin?: string;
  avatar?: string;
  tags?: string[];
}

interface MonthlyData {
  monthName: string;
  marketingSpend: number;
  burnRate: number;
  cac: number;
  churnRate: number;
  arpu: number;
  teamSize: number;
  productImprovements: number;
  marketExpansion: number;
  fundingRound: string | null;
}

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // User data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [startupProfile, setStartupProfile] = useState<StartupProfile>({
    companyName: '',
    industry: '',
    stage: '',
    description: '',
    teamSize: 0,
    monthlyRevenue: 0,
    fundingNeeded: '',
    website: '',
    location: '',
    logo: '',
    tags: []
  });
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>({
    fullName: '',
    company: '',
    role: '',
    portfolioSize: '',
    investmentFocus: [],
    preferredStages: '',
    description: '',
    website: '',
    location: '',
    linkedin: '',
    avatar: '',
    tags: []
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  
  // Form states
  const [newTag, setNewTag] = useState('');
  const [newInvestmentFocus, setNewInvestmentFocus] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user profile
      const userResponse = await fetch('http://localhost:3001/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to load user profile');
      }

      const userData = await userResponse.json();
      setUserProfile(userData.user);

      // Load role-specific profile data
      if (userData.user.role === 'startup') {
        await loadStartupProfile(token);
        await loadMonthlyData(token);
      } else if (userData.user.role === 'investor') {
        await loadInvestorProfile(token);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const loadStartupProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/user/startup-details', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setStartupProfile({
            companyName: data.profile.companyName || '',
            industry: data.profile.industry || '',
            stage: data.profile.stage || '',
            description: data.profile.description || '',
            teamSize: data.profile.teamSize || 0,
            monthlyRevenue: data.profile.monthlyRevenue || 0,
            fundingNeeded: data.profile.fundingNeeded || '',
            website: data.profile.website || '',
            location: data.profile.location || '',
            logo: data.profile.logo || '',
            tags: data.profile.tags || []
          });
        }
      }
    } catch (err) {
      console.error('Failed to load startup profile:', err);
    }
  };

  const loadInvestorProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/user/investor-details', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setInvestorProfile({
            fullName: data.profile.fullName || '',
            company: data.profile.company || '',
            role: data.profile.role || '',
            portfolioSize: data.profile.portfolioSize || '',
            investmentFocus: Array.isArray(data.profile.investmentFocus) 
              ? data.profile.investmentFocus 
              : [],
            preferredStages: data.profile.preferredStages || '',
            description: data.profile.description || '',
            website: data.profile.website || '',
            location: data.profile.location || '',
            linkedin: data.profile.linkedin || '',
            avatar: data.profile.avatar || '',
            tags: data.profile.tags || []
          });
        }
      }
    } catch (err) {
      console.error('Failed to load investor profile:', err);
    }
  };

  const loadMonthlyData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/user/startup-monthly-data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.monthlyData && Array.isArray(data.monthlyData)) {
          setMonthlyData(data.monthlyData);
        }
      }
    } catch (err) {
      console.error('Failed to load monthly data:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      if (userProfile?.role === 'startup') {
        const response = await fetch('http://localhost:3001/api/user/startup-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...startupProfile,
            monthlyData: monthlyData
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save startup profile');
        }
      } else if (userProfile?.role === 'investor') {
        const response = await fetch('http://localhost:3001/api/user/investor-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(investorProfile)
        });

        if (!response.ok) {
          throw new Error('Failed to save investor profile');
        }
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setSaving(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const addTag = (type: 'startup' | 'investor') => {
    const tag = type === 'startup' ? newTag : newInvestmentFocus;
    if (!tag.trim()) return;

    if (type === 'startup') {
      setStartupProfile(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
      setNewTag('');
    } else {
      setInvestorProfile(prev => ({
        ...prev,
        investmentFocus: [...prev.investmentFocus, tag.trim()]
      }));
      setNewInvestmentFocus('');
    }
  };

  const removeTag = (index: number, type: 'startup' | 'investor', field: string) => {
    if (type === 'startup') {
      setStartupProfile(prev => ({
        ...prev,
        [field]: prev[field as keyof StartupProfile]?.filter((_: any, i: number) => i !== index)
      }));
    } else {
      setInvestorProfile(prev => ({
        ...prev,
        [field]: prev[field as keyof InvestorProfile]?.filter((_: any, i: number) => i !== index)
      }));
    }
  };

  const addMonthlyData = () => {
    const newMonth: MonthlyData = {
      monthName: `Month ${monthlyData.length + 1}`,
      marketingSpend: 3000,
      burnRate: 8000,
      cac: 30,
      churnRate: 0.05,
      arpu: 20,
      teamSize: 3,
      productImprovements: 0,
      marketExpansion: 0,
      fundingRound: null
    };
    setMonthlyData([...monthlyData, newMonth]);
  };

  const removeMonthlyData = (index: number) => {
    if (monthlyData.length > 1) {
      setMonthlyData(monthlyData.filter((_, i) => i !== index));
    }
  };

  const updateMonthlyData = (index: number, field: string, value: any) => {
    const updated = [...monthlyData];
    updated[index] = { ...updated[index], [field]: value };
    setMonthlyData(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'account', name: 'Account', icon: Settings },
    ...(userProfile?.role === 'startup' ? [{ id: 'data', name: 'Business Data', icon: TrendingUp }] : []),
    { id: 'security', name: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#121212] relative overflow-hidden">
      {/* Background effects */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(45deg, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0) 100%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 pt-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/analytics')}
                className="p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-purple-300" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Profile Settings</h1>
                <p className="text-gray-400">Manage your account and profile information</p>
              </div>
            </div>
            
            <SaveButton
              onClick={handleSaveProfile}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </SaveButton>
          </motion.div>

          {/* Status Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-green-300">{success}</span>
              <button onClick={() => setSuccess(null)} className="ml-auto">
                <X className="w-4 h-4 text-green-400" />
              </button>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabButton
                      key={tab.id}
                      $active={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center gap-3 text-left"
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </TabButton>
                  );
                })}
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <ProfileContainer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-8">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-100 mb-2">
                          {userProfile?.role === 'startup' ? 'Startup Profile' : 'Investor Profile'}
                        </h2>
                        <p className="text-gray-400">
                          Update your {userProfile?.role} information and preferences
                        </p>
                      </div>

                      {/* Avatar Section */}
                      <div className="text-center">
                        <AvatarContainer>
                          <Avatar $imageUrl={userProfile?.role === 'startup' ? startupProfile.logo : investorProfile.avatar}>
                            {(!startupProfile.logo && !investorProfile.avatar) && (
                              <User className="w-12 h-12 text-white" />
                            )}
                            <AvatarOverlay>
                              <Camera className="w-8 h-8 text-white" />
                            </AvatarOverlay>
                          </Avatar>
                        </AvatarContainer>
                        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                          Change Photo
                        </button>
                      </div>

                      {/* Profile Form */}
                      {userProfile?.role === 'startup' ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          <InputGroup>
                            <Label>Company Name *</Label>
                            <Input
                              type="text"
                              value={startupProfile.companyName}
                              onChange={(e) => setStartupProfile(prev => ({ ...prev, companyName: e.target.value }))}
                              placeholder="Enter company name"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>Industry *</Label>
                            <Select
                              value={startupProfile.industry}
                              onChange={(e) => setStartupProfile(prev => ({ ...prev, industry: e.target.value }))}
                            >
                              <option value="">Select industry</option>
                              <option value="SaaS">SaaS</option>
                              <option value="Fintech">Fintech</option>
                              <option value="Healthcare">Healthcare</option>
                              <option value="E-commerce">E-commerce</option>
                              <option value="AI/ML">AI/ML</option>
                              <option value="EdTech">EdTech</option>
                              <option value="Food Tech">Food Tech</option>
                              <option value="Other">Other</option>
                            </Select>
                          </InputGroup>

                          <InputGroup>
                            <Label>Stage *</Label>
                            <Select
                              value={startupProfile.stage}
                              onChange={(e) => setStartupProfile(prev => ({ ...prev, stage: e.target.value }))}
                            >
                              <option value="">Select stage</option>
                              <option value="Pre-seed">Pre-seed</option>
                              <option value="Seed">Seed</option>
                              <option value="Series A">Series A</option>
                              <option value="Series B">Series B</option>
                              <option value="Series C">Series C</option>
                              <option value="Growth">Growth</option>
                            </Select>
                          </InputGroup>

                          <InputGroup>
                            <Label>Team Size</Label>
                            <Input
                              type="number"
                              value={startupProfile.teamSize || ''}
                              onChange={(e) => setStartupProfile(prev => ({ ...prev, teamSize: Number(e.target.value) }))}
                              placeholder="Number of employees"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>Monthly Revenue</Label>
                            <Input
                              type="number"
                              value={startupProfile.monthlyRevenue || ''}
                              onChange={(e) => setStartupProfile(prev => ({ ...prev, monthlyRevenue: Number(e.target.value) }))}
                              placeholder="Monthly revenue in USD"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>Funding Needed</Label>
                            <Input
                              type="text"
                              value={startupProfile.fundingNeeded || ''}
                              onChange={(e) => setStartupProfile(prev => ({ ...prev, fundingNeeded: e.target.value }))}
                              placeholder="e.g., $500K, $1M, $5M"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>Website</Label>
                            <Input
                              type="url"
                              value={startupProfile.website || ''}
                              onChange={(e) => setStartupProfile(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="https://yourcompany.com"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>Location</Label>
                            <Input
                              type="text"
                              value={startupProfile.location || ''}
                              onChange={(e) => setStartupProfile(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="City, Country"
                            />
                          </InputGroup>

                          <div className="md:col-span-2">
                            <InputGroup>
                              <Label>Company Description *</Label>
                              <TextArea
                                value={startupProfile.description}
                                onChange={(e) => setStartupProfile(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your business, what problem you're solving, and your unique value proposition..."
                              />
                            </InputGroup>
                          </div>

                          <div className="md:col-span-2">
                            <Label>Tags</Label>
                            <TagInput>
                              {startupProfile.tags?.map((tag, index) => (
                                <Tag key={index}>
                                  {tag}
                                  <button onClick={() => removeTag(index, 'startup', 'tags')}>
                                    <X className="w-3 h-3" />
                                  </button>
                                </Tag>
                              ))}
                              <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('startup'))}
                                placeholder="Add tags..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-400 min-w-32"
                              />
                            </TagInput>
                          </div>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          <InputGroup>
                            <Label>Full Name *</Label>
                            <Input
                              type="text"
                              value={investorProfile.fullName}
                              onChange={(e) => setInvestorProfile(prev => ({ ...prev, fullName: e.target.value }))}
                              placeholder="Enter your full name"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>Company/Organization</Label>
                            <Input
                              type="text"
                              value={investorProfile.company || ''}
                              onChange={(e) => setInvestorProfile(prev => ({ ...prev, company: e.target.value }))}
                              placeholder="Your company or organization"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>Role/Title</Label>
                            <Input
                              type="text"
                              value={investorProfile.role || ''}
                              onChange={(e) => setInvestorProfile(prev => ({ ...prev, role: e.target.value }))}
                              placeholder="e.g., Partner, Principal, Angel Investor"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>Portfolio Size</Label>
                            <Select
                              value={investorProfile.portfolioSize || ''}
                              onChange={(e) => setInvestorProfile(prev => ({ ...prev, portfolioSize: e.target.value }))}
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

                          <InputGroup>
                            <Label>Preferred Stages</Label>
                            <Select
                              value={investorProfile.preferredStages || ''}
                              onChange={(e) => setInvestorProfile(prev => ({ ...prev, preferredStages: e.target.value }))}
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
                            <Label>Website</Label>
                            <Input
                              type="url"
                              value={investorProfile.website || ''}
                              onChange={(e) => setInvestorProfile(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="https://yourwebsite.com"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>LinkedIn Profile</Label>
                            <Input
                              type="url"
                              value={investorProfile.linkedin || ''}
                              onChange={(e) => setInvestorProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          </InputGroup>

                          <InputGroup>
                            <Label>Location</Label>
                            <Input
                              type="text"
                              value={investorProfile.location || ''}
                              onChange={(e) => setInvestorProfile(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="City, Country"
                            />
                          </InputGroup>

                          <div className="md:col-span-2">
                            <InputGroup>
                              <Label>Investment Philosophy *</Label>
                              <TextArea
                                value={investorProfile.description}
                                onChange={(e) => setInvestorProfile(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your investment philosophy, what you look for in startups, and how you prefer to work with founders..."
                              />
                            </InputGroup>
                          </div>

                          <div className="md:col-span-2">
                            <Label>Investment Focus</Label>
                            <TagInput>
                              {investorProfile.investmentFocus.map((focus, index) => (
                                <Tag key={index}>
                                  {focus}
                                  <button onClick={() => removeTag(index, 'investor', 'investmentFocus')}>
                                    <X className="w-3 h-3" />
                                  </button>
                                </Tag>
                              ))}
                              <input
                                type="text"
                                value={newInvestmentFocus}
                                onChange={(e) => setNewInvestmentFocus(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('investor'))}
                                placeholder="Add investment focus areas..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-400 min-w-32"
                              />
                            </TagInput>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Account Tab */}
                  {activeTab === 'account' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-100 mb-2">Account Information</h2>
                        <p className="text-gray-400">Manage your account settings and preferences</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <InputGroup>
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            value={userProfile?.email || ''}
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </InputGroup>

                        <InputGroup>
                          <Label>Account Type</Label>
                          <Input
                            type="text"
                            value={userProfile?.role || ''}
                            disabled
                            className="opacity-50 cursor-not-allowed capitalize"
                          />
                          <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                        </InputGroup>

                        <InputGroup>
                          <Label>Member Since</Label>
                          <Input
                            type="text"
                            value={userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : ''}
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          />
                        </InputGroup>

                        <InputGroup>
                          <Label>Last Login</Label>
                          <Input
                            type="text"
                            value={userProfile?.lastLogin ? new Date(userProfile.lastLogin).toLocaleDateString() : 'Never'}
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          />
                        </InputGroup>
                      </div>
                    </div>
                  )}

                  {/* Business Data Tab (Startup only) */}
                  {activeTab === 'data' && userProfile?.role === 'startup' && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-100 mb-2">Business Data</h2>
                          <p className="text-gray-400">Manage your monthly performance metrics</p>
                        </div>
                        <button
                          onClick={addMonthlyData}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Month
                        </button>
                      </div>

                      <div className="grid gap-4">
                        {monthlyData.map((month, index) => (
                          <MonthCard key={index}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-100">{month.monthName}</h3>
                              {monthlyData.length > 1 && (
                                <button
                                  onClick={() => removeMonthlyData(index)}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                              <InputGroup>
                                <Label>Month Name</Label>
                                <Input
                                  type="text"
                                  value={month.monthName}
                                  onChange={(e) => updateMonthlyData(index, 'monthName', e.target.value)}
                                />
                              </InputGroup>

                              <InputGroup>
                                <Label>Marketing Spend ($)</Label>
                                <Input
                                  type="number"
                                  value={month.marketingSpend}
                                  onChange={(e) => updateMonthlyData(index, 'marketingSpend', Number(e.target.value))}
                                />
                              </InputGroup>

                              <InputGroup>
                                <Label>Burn Rate ($)</Label>
                                <Input
                                  type="number"
                                  value={month.burnRate}
                                  onChange={(e) => updateMonthlyData(index, 'burnRate', Number(e.target.value))}
                                />
                              </InputGroup>

                              <InputGroup>
                                <Label>CAC ($)</Label>
                                <Input
                                  type="number"
                                  value={month.cac}
                                  onChange={(e) => updateMonthlyData(index, 'cac', Number(e.target.value))}
                                />
                              </InputGroup>

                              <InputGroup>
                                <Label>Churn Rate (0-1)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="1"
                                  value={month.churnRate}
                                  onChange={(e) => updateMonthlyData(index, 'churnRate', Number(e.target.value))}
                                />
                              </InputGroup>

                              <InputGroup>
                                <Label>ARPU ($)</Label>
                                <Input
                                  type="number"
                                  value={month.arpu}
                                  onChange={(e) => updateMonthlyData(index, 'arpu', Number(e.target.value))}
                                />
                              </InputGroup>

                              <InputGroup>
                                <Label>Team Size</Label>
                                <Input
                                  type="number"
                                  value={month.teamSize}
                                  onChange={(e) => updateMonthlyData(index, 'teamSize', Number(e.target.value))}
                                />
                              </InputGroup>

                              <InputGroup>
                                <Label>Product Improvements</Label>
                                <Input
                                  type="number"
                                  value={month.productImprovements}
                                  onChange={(e) => updateMonthlyData(index, 'productImprovements', Number(e.target.value))}
                                />
                              </InputGroup>

                              <InputGroup>
                                <Label>Market Expansion (0-1)</Label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="1"
                                  value={month.marketExpansion}
                                  onChange={(e) => updateMonthlyData(index, 'marketExpansion', Number(e.target.value))}
                                />
                              </InputGroup>
                            </div>
                          </MonthCard>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-100 mb-2">Security Settings</h2>
                        <p className="text-gray-400">Manage your password and security preferences</p>
                      </div>

                      <div className="max-w-md space-y-6">
                        <InputGroup>
                          <Label>Current Password</Label>
                          <div className="relative">
                            <Input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </InputGroup>

                        <InputGroup>
                          <Label>New Password</Label>
                          <div className="relative">
                            <Input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </InputGroup>

                        <InputGroup>
                          <Label>Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </InputGroup>

                        <button
                          onClick={handleChangePassword}
                          disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                          {saving ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </ProfileContainer>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;