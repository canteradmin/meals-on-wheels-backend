const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Item = require("../models/Item");
const Order = require("../models/Order");
const SupportQuery = require("../models/SupportQuery");

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/meels-on-wheels",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const seedData = async () => {
  try {
    console.log("Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Item.deleteMany({});
    await Order.deleteMany({});
    await SupportQuery.deleteMany({});

    console.log("Cleared existing data");

    // Create sample users
    const customer1 = new User({
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      password: "password123",
      role: "customer",
      addresses: [
        {
          type: "home",
          name: "John Doe",
          phone: "9876543210",
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          isDefault: true,
        },
        {
          type: "work",
          name: "John Doe",
          phone: "9876543210",
          address: "456 Business Park",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400002",
          isDefault: false,
        },
      ],
    });

    const customer2 = new User({
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "9876543211",
      password: "password123",
      role: "customer",
      addresses: [
        {
          type: "home",
          name: "Jane Smith",
          phone: "9876543211",
          address: "789 Oak Avenue",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400003",
          isDefault: true,
        },
      ],
    });

    const restaurantOwner1 = new User({
      name: "Chef Raj",
      email: "chef@spicegarden.com",
      phone: "9876543212",
      password: "password123",
      role: "restaurant_owner",
    });

    const restaurantOwner2 = new User({
      name: "Chef Maria",
      email: "chef@italianbistro.com",
      phone: "9876543213",
      password: "password123",
      role: "restaurant_owner",
    });

    await customer1.save();
    await customer2.save();
    await restaurantOwner1.save();
    await restaurantOwner2.save();

    console.log("Created sample users");

    // Create sample restaurants
    const spiceGarden = new Restaurant({
      name: "Spice Garden",
      description: "Authentic Indian cuisine with a modern twist",
      owner: restaurantOwner1._id,
      address: {
        street: "10 Spice Lane",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400004",
      },
      phone: "9876543212",
      email: "info@spicegarden.com",
      cuisine: ["Indian", "North Indian", "South Indian"],
      openingHours: {
        monday: { open: "10:00", close: "22:00" },
        tuesday: { open: "10:00", close: "22:00" },
        wednesday: { open: "10:00", close: "22:00" },
        thursday: { open: "10:00", close: "22:00" },
        friday: { open: "10:00", close: "23:00" },
        saturday: { open: "10:00", close: "23:00" },
        sunday: { open: "10:00", close: "22:00" },
      },
      deliveryRadius: 5,
      deliveryFee: 30,
      minimumOrder: 200,
    });

    const italianBistro = new Restaurant({
      name: "Italian Bistro",
      description: "Traditional Italian dishes made with fresh ingredients",
      owner: restaurantOwner2._id,
      address: {
        street: "25 Pasta Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400005",
      },
      phone: "9876543213",
      email: "info@italianbistro.com",
      cuisine: ["Italian", "Pizza", "Pasta"],
      openingHours: {
        monday: { open: "11:00", close: "23:00" },
        tuesday: { open: "11:00", close: "23:00" },
        wednesday: { open: "11:00", close: "23:00" },
        thursday: { open: "11:00", close: "23:00" },
        friday: { open: "11:00", close: "00:00" },
        saturday: { open: "11:00", close: "00:00" },
        sunday: { open: "11:00", close: "23:00" },
      },
      deliveryRadius: 4,
      deliveryFee: 40,
      minimumOrder: 300,
    });

    await spiceGarden.save();
    await italianBistro.save();

    console.log("Created sample restaurants");

    // Create sample menu items for Spice Garden
    const spiceGardenItems = [
      {
        name: "Butter Chicken",
        description: "Creamy tomato-based curry with tender chicken",
        price: 350,
        category: "Main Course",
        restaurant: spiceGarden._id,
        isVegetarian: false,
        isSpicy: false,
        preparationTime: 20,
        allergens: ["dairy"],
        nutritionalInfo: {
          calories: 450,
          protein: 25,
          carbs: 15,
          fat: 30,
        },
      },
      {
        name: "Paneer Tikka",
        description: "Grilled cottage cheese with Indian spices",
        price: 280,
        category: "Appetizer",
        restaurant: spiceGarden._id,
        isVegetarian: true,
        isSpicy: true,
        preparationTime: 15,
        allergens: ["dairy"],
        nutritionalInfo: {
          calories: 320,
          protein: 18,
          carbs: 12,
          fat: 22,
        },
      },
      {
        name: "Biryani",
        description: "Fragrant rice dish with aromatic spices",
        price: 400,
        category: "Main Course",
        restaurant: spiceGarden._id,
        isVegetarian: false,
        isSpicy: true,
        preparationTime: 25,
        allergens: [],
        nutritionalInfo: {
          calories: 550,
          protein: 20,
          carbs: 80,
          fat: 15,
        },
      },
      {
        name: "Naan",
        description: "Soft leavened bread",
        price: 30,
        category: "Bread",
        restaurant: spiceGarden._id,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 10,
        allergens: ["gluten"],
        nutritionalInfo: {
          calories: 150,
          protein: 5,
          carbs: 25,
          fat: 3,
        },
      },
    ];

    // Create sample menu items for Italian Bistro
    const italianBistroItems = [
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce and mozzarella",
        price: 450,
        category: "Pizza",
        restaurant: italianBistro._id,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 18,
        allergens: ["gluten", "dairy"],
        nutritionalInfo: {
          calories: 380,
          protein: 15,
          carbs: 45,
          fat: 18,
        },
      },
      {
        name: "Spaghetti Carbonara",
        description: "Pasta with eggs, cheese, and pancetta",
        price: 380,
        category: "Pasta",
        restaurant: italianBistro._id,
        isVegetarian: false,
        isSpicy: false,
        preparationTime: 15,
        allergens: ["gluten", "dairy", "eggs"],
        nutritionalInfo: {
          calories: 420,
          protein: 18,
          carbs: 50,
          fat: 20,
        },
      },
      {
        name: "Caesar Salad",
        description: "Fresh lettuce with Caesar dressing and croutons",
        price: 220,
        category: "Salad",
        restaurant: italianBistro._id,
        isVegetarian: false,
        isSpicy: false,
        preparationTime: 8,
        allergens: ["gluten", "dairy", "eggs"],
        nutritionalInfo: {
          calories: 180,
          protein: 8,
          carbs: 12,
          fat: 12,
        },
      },
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: 180,
        category: "Dessert",
        restaurant: italianBistro._id,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 5,
        allergens: ["dairy", "eggs"],
        nutritionalInfo: {
          calories: 280,
          protein: 6,
          carbs: 25,
          fat: 18,
        },
      },
    ];

    const allItems = [...spiceGardenItems, ...italianBistroItems];
    await Item.insertMany(allItems);

    console.log("Created sample menu items");

    // Create sample orders
    const order1 = new Order({
      customer: customer1._id,
      restaurant: spiceGarden._id,
      items: [
        {
          item: (await Item.findOne({ name: "Butter Chicken" }))._id,
          name: "Butter Chicken",
          price: 350,
          quantity: 1,
          totalPrice: 350,
        },
        {
          item: (await Item.findOne({ name: "Naan" }))._id,
          name: "Naan",
          price: 30,
          quantity: 2,
          totalPrice: 60,
        },
      ],
      deliveryAddress: {
        name: "John Doe",
        phone: "9876543210",
        address: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      subtotal: 410,
      deliveryFee: 30,
      tax: 20.5,
      totalAmount: 460.5,
      status: "delivered",
      paymentMethod: "cod",
      paymentStatus: "completed",
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
      actualDeliveryTime: new Date(Date.now() + 40 * 60 * 1000),
      trackingHistory: [
        {
          status: "placed",
          message: "Order placed successfully",
          timestamp: new Date(Date.now() - 40 * 60 * 1000),
        },
        {
          status: "confirmed",
          message: "Order confirmed by restaurant",
          timestamp: new Date(Date.now() - 35 * 60 * 1000),
        },
        {
          status: "preparing",
          message: "Order is being prepared",
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
        },
        {
          status: "out_for_delivery",
          message: "Order is out for delivery",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
        },
        {
          status: "delivered",
          message: "Order delivered successfully",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
        },
      ],
    });

    const order2 = new Order({
      customer: customer2._id,
      restaurant: italianBistro._id,
      items: [
        {
          item: (await Item.findOne({ name: "Margherita Pizza" }))._id,
          name: "Margherita Pizza",
          price: 450,
          quantity: 1,
          totalPrice: 450,
        },
        {
          item: (await Item.findOne({ name: "Caesar Salad" }))._id,
          name: "Caesar Salad",
          price: 220,
          quantity: 1,
          totalPrice: 220,
        },
      ],
      deliveryAddress: {
        name: "Jane Smith",
        phone: "9876543211",
        address: "789 Oak Avenue",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400003",
      },
      subtotal: 670,
      deliveryFee: 40,
      tax: 33.5,
      totalAmount: 743.5,
      status: "preparing",
      paymentMethod: "online",
      paymentStatus: "completed",
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
      trackingHistory: [
        {
          status: "placed",
          message: "Order placed successfully",
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
        },
        {
          status: "confirmed",
          message: "Order confirmed by restaurant",
          timestamp: new Date(Date.now() - 18 * 60 * 1000),
        },
        {
          status: "preparing",
          message: "Order is being prepared",
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
        },
      ],
    });

    await order1.save();
    await order2.save();

    console.log("Created sample orders");

    // Create sample support queries
    const supportQuery1 = new SupportQuery({
      customer: customer1._id,
      restaurant: spiceGarden._id,
      order: order1._id,
      subject: "Late delivery issue",
      category: "delivery_issue",
      priority: "high",
      status: "resolved",
      messages: [
        {
          sender: customer1._id,
          message: "My order was delivered 15 minutes late. What happened?",
          isFromCustomer: true,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          sender: restaurantOwner1._id,
          message:
            "We apologize for the delay. There was heavy traffic in your area. We have processed a 10% discount for your next order.",
          isFromCustomer: false,
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        },
      ],
      assignedTo: restaurantOwner1._id,
      resolvedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      resolution: "Provided 10% discount for next order due to delivery delay",
      customerRating: 4,
      customerFeedback: "Good response time and fair resolution",
    });

    const supportQuery2 = new SupportQuery({
      customer: customer2._id,
      restaurant: italianBistro._id,
      subject: "Menu item availability",
      category: "general",
      priority: "medium",
      status: "open",
      messages: [
        {
          sender: customer2._id,
          message: "Do you have gluten-free pizza options?",
          isFromCustomer: true,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
      ],
    });

    await supportQuery1.save();
    await supportQuery2.save();

    console.log("Created sample support queries");

    console.log("Database seeding completed successfully!");
    console.log("\nSample data created:");
    console.log("- 4 users (2 customers, 2 restaurant owners)");
    console.log("- 2 restaurants");
    console.log("- 8 menu items");
    console.log("- 2 orders");
    console.log("- 2 support queries");
    console.log("\nTest credentials:");
    console.log("Customer 1: john@example.com / password123");
    console.log("Customer 2: jane@example.com / password123");
    console.log("Restaurant Owner 1: chef@spicegarden.com / password123");
    console.log("Restaurant Owner 2: chef@italianbistro.com / password123");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
