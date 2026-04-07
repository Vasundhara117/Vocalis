// authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const tokenHeader = req.header('Authorization');

  // Check if not token
  if (!tokenHeader) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // The token is sent as "Bearer <token>", so we split it and get just the token part
    const token = tokenHeader.split(' ')[1]; 

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add the user's info (from the token) to the request object
    req.user = decoded.user; 

    // Move to the next function (the actual API route)
    next(); 
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};