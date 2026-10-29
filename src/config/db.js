const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

// On Vercel the app runs as a "serverless function". The function may be reused
// between requests, so we cache the database connection on `global` to avoid
// opening a brand-new connection for every request.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to your .env file (local) or Vercel Environment Variables (live).');
    throw new AppError('Server is missing database configuration.', 500);
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000, // fail after 10s instead of hanging forever
        bufferCommands: false,
      })
      .then((m) => m)
      .catch((err) => {
        cached.promise = null; // allow a retry on the next request
        console.error('MongoDB connection error:', err.message);
        throw new AppError(
          'Database connection failed. Check MONGODB_URI and Atlas Network Access.',
          503
        );
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
