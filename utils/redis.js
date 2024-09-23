const redis = require("redis")

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`, // Use URL format for modern Redis clients
})

redisClient.on("error", (err) => {
  console.error("Redis error:", err)
})

redisClient.on("connect", () => {
  console.log("Connected to Redis ✅")
})

// Initialize the Redis client
;(async () => {
  try {
    await redisClient.connect() // Important: connect the client
    console.log("Redis client connected")
  } catch (error) {
    console.error("Error connecting to Redis:", error)
  }
})()

module.exports = redisClient
