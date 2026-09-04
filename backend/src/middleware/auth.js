const jwt = require('jsonwebtoken');
const { getUserById } = require('../data/store');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const user = getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Session is no longer valid. Please sign in again.' });
    }
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
}

// Some routes (e.g. viewing the public map, tracking a case by ID) are
// intentionally open — this middleware attaches a user if present but
// never blocks the request.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const user = getUserById(payload.sub);
    if (user) {
      req.user = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
    }
  } catch (err) {
    // ignore invalid token on optional routes
  }
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
