const mongoose = require("mongoose")

const urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

urlSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const URL = mongoose.model("URL", urlSchema)

module.exports = URL
