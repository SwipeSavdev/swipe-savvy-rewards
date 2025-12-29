#!/usr/bin/env node
/**
 * SwipeSavvy Mock Backend API Server
 * Provides mock endpoints for development without Docker
 */

const http = require('http');
const url = require('url');

const PORT = 8000;

// Mock data
const mockData = {
  user: {
    id: 'user-123',
    email: 'demo@swipesavvy.com',
    name: 'Demo User',
    createdAt: new Date().toISOString()
  },
  tickets: [
    { id: 'ticket-1', title: 'Sample Issue', status: 'open', priority: 'high' },
    { id: 'ticket-2', title: 'Feature Request', status: 'pending', priority: 'medium' }
  ],
  messages: [
    { id: 'msg-1', text: 'Hello from API', timestamp: new Date().toISOString() }
  ]
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Request handler
const server = http.createServer((req, res) => {
  // Add CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Log request
  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

  // Handle preflight
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes
  if (pathname === '/' || pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'SwipeSavvy Mock API' }));
  } else if (pathname === '/api/user') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.user));
  } else if (pathname === '/api/tickets') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.tickets));
  } else if (pathname === '/api/messages') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.messages));
  } else if (pathname === '/api/login' && method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      token: 'mock-jwt-token-' + Date.now(),
      user: mockData.user 
    }));
  } else if (pathname.startsWith('/api/')) {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      endpoint: pathname,
      message: 'Mock response for development'
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║   ✅ MOCK API SERVER RUNNING                                   ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health           - Health check');
  console.log('  GET  /api/user         - Get user profile');
  console.log('  GET  /api/tickets      - Get support tickets');
  console.log('  GET  /api/messages     - Get messages');
  console.log('  POST /api/login        - Login');
  console.log('');
  console.log('CORS enabled for all origins');
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\n✅ Mock API Server stopped');
  process.exit(0);
});
