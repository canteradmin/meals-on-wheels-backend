const express = require("express");
const { body, param, query } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");
const {
  createSupportQuery,
  getCustomerSupportQueries,
  getSupportQuery,
  addMessage,
  resolveSupportQuery,
  closeSupportQuery,
  rateSupportQuery,
} = require("../controllers/supportController");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Customer support routes
router.post(
  "/",
  [
    body("subject")
      .isLength({ min: 5, max: 200 })
      .withMessage("Subject must be between 5 and 200 characters"),
    body("category")
      .isIn([
        "order_issue",
        "payment_issue",
        "delivery_issue",
        "food_quality",
        "general",
        "technical",
      ])
      .withMessage("Invalid category"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Invalid priority"),
    body("message")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be between 10 and 1000 characters"),
    body("restaurantId")
      .optional()
      .isMongoId()
      .withMessage("Invalid restaurant ID"),
    body("orderId").optional().isMongoId().withMessage("Invalid order ID"),
    handleValidationErrors,
  ],
  createSupportQuery
);

router.get(
  "/",
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
  getCustomerSupportQueries
);

router.get(
  "/:queryId",
  [
    param("queryId").isMongoId().withMessage("Invalid query ID"),
    handleValidationErrors,
  ],
  getSupportQuery
);

router.post(
  "/:queryId/messages",
  [
    param("queryId").isMongoId().withMessage("Invalid query ID"),
    body("message")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Message must be between 1 and 1000 characters"),
    body("attachments")
      .optional()
      .isArray()
      .withMessage("Attachments must be an array"),
    body("attachments.*")
      .optional()
      .isString()
      .withMessage("Attachment items must be strings"),
    handleValidationErrors,
  ],
  addMessage
);

router.patch(
  "/:queryId/resolve",
  [
    param("queryId").isMongoId().withMessage("Invalid query ID"),
    body("resolution")
      .isLength({ min: 10, max: 500 })
      .withMessage("Resolution must be between 10 and 500 characters"),
    handleValidationErrors,
  ],
  resolveSupportQuery
);

router.patch(
  "/:queryId/close",
  [
    param("queryId").isMongoId().withMessage("Invalid query ID"),
    handleValidationErrors,
  ],
  closeSupportQuery
);

router.post(
  "/:queryId/rate",
  [
    param("queryId").isMongoId().withMessage("Invalid query ID"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("feedback")
      .optional()
      .isLength({ min: 5, max: 500 })
      .withMessage("Feedback must be between 5 and 500 characters"),
    handleValidationErrors,
  ],
  rateSupportQuery
);

module.exports = router;
