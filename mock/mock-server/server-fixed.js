const express = require('express');
const cors = require('cors');

const app = express();
const port = 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'mock-server' });
});

// Auth v1 endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username && password) {
    res.json({
      message: "Login successful",
      data: {
        access_token: 'mock-jwt-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 300,
        user: {
          id: "mock-user-id",
          username: username,
          email: username.includes('@') ? username : `${username}@example.com`,
          first_name: "Mock",
          last_name: "User",
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    });
  } else {
    res.status(400).json({ 
      error: "validation_error",
      message: "Invalid request format",
      code: 400,
      details: "Username and password are required"
    });
  }
});

// Register endpoint
app.post('/api/v1/auth/register', (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
  
  if (username && email && password && first_name && last_name) {
    res.json({
      message: "Registration successful",
      data: {
        access_token: 'mock-jwt-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 300,
        user: {
          id: "mock-user-id",
          username: username,
          email: email,
          first_name: first_name,
          last_name: last_name,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    });
  } else {
    res.status(400).json({ 
      error: "validation_error",
      message: "Invalid request format",
      code: 400,
      details: "All fields are required"
    });
  }
});

// Logout endpoint
app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Token refresh endpoint
app.post('/api/v1/auth/refresh', (req, res) => {
  const { refresh_token } = req.body;
  
  if (refresh_token) {
    res.json({
      message: "Token refreshed successfully",
      data: {
        access_token: 'new-mock-jwt-token-' + Date.now(),
        refresh_token: 'new-mock-refresh-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 300
      }
    });
  } else {
    res.status(400).json({ 
      error: "validation_error",
      message: "Invalid request format",
      code: 400,
      details: "Refresh token is required"
    });
  }
});

// New mock endpoint for agents/chat/openAI
app.post('/api/agents/chat/openAI', (req, res) => {
  const { message } = req.body;

  if (message) {
    res.json({
      message: "Chat response from OpenAI mock agent",
      data: {
        text: `Mock response to: ${message}`,
        model: 'gpt-3.5-turbo',
        timestamp: new Date().toISOString(),
      }
    });
  } else {
    res.status(400).json({
      error: 'Invalid request',
      message: 'Message is required',
    });
  }
});

// Simulate audio endpoint
app.get('/api/audio/:audioId', (req, res) => {
  const { audioId } = req.params;
  // Return a mock audio response (You can replace this with actual audio file paths if needed)
  res.json({
    message: `Audio for ${audioId}`,
    audioUrl: `/assets/audio/${audioId}.mp3`,
  });
});

// Banner endpoint
app.get('/api/banner', (req, res) => {
  res.json({
    data: {
      banner_image: "/assets/banner-placeholder.jpg",
      banner_text: "Welcome to ShopMindAI"
    },
    message: "Banner endpoint - placeholder for ShopMindAI"
  });
});

// Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    data: {
      app_name: "ShopMindAI",
      emailEnabled: false,
      features: ["auth", "ai", "shopping"],
      registrationEnabled: true,
      socialLogins: {
        discord: false,
        facebook: false,
        github: false,
        google: false
      },
      turnstile: {
        siteKey: ""
      },
      version: "1.0.0-mvp"
    },
    message: "Config endpoint - placeholder for ShopMindAI"
  });
});

// Default user endpoint
app.get('/api/user', (req, res) => {
  res.json({
    id: "mock-user-id",
    username: "mockuser",
    email: "mock@example.com",
    first_name: "Mock",
    last_name: "User"
  });
});
// Balance
app.get('/api/balance', (req, res) => {
  res.json({ credits: 1000, currency: 'USD' });
});

// Endpoints
app.get('/api/endpoints', (req, res) => {
  res.json([
    { id: 'openai', name: 'OpenAI GPT-4', status: 'active' },
    { id: 'mockai', name: 'Mock AI', status: 'active' }
  ]);
});

// Models
app.get('/api/models', (req, res) => {
  res.json([
    { id: 'gpt-4', provider: 'openai', status: 'ready' },
    { id: 'gpt-3.5', provider: 'openai', status: 'ready' }
  ]);
});

// Conversations
app.get('/api/convos', (req, res) => {
  res.json([
    { id: 1, user: 'test', messages: ['Hello!', 'Hi, how can I help?'] },
    { id: 2, user: 'demo', messages: ['Mock data works!', 'Yes it does!'] }
  ]);
});


// Start the server
app.listen(port, () => {
  console.log(`🚀 Mock server running on http://localhost:${port}`);
});
