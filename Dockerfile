# Build stage — installs deps and builds the Cloudflare Worker bundle.
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Runtime stage — serves the built Worker via wrangler in fully local mode (workerd).
# `--local` keeps everything offline (no Cloudflare API calls), perfect for an
# air-gapped server. Server routes under /api/* keep working as designed.
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 8080
CMD ["bunx", "wrangler", "dev", \
     "--ip", "0.0.0.0", \
     "--port", "8080", \
     "--local", \
     "--show-interactive-dev-session=false"]
