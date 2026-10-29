const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../middleware/auth');

// POST /auth/register
// NOTE: we read only name, email and password. Any "role" sent by the client
// is ignored on purpose, so nobody can make themselves an admin.
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  // typeof checks stop "NoSQL injection" such as { "email": { "$gt": "" } }
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError('name, email and password are required and must be text.', 400);
  }

  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) throw new AppError('This email is already registered.', 409);

  const user = await User.create({ name, email, password }); // role defaults to "user"

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please log in to get your token.',
    user, // password is removed by the model's toJSON
  });
});

// POST /auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw new AppError('email and password are required.', 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  const ok = user && (await user.comparePassword(password));

  // Same message for "no such email" and "wrong password" so attackers learn nothing.
  if (!ok) throw new AppError('Invalid email or password.', 401);

  res.json({
    success: true,
    message: 'Login successful.',
    token: signToken(user),
    user, // password is removed by toJSON
  });
});

// GET /auth/me  (needs token)
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
