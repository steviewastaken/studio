# Use the official Node.js 20 image.
FROM node:20-slim

# Set the working directory in the container.
WORKDIR /app

# Install dependencies.
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code.
COPY . .

# Build the Next.js application for production.
# Secrets defined in apphosting.yaml will be available as environment variables during this build process.
RUN npm run build

# Expose the port that Next.js runs on.
EXPOSE 3000

# The command to run the application.
# Secrets will also be available at runtime.
CMD ["npm", "start"]
