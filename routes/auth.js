const express = require("express");
const { body } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const {
  handleValidationErrors,
  commonValidations,
} = require("../middleware/validation");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} = require("../controllers/authController");

const router = express.Router();

// Register user
router.post(
  "/register",
  [
    body("name")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("phone")
      .isMobilePhone("en-IN")
      .withMessage("Please provide a valid phone number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role")
      .optional()
      .isIn(["customer", "restaurant_owner"])
      .withMessage("Invalid role"),
    handleValidationErrors,
  ],
  register
);

// Login user
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
  ],
  login
);

// Get current user profile
router.get("/me", authenticateToken, getProfile);

// Update user profile
router.put(
  "/profile",
  [
    authenticateToken,
    body("name")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("phone")
      .optional()
      .isMobilePhone("en-IN")
      .withMessage("Please provide a valid phone number"),
    handleValidationErrors,
  ],
  updateProfile
);

// Change password
router.put(
  "/change-password",
  [
    authenticateToken,
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
    handleValidationErrors,
  ],
  changePassword
);

// Logout (blacklist current token)
router.post("/logout", authenticateToken, logout);

// Logout from all devices (blacklist all tokens)
router.post("/logout-all", authenticateToken, logoutAll);

// Forgot password
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    handleValidationErrors,
  ],
  forgotPassword
);

// Verify reset token
router.get("/reset-password/:resetToken", verifyResetToken);

// Reset password
router.post(
  "/reset-password",
  [
    body("resetToken").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
    handleValidationErrors,
  ],
  resetPassword
);

module.exports = router;
