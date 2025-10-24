const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');

// Load env vars
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import socket initialization
const initializeSocket = require('./socket');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with authentication
const io = initializeSocket(server);

// Middleware
// Configure CORS to support one or more allowed origins provided via CLIENT_URL
// You can provide a single origin like 'https://app.example.com' or a comma-separated
// list: 'https://app.example.com,http://localhost:5173'
const clientUrlEnv = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = clientUrlEnv.split(',').map((s) => s.trim()).filter(Boolean);

// Log allowed origins at startup for easier debugging
console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, Postman) which have no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: origin '${origin}' not allowed`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler - Must be last
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});