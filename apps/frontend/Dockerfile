# 1. Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo

# 2. Set working directory  
# for local development
WORKDIR /app
# for azure connection
WORKDIR /app/apps/frontend  
COPY . .
RUN npm install

# 3. Build only the specified app
RUN turbo run build --filter=frontend...

# Instructs next.js to run on 0.0.0.0 and use port 3000.
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 4. Run the command
CMD ["npm", "start", "--filter=frontend"]