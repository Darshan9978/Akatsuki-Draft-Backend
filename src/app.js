// This file builds the Express app. It does NOT start a server.
//  - Locally:  src/start.js imports it and calls app.listen().
//  - On Vercel: Vercel detects this file (it imports express and exports the app)
//    and runs it as a serverless function. No vercel.json is needed.
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const asyncHandler = require('./utils/asyncHandler');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.disable('x-powered-by');

// CORS_ORIGIN can be "*" (anyone) or a comma-separated list of allowed websites.
const origins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(cors({ origin: origins.includes('*') ? '*' : origins }));

app.use(express.json({ limit: '1mb' }));

// Simple welcome route (does not touch the database).
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Akatsuki's Draft API is running.",
    health: '/health',
  });
});

// Make sure MongoDB is connected before any route below runs.
app.use(
  asyncHandler(async (req, res, next) => {
    await connectDB();
    next();
  })
);

// Health check that also proves the database connection works.
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', database: 'connected' });
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
