// Express 4 does not catch errors thrown inside async functions by itself.
// This wrapper catches them and passes them to the error handler.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
