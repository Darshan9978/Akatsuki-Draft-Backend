// Creates (or promotes) an admin account. Registration through the API can
// never create admins, so this script is the safe way to get your first one.
//
// Usage (from the project folder):
//   1. Put ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in your .env file
//   2. npm run create-admin
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

async function main() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first.');
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters.');
  }

  await connectDB();

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role === 'admin') {
      console.log(`${email} is already an admin. Nothing to do.`);
    } else {
      existing.role = 'admin'; // password is left unchanged
      await existing.save();
      console.log(`${email} already existed and has been promoted to admin.`);
    }
  } else {
    await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD, role: 'admin' });
    console.log(`Admin created: ${email}`);
  }
}

main()
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
