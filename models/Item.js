const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isSpicy: {
      type: Boolean,
      default: false,
    },
    preparationTime: {
      type: Number,
      default: 15, // in minutes
      min: 5,
      max: 120,
    },
    allergens: [
      {
        type: String,
        trim: true,
      },
    ],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
itemSchema.index({ restaurant: 1, isActive: 1 });
itemSchema.index({ restaurant: 1, category: 1 });
itemSchema.index({ restaurant: 1, isOutOfStock: 1 });

// Virtual for formatted price
itemSchema.virtual("formattedPrice").get(function () {
  return `₹${this.price.toFixed(2)}`;
});

// Ensure virtuals are serialized
itemSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Item", itemSchema);
