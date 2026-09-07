/**
 * @fileoverview Redis Connection Configuration
 * @module config/redis
 *
 * Manages Redis connection for SSO sessions, caching, and rate limiting.
 */

const Redis = require('ioredis');

/** @type {Redis|null} */
let redisClient = null;

/**
 * Creates and returns a Redis client instance (singleton)
 * @param {Object} [options] - Redis connection options
 * @param {string} [options.host] - Redis host. Defaults to REDIS_HOST env or 'localhost'
 * @param {number} [options.port] - Redis port. Defaults to REDIS_PORT env or 6379
 * @param {string} [options.password] - Redis password. Defaults to REDIS_PASSWORD env
 * @param {number} [options.db] - Redis database number. Defaults to 0
 * @returns {Redis} The Redis client instance
 */
const createRedisClient = (options = {}) => {
  if (redisClient) {
    return redisClient;
  }

  const config = {
    host: options.host || process.env.REDIS_HOST || 'localhost',
    port: parseInt(options.port || process.env.REDIS_PORT || '6379', 10),
    password: options.password || process.env.REDIS_PASSWORD || undefined,
    db: parseInt(options.db || process.env.REDIS_DB || '0', 10),
    retryStrategy: (times) => {
      if (times > 10) {
        console.error('💀 Redis: Max retry attempts reached');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 200, 5000);
      console.log(`⏳ Redis: Retrying connection in ${delay}ms (attempt ${times})`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  };

  redisClient = new Redis(config);

  redisClient.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis ready');
  });

  redisClient.on('error', (err) => {
    console.error(`❌ Redis error: ${err.message}`);
  });

  redisClient.on('close', () => {
    console.warn('⚠️  Redis connection closed');
  });

  return redisClient;
};

/**
 * Gets the existing Redis client or creates a new one
 * @returns {Redis}
 */
const getRedisClient = () => {
  if (!redisClient) {
    return createRedisClient();
  }
  return redisClient;
};

/**
 * Disconnects the Redis client gracefully
 * @returns {Promise<void>}
 */
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('🔌 Redis disconnected gracefully');
  }
};

// ─────────────────────────────────────────────────────
// SSO Session Helpers
// ─────────────────────────────────────────────────────

const SSO_PREFIX = 'sso:session:';
const SSO_TTL = 300; // 5 minutes

/**
 * Stores an SSO session in Redis
 * @param {string} uuid - Unique session identifier
 * @param {string} jwt - JWT token to store
 * @param {number} [ttl=300] - Time to live in seconds
 * @returns {Promise<string>} 'OK' on success
 */
const setSSOSession = async (uuid, jwt, ttl = SSO_TTL) => {
  const client = getRedisClient();
  return client.setex(`${SSO_PREFIX}${uuid}`, ttl, jwt);
};

/**
 * Retrieves and deletes an SSO session from Redis (one-time use)
 * @param {string} uuid - Unique session identifier
 * @returns {Promise<string|null>} The JWT token, or null if not found/expired
 */
const getSSOSession = async (uuid) => {
  const client = getRedisClient();
  const key = `${SSO_PREFIX}${uuid}`;

  // Atomic get-and-delete using a pipeline
  const pipeline = client.pipeline();
  pipeline.get(key);
  pipeline.del(key);
  const results = await pipeline.exec();

  // results[0] = [error, value] for GET
  return results[0][1];
};

module.exports = {
  createRedisClient,
  getRedisClient,
  disconnectRedis,
  setSSOSession,
  getSSOSession,
};
