# Restaurant API Documentation

## Overview

This document provides comprehensive documentation for all restaurant-related APIs in the Meels on Wheels platform. The APIs are designed for restaurant owners to manage their business operations, including registration, menu management, order processing, and analytics.

## Base URL

```
http://localhost:5000/api/restaurant
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string (optional)
}
```

---

## 1. Restaurant Registration

### Register New Restaurant with Owner

**Endpoint:** `POST /api/restaurant/register`

**Description:** Creates a new restaurant owner account and restaurant in one API call. This is a public endpoint that doesn't require authentication.

**Request Body:**

```json
{
  "ownerName": "John Doe",
  "ownerEmail": "john@restaurant.com",
  "ownerPhone": "9876543210",
  "ownerPassword": "password123",

  "restaurantName": "Spice Garden Restaurant",
  "description": "Authentic Indian cuisine with a modern twist. We serve the best butter chicken, biryani, and tandoori dishes in the city.",
  "address": {
    "street": "123 Spice Lane, Andheri West",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400058"
  },
  "phone": "9876543211",
  "email": "info@spicegarden.com",
  "cuisine": ["Indian", "North Indian", "Mughlai", "Tandoori"],
  "openingHours": {
    "monday": { "open": "11:00", "close": "23:00" },
    "tuesday": { "open": "11:00", "close": "23:00" },
    "wednesday": { "open": "11:00", "close": "23:00" },
    "thursday": { "open": "11:00", "close": "23:00" },
    "friday": { "open": "11:00", "close": "23:30" },
    "saturday": { "open": "11:00", "close": "23:30" },
    "sunday": { "open": "12:00", "close": "22:00" }
  },
  "deliveryRadius": 8,
  "deliveryFee": 30,
  "minimumOrder": 200
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "message": "Restaurant registered successfully",
    "owner": {
      "_id": "user_id_here",
      "name": "John Doe",
      "email": "john@restaurant.com",
      "phone": "9876543210",
      "role": "restaurant_owner",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "restaurant": {
      "_id": "restaurant_id_here",
      "name": "Spice Garden Restaurant",
      "description": "Authentic Indian cuisine...",
      "owner": "user_id_here",
      "address": {
        "street": "123 Spice Lane, Andheri West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400058"
      },
      "phone": "9876543211",
      "email": "info@spicegarden.com",
      "cuisine": ["Indian", "North Indian", "Mughlai", "Tandoori"],
      "rating": 0,
      "totalRatings": 0,
      "isActive": true,
      "deliveryRadius": 8,
      "deliveryFee": 30,
      "minimumOrder": 200,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "User with this email or phone already exists"
}
```

```json
{
  "success": false,
  "error": "Restaurant with this name already exists"
}
```

---

## 2. Restaurant Management

### Get Restaurant Details

**Endpoint:** `GET /api/restaurant`

**Description:** Retrieves the current restaurant owner's restaurant details.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "restaurant": {
      "_id": "restaurant_id",
      "name": "Spice Garden Restaurant",
      "description": "Authentic Indian cuisine...",
      "owner": "user_id",
      "address": {
        "street": "123 Spice Lane, Andheri West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400058"
      },
      "phone": "9876543211",
      "email": "info@spicegarden.com",
      "cuisine": ["Indian", "North Indian", "Mughlai", "Tandoori"],
      "rating": 4.5,
      "totalRatings": 25,
      "isActive": true,
      "deliveryRadius": 8,
      "deliveryFee": 30,
      "minimumOrder": 200,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Update Restaurant Details

**Endpoint:** `POST /api/restaurant`

**Description:** Updates the current restaurant's details.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Updated Restaurant Name",
  "description": "Updated description",
  "address": {
    "street": "456 New Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400059"
  },
  "phone": "9876543212",
  "email": "updated@restaurant.com",
  "cuisine": ["Indian", "Chinese"],
  "deliveryRadius": 10,
  "deliveryFee": 40,
  "minimumOrder": 250
}
```

---

## 3. Menu Management

### Get Menu Items

**Endpoint:** `GET /api/restaurant/menu`

**Description:** Retrieves all menu items for the restaurant.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "item_id",
        "name": "Butter Chicken",
        "description": "Creamy tomato-based curry",
        "price": 350,
        "category": "Main Course",
        "image": "https://example.com/butter-chicken.jpg",
        "isVegetarian": false,
        "isSpicy": false,
        "isOutOfStock": false,
        "preparationTime": 20,
        "allergens": ["dairy"],
        "nutritionalInfo": {
          "calories": 450,
          "protein": 25,
          "carbs": 15,
          "fat": 30
        },
        "restaurant": "restaurant_id",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Add Menu Item

**Endpoint:** `POST /api/restaurant/menu`

**Description:** Adds a new menu item to the restaurant.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Butter Chicken",
  "description": "Creamy tomato-based curry with tender chicken",
  "price": 350,
  "category": "Main Course",
  "image": "https://example.com/butter-chicken.jpg",
  "isVegetarian": false,
  "isSpicy": false,
  "preparationTime": 20,
  "allergens": ["dairy"],
  "nutritionalInfo": {
    "calories": 450,
    "protein": 25,
    "carbs": 15,
    "fat": 30
  }
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "item": {
      "_id": "new_item_id",
      "name": "Butter Chicken",
      "description": "Creamy tomato-based curry with tender chicken",
      "price": 350,
      "category": "Main Course",
      "image": "https://example.com/butter-chicken.jpg",
      "isVegetarian": false,
      "isSpicy": false,
      "isOutOfStock": false,
      "preparationTime": 20,
      "allergens": ["dairy"],
      "nutritionalInfo": {
        "calories": 450,
        "protein": 25,
        "carbs": 15,
        "fat": 30
      },
      "restaurant": "restaurant_id",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Update Menu Item

**Endpoint:** `PUT /api/restaurant/menu/:itemId`

**Description:** Updates an existing menu item.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "price": 380,
  "isOutOfStock": false,
  "description": "Updated description"
}
```

### Delete Menu Item

**Endpoint:** `DELETE /api/restaurant/menu/:itemId`

**Description:** Deletes a menu item from the restaurant.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Menu item deleted successfully"
  }
}
```

---

## 4. Order Management

### Get Orders

**Endpoint:** `GET /api/restaurant/orders`

**Description:** Retrieves orders with filtering and pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional): Filter by status
- `dateFrom` (optional): Filter from date (ISO format)
- `dateTo` (optional): Filter to date (ISO format)

**Example Request:**

```
GET /api/restaurant/orders?page=1&limit=10&status=preparing
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "order_id",
        "orderNumber": "A1B2C3",
        "customer": {
          "_id": "customer_id",
          "name": "John Doe",
          "phone": "9876543210"
        },
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
        "deliveryAddress": {
          "name": "John Doe",
          "phone": "9876543210",
          "address": "123 Main Street",
          "city": "Mumbai",
          "state": "Maharashtra",
          "pincode": "400001"
        },
        "subtotal": 700,
        "deliveryFee": 30,
        "tax": 35,
        "totalAmount": 765,
        "status": "preparing",
        "paymentMethod": "cod",
        "paymentStatus": "pending",
        "estimatedDeliveryTime": "2024-01-15T20:30:00.000Z",
        "trackingHistory": [
          {
            "status": "placed",
            "message": "Order placed successfully",
            "timestamp": "2024-01-15T18:00:00.000Z"
          },
          {
            "status": "confirmed",
            "message": "Order confirmed",
            "timestamp": "2024-01-15T18:05:00.000Z"
          }
        ],
        "createdAt": "2024-01-15T18:00:00.000Z",
        "updatedAt": "2024-01-15T18:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Get Order Details

**Endpoint:** `GET /api/restaurant/orders/:orderId`

**Description:** Retrieves detailed information about a specific order.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_id",
      "orderNumber": "A1B2C3",
      "customer": {
        "_id": "customer_id",
        "name": "John Doe",
        "phone": "9876543210",
        "email": "john@example.com"
      },
      "items": [
        {
          "item": {
            "_id": "item_id",
            "name": "Butter Chicken",
            "price": 350,
            "image": "https://example.com/butter-chicken.jpg"
          },
          "name": "Butter Chicken",
          "price": 350,
          "quantity": 2,
          "totalPrice": 700,
          "specialInstructions": "Extra spicy"
        }
      ],
      "deliveryAddress": {
        "name": "John Doe",
        "phone": "9876543210",
        "address": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
      },
      "subtotal": 700,
      "deliveryFee": 30,
      "tax": 35,
      "totalAmount": 765,
      "status": "preparing",
      "paymentMethod": "cod",
      "paymentStatus": "pending",
      "estimatedDeliveryTime": "2024-01-15T20:30:00.000Z",
      "trackingHistory": [
        {
          "status": "placed",
          "message": "Order placed successfully",
          "timestamp": "2024-01-15T18:00:00.000Z"
        },
        {
          "status": "confirmed",
          "message": "Order confirmed",
          "timestamp": "2024-01-15T18:05:00.000Z"
        },
        {
          "status": "preparing",
          "message": "Order is being prepared",
          "timestamp": "2024-01-15T18:10:00.000Z",
          "updatedBy": "restaurant_owner_id"
        }
      ],
      "createdAt": "2024-01-15T18:00:00.000Z",
      "updatedAt": "2024-01-15T18:10:00.000Z"
    }
  }
}
```

### Update Order Status

**Endpoint:** `PATCH /api/restaurant/orders/:orderId/status`

**Description:** Updates the status of an order and adds tracking information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "status": "out_for_delivery",
  "message": "Order is out for delivery",
  "estimatedDeliveryTime": "2024-01-15T20:30:00.000Z"
}
```

**Available Status Values:**

- `placed` - Order has been placed
- `confirmed` - Order has been confirmed
- `preparing` - Order is being prepared
- `out_for_delivery` - Order is out for delivery
- `delivered` - Order has been delivered
- `rejected` - Order has been rejected
- `cancelled` - Order has been cancelled

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "order_id",
      "orderNumber": "A1B2C3",
      "status": "out_for_delivery",
      "trackingHistory": [
        {
          "status": "placed",
          "message": "Order placed successfully",
          "timestamp": "2024-01-15T18:00:00.000Z"
        },
        {
          "status": "confirmed",
          "message": "Order confirmed",
          "timestamp": "2024-01-15T18:05:00.000Z"
        },
        {
          "status": "preparing",
          "message": "Order is being prepared",
          "timestamp": "2024-01-15T18:10:00.000Z"
        },
        {
          "status": "out_for_delivery",
          "message": "Order is out for delivery",
          "timestamp": "2024-01-15T19:00:00.000Z",
          "updatedBy": "restaurant_owner_id"
        }
      ],
      "estimatedDeliveryTime": "2024-01-15T20:30:00.000Z"
    }
  }
}
```

---

## 5. Dashboard & Analytics

### Get Dashboard Metrics

**Endpoint:** `GET /api/restaurant/dashboard`

**Description:** Retrieves key performance metrics for the restaurant dashboard.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "sales": {
      "today": {
        "totalSales": 1500,
        "orderCount": 5
      },
      "week": {
        "totalSales": 8500,
        "orderCount": 25
      },
      "month": {
        "totalSales": 35000,
        "orderCount": 120
      }
    },
    "orderStatusCounts": {
      "placed": 3,
      "confirmed": 2,
      "preparing": 1,
      "out_for_delivery": 1,
      "delivered": 15,
      "cancelled": 1
    },
    "recentOrders": [
      {
        "_id": "order_id",
        "orderNumber": "A1B2C3",
        "customer": {
          "_id": "customer_id",
          "name": "John Doe",
          "phone": "9876543210"
        },
        "totalAmount": 765,
        "status": "preparing",
        "createdAt": "2024-01-15T18:00:00.000Z"
      }
    ]
  }
}
```

### Get Reports

**Endpoint:** `GET /api/restaurant/reports`

**Description:** Retrieves detailed reports and analytics.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `period` (optional): Report period (`week`, `month`, `year`)
- `startDate` (optional): Custom start date (ISO format)
- `endDate` (optional): Custom end date (ISO format)

**Example Request:**

```
GET /api/restaurant/reports?period=month&startDate=2024-01-01&endDate=2024-01-31
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "period": "month",
    "dateRange": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z"
    },
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
        {
          "date": "2024-01-01",
          "revenue": 1500
        },
        {
          "date": "2024-01-02",
          "revenue": 1800
        }
      ]
    },
    "topSellingItems": [
      {
        "name": "Butter Chicken",
        "quantity": 45
      },
      {
        "name": "Biryani",
        "quantity": 38
      }
    ],
    "recentOrders": [
      {
        "_id": "order_id",
        "orderNumber": "A1B2C3",
        "customer": {
          "_id": "customer_id",
          "name": "John Doe"
        },
        "totalAmount": 765,
        "status": "delivered",
        "createdAt": "2024-01-15T18:00:00.000Z"
      }
    ]
  }
}
```

### Get Recent Activity

**Endpoint:** `GET /api/restaurant/activity`

**Description:** Retrieves recent activity feed combining orders and support queries.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `limit` (optional): Number of activities to return (default: 20, max: 100)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "order_id",
        "type": "order",
        "action": "Order #A1B2C3 placed",
        "description": "3 items - ₹765",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "status": "placed",
        "customer": "John Doe"
      },
      {
        "id": "support_id",
        "type": "support",
        "action": "Support ticket open",
        "description": "Late delivery issue",
        "timestamp": "2024-01-15T09:15:00.000Z",
        "status": "open",
        "customer": "Jane Smith"
      }
    ],
    "total": 20
  }
}
```

---

## 6. Support Management

### Get Support Queries

**Endpoint:** `GET /api/restaurant/support`

**Description:** Retrieves support queries related to the restaurant.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional): Filter by status (`open`, `in_progress`, `resolved`, `closed`)

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "queries": [
      {
        "_id": "support_id",
        "subject": "Late delivery issue",
        "category": "delivery_issue",
        "priority": "high",
        "status": "open",
        "customer": {
          "_id": "customer_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "messages": [
          {
            "sender": "customer",
            "message": "My order was delivered 15 minutes late",
            "timestamp": "2024-01-15T10:00:00.000Z"
          }
        ],
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

## 7. Settings Management

### Get Restaurant Settings

**Endpoint:** `GET /api/restaurant/settings`

**Description:** Retrieves current restaurant settings.

**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "settings": {
      "name": "Spice Garden Restaurant",
      "description": "Authentic Indian cuisine",
      "phone": "9876543211",
      "email": "info@spicegarden.com",
      "address": {
        "street": "123 Spice Lane, Andheri West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400058"
      },
      "cuisine": ["Indian", "North Indian", "Mughlai", "Tandoori"],
      "deliveryRadius": 8,
      "deliveryFee": 30,
      "minimumOrder": 200,
      "isActive": true
    }
  }
}
```

### Update Restaurant Settings

**Endpoint:** `PUT /api/restaurant/settings`

**Description:** Updates restaurant settings.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Updated Restaurant Name",
  "description": "Updated description",
  "deliveryFee": 40,
  "minimumOrder": 250,
  "isActive": true
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Restaurant settings updated successfully",
    "restaurant": {
      "_id": "restaurant_id",
      "name": "Updated Restaurant Name",
      "description": "Updated description",
      "deliveryFee": 40,
      "minimumOrder": 250,
      "isActive": true
    }
  }
}
```

---

## 8. Notifications

### Send Notification

**Endpoint:** `POST /api/restaurant/notifications`

**Description:** Sends notifications to customers (currently logs to console, extensible to external services).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Special Offer",
  "message": "Get 20% off on all orders today!",
  "type": "info",
  "targetUsers": ["all", "regular_customers"]
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Notification sent successfully",
    "notification": {
      "id": "1705312800000",
      "title": "Special Offer",
      "message": "Get 20% off on all orders today!",
      "type": "info",
      "targetUsers": ["all", "regular_customers"],
      "sentAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "Access token required"
}
```

#### 403 Forbidden

```json
{
  "success": false,
  "error": "Access denied - insufficient permissions"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "error": "Restaurant not found"
}
```

#### 400 Bad Request - Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "Restaurant name must be between 2 and 100 characters",
    "Please provide a valid phone number"
  ]
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to get restaurant"
}
```

---

## Usage Examples

### Complete Restaurant Registration Flow

1. **Register Restaurant:**

```bash
curl -X POST http://localhost:5000/api/restaurant/register \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "John Doe",
    "ownerEmail": "john@restaurant.com",
    "ownerPhone": "9876543210",
    "ownerPassword": "password123",
    "restaurantName": "Spice Garden Restaurant",
    "description": "Authentic Indian cuisine",
    "address": {
      "street": "123 Spice Lane",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400058"
    },
    "phone": "9876543211",
    "cuisine": ["Indian", "North Indian"],
    "deliveryRadius": 5,
    "deliveryFee": 30,
    "minimumOrder": 200
  }'
```

2. **Add Menu Items:**

```bash
curl -X POST http://localhost:5000/api/restaurant/menu \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Butter Chicken",
    "description": "Creamy tomato-based curry",
    "price": 350,
    "category": "Main Course",
    "isVegetarian": false,
    "isSpicy": false,
    "preparationTime": 20
  }'
```

3. **Check Dashboard:**

```bash
curl -X GET http://localhost:5000/api/restaurant/dashboard \
  -H "Authorization: Bearer <token>"
```

4. **Update Order Status:**

```bash
curl -X PATCH http://localhost:5000/api/restaurant/orders/order_id/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "preparing",
    "message": "Order is being prepared"
  }'
```

---

## Field Validation Rules

### Restaurant Registration

- **ownerName**: 2-50 characters
- **ownerEmail**: Valid email format, unique
- **ownerPhone**: Valid Indian mobile number, unique
- **ownerPassword**: Minimum 6 characters
- **restaurantName**: 2-100 characters, unique
- **address.pincode**: Exactly 6 digits
- **deliveryRadius**: 1-20 km
- **deliveryFee**: Non-negative number
- **minimumOrder**: Non-negative number

### Menu Items

- **name**: 2-100 characters
- **price**: Non-negative number
- **category**: Required
- **preparationTime**: 5-120 minutes
- **image**: Valid URL (optional)

### Orders

- **status**: Must be one of the predefined values
- **message**: Required for status updates
- **estimatedDeliveryTime**: Valid ISO date format

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 requests per window
- **Headers**: Rate limit information is included in response headers

---

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Restaurant owners can only access their own data
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers

---

## Support

For technical support or questions about the restaurant APIs, please refer to the main project documentation or contact the development team.
