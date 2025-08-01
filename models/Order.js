const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  specialInstructions: {
    type: String,
    trim: true,
  },
});

const trackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "rejected",
      "cancelled",
    ],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  message: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
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
    items: [orderItemSchema],
    deliveryAddress: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },
    subtotal: {
      type: Number,
      required: true,
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
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "rejected",
        "cancelled",
      ],
      default: "placed",
    },
    trackingHistory: [trackingEventSchema],
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "card"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    actualDeliveryTime: {
      type: Date,
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Get count of orders for today
    const todayStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const orderCount = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd },
    });

    const sequence = (orderCount + 1).toString().padStart(4, "0");
    this.orderNumber = `ORD${year}${month}${day}${sequence}`;

    // Add initial tracking event
    this.trackingHistory.push({
      status: "placed",
      message: "Order placed successfully",
      timestamp: new Date(),
    });
  }

  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function (
  newStatus,
  message,
  updatedBy = null
) {
  this.status = newStatus;
  this.trackingHistory.push({
    status: newStatus,
    message: message,
    updatedBy: updatedBy,
    timestamp: new Date(),
  });

  // Set delivery time when status is delivered
  if (newStatus === "delivered") {
    this.actualDeliveryTime = new Date();
  }

  return this.save();
};

// Virtual for order duration
orderSchema.virtual("duration").get(function () {
  if (this.actualDeliveryTime && this.createdAt) {
    return Math.round((this.actualDeliveryTime - this.createdAt) / (1000 * 60)); // in minutes
  }
  return null;
});

// Ensure virtuals are serialized
orderSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);
