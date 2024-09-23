const rateLimit = require("express-rate-limit")

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to few requests per `window`
  message: "Too many requests from this IP, please try again later",
})

module.exports = limiter
