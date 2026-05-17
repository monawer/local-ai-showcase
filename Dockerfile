# Multi-stage build: small image, runs the app on Node 20.
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Runtime stage — uses the Vite preview server (sufficient for an internal tool)
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 8080
# Bind to all interfaces so the container is reachable on the docker network
CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "8080"]
