const express = require("express")

const dotenv = require("dotenv")

dotenv.config()

const app = express()

app.use(express.json())

module.exports = app
