const express = require("express");
const { body, param } = require("express-validator");
const { authenticateToken, requireCustomer } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkoutCart,
} = require("../controllers/cartController");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken, requireCustomer);

// Get cart contents
router.get("/", getCart);

// Add item to cart
router.post(
  "/",
  [
    body("itemId").isMongoId().withMessage("Invalid item ID"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("specialInstructions")
      .optional()
      .isString()
      .withMessage("Special instructions must be a string"),
    handleValidationErrors,
  ],
  addToCart
);

// Update item quantity in cart
router.put(
  "/:itemId",
  [
    param("itemId").isMongoId().withMessage("Invalid item ID"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    handleValidationErrors,
  ],
  updateCartItem
);

// Remove item from cart
router.delete(
  "/:itemId",
  [
    param("itemId").isMongoId().withMessage("Invalid item ID"),
    handleValidationErrors,
  ],
  removeFromCart
);

// Clear entire cart
router.delete("/", clearCart);

// Checkout cart (convert to order)
router.post(
  "/checkout",
  [
    body("deliveryAddressId")
      .isMongoId()
      .withMessage("Invalid delivery address ID"),
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
  checkoutCart
);

module.exports = router;
