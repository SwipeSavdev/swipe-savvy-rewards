#!/usr/bin/env node

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Mock authentication endpoints
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    token: 'mock-token-12345'
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.get('/api/user/profile', (req, res) => {
  res.json({
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890'
  });
});

// Mock notification endpoints
app.post('/api/notifications/send', (req, res) => {
  res.json({ success: true, notificationId: 'notif-123' });
});

app.get('/api/notifications', (req, res) => {
  res.json({
    notifications: [
      { id: '1', title: 'Test', message: 'Test notification', read: false }
    ]
  });
});

// Mock campaign endpoints
app.post('/api/campaigns/create', (req, res) => {
  res.json({ success: true, campaignId: 'camp-123' });
});

app.get('/api/campaigns', (req, res) => {
  res.json({
    campaigns: [
      { id: '1', name: 'Summer Sale', status: 'active', reach: 5000 }
    ]
  });
});

// Mock merchant network endpoints
app.post('/api/merchants/add', (req, res) => {
  res.json({ success: true, merchantId: 'merch-123' });
});

app.get('/api/merchants', (req, res) => {
  res.json({
    merchants: [
      { id: '1', name: 'Sample Shop', category: 'retail' }
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('<h1>Cypress Test Server Running</h1>');
});

app.listen(PORT, () => {
  console.log(`✓ Cypress test server running on http://localhost:${PORT}`);
});
