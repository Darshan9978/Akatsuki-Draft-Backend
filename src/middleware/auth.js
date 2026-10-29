const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not set. Add it to .env (local) or Vercel Environment Variables (live).');
    throw new AppError('Server is missing authentication configuration.', 500);
  }
  return secret;
}

function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// protect: the request must carry "Authorization: Bearer <token>".
// On success, req.user holds the logged-in user (loaded fresh from the database,
// so the role always comes from the database, never from the token or request body).
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Not logged in. Send the header: Authorization: Bearer <your token>', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
  } catch (err) {
    if (err instanceof AppError) throw err; // missing secret = server problem, not a bad token
    throw new AppError('Invalid or expired token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('The user for this token no longer exists.', 401);
  }

  req.user = user;
  next();
});

// adminOnly: use AFTER protect.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  next(new AppError('Admin access required.', 403));
};

module.exports = { protect, adminOnly, signToken };
