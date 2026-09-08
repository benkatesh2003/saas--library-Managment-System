/**
 * @fileoverview MongoDB Database Connection Configuration
 * @module config/database
 *
 * Establishes and manages the MongoDB connection using Mongoose.
 * Handles connection events, retries, and graceful shutdown.
 */

const mongoose = require('mongoose');

/**
 * Default MongoDB connection options
 */
const DEFAULT_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  w: 'majority',
};

/**
 * Connects to MongoDB with retry logic
 * @param {string} [uri] - MongoDB connection URI. Defaults to MONGO_URI env variable.
 * @param {Object} [options] - Additional Mongoose connection options.
 * @param {number} [retries=5] - Number of connection retries.
 * @returns {Promise<mongoose.Connection>} The Mongoose connection instance.
 */
const connectDB = async (uri, options = {}, retries = 5) => {
  const mongoURI = uri || process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error(
      'MongoDB connection URI is required. Set MONGO_URI in your environment variables.'
    );
  }

  const connectionOptions = { ...DEFAULT_OPTIONS, ...options };

  // Connection event listeners
  mongoose.connection.on('connected', () => {
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  // Retry connection logic
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(mongoURI, connectionOptions);
      return mongoose.connection;
    } catch (err) {
      console.error(
        `❌ MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`
      );
      if (attempt === 2 && mongoURI.includes('mongodb+srv')) {
        try {
          console.log('🔄 Atlas connection blocked (likely IP whitelist). Attempting local MongoDB fallback...');
          const fallbackHost = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/library_sathi';
          try {
            await mongoose.connect(fallbackHost, connectionOptions);
          } catch (firstErr) {
            await mongoose.connect('mongodb://host.docker.internal:27017/library_sathi', connectionOptions);
          }
          console.log('✅ Connected to local MongoDB fallback successfully!');
          return mongoose.connection;
        } catch (localErr) {
          console.log('ℹ️  Local MongoDB fallback unavailable:', localErr.message);
        }
      }
      if (attempt === retries) {
        console.error('⚠️ All initial MongoDB connection attempts failed. Check if your current IP is whitelisted in MongoDB Atlas Network Access (https://cloud.mongodb.com). Retrying in background every 20s...');
        setTimeout(() => connectDB(uri, options, retries).catch(() => {}), 20000);
        return null;
      }
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Gracefully disconnects from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected gracefully');
  } catch (err) {
    console.error(`❌ Error during MongoDB disconnect: ${err.message}`);
    throw err;
  }
};

// Handle process termination signals
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Closing MongoDB connection...`);
  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = { connectDB, disconnectDB };
