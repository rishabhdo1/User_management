
# GIT TUTORIAL README 
# 🔐 User Management API

A production-ready User Management API built with Node.js, Express, MySQL, and Redis. Features JWT authentication with refresh tokens, input validation, rate limiting, and Redis caching.

## ✨ Features

- ✅ **JWT Authentication** - Access tokens (1h) + Refresh tokens (7d)
- ✅ **Refresh Token Rotation** - Enhanced security with token rotation
- ✅ **Redis Caching** - Fast user data retrieval with intelligent cache invalidation
- ✅ **Input Validation** - Joi schema validation on all endpoints
- ✅ **Rate Limiting** - Prevent brute force and DDoS attacks
- ✅ **Security Headers** - Helmet.js for secure HTTP headers
- ✅ **CORS Enabled** - Configurable cross-origin requests
- ✅ **Password Hashing** - bcrypt with salt for secure password storage
- ✅ **Database Transactions** - ACID compliance for critical operations
- ✅ **Error Handling** - Centralized error handling with detailed logging
- ✅ **Clean Architecture** - MVC pattern with separation of concerns

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Cache:** Redis 7.0
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Security:** Helmet, express-rate-limit, bcrypt
- **Development:** Nodemon

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Redis (v7.0 or higher)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd user_management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL Database

```sql
-- Create database
CREATE DATABASE user_management;
USE user_management;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id);
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=user_management

JWT_SECRET=your_super_secret_jwt_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

FRONTEND_URL=http://localhost:3000
```

**🔑 Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Start Redis

```bash
# On macOS with Homebrew
brew services start redis

# On Ubuntu/Debian
sudo systemctl start redis

# On Windows (WSL)
sudo service redis-server start

# Using Docker
docker run -d -p 6379:6379 redis:alpine
```

### 6. Run the application

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Rate Limit:** 5 requests per 15 minutes per IP

---

#### 2. Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Rate Limit:** 5 requests per 15 minutes per IP

---

#### 3. Refresh Access Token
```http
POST /api/auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Rate Limit:** 10 requests per hour per IP

---

#### 4. Logout
```http
POST /api/auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### User Endpoints (Protected)

**All user endpoints require authentication.**

Add this header to requests:
```
Authorization: Bearer <your_access_token>
```

#### 5. Get Current User Profile
```http
GET /api/users/me
```

**Response (200):**
```json
{
  "success": true,
  "source": "cache",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-20T10:30:00.000Z"
  }
}
```

**Note:** First request hits database, subsequent requests use Redis cache (5 min TTL)

---

#### 6. Update Current User Profile
```http
PUT /api/users/me
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

**Note:** Cache is automatically invalidated after update

---

#### 7. Delete Current User Account
```http
DELETE /api/users/me
```

**Response (200):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

---

### Health Check

```http
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🔒 Security Features

### 1. Password Security
- Passwords hashed using bcrypt with salt (10 rounds)
- Minimum 8 characters with complexity requirements
- Never stored in plain text

### 2. JWT Tokens
- **Access Token:** Short-lived (1 hour) for API requests
- **Refresh Token:** Long-lived (7 days) stored in database
- Tokens include user ID and email in payload
- Refresh token rotation on every refresh

### 3. Rate Limiting
- **Auth endpoints:** 5 requests per 15 minutes
- **Refresh token:** 10 requests per hour
- **General API:** 100 requests per 15 minutes

### 4. Input Validation
- All inputs validated using Joi schemas
- SQL injection prevention via prepared statements
- XSS protection through input sanitization

### 5. Security Headers
- Helmet.js adds secure HTTP headers
- CORS configured for specific origins
- Content Security Policy enabled

### 6. Redis Cache Security
- Cache invalidation on data updates
- Graceful degradation if Redis fails
- Connection retry with exponential backoff

## 📊 Database Schema

### Users Table
```sql
users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### Refresh Tokens Table
```sql
refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## 🧪 Testing

**Run tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Test coverage:**
```bash
npm test -- --coverage
```

## 📁 Project Structure

```
user_management/
├── config/
│   ├── database.js          # MySQL connection pool
│   └── redis.js             # Redis client setup
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── userController.js    # User CRUD operations
├── middlewares/
│   ├── authMiddleware.js    # JWT verification
│   └── rateLimiter.js       # Rate limiting configs
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   └── userRoutes.js        # User endpoints
├── services/
│   ├── cacheService.js      # Redis operations
│   └── generateToken.js     # JWT token generation
├── validators/
│   └── authValidator.js     # Joi validation schemas
├── app.js                   # Express app setup
├── server.js                # Server entry point
├── package.json
├── .env.example
└── README.md
```

