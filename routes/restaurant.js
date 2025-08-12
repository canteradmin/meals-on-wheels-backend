const express = require("express");
const { body, param, query } = require("express-validator");
const {
  authenticateToken,
  requireRestaurantOwner,
} = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");
const {
  registerRestaurant,
  getRestaurant,
  createRestaurant,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getOrders,
  getOrder,
  updateOrderStatus,
  getDashboard,
  getSupportQueries,
  getReports,
  getRecentActivity,
  getRestaurantSettings,
  updateRestaurantSettings,
  sendNotification,
} = require("../controllers/restaurantController");

const router = express.Router();

// Public restaurant registration route (no authentication required)
router.post(
  "/register",
  [
    // Owner validation
    body("ownerName")
      .isLength({ min: 2, max: 50 })
      .withMessage("Owner name must be between 2 and 50 characters"),
    body("ownerEmail")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid owner email address"),
    body("ownerPhone")
      .isMobilePhone("en-IN")
      .withMessage("Please provide a valid owner phone number"),
    body("ownerPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    // Restaurant validation
    body("restaurantName")
      .isLength({ min: 2, max: 100 })
      .withMessage("Restaurant name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("address.street").notEmpty().withMessage("Street address is required"),
    body("address.city").notEmpty().withMessage("City is required"),
    body("address.state").notEmpty().withMessage("State is required"),
    body("address.pincode")
      .isLength({ min: 6, max: 6 })
      .withMessage("Pincode must be 6 digits"),
    body("phone")
      .isMobilePhone("en-IN")
      .withMessage("Please provide a valid restaurant phone number"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid restaurant email address"),
    body("cuisine")
      .optional()
      .isArray()
      .withMessage("Cuisine must be an array"),
    body("cuisine.*")
      .optional()
      .isString()
      .withMessage("Cuisine items must be strings"),
    body("deliveryRadius")
      .optional()
      .isFloat({ min: 1, max: 20 })
      .withMessage("Delivery radius must be between 1 and 20 km"),
    body("deliveryFee")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Delivery fee must be non-negative"),
    body("minimumOrder")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum order must be non-negative"),
    handleValidationErrors,
  ],
  registerRestaurant
);

// Apply authentication to all other routes
router.use(authenticateToken, requireRestaurantOwner);

// Restaurant management routes
router.get("/", getRestaurant);

router.post(
  "/",
  [
    body("name")
      .isLength({ min: 2, max: 100 })
      .withMessage("Restaurant name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("address.street").notEmpty().withMessage("Street address is required"),
    body("address.city").notEmpty().withMessage("City is required"),
    body("address.state").notEmpty().withMessage("State is required"),
    body("address.pincode")
      .isLength({ min: 6, max: 6 })
      .withMessage("Pincode must be 6 digits"),
    body("phone")
      .isMobilePhone("en-IN")
      .withMessage("Please provide a valid phone number"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("cuisine")
      .optional()
      .isArray()
      .withMessage("Cuisine must be an array"),
    body("cuisine.*")
      .optional()
      .isString()
      .withMessage("Cuisine items must be strings"),
    body("deliveryRadius")
      .optional()
      .isFloat({ min: 1, max: 20 })
      .withMessage("Delivery radius must be between 1 and 20 km"),
    body("deliveryFee")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Delivery fee must be non-negative"),
    body("minimumOrder")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum order must be non-negative"),
    handleValidationErrors,
  ],
  createRestaurant
);

// Menu management routes
router.get("/menu", getMenuItems);

router.post(
  "/menu",
  [
    body("name")
      .isLength({ min: 2, max: 100 })
      .withMessage("Item name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be non-negative"),
    body("category").notEmpty().withMessage("Category is required"),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
    body("isVegetarian")
      .optional()
      .isBoolean()
      .withMessage("isVegetarian must be a boolean"),
    body("isSpicy")
      .optional()
      .isBoolean()
      .withMessage("isSpicy must be a boolean"),
    body("preparationTime")
      .optional()
      .isInt({ min: 5, max: 120 })
      .withMessage("Preparation time must be between 5 and 120 minutes"),
    body("allergens")
      .optional()
      .isArray()
      .withMessage("Allergens must be an array"),
    body("allergens.*")
      .optional()
      .isString()
      .withMessage("Allergen items must be strings"),
    body("nutritionalInfo.calories")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Calories must be non-negative"),
    body("nutritionalInfo.protein")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Protein must be non-negative"),
    body("nutritionalInfo.carbs")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Carbs must be non-negative"),
    body("nutritionalInfo.fat")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Fat must be non-negative"),
    handleValidationErrors,
  ],
  addMenuItem
);

router.put(
  "/menu/:itemId",
  [
    param("itemId").isMongoId().withMessage("Invalid item ID"),
    body("name")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("Item name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be non-negative"),
    body("category").optional().notEmpty().withMessage("Category is required"),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
    body("isOutOfStock")
      .optional()
      .isBoolean()
      .withMessage("isOutOfStock must be a boolean"),
    body("isVegetarian")
      .optional()
      .isBoolean()
      .withMessage("isVegetarian must be a boolean"),
    body("isSpicy")
      .optional()
      .isBoolean()
      .withMessage("isSpicy must be a boolean"),
    body("preparationTime")
      .optional()
      .isInt({ min: 5, max: 120 })
      .withMessage("Preparation time must be between 5 and 120 minutes"),
    body("allergens")
      .optional()
      .isArray()
      .withMessage("Allergens must be an array"),
    body("allergens.*")
      .optional()
      .isString()
      .withMessage("Allergen items must be strings"),
    body("nutritionalInfo.calories")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Calories must be non-negative"),
    body("nutritionalInfo.protein")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Protein must be non-negative"),
    body("nutritionalInfo.carbs")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Carbs must be non-negative"),
    body("nutritionalInfo.fat")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Fat must be non-negative"),
    handleValidationErrors,
  ],
  updateMenuItem
);

router.delete(
  "/menu/:itemId",
  [
    param("itemId").isMongoId().withMessage("Invalid item ID"),
    handleValidationErrors,
  ],
  deleteMenuItem
);

// Order management routes
router.get(
  "/orders",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("status")
      .optional()
      .isIn([
        "placed",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "rejected",
        "cancelled",
      ])
      .withMessage("Invalid status"),
    query("dateFrom")
      .optional()
      .isISO8601()
      .withMessage("Date from must be a valid date"),
    query("dateTo")
      .optional()
      .isISO8601()
      .withMessage("Date to must be a valid date"),
    handleValidationErrors,
  ],
  getOrders
);

router.get(
  "/orders/:orderId",
  [
    param("orderId").isMongoId().withMessage("Invalid order ID"),
    handleValidationErrors,
  ],
  getOrder
);

router.patch(
  "/orders/:orderId/status",
  [
    param("orderId").isMongoId().withMessage("Invalid order ID"),
    body("status")
      .isIn([
        "placed",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "rejected",
        "cancelled",
      ])
      .withMessage("Invalid status"),
    body("message").notEmpty().withMessage("Status update message is required"),
    body("estimatedDeliveryTime")
      .optional()
      .isISO8601()
      .withMessage("Estimated delivery time must be a valid date"),
    handleValidationErrors,
  ],
  updateOrderStatus
);

// Dashboard routes
router.get("/dashboard", getDashboard);

// Support queries routes
router.get(
  "/support",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("status")
      .optional()
      .isIn(["open", "in_progress", "resolved", "closed"])
      .withMessage("Invalid status"),
    handleValidationErrors,
  ],
  getSupportQueries
);

// Reports routes
router.get(
  "/reports",
  [
    query("period")
      .optional()
      .isIn(["week", "month", "year"])
      .withMessage("Period must be week, month, or year"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
    handleValidationErrors,
  ],
  getReports
);

// Recent activity routes
router.get(
  "/activity",
  [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    handleValidationErrors,
  ],
  getRecentActivity
);

// Settings routes
router.get("/settings", getRestaurantSettings);

router.put(
  "/settings",
  [
    body("name")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("Restaurant name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("phone")
      .optional()
      .isMobilePhone("en-IN")
      .withMessage("Please provide a valid phone number"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("deliveryRadius")
      .optional()
      .isFloat({ min: 1, max: 20 })
      .withMessage("Delivery radius must be between 1 and 20 km"),
    body("deliveryFee")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Delivery fee must be non-negative"),
    body("minimumOrder")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum order must be non-negative"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
    handleValidationErrors,
  ],
  updateRestaurantSettings
);

// Notification routes
router.post(
  "/notifications",
  [
    body("title").notEmpty().withMessage("Notification title is required"),
    body("message").notEmpty().withMessage("Notification message is required"),
    body("type")
      .optional()
      .isIn(["info", "warning", "success", "error"])
      .withMessage("Type must be info, warning, success, or error"),
    body("targetUsers")
      .optional()
      .isArray()
      .withMessage("Target users must be an array"),
    handleValidationErrors,
  ],
  sendNotification
);

module.exports = router;
