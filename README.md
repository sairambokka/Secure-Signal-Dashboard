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