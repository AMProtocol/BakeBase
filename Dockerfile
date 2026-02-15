# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy Prisma schema (needed for postinstall script)
COPY prisma ./prisma

# Install dependencies (runs prisma generate via postinstall)
RUN npm install

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema (needed for postinstall script)
COPY prisma ./prisma

# Install production dependencies only (runs prisma generate via postinstall)
RUN npm install --only=production

# Copy built files and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Start command (migrations + seed + start)
CMD npx prisma db push && npm run db:seed && npm start
