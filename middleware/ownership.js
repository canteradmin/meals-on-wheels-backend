const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const SupportQuery = require("../models/SupportQuery");

// Verify restaurant ownership
const verifyRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurantId = req.params.restaurantId || req.body.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: "Restaurant ID is required",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied - you can only manage your own restaurant",
      });
    }

    req.restaurant = restaurant;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error verifying restaurant ownership",
    });
  }
};

// Verify order ownership (customer can only access their own orders)
const verifyOrderOwnership = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId)
      .populate("restaurant", "name owner")
      .populate("customer", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Customer can only access their own orders
    if (
      req.user.role === "customer" &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied - you can only view your own orders",
      });
    }

    // Restaurant owner can only access orders from their restaurant
    if (
      req.user.role === "restaurant_owner" &&
      order.restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error:
          "Access denied - you can only manage orders from your restaurant",
      });
    }

    req.order = order;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error verifying order ownership",
    });
  }
};

// Verify support query ownership
const verifySupportQueryOwnership = async (req, res, next) => {
  try {
    const queryId = req.params.queryId;

    const supportQuery = await SupportQuery.findById(queryId)
      .populate("customer", "name email")
      .populate("restaurant", "name owner");

    if (!supportQuery) {
      return res.status(404).json({
        success: false,
        error: "Support query not found",
      });
    }

    // Customer can only access their own support queries
    if (
      req.user.role === "customer" &&
      supportQuery.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied - you can only view your own support queries",
      });
    }

    // Restaurant owner can only access support queries related to their restaurant
    if (
      req.user.role === "restaurant_owner" &&
      supportQuery.restaurant &&
      supportQuery.restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error:
          "Access denied - you can only manage support queries related to your restaurant",
      });
    }

    req.supportQuery = supportQuery;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error verifying support query ownership",
    });
  }
};

module.exports = {
  verifyRestaurantOwnership,
  verifyOrderOwnership,
  verifySupportQueryOwnership,
};
