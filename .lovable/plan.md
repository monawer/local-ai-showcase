
# إعادة بناء local-ai-ui (نسخة مبسّطة)

## الهدف
استبدال TanStack Start + Cloudflare Worker (المعقّد ويفشل في Docker) بـ **Vite + React SPA** يُخدَم عبر **Nginx** على المنفذ 8080 داخل حاوية واحدة بسيطة، تعمل خلف Traefik على `ai.localhost`.

## المعمارية الجديدة

```text
المتصفح (ai.localhost)
        │
     Traefik (web :80)
        │
   حاوية local-ai-ui
   └── Nginx :8080  →  ملفات React الثابتة (dist/)
        │
المتصفح يستدعي مباشرة:
   • http://localhost:11434          → Ollama على Windows host
   • http://n8n.localhost            → n8n (عبر Traefik)
   • http://supabase.localhost:8000  → Supabase (عبر Traefik)
```

لا باك-إند داخل الحاوية، لا server functions، لا Workers — فقط ملفات HTML/JS/CSS ثابتة.

## الميزات المُحتفَظ بها

1. **صفحة هبوط** (Hero + شرح المعمارية + Footer).
2. **لوحة حالة الخدمات** — بطاقات تعرض حالة Ollama / n8n / Supabase (متصل ✅ / غير متصل ❌) عبر ping من المتصفح.
3. **واجهة دردشة Ollama** — اختيار مودل + إرسال رسائل + بث الرد (streaming) عبر `fetch` مباشر إلى `OLLAMA_URL/api/chat`.
4. **تشغيل n8n workflows** — قائمة workflows من `N8N_URL/api/v1/workflows` + زر لاستدعاء webhook.

## التغييرات على الكود

### يُحذَف
- `src/server.ts`, `src/start.ts`, `src/router.tsx`, `src/routeTree.gen.ts`
- مجلد `src/routes/` بالكامل (مع `src/routes/api/*`)
- `src/lib/error-capture.ts`, `src/lib/error-page.ts`
- `wrangler.jsonc`, `vite.config.ts` (الحالي)
- جميع تبعيات TanStack / wrangler / unenv من `package.json`

### يُضاف / يُستبدل
- `index.html` في الجذر (نقطة دخول Vite)
- `src/main.tsx` — bootstrap React 19 + React Router DOM
- `src/App.tsx` — Routes: `/` (الهبوط) + `/chat` + `/services` + `/workflows` + `/settings`
- `src/lib/service-config.ts` — يقرأ `import.meta.env.VITE_OLLAMA_URL` / `VITE_N8N_URL` / `VITE_SUPABASE_URL`
- `src/hooks/useOllamaChat.ts` — يبقى لكن يستدعي `${OLLAMA_URL}/api/chat` مباشرة
- `src/hooks/useServiceStatus.ts` — يبقى لكن يستدعي endpoints الخدمات مباشرة (`/api/tags` للـ Ollama، `/healthz` للـ n8n)
- مكونات `src/components/landing/*` تُحدَّث لاستخدام الـ hooks المباشرة

### `vite.config.ts` جديد (بسيط)
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { host: "0.0.0.0", port: 8080 },
});
```

### `Dockerfile` جديد (متعدد المراحل، خفيف)
```dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG VITE_OLLAMA_URL=http://localhost:11434
ARG VITE_N8N_URL=http://n8n.localhost
ARG VITE_SUPABASE_URL=http://supabase.localhost:8000
ENV VITE_OLLAMA_URL=$VITE_OLLAMA_URL \
    VITE_N8N_URL=$VITE_N8N_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL
RUN bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
```

### `nginx.conf` جديد
```nginx
server {
  listen 8080;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;   # SPA fallback
  }
  location ~* \.(js|css|png|jpg|svg|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

### `docker-compose.yml` نهائي
```yaml
services:
  local-ai-ui:
    image: local-ai-ui:1.0.0
    container_name: local-ai-ui
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ai.rule=Host(`ai.localhost`)"
      - "traefik.http.routers.ai.entrypoints=web"
      - "traefik.http.services.ai.loadbalancer.server.port=8080"
    networks:
      - traefik-net

networks:
  traefik-net:
    external: true
```

## ملاحظات تقنية

- **CORS**: Ollama يحتاج تفعيل `OLLAMA_ORIGINS=*` على Windows host (متغير بيئة) ليقبل طلبات من `http://ai.localhost`. سأضيف هذا في README.
- **n8n**: يحتاج API key (اختياري) يُمرَّر عبر `VITE_N8N_API_KEY`.
- **بناء الصورة**: على جهاز فيه إنترنت → `docker build -t local-ai-ui:1.0.0 .` → `docker save` → استيراد في Portainer.

## الخطوات

1. حذف ملفات TanStack/Worker
2. إنشاء `index.html` + `src/main.tsx` + `src/App.tsx` + Router
3. تحديث `package.json` (إزالة TanStack/wrangler، إضافة `react-router-dom`)
4. كتابة `vite.config.ts` + `Dockerfile` + `nginx.conf` الجديدة
5. تحديث الـ hooks والمكونات للاستدعاءات المباشرة
6. تحديث `docker-compose.yml` والـ README
