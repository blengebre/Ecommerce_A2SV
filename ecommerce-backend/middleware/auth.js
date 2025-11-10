const jwt = require('jsonwebtoken');

// 🔒 Verify JWT and attach user info
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorized: No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// 🧑‍💼 Verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};

// 🧍 Verify standard user role
const verifyUser = (req, res, next) => {
  if (req.user.role !== 'User') {
    return res.status(403).json({ message: 'Forbidden: Users only' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, verifyUser };
