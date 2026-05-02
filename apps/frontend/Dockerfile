# 1. Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo

# 2. Set working directory  
WORKDIR /app
COPY . .
RUN npm install

# 3. Build only the specified app
RUN turbo run build --filter=frontend...

# 4. Run the command
CMD ["npm", "start", "--filter=frontend"]