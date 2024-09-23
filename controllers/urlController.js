const redisClient = require("../utils/redis")
const URL = require("../models/url")
const { get } = require("mongoose")

// Create a new short URL
const createShortURL = async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: "URL is required" })

  try {
    // Check if the URL already exists in the database
    const existingURL = await URL.findOne({ url })
    if (existingURL) {
      const shortenedURL = `${req.protocol}://${req.get("host")}/${
        existingURL.shortCode
      }`
      const response = {
        originalURL: existingURL.url,
        shortenedURL: shortenedURL,
        accessCount: existingURL.accessCount,
        createdAt: existingURL.createdAt,
        shortCode: existingURL.shortCode,
      }
      return res.status(200).json(response)
    }

    const { nanoid } = await import("nanoid")
    const shortCode = nanoid(6)

    const newURL = new URL({
      url,
      shortCode,
    })

    await newURL.save()

    // Cache the URL in Redis
    await redisClient.set(shortCode, JSON.stringify(newURL), "EX", 3600) // Expiry in 1 hour

    // Construct the shortened URL
    const shortenedURL = `${req.protocol}://${req.get("host")}/${shortCode}`

    const response = {
      originalURL: newURL.url,
      shortenedURL: shortenedURL,
      accessCount: newURL.accessCount,
      createdAt: newURL.createdAt,
      shortCode: newURL.shortCode,
    }

    return res.status(201).json(response)
  } catch (error) {
    console.error("Error creating short URL:", error)
    res.status(500).json({ error: "Error creating short URL" })
  }
}

// Retrieve original URL from short code
const getOriginalURL = async (req, res) => {
  const { shortCode } = req.params

  try {
    // Fetching from cache first
    const cachedURL = await redisClient.get(shortCode)
    if (cachedURL) {
      return res.status(200).json(JSON.parse(cachedURL))
    }

    // Fetch from database if not in cache
    const urlRecord = await URL.findOne({ shortCode })
    if (!urlRecord) {
      return res.status(404).json({ error: "URL not found" })
    }

    // Update access count
    urlRecord.accessCount += 1
    await urlRecord.save()

    // Cache the updated URL
    await redisClient.set(shortCode, JSON.stringify(urlRecord), "EX", 3600) // Expiry in 1 hour

    const response = {
      id: urlRecord._id,
      originalURL: urlRecord.url,
      shortCode: urlRecord.shortCode,
      accessCount: urlRecord.accessCount,
      createdAt: urlRecord.createdAt,
      updatedAt: urlRecord.updatedAt,
    }

    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ error: "Error retrieving original URL" })
  }
}

// Update a short URL
const updateURL = async (req, res) => {
  const { shortCode } = req.params
  const { url } = req.body

  try {
    const updatedURL = await URL.findOneAndUpdate(
      { shortCode },
      { url },
      { new: true }
    )

    if (!updatedURL) {
      return res.status(404).json({ error: "URL not found" })
    }

    // Invalidate the cache
    await redisClient.del(shortCode)

    res.status(200).json(updatedURL)
  } catch (error) {
    res.status(500).json({ error: "Error updating URL" })
  }
}

// Delete a short URL
const deleteURL = async (req, res) => {
  const { shortCode } = req.params

  try {
    const deletedURL = await URL.findOneAndDelete({ shortCode })

    if (!deletedURL) {
      return res.status(404).json({ error: "URL not found" })
    }

    // Remove from cache
    await redisClient.del(shortCode)

    res.status(204).send() // No content to send back in response
  } catch (error) {
    res.status(500).json({ error: "Error deleting URL" })
  }
}

// Get statistics (access count) of a short URL
const getURLStats = async (req, res) => {
  const { shortCode } = req.params

  try {
    const urlRecord = await URL.findOne({ shortCode })
    if (!urlRecord) {
      return res.status(404).json({ error: "URL not found" })
    }

    res.status(200).json({ accessCount: urlRecord.accessCount })
  } catch (error) {
    res.status(500).json({ error: "Error retrieving URL statistics" })
  }
}
// Get original URL and redirect
const getOriginalURLAndRedirect = async (req, res) => {
  const { shortCode } = req.params

  try {
    const cachedURL = await redisClient.get(shortCode)
    if (cachedURL) {
      const urlRecord = JSON.parse(cachedURL)
      await URL.updateOne({ _id: urlRecord._id }, { $inc: { accessCount: 1 } })
      // Ensure the URL has a protocol
      const redirectURL =
        urlRecord.url.startsWith("http://") ||
        urlRecord.url.startsWith("https://")
          ? urlRecord.url
          : `http://${urlRecord.url}`
      // Redirect to the original URL
      return res.redirect(redirectURL)
    }

    // Fetch from database if not in cache
    const urlRecord = await URL.findOne({ shortCode })
    if (!urlRecord) {
      return res.status(404).json({ error: "URL not found" })
    }

    // Update access count
    await URL.updateOne({ _id: urlRecord._id }, { $inc: { accessCount: 1 } })

    // Cache the URL
    await redisClient.set(shortCode, JSON.stringify(urlRecord), "EX", 3600) // Expiry in 1 hour

    // Ensure the URL has a protocol
    const redirectURL =
      urlRecord.url.startsWith("http://") ||
      urlRecord.url.startsWith("https://")
        ? urlRecord.url
        : `http://${urlRecord.url}`

    // Redirect to the original URL
    return res.redirect(redirectURL)
  } catch (error) {
    console.error("Error retrieving original URL:", error)
    res.status(500).json({ error: "Error retrieving original URL" })
  }
}

module.exports = {
  createShortURL,
  getOriginalURL,
  updateURL,
  deleteURL,
  getURLStats,
  getOriginalURLAndRedirect,
}
