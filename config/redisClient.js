const redis = require("redis");

// const redisClient = redis.createClient({
//   url: process.env.REDIS_URL,
// });

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_SERVER_NAME, // Server name or IP
    port: process.env.REDIS_SERVER_PORT,                    // Redis port
    idleTimeout: process.env.REDIS_IDLE_TIME,           // Idle time in ms (default is 5 min)
    connectTimeout: process.env.REDIS_CONNECT_TIMEOUT,        // Connect timeout
  },
  password: process.env.REDIS_USER_PASSWORD,  // Password if required
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.connect();

module.exports = redisClient;
