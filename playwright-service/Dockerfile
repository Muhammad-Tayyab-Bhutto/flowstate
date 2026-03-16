FROM mcr.microsoft.com/playwright:v1.41.1-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Build
RUN npm run build

# Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/server.js"]
