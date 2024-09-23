const app = require("./app")
const mongoose = require("mongoose")
const redisClient = require("./utils/redis")

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB ✅")

    redisClient.on("connect", () => {
      console.log("Connected to Redis ✅")
    })

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error.message)
  })
