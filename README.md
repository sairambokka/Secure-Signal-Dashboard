# Secure Signal Dashboard

A full-stack web application for secure signal data collection and visualization with JWT-based authentication, built with Node.js, Express, React, and MongoDB.

## 🏗️ Architecture

- **Backend**: Node.js + Express with JWT authentication
- **Frontend**: React with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest + Supertest

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (if running locally)

### Option 1: Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd Secure-Signal-Dashboard
```

2. Start the entire application stack:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/signal_dashboard
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

5. Start the backend server:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## 📝 API Documentation

### Base URL
- Local: `http://localhost:5000`
- Docker: `http://localhost:5000`

### Authentication Endpoints

#### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric)",
  "email": "string (valid email)",
  "password": "string (min 6 chars, must contain uppercase, lowercase, and number)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "username",
      "email": "email@example.com"
    },
    "token": "jwt_token_string"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: User already exists

#### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "username",
      "email": "email@example.com"
    },
    "token": "jwt_token_string"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Invalid credentials

### Signal Endpoints

All signal endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

#### POST /signals
Create a new signal record.

**Request Body:**
```json
{
  "agent_id": "string (required)",
  "signal_type": "string (HRV|GSR|respiration|temperature|heart_rate)",
  "timestamp": "string (ISO 8601 date)",
  "payload": {
    "raw": "array of numbers",
    "avg": "number",
    "sdnn": "number (optional)"
  },
  "context": "object (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Signal created successfully",
  "data": {
    "signal": {
      "_id": "signal_id",
      "user_id": "user_id",
      "agent_id": "agent_001",
      "signal_type": "HRV",
      "timestamp": "2024-01-01T10:00:00.000Z",
      "payload": {
        "raw": [100, 102, 98, 105, 99],
        "avg": 100.8,
        "sdnn": 2.5
      },
      "context": {},
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

#### GET /signals
Retrieve user's signals with filtering and pagination.

**Query Parameters:**
- `signal_type` (optional): Filter by signal type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sort` (optional): Sort order (timestamp|-timestamp|signal_type|-signal_type)

**Response (200):**
```json
{
  "success": true,
  "message": "Signals retrieved successfully",
  "data": {
    "signals": [
      {
        "_id": "signal_id",
        "user_id": "user_id",
        "agent_id": "agent_001",
        "signal_type": "HRV",
        "timestamp": "2024-01-01T10:00:00.000Z",
        "payload": {
          "raw": [100, 102, 98, 105, 99],
          "avg": 100.8,
          "sdnn": 2.5
        },
        "context": {},
        "createdAt": "2024-01-01T10:00:00.000Z",
        "updatedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### GET /signals/:id
Retrieve a specific signal by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Signal retrieved successfully",
  "data": {
    "signal": {
      "_id": "signal_id",
      "user_id": "user_id",
      "agent_id": "agent_001",
      "signal_type": "HRV",
      "timestamp": "2024-01-01T10:00:00.000Z",
      "payload": {
        "raw": [100, 102, 98, 105, 99],
        "avg": 100.8,
        "sdnn": 2.5
      },
      "context": {},
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Invalid signal ID format
- `404`: Signal not found

#### DELETE /signals/:id
Delete a specific signal by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Signal deleted successfully"
}
```

**Error Responses:**
- `400`: Invalid signal ID format
- `404`: Signal not found

### Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "type": "field",
      "msg": "Error message",
      "path": "field_name",
      "location": "body"
    }
  ]
}
```

## 🧪 Testing

### Backend Tests

Run all tests:
```bash
cd backend
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

Run specific test suites:
```bash
npm test -- --testPathPattern=auth.test.js
npm test -- --testPathPattern=signals.test.js
npm test -- --testPathPattern=integration.test.js
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🐳 Docker Configuration

### Backend Dockerfile
- Multi-stage build for optimization
- Uses Node.js 18 Alpine for smaller image size
- Runs as non-root user for security
- Exposes port 5000

### Frontend Dockerfile
- Multi-stage build with nginx for production
- Build stage uses Node.js for compilation
- Production stage uses nginx Alpine
- Includes nginx configuration for API proxying
- Exposes port 80

### Docker Compose Services

1. **MongoDB**: 
   - MongoDB 7.0 with authentication
   - Persistent data volume
   - Database initialization script

2. **Backend**:
   - Built from local Dockerfile
   - Environment variables for configuration
   - Depends on MongoDB

3. **Frontend**:
   - Built from local Dockerfile
   - Nginx reverse proxy for API calls
   - Depends on Backend

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Configuration**: Configurable cross-origin requests
- **Error Handling**: Secure error messages without sensitive data exposure
- **MongoDB Injection Protection**: Mongoose built-in protection
- **Rate Limiting**: Can be easily added with express-rate-limit

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, 3-50 chars),
  email: String (unique, valid email),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Signals Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  agent_id: String,
  signal_type: String (enum: ['HRV', 'GSR', 'respiration', 'temperature', 'heart_rate']),
  timestamp: Date,
  payload: {
    raw: [Number],
    avg: Number,
    sdnn: Number (optional)
  },
  context: Object (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes
- Users: email (unique), username (unique)
- Signals: user_id + timestamp, user_id + signal_type

## 🛠️ Development

### Project Structure
```
Secure-Signal-Dashboard/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development|production|test
PORT=5000
MONGODB_URI=mongodb://localhost:27017/signal_dashboard
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Use secure, production-ready values
2. **Database**: Use MongoDB Atlas or properly secured MongoDB instance
3. **SSL/TLS**: Implement HTTPS in production
4. **Load Balancing**: Consider nginx or cloud load balancers
5. **Monitoring**: Implement logging and monitoring solutions
6. **Backup**: Regular database backups
7. **CI/CD**: Automated testing and deployment pipelines

### Docker Production Deployment

1. Build production images:
```bash
docker-compose -f docker-compose.prod.yml build
```

2. Deploy with production configuration:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading with cursor-based pagination
- **Caching**: Ready for Redis integration
- **Connection Pooling**: MongoDB connection optimization
- **Static Asset Optimization**: Frontend build optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation above
- Review the test files for usage examples