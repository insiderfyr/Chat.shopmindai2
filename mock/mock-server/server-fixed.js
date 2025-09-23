const express = require('express');
const cors = require('cors');

const app = express();
const port = 3080;

// Middleware
app.use(express.json());
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'mock-server' });
});

// Auth configuration endpoint
app.get('/api/auth/config', (req, res) => {
  res.json({
    data: {
      keycloak: {
        url: 'http://localhost:8081/auth',
        realm: 'ShopMindAI',
        clientId: 'auth-service',
        authUrl: 'http://localhost:8081/auth/realms/ShopMindAI/protocol/openid-connect/auth',
        tokenUrl: 'http://localhost:8081/auth/realms/ShopMindAI/protocol/openid-connect/token',
        logoutUrl: 'http://localhost:8081/auth/realms/ShopMindAI/protocol/openid-connect/logout',
      },
      endpoints: {
        login: '/api/v1/auth/login',
        register: '/api/v1/auth/register',
        refresh: '/api/v1/auth/refresh',
        logout: '/api/v1/auth/logout',
        profile: '/api/v1/user/profile',
      },
      features: {
        registration: true,
        passwordReset: true,
        emailVerification: false,
        socialLogin: false,
      },
      validation: {
        username: {
          minLength: 3,
          maxLength: 30,
          pattern: '^[a-zA-Z0-9_]+$',
        },
        password: {
          minLength: 8,
          maxLength: 128,
          requirements: [
            'At least one uppercase letter',
            'At least one lowercase letter',
            'At least one number',
            'At least one special character',
          ],
        },
        email: {
          required: true,
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        },
      },
    }
  });
});

// Memories endpoint
app.get('/api/memories', (req, res) => {
  res.json({
    memories: [
      { id: 1, title: 'Mock Memory 1', content: 'This is a mock memory.' },
      { id: 2, title: 'Mock Memory 2', content: 'This is another mock memory.' },
    ]
  });
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

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

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

// Other required endpoints
app.get('/api/banner', (req, res) => {
  res.json({
    data: {
      banner_image: "/assets/banner-placeholder.jpg",
      banner_text: "Welcome to ShopMindAI"
    },
    message: "Banner endpoint - placeholder for ShopMindAI"
  });
});

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

app.get('/api/user', (req, res) => {
  res.json({
    id: "mock-user-id",
    username: "mockuser",
    email: "mock@example.com",
    first_name: "Mock",
    last_name: "User"
  });
});

app.get('/api/endpoints', (req, res) => {
  res.json({
    azureOpenAI: false,
    openAI: true,
    google: false,
    anthropic: false,
    custom: true,
    assistants: true,
    azureAssistants: false,
    chatGPTBrowser: false,
    gptPlugins: false,
    xAI: false
  });
});

app.get('/api/startup', (req, res) => {
  res.json({
    data: {
      app_name: "ShopMindAI",
      version: "1.0.0-mvp",
      features: {
        plugins: true,
        assistants: true,
        files: true,
        search: true
      }
    },
    message: "Startup config - placeholder for ShopMindAI"
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    data: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    },
    message: "Metrics endpoint - placeholder for ShopMindAI"
  });
});

// Chat/Messages endpoints
app.get('/api/messages', (req, res) => {
  res.json({
    conversations: [],
    pageNumber: 1,
    pageSize: 50,
    pages: 1
  });
});

app.post('/api/ask', (req, res) => {
  const { message, conversationId, model, endpoint } = req.body;
  res.json({
    message: `Mock response to: ${message}`,
    conversationId: conversationId || 'mock-conversation-id',
    messageId: 'mock-message-id-' + Date.now(),
    parentMessageId: null,
    model: model || 'gpt-3.5-turbo',
    endpoint: endpoint || 'openAI'
  });
});

// Conversations endpoints
app.get('/api/convos', (req, res) => {
  res.json([
    {
      conversationId: 'mock-convo-1',
      title: 'Mock Conversation 1',
      endpoint: 'openAI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
});

app.post('/api/convos', (req, res) => {
  res.json({
    conversationId: 'new-mock-convo-' + Date.now(),
    title: 'New Conversation',
    endpoint: req.body.endpoint || 'openAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

app.put('/api/convos/:conversationId', (req, res) => {
  res.json({
    conversationId: req.params.conversationId,
    title: req.body.title || 'Updated Conversation',
    endpoint: req.body.endpoint || 'openAI',
    updatedAt: new Date().toISOString()
  });
});

app.delete('/api/convos/:conversationId', (req, res) => {
  res.json({ message: 'Conversation deleted successfully' });
});

// Files endpoints
app.get('/api/files', (req, res) => {
  res.json({
    files: [],
    message: 'Files endpoint - placeholder for ShopMindAI'
  });
});

app.post('/api/files/upload', (req, res) => {
  res.json({
    file_id: 'mock-file-id-' + Date.now(),
    filename: 'mock-file.txt',
    type: 'text/plain',
    size: 1024,
    message: 'File uploaded successfully'
  });
});

// Models/Presets endpoints
app.get('/api/models', (req, res) => {
  res.json({
    data: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        endpoint: 'openAI',
        maxTokens: 4096
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        endpoint: 'openAI',
        maxTokens: 8192
      }
    ]
  });
});

app.get('/api/presets', (req, res) => {
  res.json([
    {
      presetId: 'default-preset',
      title: 'Default Preset',
      endpoint: 'openAI',
      model: 'gpt-3.5-turbo'
    }
  ]);
});

// Plugins/Tools endpoints  
app.get('/api/plugins', (req, res) => {
  res.json({
    data: [],
    message: 'Plugins endpoint - placeholder for ShopMindAI'
  });
});

app.get('/api/tools', (req, res) => {
  res.json({
    data: [],
    message: 'Tools endpoint - placeholder for ShopMindAI'
  });
});

// Search endpoints
app.get('/api/search', (req, res) => {
  res.json({
    conversations: [],
    messages: [],
    message: 'Search endpoint - placeholder for ShopMindAI'
  });
});

// ✅ ENDPOINT-URI CRITICE PENTRU CHATFORM (ADĂUGATE ACUM)
app.get('/api/endpoints/config', (req, res) => {
  res.json({
    availableEndpoints: ['azureOpenAI', 'openAI', 'google', 'anthropic', 'custom'],
    defaultEndpoint: 'openAI'
  });
});

app.get('/api/endpoints/config/openAI', (req, res) => {
  res.json({
    availableModels: [
      { name: 'gpt-3.5-turbo', model: 'gpt-3.5-turbo', description: 'GPT-3.5 Turbo' },
      { name: 'gpt-4', model: 'gpt-4', description: 'GPT-4' }
    ],
    modelNames: ['gpt-3.5-turbo', 'gpt-4']
  });
});

app.get('/api/search/enable', (req, res) => {
  res.json({ enabled: false });
});

app.get('/api/balance', (req, res) => {
  res.json({ balance: 0, credit_balance: 0, aggregate_balance: 0 });
});

app.get('/api/config/app', (req, res) => {
  res.json({
    customFooter: null,
    exampleEndpoints: [
      {
        name: 'OpenAI',
        endpoint: 'openAI',
        apiKey: '',
        models: ['gpt-3.5-turbo', 'gpt-4']
      }
    ],
    socialLogins: [],
    emailEnabled: false,
    checkBalance: false,
    modelNames: ['gpt-3.5-turbo', 'gpt-4']
  });
});

app.get('/api/convos/latest', (req, res) => {
  res.json({ 
    conversations: [], 
    pageNumber: 1, 
    pageSize: 50, 
    pages: 1 
  });
});

app.post('/api/auth/verify', (req, res) => {
  res.json({ valid: true, user: { username: 'mockuser' } });
});

app.get('/api/startup/config', (req, res) => {
  res.json({
    appTitle: 'ShopMindAI',
    socialLogins: [],
    emailEnabled: false,
    checkBalance: false,
    modelNames: ['gpt-3.5-turbo', 'gpt-4']
  });
});

// Generic API routes
app.get('/api/*', (req, res) => {
  res.json({
    message: "Generic API endpoint",
    path: req.path,
    method: req.method
  });
});
// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Mock server running on http://localhost:${port}`);
  console.log('✅ All critical endpoints for ChatForm are available!');
});

module.exports = app;
