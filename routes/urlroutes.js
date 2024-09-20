const express = require("express")
const router = express.Router()
const {
  createShortURL,
  getOriginalURL,
  updateURL,
  deleteURL,
  getURLStats,
} = require("../controllers/urlController")

router.post("/shorten", createShortURL)
router.get("/shorten/:shortCode", getOriginalURL)
router.put("/shorten/:shortCode", updateURL)
router.delete("/shorten/:shortCode", deleteURL)
router.get("/shorten/:shortCode/stats", getURLStats)

module.exports = router
