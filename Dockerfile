# Use an official lightweight Node.js 18 image.
# https://hub.docker.com/_/node
FROM node:18-slim

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
# --omit=dev skips installingdevDependencies.
RUN npm install --omit=dev

# Copy the rest of the local code to the container image.
COPY . .

# Build the Next.js application for production.
RUN npm run build

# Expose the port the app will run on.
EXPOSE 3000

# Set the command to run when the container starts.
CMD ["npm", "start"]
