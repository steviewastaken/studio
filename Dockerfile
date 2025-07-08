# Use the official Node.js 20 image.
FROM node:20-slim

# Set the working directory.
WORKDIR /app

# Declare build arguments for environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set environment variables from build arguments
ENV NEXT_PUBLIC_SUPABASE_URL="https://ftxlasqgnvvdnedwplgn.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eGxhc3FnbnZ2ZG5lZHdwbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzE4OTAsImV4cCI6MjA2NzE0Nzg5MH0.dBb7RMgIK3PCzQGHPPwglQD8ntB89AeqGwCuc3t0YpU"

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