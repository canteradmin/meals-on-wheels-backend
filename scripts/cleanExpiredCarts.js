const mongoose = require("mongoose");
const Cart = require("../models/Cart");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/meels-on-wheels",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Clean expired carts
const cleanExpiredCarts = async () => {
  try {
    const result = await Cart.cleanExpiredCarts();
    console.log(`Cleaned ${result.deletedCount} expired carts`);

    if (result.deletedCount > 0) {
      console.log("Expired carts cleaned successfully");
    } else {
      console.log("No expired carts found");
    }
  } catch (error) {
    console.error("Error cleaning expired carts:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the cleanup
cleanExpiredCarts();
