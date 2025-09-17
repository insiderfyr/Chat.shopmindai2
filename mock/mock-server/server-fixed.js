const express = require('express');
const cors = require('cors');

const app = express();
const port = 3090;

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
    openAI: {
      availableModels: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      userProvide: false,
      apiKey: 'mock-api-key',
      baseURL: 'https://api.openai.com/v1',
      models: {
        default: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        fetch: false
      },
      titleConvo: true,
      titleModel: 'gpt-3.5-turbo',
      summarize: false,
      summaryModel: 'gpt-3.5-turbo',
      forcePrompt: false,
      modelDisplayLabel: 'OpenAI',
      order: 1
    },
    anthropic: {
      availableModels: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
      userProvide: false,
      apiKey: 'mock-anthropic-key',
      baseURL: 'https://api.anthropic.com',
      models: {
        default: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
        fetch: false
      },
      titleConvo: true,
      titleModel: 'claude-3-haiku',
      modelDisplayLabel: 'Anthropic',
      order: 2
    },
    google: {
      availableModels: ['gemini-pro', 'gemini-pro-vision'],
      userProvide: false,
      apiKey: 'mock-google-key',
      models: {
        default: ['gemini-pro', 'gemini-pro-vision'],
        fetch: false
      },
      modelDisplayLabel: 'Google',
      order: 3
    },
    agents: {
      disableBuilder: false,
      pollIntervalMs: 750,
      timeoutMs: 180000,
      modelDisplayLabel: 'Agents',
      order: 4
    }
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

// Files endpoints
app.get('/api/files', (req, res) => {
  res.json([]);
});

app.get('/api/files/config', (req, res) => {
  res.json({
    endpoints: {
      openAI: {
        disabled: false,
        fileLimit: 10,
        fileSizeLimit: 100000000,
        totalSizeLimit: 1000000000,
        supportedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'text/plain',
          'application/pdf',
          'text/csv',
          'application/json'
        ]
      },
      anthropic: {
        disabled: false,
        fileLimit: 5,
        fileSizeLimit: 50000000,
        totalSizeLimit: 500000000,
        supportedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'text/plain'
        ]
      },
      google: {
        disabled: false,
        fileLimit: 8,
        fileSizeLimit: 75000000,
        totalSizeLimit: 750000000,
        supportedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'text/plain',
          'application/pdf'
        ]
      }
    },
    serverFileSizeLimit: 100000000,
    avatarSizeLimit: 2000000
  });
});

// Models endpoint
app.get('/api/models', (req, res) => {
  res.json({
    openAI: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    anthropic: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
    google: ['gemini-pro', 'gemini-pro-vision']
  });
});

// Conversations endpoints
app.get('/api/convos', (req, res) => {
  res.json({
    conversations: [],
    nextCursor: null
  });
});

app.get('/api/convos/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    conversationId: id,
    title: 'Mock Conversation',
    endpoint: 'openAI',
    model: 'gpt-3.5-turbo',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Messages endpoints
app.get('/api/messages/:conversationId', (req, res) => {
  res.json([]);
});

// Auth service config for frontend
app.get('/api/auth/config', (req, res) => {
  res.json({
    data: {
      keycloak: {
        url: 'http://localhost:8081/auth',
        realm: 'ShopMindAI',
        clientId: 'auth-service',
        authUrl: 'http://localhost:8081/auth/realms/ShopMindAI/protocol/openid-connect/auth',
        tokenUrl: 'http://localhost:8081/auth/realms/ShopMindAI/protocol/openid-connect/token',
        logoutUrl: 'http://localhost:8081/auth/realms/ShopMindAI/protocol/openid-connect/logout'
      },
      endpoints: {
        login: '/api/v1/auth/login',
        register: '/api/v1/auth/register',
        refresh: '/api/v1/auth/refresh',
        logout: '/api/v1/auth/logout',
        profile: '/api/v1/user/profile'
      },
      features: {
        registration: true,
        passwordReset: true,
        emailVerification: false,
        socialLogin: false
      },
      validation: {
        username: { minLength: 3, maxLength: 30, pattern: '^[a-zA-Z0-9_]+$' },
        password: { minLength: 8, maxLength: 128, requirements: ['At least one uppercase letter','At least one lowercase letter','At least one number','At least one special character'] },
        email: { required: true, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' }
      }
    },
    message: 'Auth configuration for ShopMindAI'
  });
});

// Balance endpoint
app.get('/api/balance', (req, res) => {
  res.json({
    balance: 100.0
  });
});

// Search enable endpoint
app.get('/api/search/enable', (req, res) => {
  res.json({
    enabled: true
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
  console.log('\n📝 Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/v1/auth/login');
  console.log('  POST /api/v1/auth/register');
  console.log('  POST /api/v1/auth/logout');
  console.log('  POST /api/v1/auth/refresh');
  console.log('  GET  /api/banner');
  console.log('  GET  /api/config');
  console.log('  GET  /api/user');
  console.log('  GET  /api/endpoints');
  console.log('  GET  /api/startup');
  console.log('  GET  /metrics');
  console.log('  GET  /api/* (generic)');
  console.log('\n✅ Ready to serve!');
});

module.exports = app;

// Auth config endpoint
app.get('/api/v1/auth/config', (req, res) => {
  res.json({
    data: {
      app_name: "ShopMindAI",
      version: "1.0.0-mvp",
      features: {
        plugins: true,
        assistants: true,
        files: true,
        search: true
      },
      auth: {
        enabled: true,
        provider: "keycloak",
        keycloak_url: "http://localhost:8080",
        realm: "shopmindai",
        client_id: "shopmindai-client"
      }
    },
    message: "Auth configuration for ShopMindAI"
  });
});


// Auth config endpoint
app.get('/api/v1/auth/config', (req, res) => {
  res.json({
    data: {
      app_name: 'ShopMindAI',
      version: '1.0.0-mvp',
      features: {
        plugins: true,
        assistants: true,
        files: true,
        search: true
      },
      auth: {
        enabled: true,
        provider: 'keycloak',
        keycloak_url: 'http://localhost:8080',
        realm: 'shopmindai',
        client_id: 'shopmindai-client'
      }
    },
    message: 'Auth configuration for ShopMindAI'
  });
});
