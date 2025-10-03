# Use Node.js 20 LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port (change if needed)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
