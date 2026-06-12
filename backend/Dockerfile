# ==========================================
# Stage 1: Build the application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency and prisma files
COPY package*.json ./
COPY prisma ./prisma

# Install all dependencies and generate Prisma Client
RUN npm ci
RUN npx prisma generate

# Copy project files
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript project
RUN npm run build

# ==========================================
# Stage 2: Create the production runner image
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy dependency and prisma files
COPY package*.json ./
COPY prisma ./prisma

# Install ONLY production dependencies and generate Prisma Client
RUN npm ci --omit=dev
RUN npx prisma generate

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port (defaults to 8080 or falls back to PORT)
EXPOSE 8080

# Run the app directly
CMD ["node", "dist/index.js"]
