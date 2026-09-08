FROM node:20-alpine

WORKDIR /app

# Install dependencies based on lockfile
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Ensure uploads directory exists for file uploads
RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["npm", "start"]
