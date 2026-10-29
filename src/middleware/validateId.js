const AppError = require('../utils/AppError');

// Checks that a URL parameter (like :id) looks like a MongoDB ObjectId
// (24 hexadecimal characters). This gives a clear 400 error instead of a
// confusing database error.
module.exports = (paramName = 'id') => (req, res, next) => {
  const value = req.params[paramName];
  if (!/^[a-f\d]{24}$/i.test(value || '')) {
    return next(new AppError(`Invalid ${paramName}: "${value}" is not a valid ID.`, 400));
  }
  next();
};
