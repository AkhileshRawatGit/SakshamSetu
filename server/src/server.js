const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server and root directory (server/.env.local has priority)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

// Initialize Express app
const app = express();

// Connect to MongoDB on startup for traditional server
if (!process.env.VERCEL) {
  connectDB().catch((err) => {
    console.error('Initial DB connection error:', err.message);
  });
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    // In development or on Vercel, allow requests
    if (!origin || process.env.NODE_ENV === 'development' || process.env.VERCEL || origin.includes('localhost') || origin.includes('192.168.') || origin.includes('10.') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

if (!process.env.VERCEL) {
  app.use(morgan('dev')); // HTTP request logger in local dev
}

app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true })); // URL encoded parser

// Ensure DB is connected for serverless invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SakshamSetu API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      pwd: '/api/pwd',
      donor: '/api/donor',
      admin: '/api/admin',
      payment: '/api/payment',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server only when running locally (not in Vercel serverless environment)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
