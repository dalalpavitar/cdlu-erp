const jwt = require('jsonwebtoken');

const AUTH_PASS = 'cdlu@2026';

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader === AUTH_PASS) {
    req.user = { role: 'admin' };
    return next();
  }
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cdlu-erp-secret-key-2026');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  if (authHeader === AUTH_PASS) {
    req.user = { role: 'admin' };
    return next();
  }
  if (authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'cdlu-erp-secret-key-2026');
    } catch (e) {}
  }
  next();
}

module.exports = { adminAuth, optionalAuth, AUTH_PASS };
