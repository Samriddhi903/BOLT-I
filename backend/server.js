// ===== Express Server for Voice Startup Advisor =====

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
let db;
async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db('startup_advisor');
    console.log('Connected to MongoDB');
  }
  return db;
}

// ===== Helper Functions =====
function calculateRunway(businessData) {
  if (!businessData.burnRate || businessData.burnRate <= 0) return "Unknown";
  if (!businessData.monthlyRevenue) return Math.floor(12);
  const netBurn = businessData.burnRate - businessData.monthlyRevenue;
  if (netBurn <= 0) return "Profitable";
  const estimatedCash = businessData.burnRate * 6;
  return Math.floor(estimatedCash / netBurn);
}
function calculateBurnMultiple(businessData) {
  if (!businessData.burnRate || !businessData.monthlyRevenue) return "N/A";
  if (businessData.monthlyRevenue === 0) return "Infinite";
  const multiple = (businessData.burnRate / businessData.monthlyRevenue).toFixed(2);
  return multiple;
}
function assessUnitEconomics(businessData) {
  if (!businessData.ltv || !businessData.cac) return "Insufficient data";
  const ratio = businessData.ltv / businessData.cac;
  if (ratio >= 4) return "Excellent (4:1+)";
  if (ratio >= 3) return "Healthy (3:1)";
  if (ratio >= 2) return "Acceptable (2:1)";
  return "Needs improvement (<2:1)";
}
function assessChurnHealth(churnRate) {
  if (!churnRate) return "No data";
  if (churnRate <= 2) return "Excellent (<2%)";
  if (churnRate <= 5) return "Good (<5%)";
  if (churnRate <= 10) return "Acceptable (<10%)";
  return "High (>10% - needs attention)";
}
function assessRevenueHealth(businessData) {
  if (!businessData.monthlyRevenue) return "Pre-revenue stage";
  if (businessData.monthlyRevenue >= 100000) return "Strong revenue base";
  if (businessData.monthlyRevenue >= 10000) return "Growing revenue";
  return "Early revenue stage";
}

// Intelligent fallback response generator
function generateFallbackResponse(message, businessData) {
  const lowerMessage = message.toLowerCase();
  
  // Revenue and growth questions
  if (lowerMessage.includes('revenue') || lowerMessage.includes('growth') || lowerMessage.includes('sales')) {
    if (businessData && businessData.monthlyRevenue) {
      return `Based on your current monthly revenue of $${businessData.monthlyRevenue.toLocaleString()}, you're in the ${assessRevenueHealth(businessData)} category. Focus on increasing your customer base and improving your conversion rates. Consider implementing a referral program and optimizing your sales funnel.`;
    }
    return "For revenue growth, focus on customer acquisition, retention, and increasing your average order value. Track your key metrics like customer acquisition cost and lifetime value to ensure sustainable growth.";
  }
  
  // Burn rate and runway questions
  if (lowerMessage.includes('burn') || lowerMessage.includes('runway') || lowerMessage.includes('cash')) {
    if (businessData && businessData.burnRate) {
      const runway = calculateRunway(businessData);
      const burnMultiple = calculateBurnMultiple(businessData);
      return `Your current burn rate is $${businessData.burnRate.toLocaleString()} per month with a burn multiple of ${burnMultiple}. Your estimated runway is ${runway} months. To extend your runway, focus on reducing costs and increasing revenue. Consider renegotiating vendor contracts and optimizing your team structure.`;
    }
    return "To manage your burn rate effectively, track all expenses, prioritize essential costs, and focus on revenue-generating activities. Aim for a burn multiple under 3x for healthy growth.";
  }
  
  // Customer and churn questions
  if (lowerMessage.includes('customer') || lowerMessage.includes('churn') || lowerMessage.includes('retention')) {
    if (businessData && businessData.churnRate) {
      return `Your current churn rate is ${businessData.churnRate}%, which is ${assessChurnHealth(businessData.churnRate).toLowerCase()}. With ${businessData.customerCount?.toLocaleString()} customers, focus on improving customer satisfaction, onboarding, and support. Implement feedback loops and proactive customer success programs.`;
    }
    return "To reduce churn, focus on customer success, regular feedback collection, and addressing pain points quickly. Aim for a monthly churn rate under 5% for SaaS businesses.";
  }
  
  // Team and hiring questions
  if (lowerMessage.includes('team') || lowerMessage.includes('hire') || lowerMessage.includes('employee')) {
    if (businessData && businessData.teamSize) {
      return `With your team of ${businessData.teamSize} people, focus on building a strong company culture and clear communication channels. Consider hiring strategically based on your growth stage and prioritize roles that directly impact revenue or product development.`;
    }
    return "When building your team, hire for culture fit and specific skills needed for your current growth stage. Focus on roles that directly impact your key metrics and customer satisfaction.";
  }
  
  // General startup advice
  if (lowerMessage.includes('advice') || lowerMessage.includes('help') || lowerMessage.includes('what should')) {
    if (businessData) {
      const unitEconomics = assessUnitEconomics(businessData);
      return `Based on your business data, your unit economics are ${unitEconomics}. Focus on your most critical metrics: customer acquisition cost, lifetime value, and churn rate. Prioritize activities that improve these numbers and consider your runway when making strategic decisions.`;
    }
    return "Focus on your core value proposition, track key metrics religiously, and maintain a healthy cash runway. Build strong relationships with customers and iterate based on their feedback.";
  }
  
  // Default response
  return "I'm experiencing high demand right now, but I can still help! Based on startup best practices, focus on your key metrics, maintain healthy unit economics, and prioritize customer satisfaction. What specific aspect of your business would you like to discuss?";
}

async function logInteraction(businessId, question, response) {
  try {
    const database = await connectToDatabase();
    await database.collection('chat_logs').insertOne({
      businessId,
      question,
      response,
      timestamp: new Date().toISOString(),
      service: 'gemini',
      responseLength: response.length
    });
  } catch (error) {
    console.error('Failed to log interaction:', error);
  }
}

// ===== API Endpoints =====
// GET /api/business/:id
app.get('/api/business/:id', async (req, res) => {
  const businessId = req.params.id;
  try {
    // Check if user is authenticated
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        // Verify token and get user data
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const database = await connectToDatabase();
        // If requesting own business, use decoded.userId
        const userIdToFetch = businessId;
        // Get startup profile by userId
        const startupProfile = await database.collection('startup_profiles').findOne(
          { userId: userIdToFetch }
        );
        if (startupProfile) {
          return res.json({
            businessId: userIdToFetch,
            companyName: startupProfile.companyName,
            industry: startupProfile.industry,
            stage: startupProfile.stage,
            description: startupProfile.description,
            teamSize: startupProfile.teamSize || 0,
            monthlyRevenue: startupProfile.monthlyRevenue || 0,
            fundingNeeded: startupProfile.fundingNeeded || null,
            website: startupProfile.website || null,
            location: startupProfile.location || null,
            lastUpdated: startupProfile.updatedAt || startupProfile.createdAt,
            equityStructure: startupProfile.equityStructure || [{ name: 'Owner', percentage: 100 }],
            lastValuation: startupProfile.lastValuation || null
          });
        }
      } catch (jwtError) {
        // Ignore and fallback
      }
    }
    // Fallback: try to fetch from startup_profiles without auth
    const database = await connectToDatabase();
    const startupProfile = await database.collection('startup_profiles').findOne(
      { userId: businessId }
    );
    if (startupProfile) {
      return res.json({
        businessId: businessId,
        companyName: startupProfile.companyName,
        industry: startupProfile.industry,
        stage: startupProfile.stage,
        description: startupProfile.description,
        teamSize: startupProfile.teamSize || 0,
        monthlyRevenue: startupProfile.monthlyRevenue || 0,
        fundingNeeded: startupProfile.fundingNeeded || null,
        website: startupProfile.website || null,
        location: startupProfile.location || null,
        lastUpdated: startupProfile.updatedAt || startupProfile.createdAt,
        equityStructure: startupProfile.equityStructure || [{ name: 'Owner', percentage: 100 }],
        lastValuation: startupProfile.lastValuation || null
      });
    }
    // Fallback to demo data if not found
    const demoData = {
      businessId,
      companyName: "TechStartup Inc",
      industry: "SaaS",
      stage: "Series A",
      monthlyRevenue: 45000,
      teamSize: 12,
      fundingNeeded: "$500K",
      website: null,
      location: null,
      lastUpdated: new Date().toISOString(),
      equityStructure: [{ name: 'Owner', percentage: 100 }],
      lastValuation: 1000000
    };
    return res.json(demoData);
  } catch (error) {
    console.error('Database error:', error);
    // Fallback to demo data on database error
    const demoData = {
      businessId,
      companyName: "TechStartup Inc",
      industry: "SaaS",
      stage: "Series A",
      monthlyRevenue: 45000,
      teamSize: 12,
      fundingNeeded: "$500K",
      website: null,
      location: null,
      lastUpdated: new Date().toISOString(),
      equityStructure: [{ name: 'Owner', percentage: 100 }],
      lastValuation: 1000000
    };
    res.json(demoData);
  }
});

// PUT /api/business/:id
app.put('/api/business/:id', async (req, res) => {
  const businessId = req.params.id;
  try {
    const database = await connectToDatabase();
    const updateData = {
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    const result = await database
      .collection('businesses')
      .updateOne(
        { businessId },
        { $set: updateData },
        { upsert: true }
      );
    res.json({ success: true, result });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Failed to update business data' });
  }
});

// POST /api/business/register
app.post('/api/business/register', async (req, res) => {
  try {
    const database = await connectToDatabase();
    const businessData = {
      businessId: req.body.businessId || `business_${Date.now()}`,
      companyName: req.body.companyName || 'Unnamed Company',
      industry: req.body.industry || 'Technology',
      stage: req.body.stage || 'Pre-seed',
      monthlyRevenue: parseFloat(req.body.monthlyRevenue) || 0,
      burnRate: parseFloat(req.body.burnRate) || 0,
      teamSize: parseInt(req.body.teamSize) || 1,
      customerCount: parseInt(req.body.customerCount) || 0,
      churnRate: parseFloat(req.body.churnRate) || 0,
      cac: parseFloat(req.body.cac) || 0,
      ltv: parseFloat(req.body.ltv) || 0,
      marketSize: parseFloat(req.body.marketSize) || 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    const result = await database
      .collection('businesses')
      .insertOne(businessData);
    res.json({ 
      success: true, 
      businessId: businessData.businessId,
      insertedId: result.insertedId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register business' });
  }
});

// POST /api/gemini-voice
app.post('/api/gemini-voice', async (req, res) => {
  const { message, businessData, businessId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const businessContext = businessData ? `\nBUSINESS CONTEXT FOR ${businessData.companyName}:\n- Company: ${businessData.companyName}\n- Industry: ${businessData.industry}\n- Stage: ${businessData.stage}\n- Monthly Revenue: $${businessData.monthlyRevenue?.toLocaleString()}\n- Monthly Burn Rate: $${businessData.burnRate?.toLocaleString()}\n- Team Size: ${businessData.teamSize} people\n- Customer Count: ${businessData.customerCount?.toLocaleString()}\n- Churn Rate: ${businessData.churnRate}%\n- Customer Acquisition Cost (CAC): $${businessData.cac}\n- Customer Lifetime Value (LTV): $${businessData.ltv}\n- LTV/CAC Ratio: ${businessData.ltv && businessData.cac ? (businessData.ltv / businessData.cac).toFixed(2) : 'N/A'}\n- Market Size: $${businessData.marketSize?.toLocaleString()}\n- Estimated Runway: ${calculateRunway(businessData)} months\n- Last Updated: ${businessData.lastUpdated}\n\nKEY METRICS ANALYSIS:\n- Revenue Growth: ${assessRevenueHealth(businessData)}\n- Burn Multiple: ${calculateBurnMultiple(businessData)}\n- Unit Economics: ${assessUnitEconomics(businessData)}\n- Churn Health: ${assessChurnHealth(businessData.churnRate)}\n` : 'No specific business data available - provide general startup advice.';
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
      },
    });
    const systemPrompt = `You are an expert startup advisor with deep knowledge of business metrics and growth strategies. You have access to real-time business data and provide personalized advice.\n\n${businessContext}\n\nRESPONSE GUIDELINES:\n1. Reference specific numbers from their business data when available\n2. Compare against industry benchmarks (3:1 LTV:CAC ratio, <5% monthly churn for SaaS, etc.)\n3. Prioritize the most critical issues first\n4. Be encouraging but realistic\n5. Provide 2-3 concrete, actionable next steps\n6. Keep responses conversational and suitable for voice interaction\n7. Limit response to 120-150 words for optimal voice playback\n8. Use a friendly, professional tone\n9. Avoid bullet points - use natural speech patterns\n10. When giving numbers, say them in a natural way (e.g., "forty-five thousand" not "$45,000")\n\nIf the user asks general questions, contextualize your answer with their specific business situation when possible.`;
    const prompt = `${systemPrompt}\n\nUser question: ${message}\n\nPlease provide specific, actionable advice:`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text
      .replace(/\*/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    await logInteraction(businessId, message, cleanedText);
    res.json({ message: cleanedText });
  } catch (error) {
    console.error('Gemini API error:', error);
    const fallbackResponse = generateFallbackResponse(message, businessData);
    res.json({ message: fallbackResponse });
  }
});

// POST /api/elevenlabs-tts
app.post('/api/elevenlabs-tts', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  if (text.length > 2500) {
    return res.status(400).json({ error: 'Text too long for speech synthesis' });
  }
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }
    console.log('Generating speech for text length:', text.length);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          }
        }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Eleven Labs API error:', response.status, errorText);
      if (response.status === 401) {
        throw new Error('Invalid ElevenLabs API key');
      } else if (response.status === 429) {
        throw new Error('ElevenLabs rate limit exceeded');
      } else {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
    }
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.setHeader('Cache-Control', 'no-cache');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== Authentication Endpoints =====

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, photo } = req.body;
    
    if (!email || !password || !photo || !photo.data || !photo.contentType) {
      return res.status(400).json({ error: 'Email, password, and profile photo are required' });
    }

    const database = await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await database.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      photo: {
        data: new Buffer.from(photo.data, 'base64'),
        contentType: photo.contentType
      }
    };

    const result = await database.collection('users').insertOne(user);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: result.insertedId,
        email: user.email,
        createdAt: user.createdAt,
        photo: user.photo
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const database = await connectToDatabase();
    
    // Find user
    const user = await database.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await database.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date().toISOString() } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Protected route example
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const database = await connectToDatabase();
    const user = await database.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has a startup profile
    const startupProfile = await database.collection('startup_profiles').findOne(
      { userId: req.user.userId }
    );

    // Check if user has an investor profile
    const investorProfile = await database.collection('investor_profiles').findOne(
      { userId: req.user.userId }
    );

    res.json({
      success: true,
      user: {
        email: user.email,
        id: user._id,
        role: user.role || null,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profilePhoto: user.profilePhoto || null
      },
      businessId: startupProfile ? req.user.userId : null, // Use userId as businessId if they have a startup profile
      hasStartupProfile: !!startupProfile,
      role: user?.role || null,
      currentPlan: user?.currentPlan || 'Free',
      profilePhoto: user.profilePhoto || null
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const database = await connectToDatabase();
    
    // Get user
    const user = await database.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      { $set: { password: hashedNewPassword, passwordUpdatedAt: new Date().toISOString() } }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST /api/user/role - Store user role selection
app.post('/api/user/role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['startup', 'investor'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (startup or investor)' });
    }

    const database = await connectToDatabase();
    
    // Update user with role
    const result = await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      { 
        $set: { 
          role: role,
          roleUpdatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Role updated successfully',
      role: role
    });

  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// GET /api/user/startup-details - Get startup profile
app.get('/api/user/startup-details', authenticateToken, async (req, res) => {
  try {
    const database = await connectToDatabase();
    
    const startupProfile = await database.collection('startup_profiles').findOne(
      { userId: req.user.userId }
    );

    if (!startupProfile) {
      return res.json({ success: true, profile: null });
    }

    res.json({
      success: true,
      profile: startupProfile
    });

  } catch (error) {
    console.error('Get startup details error:', error);
    res.status(500).json({ error: 'Failed to get startup details' });
  }
});

// GET /api/user/investor-details - Get investor profile
app.get('/api/user/investor-details', authenticateToken, async (req, res) => {
  try {
    const database = await connectToDatabase();
    
    const investorProfile = await database.collection('investor_profiles').findOne(
      { userId: req.user.userId }
    );

    if (!investorProfile) {
      return res.json({ success: true, profile: null });
    }

    res.json({
      success: true,
      profile: investorProfile
    });

  } catch (error) {
    console.error('Get investor details error:', error);
    res.status(500).json({ error: 'Failed to get investor details' });
  }
});

// POST /api/user/startup-details - Store startup details
app.post('/api/user/startup-details', authenticateToken, async (req, res) => {
  try {
    const database = await connectToDatabase();
    const {
      companyName,
      industry,
      stage,
      description,
      teamSize,
      monthlyRevenue,
      fundingNeeded,
      website,
      location,
      logo,
      tags,
      monthlyData,
      equityStructure,
      lastValuation
    } = req.body;

    // PATCH-like: If only equityStructure or lastValuation is sent, update just those fields
    if ((equityStructure || lastValuation) && !companyName && !industry && !stage && !description) {
      const updateFields = {};
      if (equityStructure && Array.isArray(equityStructure) && equityStructure.length > 0) {
        updateFields.equityStructure = equityStructure;
      }
      if (lastValuation) {
        updateFields.lastValuation = lastValuation;
      }
      if (Object.keys(updateFields).length > 0) {
        updateFields.updatedAt = new Date().toISOString();
        await database.collection('startup_profiles').updateOne(
          { userId: req.user.userId },
          { $set: updateFields },
          { upsert: true }
        );
        return res.json({ success: true, message: 'Equity/valuation updated' });
      }
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Full update (all required fields)
    if (!companyName || !industry || !stage || !description) {
      return res.status(400).json({ error: 'Required fields: companyName, industry, stage, description' });
    }

    // Always set equityStructure to default if missing or empty
    let equityToStore = equityStructure && Array.isArray(equityStructure) && equityStructure.length > 0
      ? equityStructure
      : [{ name: 'Owner', percentage: 100 }];

    // Create or update startup profile
    const startupData = {
      userId: req.user.userId,
      companyName,
      industry,
      stage,
      description,
      teamSize: teamSize || null,
      monthlyRevenue: monthlyRevenue || null,
      fundingNeeded: fundingNeeded || null,
      website: website || null,
      location: location || null,
      logo: logo || null,
      tags: tags || [],
      equityStructure: equityToStore,
      lastValuation: lastValuation || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await database.collection('startup_profiles').updateOne(
      { userId: req.user.userId },
      { $set: startupData },
      { upsert: true }
    );

    // Store monthly data if provided
    if (monthlyData && Array.isArray(monthlyData) && monthlyData.length > 0) {
      console.log('Storing monthly data for userId:', req.user.userId);
      console.log('Monthly data:', monthlyData);
      
      const monthlyResult = await database.collection('startup_monthly_data').updateOne(
        { userId: req.user.userId },
        { 
          $set: {
            userId: req.user.userId,
            monthlyData: monthlyData,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );
      console.log('Monthly data storage result:', monthlyResult);
      
      // Also try with ObjectId format as backup
      try {
        const objectIdUserId = new ObjectId(req.user.userId);
        await database.collection('startup_monthly_data').updateOne(
          { userId: objectIdUserId },
          { 
            $set: {
              userId: objectIdUserId,
              monthlyData: monthlyData,
              updatedAt: new Date().toISOString()
            }
          },
          { upsert: true }
        );
        console.log('Also stored with ObjectId format');
      } catch (objectIdError) {
        console.log('ObjectId conversion failed (expected for string userIds):', objectIdError.message);
      }
    } else {
      console.log('No monthly data provided or invalid format');
    }

    res.json({
      success: true,
      message: 'Startup details saved successfully',
      profileId: result.upsertedId || 'updated'
    });

  } catch (error) {
    console.error('Startup details save error:', error);
    res.status(500).json({ error: 'Failed to save startup details' });
  }
});

// GET /api/user/startup-monthly-data - Get startup monthly data
app.get('/api/user/startup-monthly-data', authenticateToken, async (req, res) => {
  try {
    const database = await connectToDatabase();
    const { startupId } = req.query;
    // If startupId is provided and user is investor, fetch that startup's data
    if (startupId && startupId !== req.user.userId) {
      // Check user role
      const user = await database.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
      if (!user || user.role !== 'investor') {
        return res.status(403).json({ error: 'Forbidden: Only investors can view other startups\' analytics.' });
      }
      // Fetch monthly data for the specified startupId
      let monthlyData = await database.collection('startup_monthly_data').findOne(
        { userId: startupId }
      );
      if (!monthlyData) {
        try {
          const objectIdUserId = new ObjectId(startupId);
          monthlyData = await database.collection('startup_monthly_data').findOne(
            { userId: objectIdUserId }
          );
        } catch (objectIdError) {}
      }
      if (!monthlyData) {
        return res.json({ success: true, monthlyData: [] });
      }
      return res.json({ success: true, monthlyData: monthlyData.monthlyData || [] });
    }
    // Default: fetch for current user
    console.log('Fetching monthly data for userId:', req.user.userId);
    
    // Try to find with string userId first
    let monthlyData = await database.collection('startup_monthly_data').findOne(
      { userId: req.user.userId }
    );

    // If not found, try with ObjectId format
    if (!monthlyData) {
      try {
        const objectIdUserId = new ObjectId(req.user.userId);
        monthlyData = await database.collection('startup_monthly_data').findOne(
          { userId: objectIdUserId }
        );
        console.log('Found monthly data with ObjectId format');
      } catch (objectIdError) {
        console.log('ObjectId conversion failed (expected for string userIds):', objectIdError.message);
      }
    } else {
      console.log('Found monthly data with string format');
    }

    console.log('Found monthly data:', monthlyData);

    if (!monthlyData) {
      console.log('No monthly data found for user');
      return res.json({
        success: true,
        monthlyData: []
      });
    }

    res.json({
      success: true,
      monthlyData: monthlyData.monthlyData || []
    });

  } catch (error) {
    console.error('Get monthly data error:', error);
    res.status(500).json({ error: 'Failed to get monthly data' });
  }
});

// POST /api/user/startup-monthly-data - Update startup monthly data
app.post('/api/user/startup-monthly-data', authenticateToken, async (req, res) => {
  try {
    const { monthlyData } = req.body;

    if (!monthlyData || !Array.isArray(monthlyData)) {
      return res.status(400).json({ error: 'Monthly data array is required' });
    }

    const database = await connectToDatabase();
    
    const result = await database.collection('startup_monthly_data').updateOne(
      { userId: req.user.userId },
      { 
        $set: {
          userId: req.user.userId,
          monthlyData: monthlyData,
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Monthly data saved successfully',
      dataId: result.upsertedId || 'updated'
    });

  } catch (error) {
    console.error('Monthly data save error:', error);
    res.status(500).json({ error: 'Failed to save monthly data' });
  }
});

// POST /api/user/investor-details - Store investor details
app.post('/api/user/investor-details', authenticateToken, async (req, res) => {
  try {
    const {
      fullName,
      company,
      role,
      portfolioSize,
      investmentFocus,
      preferredStages,
      description,
      website,
      location,
      linkedin,
      avatar,
      tags
    } = req.body;

    if (!fullName || !investmentFocus || !description) {
      return res.status(400).json({ error: 'Required fields: fullName, investmentFocus, description' });
    }

    const database = await connectToDatabase();
    
    // Create or update investor profile
    const investorData = {
      userId: req.user.userId,
      fullName,
      company: company || null,
      role: role || null,
      portfolioSize: portfolioSize || null,
      investmentFocus: Array.isArray(investmentFocus)
        ? investmentFocus
        : (typeof investmentFocus === 'string' && investmentFocus.length > 0
            ? [investmentFocus]
            : []),
      preferredStages: preferredStages || null,
      description,
      website: website || null,
      location: location || null,
      linkedin: linkedin || null,
      avatar: avatar || null,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await database.collection('investor_profiles').updateOne(
      { userId: req.user.userId },
      { $set: investorData },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Investor details saved successfully',
      profileId: result.upsertedId || 'updated'
    });

  } catch (error) {
    console.error('Investor details save error:', error);
    res.status(500).json({ error: 'Failed to save investor details' });
  }
});

// GET /api/user/profile - Get user profile with business ID
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const database = await connectToDatabase();
    const user = await database.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) }
    );
    // Check if user has a startup profile
    const startupProfile = await database.collection('startup_profiles').findOne(
      { userId: req.user.userId }
    );

    res.json({
      success: true,
      businessId: startupProfile ? req.user.userId : null, // Use userId as businessId if they have a startup profile
      hasStartupProfile: !!startupProfile,
      role: user?.role || null
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// POST /api/user/upload-photo (accepts base64 JSON)
app.post('/api/user/upload-photo', authenticateToken, async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ error: 'No image data' });
    const database = await connectToDatabase();
    const userId = req.user.userId;
    await database.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { profilePhoto: base64, photoUpdatedAt: new Date().toISOString() } }
    );
    res.json({ success: true, base64 });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// DELETE /api/user/photo - Delete profile photo
app.delete('/api/user/photo', authenticateToken, async (req, res) => {
  try {
    const database = await connectToDatabase();
    const userId = req.user.userId;
    const user = await database.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove photo from user profile
    await database.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $unset: { 
          profilePhoto: "",
          photoUpdatedAt: ""
        } 
      }
    );

    // Also remove from role-specific profile if it exists
    if (user.role === 'startup') {
      await database.collection('startup_profiles').updateOne(
        { userId: userId },
        { 
          $unset: { logo: "" },
          $set: { updatedAt: new Date().toISOString() }
        }
      );
    } else if (user.role === 'investor') {
      await database.collection('investor_profiles').updateOne(
        { userId: userId },
        { 
          $unset: { avatar: "" },
          $set: { updatedAt: new Date().toISOString() }
        }
      );
    }

    res.json({
      success: true,
      message: 'Profile photo removed successfully'
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// GET /api/debug/collections - Debug endpoint to check all collections
app.get('/api/debug/collections', async (req, res) => {
  try {
    const database = await connectToDatabase();
    
    // Get all collections
    const collections = await database.listCollections().toArray();
    
    const result = {};
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await database.collection(collectionName).countDocuments();
      const sampleData = await database.collection(collectionName).find().limit(2).toArray();
      
      result[collectionName] = {
        count: count,
        sampleData: sampleData
      };
    }
    
    res.json({
      success: true,
      database: 'startup_advisor',
      collections: result
    });

  } catch (error) {
    console.error('Debug collections error:', error);
    res.status(500).json({ error: 'Failed to get collections info' });
  }
});

// GET /api/debug/monthly-data/:userId - Debug endpoint to check monthly data for specific user
app.get('/api/debug/monthly-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const database = await connectToDatabase();
    
    const monthlyData = await database.collection('startup_monthly_data').findOne(
      { userId: userId }
    );
    
    const startupProfile = await database.collection('startup_profiles').findOne(
      { userId: userId }
    );
    
    res.json({
      success: true,
      userId: userId,
      monthlyData: monthlyData,
      startupProfile: startupProfile
    });

  } catch (error) {
    console.error('Debug monthly data error:', error);
    res.status(500).json({ error: 'Failed to get monthly data info' });
  }
});

// POST /api/test/insert-monthly-data - Test endpoint to manually insert monthly data
app.post('/api/test/insert-monthly-data', async (req, res) => {
  try {
    const { userId, monthlyData } = req.body;
    
    if (!userId || !monthlyData || !Array.isArray(monthlyData)) {
      return res.status(400).json({ error: 'userId and monthlyData array are required' });
    }

    const database = await connectToDatabase();
    
    const result = await database.collection('startup_monthly_data').updateOne(
      { userId: userId },
      { 
        $set: {
          userId: userId,
          monthlyData: monthlyData,
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    console.log('Test insert result:', result);

    res.json({
      success: true,
      message: 'Test monthly data inserted successfully',
      result: result
    });

  } catch (error) {
    console.error('Test insert error:', error);
    res.status(500).json({ error: 'Failed to insert test monthly data' });
  }
});

// GET /api/investors - Get all investor profiles
app.get('/api/investors', async (req, res) => {
  try {
    const database = await connectToDatabase();
    const investors = await database.collection('investor_profiles').find().toArray();
    res.json({ profiles: investors });
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ error: 'Failed to fetch investors' });
  }
});

// GET /api/startups - Get all startup profiles
app.get('/api/startups', async (req, res) => {
  try {
    const database = await connectToDatabase();
    const startups = await database.collection('startup_profiles').find().toArray();
    res.json({ profiles: startups });
  } catch (error) {
    console.error('Error fetching startups:', error);
    res.status(500).json({ error: 'Failed to fetch startups' });
  }
});

// ===== Matchmaking Endpoints =====

// POST /api/match/like - Record a like and check for mutual match
app.post('/api/match/like', authenticateToken, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: 'targetUserId is required' });
    }
    const database = await connectToDatabase();
    const userId = req.user.userId;
    
    // Validate users exist and are of opposite roles
    const currentUser = await database.collection('users').findOne({ _id: new ObjectId(userId) });
    const targetUser = await database.collection('users').findOne({ _id: new ObjectId(targetUserId) });
    
    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (currentUser.role === targetUser.role) {
      return res.status(400).json({ error: 'Cannot match with user of same role' });
    }
    
    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot like yourself' });
    }

    // Record the like
    await database.collection('matches').updateOne(
      { userId, targetUserId },
      { 
        $set: { 
          userId, 
          targetUserId, 
          liked: true, 
          userRole: currentUser.role,
          targetRole: targetUser.role,
          createdAt: new Date().toISOString() 
        } 
      },
      { upsert: true }
    );

    // Check for mutual like with proper role validation
    const mutual = await database.collection('matches').findOne({ 
      userId: targetUserId, 
      targetUserId: userId, 
      liked: true 
    });

    if (mutual) {
      // Verify the roles are still opposite
      if (mutual.userRole !== currentUser.role) {
        // Store the match
        const sortedUsers = [userId, targetUserId].sort();
        await database.collection('mutual_matches').updateOne(
          { users: sortedUsers },
          { 
            $set: { 
              users: sortedUsers,
              startupId: currentUser.role === 'startup' ? userId : targetUserId,
              investorId: currentUser.role === 'investor' ? userId : targetUserId,
              matchedAt: new Date().toISOString() 
            } 
          },
          { upsert: true }
        );
        return res.json({ 
          success: true, 
          matched: true, 
          message: 'It\'s a match!' 
        });
      }
    }

    res.json({ success: true, matched: false });
  } catch (error) {
    console.error('Match like error:', error);
    res.status(500).json({ error: 'Failed to record like' });
  }
});

// GET /api/match/list - Get all mutual matches for the logged-in user
app.get('/api/match/list', authenticateToken, async (req, res) => {
  try {
    const database = await connectToDatabase();
    const userId = req.user.userId;
    // Find all mutual matches
    const matches = await database.collection('mutual_matches').find({ users: userId }).toArray();
    res.json({ success: true, matches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Message Schema
const messageSchema = {
  senderId: String,
  receiverId: String,
  text: String,
  timestamp: Date,
  status: String,
  attachments: Array
};

// Socket.IO connection handling
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Store user socket mapping when they join
  socket.on('join', (userId) => {
    userSockets.set(userId, socket.id);
    console.log('User joined:', userId, 'Socket ID:', socket.id);
  });

  // Handle new message
  socket.on('sendMessage', async (messageData) => {
    try {
      const database = await connectToDatabase();
      const { senderId, receiverId, text, attachments } = messageData;

      console.log('Received message:', { senderId, receiverId, text });

      // Create new message
      const newMessage = {
        senderId,
        receiverId,
        text,
        timestamp: new Date(),
        status: 'sent',
        attachments: attachments || []
      };

      // Save message to database
      const result = await database.collection('messages').insertOne(newMessage);
      
      // Add the MongoDB _id to the message as a string
      newMessage._id = result.insertedId.toString();

      console.log('Message saved with ID:', newMessage._id);

      // Send to receiver if online
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        console.log('Sending to receiver socket:', receiverSocketId);
        io.to(receiverSocketId).emit('newMessage', newMessage);
        
        // Update message status to delivered
        await database.collection('messages').updateOne(
          { _id: result.insertedId },
          { $set: { status: 'delivered' } }
        );
        
        // Notify sender of delivery
        socket.emit('messageStatus', { 
          messageId: newMessage._id, 
          status: 'delivered' 
        });
      }

      // Send confirmation back to sender with the server-generated ID
      socket.emit('messageSent', newMessage);
      console.log('Sent confirmation to sender');
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('messageRead', async ({ messageId, senderId }) => {
    try {
      const database = await connectToDatabase();
      
      // Convert string ID to ObjectId for MongoDB
      const objectId = new ObjectId(messageId);
      
      await database.collection('messages').updateOne(
        { _id: objectId },
        { $set: { status: 'read' } }
      );

      // Notify sender that message was read
      const senderSocketId = userSockets.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageStatus', { 
          messageId, 
          status: 'read' 
        });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  });

  // Handle typing status
  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocketId = userSockets.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', { userId: senderId });
    }
  });

  // Handle stop typing
  socket.on('stopTyping', ({ senderId, receiverId }) => {
    const receiverSocketId = userSockets.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userStoppedTyping', { userId: senderId });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user socket mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log('User disconnected:', userId);
        break;
      }
    }
  });
});

// API endpoint to get chat history
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const database = await connectToDatabase();
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    // Get messages where current user is either sender or receiver
    const messages = await database.collection('messages')
      .find({
        $or: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      })
      .sort({ timestamp: 1 })
      .toArray();

    // Convert ObjectId to string for each message
    const formattedMessages = messages.map(message => ({
      ...message,
      _id: message._id.toString()
    }));

    // Mark messages as read
    await database.collection('messages').updateMany(
      {
        senderId: userId,
        receiverId: currentUserId,
        status: { $ne: 'read' }
      },
      { $set: { status: 'read' } }
    );

    res.json({ success: true, messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});