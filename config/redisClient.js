const redis = require("redis");

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_SERVER_NAME,
    port: Number(process.env.REDIS_SERVER_PORT),
    idleTimeout: Number(process.env.REDIS_IDLE_TIME) || 300000,
    connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT) || 10000,
  },
  password: process.env.REDIS_USER_PASSWORD,
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("🔌 Redis: Trying to connect...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis: Connected and ready to use");
});

redisClient.on("end", () => {
  console.log("🛑 Redis: Connection closed");
});

redisClient.connect();

module.exports = redisClient;
