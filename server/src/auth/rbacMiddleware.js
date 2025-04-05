// server/src/auth/rbacMiddleware.js

// Enhanced Role-based Access Control Middleware
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    // Ensure req.user is available and has a role
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Access denied. No user role found.' });
    }

    const userRole = req.user.role;

    // Check if user role is within the allowed roles
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};