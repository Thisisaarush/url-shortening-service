FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .
COPY prisma ./prisma/

# Development stage 
FROM base AS development
RUN npm install
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]