const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  specialInstructions: {
    type: String,
    trim: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Cart expires in 24 hours
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
cartSchema.index({ customer: 1 });
cartSchema.index({ restaurant: 1 });
cartSchema.index({ expiresAt: 1 });

// Method to calculate totals
cartSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.tax = this.subtotal * 0.05; // 5% tax
  this.totalAmount = this.subtotal + this.deliveryFee + this.tax;
  return this;
};

// Method to add item to cart
cartSchema.methods.addItem = function (itemData) {
  const existingItemIndex = this.items.findIndex(
    (item) => item.item.toString() === itemData.item.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += itemData.quantity;
    this.items[existingItemIndex].totalPrice =
      this.items[existingItemIndex].price *
      this.items[existingItemIndex].quantity;
    if (itemData.specialInstructions) {
      this.items[existingItemIndex].specialInstructions =
        itemData.specialInstructions;
    }
  } else {
    // Add new item
    this.items.push(itemData);
  }

  this.calculateTotals();
  return this;
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (itemId) {
  this.items = this.items.filter(
    (item) => item.item.toString() !== itemId.toString()
  );
  this.calculateTotals();
  return this;
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
  const item = this.items.find(
    (item) => item.item.toString() === itemId.toString()
  );
  if (item) {
    item.quantity = quantity;
    item.totalPrice = item.price * quantity;
    this.calculateTotals();
  }
  return this;
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.subtotal = 0;
  this.deliveryFee = 0;
  this.tax = 0;
  this.totalAmount = 0;
  return this;
};

// Static method to clean expired carts
cartSchema.statics.cleanExpiredCarts = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result;
};

module.exports = mongoose.model("Cart", cartSchema);
