const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    let decoded;
    try {
      // Try verifying with manager secret
      decoded = jwt.verify(token, process.env.JWT_SECRET_MANAGER);
    } catch (managerErr) {
      // If manager secret fails, try with user secret
      decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const authManager = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_MANAGER);
    if (decoded.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Access denied: Managers only' });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid or not a manager token' });
  }
};

const authUser = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
    if (decoded.user.role !== 'user') {
      return res.status(403).json({ msg: 'Access denied: Users only' });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid or not a user token' });
  }
};

module.exports = { protect, authManager, authUser };
