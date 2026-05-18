const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Support both User and Admin tokens
    if (decoded.role === 'admin') {
      req.adminId = decoded.adminId;
      req.role = 'admin';
    } else {
      req.userId = decoded.userId;
      req.mobile = decoded.mobile;
      req.role = 'user';
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
