const express = require("express");
const { body, param, query } = require("express-validator");
const { authenticateToken, requireCustomer } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  placeOrder,
  getOrders,
  getOrder,
  trackOrder,
} = require("../controllers/customerController");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken, requireCustomer);

// Address management routes
router.get("/addresses", getAddresses);

router.post(
  "/addresses",
  [
    body("type")
      .isIn(["home", "work", "other"])
      .withMessage("Invalid address type"),
    body("name")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("phone")
      .isMobilePhone("en-IN")
      .withMessage("Please provide a valid phone number"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("pincode")
      .isLength({ min: 6, max: 6 })
      .withMessage("Pincode must be 6 digits"),
    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be a boolean"),
    handleValidationErrors,
  ],
  addAddress
);

router.put(
  "/addresses/:addressId",
  [
    param("addressId").isMongoId().withMessage("Invalid address ID"),
    body("type")
      .optional()
      .isIn(["home", "work", "other"])
      .withMessage("Invalid address type"),
    body("name")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("phone")
      .optional()
      .isMobilePhone("en-IN")
      .withMessage("Please provide a valid phone number"),
    body("address").optional().notEmpty().withMessage("Address is required"),
    body("city").optional().notEmpty().withMessage("City is required"),
    body("state").optional().notEmpty().withMessage("State is required"),
    body("pincode")
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage("Pincode must be 6 digits"),
    body("isDefault")
      .optional()
      .isBoolean()
      .withMessage("isDefault must be a boolean"),
    handleValidationErrors,
  ],
  updateAddress
);

router.delete(
  "/addresses/:addressId",
  [
    param("addressId").isMongoId().withMessage("Invalid address ID"),
    handleValidationErrors,
  ],
  deleteAddress
);

// Order routes
router.post(
  "/orders",
  [
    body("restaurantId").isMongoId().withMessage("Invalid restaurant ID"),
    body("deliveryAddressId")
      .isMongoId()
      .withMessage("Invalid delivery address ID"),
    body("items")
      .isArray({ min: 1 })
      .withMessage("At least one item is required"),
    body("items.*.itemId").isMongoId().withMessage("Invalid item ID"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("items.*.specialInstructions")
      .optional()
      .isString()
      .withMessage("Special instructions must be a string"),
    body("specialInstructions")
      .optional()
      .isString()
      .withMessage("Special instructions must be a string"),
    body("paymentMethod")
      .optional()
      .isIn(["cod", "online", "card"])
      .withMessage("Invalid payment method"),
    handleValidationErrors,
  ],
  placeOrder
);

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

router.get(
  "/orders/:orderId/track",
  [
    param("orderId").isMongoId().withMessage("Invalid order ID"),
    handleValidationErrors,
  ],
  trackOrder
);

module.exports = router;
