# Meels on Wheels - Restaurant Platform Backend

A comprehensive RESTful backend for a restaurant platform built with Node.js, Express, MongoDB, and Mongoose. Supports two user roles: customers and restaurant owners with complete order management, support system, and dashboard analytics.

## Features

### 🔐 Authentication & Authorization

- JWT-based authentication with role separation
- **Conditional JWT expiration** - Unlimited or time-based token expiration
- **Token blacklisting** - Secure logout with immediate token invalidation
- Role-based access control (customer vs restaurant_owner)
- Secure password hashing with bcrypt
- Token-based session management
- Multi-device logout support

### 👥 Customer Features

- User registration and profile management
- Multiple address management (home, work, other)
- **Shopping cart management** with item persistence
- Order placement with real-time tracking
- Order history with pagination
- Support query system
- Address CRUD operations

### 🏪 Restaurant Owner Features

- Restaurant profile management
- Menu item CRUD with out-of-stock functionality
- Order management with status updates
- Dashboard with sales analytics
- Support query management
- Real-time order tracking

### 📊 Dashboard Analytics

- Total sales (today, week, month)
- Order status counts
- Recent orders
- Performance metrics

### 🛒 Order Management

- **Shopping cart system** with automatic expiration
- Complete order lifecycle: placed → confirmed → preparing → out_for_delivery → delivered
- Order rejection and cancellation support
- Real-time tracking with history
- Payment status tracking
- Delivery time estimation

### 🆘 Support System

- Multi-message support queries
- Priority-based categorization
- Restaurant-specific support
- Resolution tracking
- Customer rating system

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limiting
- **Logging**: morgan

## Project Structure

```
meels-on-wheels-backend/
├── models/                 # Database models
│   ├── User.js            # User model with roles
│   ├── Restaurant.js      # Restaurant model
│   ├── Item.js            # Menu item model
│   ├── Order.js           # Order model with tracking
│   ├── Cart.js            # Shopping cart model
│   └── SupportQuery.js    # Support system model
├── controllers/           # Business logic
│   ├── authController.js  # Authentication logic
│   ├── customerController.js # Customer operations
│   ├── restaurantController.js # Restaurant operations
│   ├── cartController.js  # Cart management logic
│   └── supportController.js # Support system logic
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication
│   ├── validation.js     # Request validation
│   └── ownership.js      # Resource ownership checks
├── routes/               # API routes
│   ├── auth.js          # Authentication routes
│   ├── customer.js      # Customer routes
│   ├── restaurant.js    # Restaurant routes
│   ├── cart.js          # Cart management routes
│   └── support.js       # Support routes
├── scripts/             # Utility scripts
│   ├── seed.js         # Database seeding
│   └── cleanExpiredCarts.js # Cart cleanup utility
├── server.js           # Main server file
├── package.json        # Dependencies
└── README.md          # Documentation
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd meels-on-wheels-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/meels-on-wheels

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT Expiration Settings
# Options:
# - "Unlimited" or "unlimited" - Tokens never expire (only logout can invalidate)
# - "7d" - Tokens expire in 7 days
# - "24h" - Tokens expire in 24 hours
# - "1h" - Tokens expire in 1 hour
# - Any valid time string supported by jsonwebtoken
JWT_EXPIRE=Unlimited

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start the server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 5. Seed the database (optional)

```bash
npm run seed
```

## JWT Configuration & Security

### Token Expiration Options

The system supports flexible JWT token expiration through the `JWT_EXPIRE` environment variable:

#### **Unlimited Tokens (Recommended for Development)**

```env
JWT_EXPIRE=Unlimited
```

- Tokens never expire automatically
- Only logout can invalidate tokens
- Users stay logged in until they explicitly logout
- Perfect for development and testing

#### **Time-Based Expiration**

```env
JWT_EXPIRE=7d    # 7 days
JWT_EXPIRE=24h   # 24 hours
JWT_EXPIRE=1h    # 1 hour
```

- Tokens expire after the specified time
- Users need to login again after expiration
- Logout still works to invalidate tokens immediately

### Token Blacklisting

- All logout operations use token blacklisting
- Invalidated tokens are stored in the database
- Authentication checks blacklist on every request
- Provides immediate token invalidation

### Security Features

- **Conditional Expiration**: Choose between unlimited and time-based tokens
- **Immediate Invalidation**: Logout immediately invalidates tokens
- **Multi-Device Support**: Logout from all devices option
- **Blacklist Tracking**: All invalidated tokens are tracked
- **Secure Storage**: Tokens are hashed and stored securely

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string (optional)
}
```

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "customer"
}
```

### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Profile

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "9876543211"
}
```

### Change Password

```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### Logout (Current Device)

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Logout from All Devices

```http
POST /api/auth/logout-all
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Logged out from all devices successfully"
  }
}
```

### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Password reset instructions sent to your email",
    "resetToken": "abc123...",
    "resetTokenExpiry": "2024-01-15T20:30:00Z"
  }
}
```

### Verify Reset Token

```http
GET /api/auth/reset-password/:resetToken
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Reset token is valid",
    "email": "john@example.com"
  }
}
```

### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "abc123...",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

## Customer Endpoints

### Address Management

#### Get Addresses

```http
GET /api/customer/addresses
Authorization: Bearer <token>
```

#### Add Address

```http
POST /api/customer/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "home",
  "name": "John Doe",
  "phone": "9876543210",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "isDefault": true
}
```

#### Update Address

```http
PUT /api/customer/addresses/:addressId
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "home",
  "name": "John Doe",
  "phone": "9876543210",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Telangana",
  "pincode": "400001",
  "isDefault": true
}
```

#### Delete Address

```http
DELETE /api/customer/addresses/:addressId
Authorization: Bearer <token>
```

### Order Management

#### Place Order

```http
POST /api/customer/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": "restaurant_id",
  "deliveryAddressId": "address_id",
  "items": [
    {
      "itemId": "item_id",
      "quantity": 2,
      "specialInstructions": "Extra spicy"
    }
  ],
  "specialInstructions": "Ring doorbell twice",
  "paymentMethod": "cod"
}
```

#### Get Orders

```http
GET /api/customer/orders?page=1&limit=10&status=delivered
Authorization: Bearer <token>
```

#### Get Order Details

```http
GET /api/customer/orders/:orderId
Authorization: Bearer <token>
```

#### Track Order

```http
GET /api/customer/orders/:orderId/track
Authorization: Bearer <token>
```

## Cart Management Endpoints

### Get Cart Contents

```http
GET /api/cart
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [
        {
          "item": "item_id",
          "name": "Butter Chicken",
          "price": 350,
          "quantity": 2,
          "totalPrice": 700,
          "specialInstructions": "Extra spicy"
        }
      ],
      "subtotal": 700,
      "deliveryFee": 30,
      "tax": 35,
      "totalAmount": 765,
      "itemCount": 2,
      "restaurant": {
        "name": "Spice Garden",
        "address": {...}
      }
    }
  }
}
```

### Add Item to Cart

```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": "item_id",
  "quantity": 2,
  "specialInstructions": "Extra spicy"
}
```

### Update Item Quantity

```http
PUT /api/cart/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove Item from Cart

```http
DELETE /api/cart/:itemId
Authorization: Bearer <token>
```

### Clear Cart

```http
DELETE /api/cart
Authorization: Bearer <token>
```

### Checkout Cart (Convert to Order)

```http
POST /api/cart/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "deliveryAddressId": "address_id",
  "specialInstructions": "Ring doorbell twice",
  "paymentMethod": "cod"
}
```

## Restaurant Owner Endpoints

### Restaurant Management

#### Get Restaurant

```http
GET /api/restaurant
Authorization: Bearer <token>
```

#### Create/Update Restaurant

```http
POST /api/restaurant
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Spice Garden",
  "description": "Authentic Indian cuisine",
  "address": {
    "street": "10 Spice Lane",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400004"
  },
  "phone": "9876543212",
  "email": "info@spicegarden.com",
  "cuisine": ["Indian", "North Indian"],
  "deliveryRadius": 5,
  "deliveryFee": 30,
  "minimumOrder": 200
}
```

### Menu Management

#### Get Menu Items

```http
GET /api/restaurant/menu
Authorization: Bearer <token>
```

#### Add Menu Item

```http
POST /api/restaurant/menu
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Butter Chicken",
  "description": "Creamy tomato-based curry",
  "price": 350,
  "category": "Main Course",
  "isVegetarian": false,
  "isSpicy": false,
  "preparationTime": 20,
  "allergens": ["dairy"]
}
```

#### Update Menu Item

```http
PUT /api/restaurant/menu/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 380,
  "isOutOfStock": false
}
```

#### Delete Menu Item

```http
DELETE /api/restaurant/menu/:itemId
Authorization: Bearer <token>
```

### Order Management

#### Get Orders

```http
GET /api/restaurant/orders?page=1&limit=10&status=preparing
Authorization: Bearer <token>
```

#### Get Order Details

```http
GET /api/restaurant/orders/:orderId
Authorization: Bearer <token>
```

#### Update Order Status

```http
PATCH /api/restaurant/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "preparing",
  "message": "Order is being prepared",
  "estimatedDeliveryTime": "2024-01-15T20:30:00Z"
}
```

### Dashboard

#### Get Dashboard Metrics

```http
GET /api/restaurant/dashboard
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "sales": {
      "today": { "totalSales": 1500, "orderCount": 5 },
      "week": { "totalSales": 8500, "orderCount": 25 },
      "month": { "totalSales": 35000, "orderCount": 120 }
    },
    "orderStatusCounts": {
      "placed": 3,
      "confirmed": 2,
      "preparing": 1,
      "delivered": 15
    },
    "recentOrders": [...]
  }
}
```

#### Get Reports

```http
GET /api/restaurant/reports?period=month&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "period": "month",
    "dateRange": { "start": "2024-01-01T00:00:00.000Z", "end": "2024-01-31T23:59:59.999Z" },
    "summary": {
      "totalOrders": 150,
      "totalRevenue": 45000,
      "averageOrderValue": 300,
      "statusBreakdown": {
        "delivered": 120,
        "preparing": 15,
        "placed": 10,
        "cancelled": 5
      }
    },
    "charts": {
      "dailyRevenue": [
        { "date": "2024-01-01", "revenue": 1500 },
        { "date": "2024-01-02", "revenue": 1800 }
      ]
    },
    "topSellingItems": [
      { "name": "Butter Chicken", "quantity": 45 },
      { "name": "Biryani", "quantity": 38 }
    ],
    "recentOrders": [...]
  }
}
```

#### Get Recent Activity

```http
GET /api/restaurant/activity?limit=20
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "order_id",
        "type": "order",
        "action": "Order #1234 placed",
        "description": "3 items - ₹450",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "placed",
        "customer": "John Doe"
      },
      {
        "id": "support_id",
        "type": "support",
        "action": "Support ticket open",
        "description": "Late delivery issue",
        "timestamp": "2024-01-15T09:15:00Z",
        "status": "open",
        "customer": "Jane Smith"
      }
    ],
    "total": 20
  }
}
```

### Settings Management

#### Get Restaurant Settings

```http
GET /api/restaurant/settings
Authorization: Bearer <token>
```

#### Update Restaurant Settings

```http
PUT /api/restaurant/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Restaurant Name",
  "description": "Updated description",
  "deliveryFee": 40,
  "minimumOrder": 250,
  "isActive": true
}
```

### Notifications

#### Send Notification

```http
POST /api/restaurant/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Special Offer",
  "message": "Get 20% off on all orders today!",
  "type": "info",
  "targetUsers": ["all", "regular_customers"]
}
```

## Support System Endpoints

### Create Support Query

```http
POST /api/support
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Late delivery issue",
  "category": "delivery_issue",
  "priority": "high",
  "message": "My order was delivered 15 minutes late",
  "restaurantId": "restaurant_id",
  "orderId": "order_id"
}
```

### Get Support Queries

```http
GET /api/support?page=1&limit=10&status=open
Authorization: Bearer <token>
```

### Get Support Query Details

```http
GET /api/support/:queryId
Authorization: Bearer <token>
```

### Add Message to Support Query

```http
POST /api/support/:queryId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Thank you for your response"
}
```

### Resolve Support Query (Restaurant Owner)

```http
PATCH /api/support/:queryId/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "resolution": "Provided 10% discount for next order"
}
```

### Rate Support Query (Customer)

```http
POST /api/support/:queryId/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "feedback": "Good response time"
}
```

## Sample Data

After running the seed script, you'll have access to:

### Test Users

- **Customer 1**: john@example.com / password123
- **Customer 2**: jane@example.com / password123
- **Restaurant Owner 1**: chef@spicegarden.com / password123
- **Restaurant Owner 2**: chef@italianbistro.com / password123

### Sample Data Includes

- 2 restaurants (Spice Garden, Italian Bistro)
- 8 menu items across different categories
- 2 sample orders with tracking history
- 2 support queries with messages

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Validation error details"] // Optional
}
```

### Authentication Error Examples

#### **Token Expired**

```json
{
  "success": false,
  "error": "Token expired"
}
```

#### **Token Invalidated (After Logout)**

```json
{
  "success": false,
  "error": "Token has been invalidated - please login again"
}
```

#### **Invalid Token**

```json
{
  "success": false,
  "error": "Invalid token"
}
```

#### **Missing Token**

```json
{
  "success": false,
  "error": "Access token required"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Conditional Token Expiration**: Flexible JWT expiration (unlimited or time-based)
- **Token Blacklisting**: Secure logout with immediate token invalidation
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Comprehensive request validation
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Ownership Checks**: Users can only access their own resources
- **Multi-Device Logout**: Logout from all devices functionality

## Development

### Running in Development Mode

```bash
npm run dev
```

### Running Tests (if implemented)

```bash
npm test
```

### Database Seeding

```bash
npm run seed
```

### Clean Expired Carts

```bash
npm run clean-carts
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB connection string
4. Set up proper logging
5. Configure rate limiting
6. Use HTTPS in production
7. Set up monitoring and error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.
