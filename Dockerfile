FROM ubuntu:latest
LABEL authors="shado"
# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy all source code
COPY . .

# Set environment variables at runtime using a .env or platform config
ENV NODE_ENV=production

# Run the bot
CMD ["node", "app.js"]

ENTRYPOINT ["top", "-b"]