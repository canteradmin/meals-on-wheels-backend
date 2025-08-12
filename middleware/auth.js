const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token with conditional expiration
const generateToken = (userId) => {
  const jwtExpire = process.env.JWT_EXPIRE || "7d";

  // If JWT_EXPIRE is set to "Unlimited" or "unlimited", don't set expiration
  if (jwtExpire.toLowerCase() === "unlimited") {
    return jwt.sign({ userId }, process.env.JWT_SECRET);
  }

  // Otherwise, use the specified expiration time
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: jwtExpire,
  });
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token - user not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated",
      });
    }

    // Check if token is blacklisted (for logout functionality)
    if (user.blacklistedTokens && user.blacklistedTokens.includes(token)) {
      return res.status(401).json({
        success: false,
        error: "Token has been invalidated - please login again",
      });
    }

    req.user = user;
    req.token = token; // Store token for potential logout use
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Authentication error",
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Access denied - insufficient permissions",
      });
    }

    next();
  };
};

// Specific role middleware
const requireCustomer = authorizeRoles("customer");
const requireRestaurantOwner = authorizeRoles("restaurant_owner");

module.exports = {
  generateToken,
  authenticateToken,
  authorizeRoles,
  requireCustomer,
  requireRestaurantOwner,
};
