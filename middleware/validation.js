const { validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

// Common validation rules
const commonValidations = {
  name: {
    notEmpty: { errorMessage: "Name is required" },
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: "Name must be between 2 and 50 characters",
    },
  },

  email: {
    isEmail: { errorMessage: "Please provide a valid email address" },
    normalizeEmail: true,
  },

  phone: {
    isMobilePhone: {
      options: ["en-IN"],
      errorMessage: "Please provide a valid phone number",
    },
  },

  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters long",
    },
  },

  price: {
    isFloat: {
      options: { min: 0 },
      errorMessage: "Price must be a positive number",
    },
  },

  quantity: {
    isInt: {
      options: { min: 1 },
      errorMessage: "Quantity must be a positive integer",
    },
  },

  objectId: {
    isMongoId: { errorMessage: "Invalid ID format" },
  },
};

module.exports = {
  handleValidationErrors,
  commonValidations,
};
