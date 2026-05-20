# --- مرحلة البناء ---
FROM oven/bun:1 AS build
WORKDIR /app

# تثبيت التبعيات (طبقة قابلة للتخزين المؤقت)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# نسخ الكود وبناء SPA الثابت
COPY . .

# قيم افتراضية تمر عبر nginx الداخلي (same-origin) لتجنب CORS
ARG VITE_OLLAMA_URL=/proxy/ollama
ARG VITE_N8N_URL=/proxy/n8n
ARG VITE_N8N_WEBHOOK_BASE=/proxy/n8n/webhook
ARG VITE_N8N_API_KEY=
ARG VITE_SUPABASE_URL=/proxy/supabase
ARG VITE_SUPABASE_ANON_KEY=

ENV VITE_OLLAMA_URL=$VITE_OLLAMA_URL \
    VITE_N8N_URL=$VITE_N8N_URL \
    VITE_N8N_WEBHOOK_BASE=$VITE_N8N_WEBHOOK_BASE \
    VITE_N8N_API_KEY=$VITE_N8N_API_KEY \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN bun run build

# --- مرحلة التشغيل ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-maps.conf /etc/nginx/conf.d/00-maps.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

