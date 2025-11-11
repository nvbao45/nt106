FROM node:20-alpine AS deps
WORKDIR /app
COPY ui/package.json ui/package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ui ./
# Ensure standalone output is produced (configured in next.config.js)
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Copy standalone server bundle
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY ui/package.json ./package.json
# Use the pre-created node user in the official image
USER node
EXPOSE 3000
CMD ["node", "server.js"]