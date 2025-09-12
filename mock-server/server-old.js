const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3080;
const host = process.env.HOST || 'localhost';

// Mock data
const mockUsers = [
  { id: 1, username: 'testuser', email: 'test@example.com', name: 'Test User' }
];

const mockConversations = [
  {
    id: 'conv-1',
    title: 'Test Conversation',
    messages: [
      { id: 'msg-1', text: 'Hello!', sender: 'user', createdAt: new Date().toISOString() },
      { id: 'msg-2', text: 'Hi there! How can I help you?', sender: 'assistant', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  }
];

const mockModels = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
  { id: 'claude-3', name: 'Claude 3', provider: 'anthropic' }
];

const mockPresets = [
  { id: 1, name: 'Default', model: 'gpt-3.5-turbo', temperature: 0.7 },
  { id: 2, name: 'Creative', model: 'gpt-4', temperature: 1.0 }
];

// Middleware
app.disable('x-powered-by');
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      token: 'mock-jwt-token',
      user: mockUsers[0]
    });
  } else {
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (name && email && password) {
    const newUser = {
      id: mockUsers.length + 1,
      username: email.split('@')[0],
      email,
      name
    };
    mockUsers.push(newUser);
    
    res.json({
      token: 'mock-jwt-token',
      user: newUser
    });
  } else {
    res.status(400).json({ error: 'Missing required fields' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Auth v1 routes (redirect to v1 endpoints)
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username && password) {
    res.json({
      message: "Login successful",
      data: {
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
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

app.post('/api/v1/auth/register', (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
  
  if (username && email && password && first_name && last_name) {
    res.json({
      message: "Registration successful",
      data: {
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
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

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.post('/api/v1/auth/refresh', (req, res) => {
  const { refresh_token } = req.body;
  
  if (refresh_token) {
    res.json({
      message: "Token refreshed successfully",
      data: {
        access_token: 'new-mock-jwt-token',
        refresh_token: 'new-mock-refresh-token',
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

// User routes
app.get('/api/user', (req, res) => {
  res.json(mockUsers[0]);
});

app.patch('/api/user', (req, res) => {
  const updates = req.body;
  Object.assign(mockUsers[0], updates);
  res.json(mockUsers[0]);
});

// Conversations routes
app.get('/api/convos', (req, res) => {
  res.json(mockConversations);
});

app.post('/api/convos', (req, res) => {
  const newConvo = {
    id: `conv-${mockConversations.length + 1}`,
    title: req.body.title || 'New Conversation',
    messages: [],
    createdAt: new Date().toISOString()
  };
  mockConversations.push(newConvo);
  res.json(newConvo);
});

app.get('/api/convos/:id', (req, res) => {
  const convo = mockConversations.find(c => c.id === req.params.id);
  if (convo) {
    res.json(convo);
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

app.delete('/api/convos/:id', (req, res) => {
  const index = mockConversations.findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    mockConversations.splice(index, 1);
    res.json({ message: 'Conversation deleted' });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// Messages routes
app.get('/api/messages/:convId', (req, res) => {
  const convo = mockConversations.find(c => c.id === req.params.convId);
  if (convo) {
    res.json(convo.messages);
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

app.post('/api/messages', (req, res) => {
  const { conversationId, text, model } = req.body;
  const convo = mockConversations.find(c => c.id === conversationId);
  
  if (!convo) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // Add user message
  const userMessage = {
    id: `msg-${Date.now()}-user`,
    text,
    sender: 'user',
    createdAt: new Date().toISOString()
  };
  convo.messages.push(userMessage);

  // Mock AI response
  setTimeout(() => {
    const aiMessage = {
      id: `msg-${Date.now()}-ai`,
      text: `This is a mock response to: "${text}". Model used: ${model || 'default'}`,
      sender: 'assistant',
      model: model || 'gpt-3.5-turbo',
      createdAt: new Date().toISOString()
    };
    convo.messages.push(aiMessage);
  }, 1000);

  res.json(userMessage);
});

// Models routes
app.get('/api/models', (req, res) => {
  res.json(mockModels);
});

// Presets routes
app.get('/api/presets', (req, res) => {
  res.json(mockPresets);
});

app.post('/api/presets', (req, res) => {
  const newPreset = {
    id: mockPresets.length + 1,
    ...req.body
  };
  mockPresets.push(newPreset);
  res.json(newPreset);
});

// Config route
app.get('/api/config', (req, res) => {
  res.json({
    appTitle: 'ShopMindAI Mock',
    socialLogins: ['google', 'github'],
    registrationEnabled: true,
    emailEnabled: false,
    features: {
      plugins: true,
      assistants: true,
      files: true,
      search: true
    }
  });
});

// Search routes
app.get('/api/search/convos', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json(mockConversations);
  }
  
  const filtered = mockConversations.filter(convo => 
    convo.title.toLowerCase().includes(q.toLowerCase()) ||
    convo.messages.some(msg => msg.text.toLowerCase().includes(q.toLowerCase()))
  );
  res.json(filtered);
});

// Files routes
app.get('/api/files', (req, res) => {
  res.json([]);
});

app.post('/api/files', (req, res) => {
  res.json({
    id: `file-${Date.now()}`,
    name: 'mock-file.txt',
    size: 1024,
    type: 'text/plain',
    createdAt: new Date().toISOString()
  });
});

// Plugins routes
app.get('/api/plugins', (req, res) => {
  res.json([
    { id: 'web-search', name: 'Web Search', enabled: true },
    { id: 'calculator', name: 'Calculator', enabled: false }
  ]);
});

// Assistants routes
app.get('/api/assistants', (req, res) => {
  res.json([
    { id: 'assistant-1', name: 'General Assistant', model: 'gpt-4' },
    { id: 'assistant-2', name: 'Code Helper', model: 'gpt-3.5-turbo' }
  ]);
});

// Balance route
app.get('/api/balance', (req, res) => {
  res.json({
    balance: 100.00,
    currency: 'USD'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = () => {
  app.listen(port, host, () => {
    if (host === '0.0.0.0') {
      console.log(`Mock server listening on all interfaces at port ${port}`);
      console.log(`Use http://localhost:${port} to access it`);
    } else {
      console.log(`Mock server listening at http://${host}:${port}`);
    }
    console.log('\n📝 Available endpoints:');
    console.log('  GET  /health');
    console.log('  POST /api/auth/login');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/v1/auth/login');
    console.log('  POST /api/v1/auth/register');
    console.log('  POST /api/v1/auth/logout');
    console.log('  POST /api/v1/auth/refresh');
    console.log('  GET  /api/user');
    console.log('  GET  /api/convos');
    console.log('  POST /api/convos');
    console.log('  GET  /api/messages/:convId');
    console.log('  POST /api/messages');
    console.log('  GET  /api/models');
    console.log('  GET  /api/presets');
    console.log('  GET  /api/config');
    console.log('  GET  /api/search/convos');
    console.log('  And more...\n');
  });
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();

module.exports = app;
