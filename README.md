# Meels on Wheels - Restaurant Platform Backend

A comprehensive RESTful backend for a restaurant platform built with Node.js, Express, MongoDB, and Mongoose. Supports two user roles: customers and restaurant owners with complete order management, support system, and dashboard analytics.

## Features

### 🔐 Authentication & Authorization

- JWT-based authentication with role separation
- Role-based access control (customer vs restaurant_owner)
- Secure password hashing with bcrypt
- Token-based session management

### 👥 Customer Features

- User registration and profile management
- Multiple address management (home, work, other)
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
│   └── SupportQuery.js    # Support system model
├── controllers/           # Business logic
│   ├── authController.js  # Authentication logic
│   ├── customerController.js # Customer operations
│   ├── restaurantController.js # Restaurant operations
│   └── supportController.js # Support system logic
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication
│   ├── validation.js     # Request validation
│   └── ownership.js      # Resource ownership checks
├── routes/               # API routes
│   ├── auth.js          # Authentication routes
│   ├── customer.js      # Customer routes
│   ├── restaurant.js    # Restaurant routes
│   └── support.js       # Support routes
├── scripts/             # Utility scripts
│   └── seed.js         # Database seeding
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
JWT_EXPIRE=7d

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
  "address": "456 Updated Street",
  "city": "Mumbai"
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
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Comprehensive request validation
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Ownership Checks**: Users can only access their own resources

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
