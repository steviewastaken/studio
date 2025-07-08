# Use the official Node.js 20 image.
# https://hub.docker.com/_/node
FROM node:20-slim AS base

# Set the working directory in the container.
WORKDIR /usr/src/app

# Install dependencies.
COPY package.json ./
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build the Next.js application.
# The build needs access to environment variables.
# We pass them in as secrets during the build process.
RUN --mount=type=secret,id=GOOGLE_SERVER_API_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_URL \
    --mount=type=secret,id=NEXT_PUBLIC_SUPABASE_ANON_KEY \
    --mount=type=secret,id=NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY \
    export GOOGLE_SERVER_API_KEY=$(cat /run/secrets/GOOGLE_SERVER_API_KEY) && \
    export NEXT_PUBLIC_SUPABASE_URL=$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_URL) && \
    export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(cat /run/secrets/NEXT_PUBLIC_SUPABASE_ANON_KEY) && \
    export NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY=$(cat /run/secrets/NEXT_PUBLIC_GOOGLE_CLIENT_API_KEY) && \
    npm run build

# Set the command to start the application.
CMD ["npm", "start"]
