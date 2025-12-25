FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose port (if we add a server wrapper)
EXPOSE 3000

# Start command (we will update this to a server wrapper later, or stick to main.js if Cron)
# Using a server wrapper is safer for Azure Web App to detect "health"
CMD ["node", "service.js"]
