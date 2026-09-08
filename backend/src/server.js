require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const { createRedisClient } = require('./config/redis');

const PORT = process.env.PORT || 5000;

/**
 * @function startServer
 * @description Initializes the server, connects to database and starts listening on PORT
 */
const startServer = async () => {
  try {
    // Connect to database in background so server listens immediately
    connectDB().catch(err => {
      console.warn('MongoDB connection pending:', err.message);
    });
    
    // Redis is optional — log warning if unavailable
    try {
      createRedisClient();
    } catch (e) {
      console.warn('Redis not available:', e.message);
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer().catch(console.error);
