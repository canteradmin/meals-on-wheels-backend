const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isFromCustomer: {
      type: Boolean,
      required: true,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const supportQuerySchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "order_issue",
        "payment_issue",
        "delivery_issue",
        "food_quality",
        "general",
        "technical",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    messages: [supportMessageSchema],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
    resolution: {
      type: String,
      trim: true,
    },
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    customerFeedback: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
supportQuerySchema.index({ customer: 1, createdAt: -1 });
supportQuerySchema.index({ restaurant: 1, status: 1 });
supportQuerySchema.index({ status: 1, priority: 1 });
supportQuerySchema.index({ assignedTo: 1, status: 1 });

// Method to add message
supportQuerySchema.methods.addMessage = function (
  sender,
  message,
  isFromCustomer,
  attachments = []
) {
  this.messages.push({
    sender,
    message,
    isFromCustomer,
    attachments,
  });

  // Update status to in_progress if it was open
  if (this.status === "open") {
    this.status = "in_progress";
  }

  return this.save();
};

// Method to resolve query
supportQuerySchema.methods.resolve = function (resolution, resolvedBy) {
  this.status = "resolved";
  this.resolvedAt = new Date();
  this.resolution = resolution;
  this.assignedTo = resolvedBy;

  return this.save();
};

// Method to close query
supportQuerySchema.methods.close = function () {
  this.status = "closed";
  return this.save();
};

module.exports = mongoose.model("SupportQuery", supportQuerySchema);
