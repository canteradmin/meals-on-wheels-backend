const Restaurant = require("../models/Restaurant");
const Item = require("../models/Item");
const Order = require("../models/Order");
const SupportQuery = require("../models/SupportQuery");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Register restaurant with owner account
const registerRestaurant = async (req, res) => {
  try {
    console.log("=== RESTAURANT REGISTRATION ENDPOINT HIT ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request URL:", req.originalUrl);
    console.log("Request method:", req.method);

    const {
      // Owner details
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerPassword,

      // Restaurant details
      restaurantName,
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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: ownerEmail }, { phone: ownerPhone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email or phone already exists",
      });
    }

    // Check if restaurant name already exists
    const existingRestaurant = await Restaurant.findOne({
      name: restaurantName,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        error: "Restaurant with this name already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ownerPassword, saltRounds);

    // Create restaurant owner user
    const owner = new User({
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      password: hashedPassword,
      role: "restaurant_owner",
    });

    await owner.save();

    // Create restaurant
    const restaurant = new Restaurant({
      owner: owner._id,
      name: restaurantName,
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

    // Generate JWT token for the new owner
    const jwt = require("jsonwebtoken");
    const jwtExpire = process.env.JWT_EXPIRE || "7d";

    let token;
    if (jwtExpire.toLowerCase() === "unlimited") {
      token = jwt.sign({ userId: owner._id }, process.env.JWT_SECRET);
    } else {
      token = jwt.sign({ userId: owner._id }, process.env.JWT_SECRET, {
        expiresIn: jwtExpire,
      });
    }

    // Remove password from response
    const ownerResponse = {
      _id: owner._id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      role: owner.role,
      isActive: owner.isActive,
      createdAt: owner.createdAt,
    };

    res.status(201).json({
      success: true,
      data: {
        message: "Restaurant registered successfully",
        owner: ownerResponse,
        restaurant,
        token,
      },
    });
  } catch (error) {
    console.error("Register restaurant error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register restaurant",
    });
  }
};

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

// Get restaurant reports
const getReports = async (req, res) => {
  try {
    const { period = "month", startDate, endDate } = req.query;

    // Calculate date range
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      switch (period) {
        case "week":
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          start = new Date(end.getFullYear(), end.getMonth(), 1);
          break;
        case "year":
          start = new Date(end.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Get restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    // Get orders in date range
    const orders = await Order.find({
      restaurant: restaurant._id,
      createdAt: { $gte: start, $lte: end },
    }).populate("customer", "name");

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status breakdown
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Daily revenue chart data
    const dailyRevenue = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + order.totalAmount;
    });

    // Top selling items
    const itemSales = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
      });
    });

    const topSellingItems = Object.entries(itemSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, quantity]) => ({ name, quantity }));

    res.json({
      success: true,
      data: {
        period,
        dateRange: { start, end },
        summary: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          statusBreakdown,
        },
        charts: {
          dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
            date,
            revenue,
          })),
        },
        topSellingItems,
        recentOrders: orders.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get reports",
    });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    // Get recent orders
    const recentOrders = await Order.find({ restaurant: restaurant._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2)
      .populate("customer", "name");

    // Get recent support queries
    const recentSupport = await SupportQuery.find({
      restaurant: restaurant._id,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2)
      .populate("customer", "name");

    // Combine and format activities
    const activities = [];

    // Add order activities
    recentOrders.forEach((order) => {
      activities.push({
        id: order._id,
        type: "order",
        action: `Order #${order.orderNumber} ${order.status}`,
        description: `${order.items.length} items - ₹${order.totalAmount}`,
        timestamp: order.createdAt,
        status: order.status,
        customer: order.customer?.name || "Unknown",
      });
    });

    // Add support activities
    recentSupport.forEach((query) => {
      activities.push({
        id: query._id,
        type: "support",
        action: `Support ticket ${query.status}`,
        description: query.subject,
        timestamp: query.createdAt,
        status: query.status,
        customer: query.customer?.name || "Unknown",
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => b.timestamp - a.timestamp);
    activities.splice(parseInt(limit));

    res.json({
      success: true,
      data: {
        activities,
        total: activities.length,
      },
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get recent activity",
    });
  }
};

// Get restaurant settings
const getRestaurantSettings = async (req, res) => {
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
        settings: {
          name: restaurant.name,
          description: restaurant.description,
          phone: restaurant.phone,
          email: restaurant.email,
          address: restaurant.address,
          cuisine: restaurant.cuisine,
          deliveryRadius: restaurant.deliveryRadius,
          deliveryFee: restaurant.deliveryFee,
          minimumOrder: restaurant.minimumOrder,
          isActive: restaurant.isActive,
          operatingHours: restaurant.operatingHours,
          paymentMethods: restaurant.paymentMethods,
        },
      },
    });
  } catch (error) {
    console.error("Get restaurant settings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get restaurant settings",
    });
  }
};

// Update restaurant settings
const updateRestaurantSettings = async (req, res) => {
  try {
    const {
      name,
      description,
      phone,
      email,
      address,
      cuisine,
      deliveryRadius,
      deliveryFee,
      minimumOrder,
      isActive,
      operatingHours,
      paymentMethods,
    } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    // Update fields
    if (name) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (phone) restaurant.phone = phone;
    if (email) restaurant.email = email;
    if (address) restaurant.address = address;
    if (cuisine) restaurant.cuisine = cuisine;
    if (deliveryRadius !== undefined)
      restaurant.deliveryRadius = deliveryRadius;
    if (deliveryFee !== undefined) restaurant.deliveryFee = deliveryFee;
    if (minimumOrder !== undefined) restaurant.minimumOrder = minimumOrder;
    if (isActive !== undefined) restaurant.isActive = isActive;
    if (operatingHours) restaurant.operatingHours = operatingHours;
    if (paymentMethods) restaurant.paymentMethods = paymentMethods;

    await restaurant.save();

    res.json({
      success: true,
      data: {
        message: "Restaurant settings updated successfully",
        restaurant,
      },
    });
  } catch (error) {
    console.error("Update restaurant settings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update restaurant settings",
    });
  }
};

// Send notification
const sendNotification = async (req, res) => {
  try {
    const { title, message, type, targetUsers } = req.body;

    // Get restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    // In a real application, you would integrate with a notification service
    // For now, we'll just log the notification
    console.log("Notification sent:", {
      restaurant: restaurant.name,
      title,
      message,
      type,
      targetUsers,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      data: {
        message: "Notification sent successfully",
        notification: {
          id: Date.now().toString(),
          title,
          message,
          type,
          targetUsers,
          sentAt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send notification",
    });
  }
};

module.exports = {
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
};
