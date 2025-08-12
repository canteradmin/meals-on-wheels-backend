const Cart = require("../models/Cart");
const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const User = require("../models/User");

// Get cart contents
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id })
      .populate("restaurant", "name address")
      .populate("items.item", "name price image isOutOfStock");

    if (!cart) {
      return res.json({
        success: true,
        data: {
          cart: {
            items: [],
            subtotal: 0,
            deliveryFee: 0,
            tax: 0,
            totalAmount: 0,
            itemCount: 0,
          },
        },
      });
    }

    // Check if cart has expired
    if (cart.expiresAt < new Date()) {
      await Cart.findByIdAndDelete(cart._id);
      return res.json({
        success: true,
        data: {
          cart: {
            items: [],
            subtotal: 0,
            deliveryFee: 0,
            tax: 0,
            totalAmount: 0,
            itemCount: 0,
          },
        },
      });
    }

    // Check if items are still available
    const validItems = [];
    for (const cartItem of cart.items) {
      const item = await Item.findById(cartItem.item);
      if (item && !item.isOutOfStock) {
        validItems.push(cartItem);
      }
    }

    // Update cart if items were removed
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      cart.calculateTotals();
      await cart.save();
    }

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          itemCount,
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get cart",
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1, specialInstructions } = req.body;

    // Validate item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    if (item.isOutOfStock) {
      return res.status(400).json({
        success: false,
        error: "Item is out of stock",
      });
    }

    // Get restaurant
    const restaurant = await Restaurant.findById(item.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    // Check if user has existing cart
    let cart = await Cart.findOne({ customer: req.user._id });

    if (cart) {
      // Check if cart is for different restaurant
      if (cart.restaurant.toString() !== item.restaurant.toString()) {
        return res.status(400).json({
          success: false,
          error: "Cannot add items from different restaurants to the same cart",
        });
      }

      // Check if cart has expired
      if (cart.expiresAt < new Date()) {
        await Cart.findByIdAndDelete(cart._id);
        cart = null;
      }
    }

    if (!cart) {
      // Create new cart
      cart = new Cart({
        customer: req.user._id,
        restaurant: item.restaurant,
        deliveryFee: restaurant.deliveryFee || 0,
      });
    }

    // Add item to cart
    const itemData = {
      item: item._id,
      name: item.name,
      price: item.price,
      quantity,
      specialInstructions,
      totalPrice: item.price * quantity,
    };

    cart.addItem(itemData);
    await cart.save();

    // Populate cart for response
    await cart.populate("restaurant", "name address");
    await cart.populate("items.item", "name price image");

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          itemCount,
        },
        message: "Item added to cart successfully",
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add item to cart",
    });
  }
};

// Update item quantity in cart
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      });
    }

    // Check if cart has expired
    if (cart.expiresAt < new Date()) {
      await Cart.findByIdAndDelete(cart._id);
      return res.status(400).json({
        success: false,
        error: "Cart has expired",
      });
    }

    // Check if item exists in cart
    const cartItem = cart.items.find((item) => item.item.toString() === itemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart",
      });
    }

    // Check if item is still available
    const item = await Item.findById(itemId);
    if (!item || item.isOutOfStock) {
      return res.status(400).json({
        success: false,
        error: "Item is no longer available",
      });
    }

    // Update quantity
    cart.updateItemQuantity(itemId, quantity);
    await cart.save();

    // Populate cart for response
    await cart.populate("restaurant", "name address");
    await cart.populate("items.item", "name price image");

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          itemCount,
        },
        message: "Cart updated successfully",
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update cart item",
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      });
    }

    // Check if cart has expired
    if (cart.expiresAt < new Date()) {
      await Cart.findByIdAndDelete(cart._id);
      return res.status(400).json({
        success: false,
        error: "Cart has expired",
      });
    }

    // Check if item exists in cart
    const cartItem = cart.items.find((item) => item.item.toString() === itemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart",
      });
    }

    // Remove item
    cart.removeItem(itemId);
    await cart.save();

    // Populate cart for response
    await cart.populate("restaurant", "name address");
    await cart.populate("items.item", "name price image");

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          itemCount,
        },
        message: "Item removed from cart successfully",
      },
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove item from cart",
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.json({
        success: true,
        data: {
          message: "Cart is already empty",
        },
      });
    }

    await Cart.findByIdAndDelete(cart._id);

    res.json({
      success: true,
      data: {
        message: "Cart cleared successfully",
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear cart",
    });
  }
};

// Checkout cart (convert to order)
const checkoutCart = async (req, res) => {
  try {
    const { deliveryAddressId, specialInstructions, paymentMethod } = req.body;

    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      });
    }

    // Check if cart has expired
    if (cart.expiresAt < new Date()) {
      await Cart.findByIdAndDelete(cart._id);
      return res.status(400).json({
        success: false,
        error: "Cart has expired",
      });
    }

    // Check if cart is empty
    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Get user with addresses
    const user = await User.findById(req.user._id);

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

    // Get restaurant
    const restaurant = await Restaurant.findById(cart.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    // Validate all items are still available
    const orderItems = [];
    for (const cartItem of cart.items) {
      const item = await Item.findById(cartItem.item);

      if (!item) {
        return res.status(400).json({
          success: false,
          error: `Item ${cartItem.name} is no longer available`,
        });
      }

      if (item.isOutOfStock) {
        return res.status(400).json({
          success: false,
          error: `Item ${cartItem.name} is out of stock`,
        });
      }

      orderItems.push({
        item: item._id,
        name: cartItem.name,
        price: cartItem.price,
        quantity: cartItem.quantity,
        totalPrice: cartItem.totalPrice,
        specialInstructions: cartItem.specialInstructions,
      });
    }

    // Check minimum order
    if (cart.totalAmount < restaurant.minimumOrder) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount is ₹${restaurant.minimumOrder}`,
      });
    }

    // Create order
    const order = new Order({
      customer: req.user._id,
      restaurant: cart.restaurant,
      items: orderItems,
      deliveryAddress: {
        name: deliveryAddress.name,
        phone: deliveryAddress.phone,
        address: deliveryAddress.address,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        pincode: deliveryAddress.pincode,
      },
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      tax: cart.tax,
      totalAmount: cart.totalAmount,
      specialInstructions,
      paymentMethod: paymentMethod || "cod",
      status: "placed",
      statusHistory: [
        {
          status: "placed",
          message: "Order placed successfully",
          timestamp: new Date(),
        },
      ],
    });

    await order.save();

    // Clear cart after successful order
    await Cart.findByIdAndDelete(cart._id);

    // Populate order for response
    await order.populate("restaurant", "name address");
    await order.populate("customer", "name phone");

    res.status(201).json({
      success: true,
      data: {
        order,
        message: "Order placed successfully",
      },
    });
  } catch (error) {
    console.error("Checkout cart error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to checkout cart",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkoutCart,
};
