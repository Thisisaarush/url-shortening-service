const redisClient = require("../utils/redis")
const prismaClient = require("../utils/prisma")

// Create a new short URL
const createShortURL = async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: "URL is required" })

  try {
    const { nanoid } = await import("nanoid")
    const shortCode = nanoid(6)
    console.log("shortCode ⭐️", shortCode)

    const newURL = await prismaClient.url.create({
      data: { url, shortCode },
    })

    // Cache the URL in Redis
    await redisClient.set(shortCode, JSON.stringify(newURL), "EX", 3600) // Expiry in 1 hour

    return res.status(201).json(newURL)
  } catch (error) {
    res.status(500).json({ error: "Error creating short URL" })
  }
}

// Retrieve original URL from short code
const getOriginalURL = async (req, res) => {
  const { shortCode } = req.params

  try {
    // fetching from cache first
    const cachedURL = await redisClient.get(shortCode)
    if (cachedURL) {
      return res.status(200).json(JSON.parse(cachedURL))
    }

    // Fetch from database if not in cache
    const urlRecord = await prismaClient.url.findUnique({
      where: { shortCode },
    })
    if (!urlRecord) {
      return res.status(404).json({ error: "URL not found" })
    }

    // Update access count
    await prismaClient.url.update({
      where: { shortCode },
      data: { accessCount: { increment: 1 } },
    })

    // Cache the URL
    await redisClient.set(shortCode, JSON.stringify(urlRecord), "EX", 3600) // Expiry in 1 hour

    res.status(200).json(urlRecord)
  } catch (error) {
    res.status(500).json({ error: "Error retrieving original URL" })
  }
}

// Update a short URL
const updateURL = async (req, res) => {
  const { shortCode } = req.params
  const { url } = req.body

  try {
    const updatedURL = await prismaClient.url.update({
      where: { shortCode },
      data: { url },
    })

    // Invalidate the cache
    await redisClient.del(shortCode)

    res.status(200).json(updatedURL)
  } catch (error) {
    res.status(404).json({ error: "URL not found" })
  }
}

// Delete a short URL
const deleteURL = async (req, res) => {
  const { shortCode } = req.params

  try {
    await prismaClient.url.delete({ where: { shortCode } })

    // Remove from cache
    await redisClient.del(shortCode)

    res.status(204).send() // No content to send back in response
  } catch (error) {
    res.status(404).json({ error: "URL not found" })
  }
}

// Get statistics (access count) of a short URL
const getURLStats = async (req, res) => {
  const { shortCode } = req.params

  try {
    const urlRecord = await prismaClient.url.findUnique({
      where: { shortCode },
    })
    if (!urlRecord) {
      return res.status(404).json({ error: "URL not found" })
    }

    res.status(200).json({ accessCount: urlRecord.accessCount })
  } catch (error) {
    res.status(500).json({ error: "Error retrieving URL statistics" })
  }
}

module.exports = {
  createShortURL,
  getOriginalURL,
  updateURL,
  deleteURL,
  getURLStats,
}
