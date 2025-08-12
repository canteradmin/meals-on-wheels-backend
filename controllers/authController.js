const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const crypto = require("crypto");

// Register user
const register = async (req, res) => {
  try {
    console.log("=== AUTH REGISTRATION ENDPOINT HIT ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request URL:", req.originalUrl);
    console.log("Request method:", req.method);

    const { name, email, phone, password, role = "customer" } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email or phone already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password,
      role,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed",
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get profile",
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    // Check if phone is already taken by another user
    if (phone) {
      const existingUser = await User.findOne({
        phone,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Phone number is already in use",
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      data: {
        message: "Password updated successfully",
      },
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to change password",
    });
  }
};

// Logout user (blacklist current token)
const logout = async (req, res) => {
  try {
    const token = req.token; // Token is stored in req by authenticateToken middleware

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "No token to logout",
      });
    }

    // Add token to blacklist
    await User.findByIdAndUpdate(req.user._id, {
      $push: { blacklistedTokens: token },
    });

    res.json({
      success: true,
      data: {
        message: "Logged out successfully",
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to logout",
    });
  }
};

// Logout from all devices (blacklist all tokens)
const logoutAll = async (req, res) => {
  try {
    // Clear all blacklisted tokens and add current token
    const token = req.token;

    await User.findByIdAndUpdate(req.user._id, {
      $set: { blacklistedTokens: token ? [token] : [] },
    });

    res.json({
      success: true,
      data: {
        message: "Logged out from all devices successfully",
      },
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to logout from all devices",
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User with this email does not exist",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // In a real application, you would send this via email
    // For now, we'll return it in the response for testing
    res.json({
      success: true,
      data: {
        message: "Password reset instructions sent to your email",
        resetToken, // Remove this in production - send via email instead
        resetTokenExpiry,
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process forgot password request",
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
};

// Verify reset token
const verifyResetToken = async (req, res) => {
  try {
    const { resetToken } = req.params;

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    res.json({
      success: true,
      data: {
        message: "Reset token is valid",
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify reset token",
    });
  }
};

module.exports = {
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
};
