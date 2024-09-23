const express = require("express")

const dotenv = require("dotenv")
const logger = require("./utils/logger")
const rateLimiter = require("./utils/rateLimiter")
const urlRoutes = require("./routes/urlroutes")

dotenv.config()

const app = express()

// Middlewares
app.use(express.json())
app.use(logger)
app.use(rateLimiter)

// Routes
app.use("/", urlRoutes)

module.exports = app
