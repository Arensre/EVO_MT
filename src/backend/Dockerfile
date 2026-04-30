# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies for sharp (libvips)
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies (npm install to handle package.json changes)
RUN npm install --omit=dev

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
