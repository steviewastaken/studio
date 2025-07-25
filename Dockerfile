# Use the official Node.js 20 image.
FROM node:20-slim

# Set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build the Next.js application for production.
RUN npm run build

# Expose the port the app runs on.
EXPOSE 3000

# The command to run the application.
CMD ["npm", "start"]