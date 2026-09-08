# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications first for Docker caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy full frontend codebase
COPY . .

# Build arguments for Vite client-side bundle
ARG VITE_API_BASE_URL=http://localhost:5000/api
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_RAZORPAY_KEY_ID=""
ARG VITE_APP_NAME="Library Sathi"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_APP_NAME=$VITE_APP_NAME

# Compile production Vite bundle into /app/dist
RUN npm run build

# Stage 2: Production Nginx runtime
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
