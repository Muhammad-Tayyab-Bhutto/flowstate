FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --workspace=shared --workspace=backend

# Copy source
COPY shared ./shared
COPY backend ./backend
COPY tsconfig.base.json ./

# Build
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend

# Production image
FROM node:20-slim

WORKDIR /app

# Copy built files
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/shared/dist ./node_modules/@flowstate/shared/dist
COPY --from=builder /app/shared/package.json ./node_modules/@flowstate/shared/

# Install production dependencies only
RUN npm ci --omit=dev

# Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/app.js"]
