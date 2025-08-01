const Restaurant = require("../models/Restaurant");
const Item = require("../models/Item");
const Order = require("../models/Order");
const SupportQuery = require("../models/SupportQuery");

// Get restaurant owner's restaurant
const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    res.json({
      success: true,
      data: {
        restaurant,
      },
    });
  } catch (error) {
    console.error("Get restaurant error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get restaurant",
    });
  }
};

// Create/Update restaurant
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      phone,
      email,
      cuisine,
      openingHours,
      deliveryRadius,
      deliveryFee,
      minimumOrder,
    } = req.body;

    let restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (restaurant) {
      // Update existing restaurant
      restaurant = await Restaurant.findByIdAndUpdate(
        restaurant._id,
        {
          name,
          description,
          address,
          phone,
          email,
          cuisine,
          openingHours,
          deliveryRadius,
          deliveryFee,
          minimumOrder,
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new restaurant
      restaurant = new Restaurant({
        owner: req.user._id,
        name,
        description,
        address,
        phone,
        email,
        cuisine,
        openingHours,
        deliveryRadius,
        deliveryFee,
        minimumOrder,
      });
      await restaurant.save();
    }

    res.json({
      success: true,
      data: {
        restaurant,
      },
    });
  } catch (error) {
    console.error("Create restaurant error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create/update restaurant",
    });
  }
};

// Get all menu items
const getMenuItems = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const items = await Item.find({ restaurant: restaurant._id }).sort({
      order: 1,
      category: 1,
      name: 1,
    });

    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error) {
    console.error("Get menu items error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get menu items",
    });
  }
};

// Add menu item
const addMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      isVegetarian,
      isSpicy,
      preparationTime,
      allergens,
      nutritionalInfo,
    } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const item = new Item({
      restaurant: restaurant._id,
      name,
      description,
      price,
      category,
      image,
      isVegetarian,
      isSpicy,
      preparationTime,
      allergens,
      nutritionalInfo,
    });

    await item.save();

    res.status(201).json({
      success: true,
      data: {
        item,
      },
    });
  } catch (error) {
    console.error("Add menu item error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add menu item",
    });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updates = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const item = await Item.findOneAndUpdate(
      { _id: itemId, restaurant: restaurant._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    res.json({
      success: true,
      data: {
        item,
      },
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update menu item",
    });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const item = await Item.findOneAndDelete({
      _id: itemId,
      restaurant: restaurant._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    res.json({
      success: true,
      data: {
        message: "Menu item deleted successfully",
      },
    });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete menu item",
    });
  }
};

// Get restaurant orders with filtering and pagination
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const skip = (page - 1) * limit;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const filter = { restaurant: restaurant._id };

    if (status) {
      filter.status = status;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const orders = await Order.find(filter)
      .populate("customer", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get orders",
    });
  }
};

// Get order details
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    })
      .populate("customer", "name phone email")
      .populate("items.item", "name price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get order",
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, message, estimatedDeliveryTime } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      restaurant: restaurant._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Update order status
    await order.updateStatus(status, message, req.user._id);

    // Update estimated delivery time if provided
    if (estimatedDeliveryTime) {
      order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
      await order.save();
    }

    // Populate order details
    await order.populate([
      { path: "customer", select: "name phone email" },
      { path: "items.item", select: "name price image" },
    ]);

    res.json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update order status",
    });
  }
};

// Get restaurant dashboard metrics
const getDashboard = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Sales metrics
    const todaySales = await Order.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          status: { $in: ["delivered", "out_for_delivery"] },
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const weekSales = await Order.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          status: { $in: ["delivered", "out_for_delivery"] },
          createdAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const monthSales = await Order.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          status: { $in: ["delivered", "out_for_delivery"] },
          createdAt: { $gte: monthAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    // Order status counts
    const orderStatusCounts = await Order.aggregate([
      {
        $match: { restaurant: restaurant._id },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent orders
    const recentOrders = await Order.find({ restaurant: restaurant._id })
      .populate("customer", "name phone")
      .sort({ createdAt: -1 })
      .limit(5);

    // Convert to object for easier access
    const statusCounts = {};
    orderStatusCounts.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        sales: {
          today: todaySales[0] || { totalSales: 0, orderCount: 0 },
          week: weekSales[0] || { totalSales: 0, orderCount: 0 },
          month: monthSales[0] || { totalSales: 0, orderCount: 0 },
        },
        orderStatusCounts: statusCounts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get dashboard data",
    });
  }
};

// Get restaurant support queries
const getSupportQueries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    const filter = { restaurant: restaurant._id };
    if (status) {
      filter.status = status;
    }

    const queries = await SupportQuery.find(filter)
      .populate("customer", "name email")
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
    console.error("Get support queries error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get support queries",
    });
  }
};

module.exports = {
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
};
