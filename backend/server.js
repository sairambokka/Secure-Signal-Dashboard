const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/utils/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const signalRoutes = require('./src/routes/signals');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/signals', signalRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;