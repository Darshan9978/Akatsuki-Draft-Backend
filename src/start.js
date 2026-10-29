// Local development entry point: `npm start` or `npm run dev`.
// (Vercel does not use this file; it uses src/app.js.)

import 'dotenv/config';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Could not start the server:', err.message);
    process.exit(1);
  });
