const { PrismaClient } = require("@prisma/client")
const dotenv = require("dotenv")

dotenv.config()

const globalForPrisma = globalThis

const prismaClient = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient

module.exports = prismaClient
