const SupportQuery = require("../models/SupportQuery");
const Restaurant = require("../models/Restaurant");

// Create support query (customer)
const createSupportQuery = async (req, res) => {
  try {
    const { subject, category, priority, message, restaurantId, orderId } =
      req.body;

    // Validate restaurant ownership if restaurantId is provided
    if (restaurantId) {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: "Restaurant not found",
        });
      }
    }

    const supportQuery = new SupportQuery({
      customer: req.user._id,
      restaurant: restaurantId,
      order: orderId,
      subject,
      category,
      priority,
      messages: [
        {
          sender: req.user._id,
          message,
          isFromCustomer: true,
        },
      ],
    });

    await supportQuery.save();

    // Populate customer details
    await supportQuery.populate("customer", "name email");

    res.status(201).json({
      success: true,
      data: {
        supportQuery,
      },
    });
  } catch (error) {
    console.error("Create support query error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create support query",
    });
  }
};

// Get customer's support queries
const getCustomerSupportQueries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = { customer: req.user._id };
    if (status) {
      filter.status = status;
    }

    const queries = await SupportQuery.find(filter)
      .populate("restaurant", "name")
      .populate("order", "orderNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SupportQuery.countDocuments(filter);

    res.json({
      success: true,
      data: {
        queries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get customer support queries error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get support queries",
    });
  }
};

// Get support query details
const getSupportQuery = async (req, res) => {
  try {
    const { queryId } = req.params;

    const supportQuery = await SupportQuery.findById(queryId)
      .populate("customer", "name email")
      .populate("restaurant", "name")
      .populate("order", "orderNumber totalAmount")
      .populate("messages.sender", "name");

    if (!supportQuery) {
      return res.status(404).json({
        success: false,
        error: "Support query not found",
      });
    }

    // Check ownership
    if (
      req.user.role === "customer" &&
      supportQuery.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Check restaurant ownership for restaurant owners
    if (
      req.user.role === "restaurant_owner" &&
      supportQuery.restaurant &&
      supportQuery.restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      data: {
        supportQuery,
      },
    });
  } catch (error) {
    console.error("Get support query error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get support query",
    });
  }
};

// Add message to support query
const addMessage = async (req, res) => {
  try {
    const { queryId } = req.params;
    const { message, attachments } = req.body;

    const supportQuery = await SupportQuery.findById(queryId);

    if (!supportQuery) {
      return res.status(404).json({
        success: false,
        error: "Support query not found",
      });
    }

    // Check ownership
    if (
      req.user.role === "customer" &&
      supportQuery.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Check restaurant ownership for restaurant owners
    if (
      req.user.role === "restaurant_owner" &&
      supportQuery.restaurant &&
      supportQuery.restaurant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const isFromCustomer = req.user.role === "customer";

    await supportQuery.addMessage(
      req.user._id,
      message,
      isFromCustomer,
      attachments
    );

    // Populate the updated query
    await supportQuery.populate([
      { path: "customer", select: "name email" },
      { path: "restaurant", select: "name" },
      { path: "order", select: "orderNumber" },
      { path: "messages.sender", select: "name" },
    ]);

    res.json({
      success: true,
      data: {
        supportQuery,
      },
    });
  } catch (error) {
    console.error("Add message error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add message",
    });
  }
};

// Resolve support query (restaurant owner)
const resolveSupportQuery = async (req, res) => {
  try {
    const { queryId } = req.params;
    const { resolution } = req.body;

    const supportQuery = await SupportQuery.findById(queryId).populate(
      "restaurant",
      "owner"
    );

    if (!supportQuery) {
      return res.status(404).json({
        success: false,
        error: "Support query not found",
      });
    }

    // Check restaurant ownership
    if (
      req.user.role !== "restaurant_owner" ||
      !supportQuery.restaurant ||
      supportQuery.restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    await supportQuery.resolve(resolution, req.user._id);

    // Populate the updated query
    await supportQuery.populate([
      { path: "customer", select: "name email" },
      { path: "restaurant", select: "name" },
      { path: "order", select: "orderNumber" },
      { path: "messages.sender", select: "name" },
    ]);

    res.json({
      success: true,
      data: {
        supportQuery,
      },
    });
  } catch (error) {
    console.error("Resolve support query error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resolve support query",
    });
  }
};

// Close support query
const closeSupportQuery = async (req, res) => {
  try {
    const { queryId } = req.params;

    const supportQuery = await SupportQuery.findById(queryId);

    if (!supportQuery) {
      return res.status(404).json({
        success: false,
        error: "Support query not found",
      });
    }

    // Check ownership
    if (
      req.user.role === "customer" &&
      supportQuery.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Check restaurant ownership for restaurant owners
    if (
      req.user.role === "restaurant_owner" &&
      supportQuery.restaurant &&
      supportQuery.restaurant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    await supportQuery.close();

    res.json({
      success: true,
      data: {
        message: "Support query closed successfully",
      },
    });
  } catch (error) {
    console.error("Close support query error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to close support query",
    });
  }
};

// Rate support query (customer)
const rateSupportQuery = async (req, res) => {
  try {
    const { queryId } = req.params;
    const { rating, feedback } = req.body;

    const supportQuery = await SupportQuery.findById(queryId);

    if (!supportQuery) {
      return res.status(404).json({
        success: false,
        error: "Support query not found",
      });
    }

    // Check customer ownership
    if (
      req.user.role !== "customer" ||
      supportQuery.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Check if query is resolved
    if (supportQuery.status !== "resolved") {
      return res.status(400).json({
        success: false,
        error: "Can only rate resolved support queries",
      });
    }

    supportQuery.customerRating = rating;
    supportQuery.customerFeedback = feedback;
    await supportQuery.save();

    res.json({
      success: true,
      data: {
        message: "Support query rated successfully",
      },
    });
  } catch (error) {
    console.error("Rate support query error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to rate support query",
    });
  }
};

module.exports = {
  createSupportQuery,
  getCustomerSupportQueries,
  getSupportQuery,
  addMessage,
  resolveSupportQuery,
  closeSupportQuery,
  rateSupportQuery,
};
