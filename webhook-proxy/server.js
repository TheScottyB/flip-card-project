/**
 * Webhook Proxy Server for Flip Card Agent System
 * 
 * This server provides:
 * 1. JWT token generation for GitHub App authentication
 * 2. Webhook forwarding to GitHub API
 * 3. Security and rate limiting
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('combined'));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:8080'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Simple rate limiting
const rateLimit = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 60000), // 1 minute
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  clients: new Map()
};

const rateLimiter = (req, res, next) => {
  const clientIp = req.ip;
  const now = Date.now();
  
  if (!rateLimit.clients.has(clientIp)) {
    rateLimit.clients.set(clientIp, { count: 1, resetAt: now + rateLimit.windowMs });
    return next();
  }
  
  const client = rateLimit.clients.get(clientIp);
  
  // Reset counter if window expired
  if (now > client.resetAt) {
    client.count = 1;
    client.resetAt = now + rateLimit.windowMs;
    return next();
  }
  
  // Increment counter and check limit
  client.count++;
  if (client.count > rateLimit.maxRequests) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      retry_after: Math.ceil((client.resetAt - now) / 1000) 
    });
  }
  
  next();
};

app.use(rateLimiter);

// Clean up rate limit data periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimit.clients.entries()) {
    if (now > data.resetAt) {
      rateLimit.clients.delete(ip);
    }
  }
}, 60000); // Cleanup every minute

// JWT Generation function
function generateJWT() {
  try {
    // Read private key
    const privateKeyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
    
    if (!fs.existsSync(privateKeyPath)) {
      console.error(`Private key file not found at ${privateKeyPath}`);
      return null;
    }
    
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const appId = process.env.GITHUB_APP_ID;
    
    if (!appId) {
      console.error('GITHUB_APP_ID not set in environment variables');
      return null;
    }
    
    // Create the JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now, // Issued at time
      exp: now + parseInt(process.env.JWT_EXPIRATION_SECONDS || 600), // Expires in 10 minutes by default
      iss: appId // GitHub App ID
    };
    
    // Sign the JWT
    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  } catch (error) {
    console.error('Error generating JWT:', error);
    return null;
  }
}

// Generate an installation access token
async function getInstallationToken() {
  try {
    const appJwt = generateJWT();
    if (!appJwt) {
      throw new Error('Failed to generate JWT');
    }
    
    const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
    if (!installationId) {
      throw new Error('GITHUB_APP_INSTALLATION_ID not set');
    }
    
    const response = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${appJwt}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    return response.data.token;
  } catch (error) {
    console.error('Error getting installation token:', error.response?.data || error.message);
    return null;
  }
}

// Route to get a JWT token for client-side use
app.post('/token', async (req, res) => {
  try {
    // For a production app, implement more thorough authorization here
    // For example, verifying API keys or authenticating the client app
    
    const token = await getInstallationToken();
    if (!token) {
      return res.status(500).json({ error: 'Failed to generate installation token' });
    }
    
    // Return the token with expiration information
    res.json({
      token,
      expires_in: parseInt(process.env.JWT_EXPIRATION_SECONDS || 600),
      token_type: 'bearer'
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to forward events to GitHub
app.post('/events', async (req, res) => {
  try {
    const { event_type, client_payload } = req.body;
    
    if (!event_type || !client_payload) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get an installation token
    const token = await getInstallationToken();
    if (!token) {
      return res.status(500).json({ error: 'Failed to authenticate with GitHub' });
    }
    
    // Forward to GitHub Repository Dispatch API
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/dispatches`,
      {
        event_type,
        client_payload
      },
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    // GitHub returns 204 No Content on success
    res.status(202).json({ message: 'Event forwarded successfully' });
  } catch (error) {
    console.error('Error forwarding event:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to forward event to GitHub' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Webhook proxy server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});