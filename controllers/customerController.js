const User = require("../models/User");
const Order = require("../models/Order");
const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");

// Get all addresses
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get addresses",
    });
  }
};

// Add new address
const addAddress = async (req, res) => {
  try {
    const { type, name, phone, address, city, state, pincode, isDefault } =
      req.body;

    const user = await User.findById(req.user._id);

    // If this is the first address or isDefault is true, set it as default
    if (user.addresses.length === 0 || isDefault) {
      // Remove default from all other addresses
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      type,
      name,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: isDefault || user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        address: newAddress,
      },
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add address",
    });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { type, name, phone, address, city, state, pincode, isDefault } =
      req.body;

    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    // If setting as default, remove default from others
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      type,
      name,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: isDefault || false,
    };

    await user.save();

    res.json({
      success: true,
      data: {
        address: user.addresses[addressIndex],
      },
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update address",
    });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Address not found",
      });
    }

    const deletedAddress = user.addresses[addressIndex];
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default and there are other addresses, set first as default
    if (deletedAddress.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        message: "Address deleted successfully",
      },
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete address",
    });
  }
};

// Place order
const placeOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddressId,
      specialInstructions,
      paymentMethod,
    } = req.body;

    // Get user with addresses
    const user = await User.findById(req.user._id);

    // Get restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    // Get delivery address
    const deliveryAddress = user.addresses.find(
      (addr) => addr._id.toString() === deliveryAddressId
    );
    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: "Delivery address not found",
      });
    }

    // Validate and get items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await Item.findById(item.itemId);

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          error: `Item ${item.itemId} not found`,
        });
      }

      if (menuItem.restaurant.toString() !== restaurantId) {
        return res.status(400).json({
          success: false,
          error: `Item ${menuItem.name} does not belong to this restaurant`,
        });
      }

      if (menuItem.isOutOfStock) {
        return res.status(400).json({
          success: false,
          error: `Item ${menuItem.name} is out of stock`,
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        item: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
        specialInstructions: item.specialInstructions,
      });
    }

    // Calculate totals
    const deliveryFee = restaurant.deliveryFee || 0;
    const tax = subtotal * 0.05; // 5% tax
    const totalAmount = subtotal + deliveryFee + tax;

    // Check minimum order
    if (totalAmount < restaurant.minimumOrder) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount is ₹${restaurant.minimumOrder}`,
      });
    }

    // Create order
    const order = new Order({
      customer: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      deliveryAddress: {
        name: deliveryAddress.name,
        phone: deliveryAddress.phone,
        address: deliveryAddress.address,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
      },
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      specialInstructions,
      paymentMethod: paymentMethod || "cod",
    });

    await order.save();

    // Populate order details
    await order.populate([
      { path: "restaurant", select: "name phone address" },
      { path: "items.item", select: "name price" },
    ]);

    res.status(201).json({
      success: true,
      data: {
        order: order.toJSON(),
      },
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to place order",
    });
  }
};

// Get customer orders with pagination
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = { customer: req.user._id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("restaurant", "name")
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
    const order = await Order.findById(req.params.orderId)
      .populate("restaurant", "name phone address")
      .populate("items.item", "name price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check ownership
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      data: {
        order: order.toJSON(),
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

// Track order
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "restaurant",
      "name phone"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check ownership
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      data: {
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          trackingHistory: order.trackingHistory,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          actualDeliveryTime: order.actualDeliveryTime,
          restaurant: order.restaurant,
        },
      },
    });
  } catch (error) {
    console.error("Track order error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to track order",
    });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  placeOrder,
  getOrders,
  getOrder,
  trackOrder,
};
