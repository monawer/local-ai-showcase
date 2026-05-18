## المشكلة

- `Dockerfile` يشغّل `bun run preview` ← يستدعي `vite preview`.
- `vite preview` في TanStack Start يحتاج بناء Node SSR في `dist/server/server.js`.
- مشروعنا مبني لـ Cloudflare Workers (`@cloudflare/vite-plugin` + `wrangler.jsonc`)، فالناتج Worker bundle وليس Node SSR ⇒ `Cannot find module dist/server/server.js` ⇒ 500.

## الحل المختار: تشغيل ناتج البناء عبر wrangler محليًا (workerd)

نُبقي نفس بيئة التشغيل التي بُني لها المشروع، نعمل أوفلاين، ونحافظ على Server Routes.

### 1) تعديل `Dockerfile`

- في مرحلة `builder`: نُبقي `bun install` و `bun run build` كما هي (تُنتج Worker bundle + `wrangler.jsonc`).
- نُضيف تثبيت `wrangler` ضمن devDependencies (أو نستخدم `bunx wrangler` — لكن لأن السيرفر أوفلاين يجب تضمينه في `node_modules` وقت بناء الصورة).
- مرحلة `runner` تنسخ `dist/`, `wrangler.jsonc`, `node_modules`, و`package.json` فقط، ثم تشغّل:
  ```
  CMD ["bunx","wrangler","dev","--ip","0.0.0.0","--port","8080","--local","--no-show-interactive-dev-session"]
  ```
  `--local` يُجبر workerd بدون أي اتصال بـ Cloudflare ⇒ يعمل أوفلاين.

### 2) إضافة `wrangler` للحزم

`bun add -d wrangler` لتضمينه داخل الصورة (وقت بناء الصورة على جهاز فيه إنترنت)، ثم نقل الصورة للسيرفر المحلي.

### 3) تمرير متغيرات البيئة إلى wrangler

`wrangler dev --local` يقرأ المتغيرات من `wrangler.jsonc` (`vars`) أو من بيئة العملية. سنُبقي قراءتها من `process.env` كما هي اليوم في server routes — كافٍ لأن docker-compose يحقنها عبر `environment:`.

### 4) لا تغييرات على docker-compose

- نفس الشبكات (`traefik-net`, `supabase_default`, `n8n_default`).
- نفس عنوان traefik على المنفذ 8080.
- نفس متغيرات `OLLAMA_URL`, `N8N_URL`, `SUPABASE_URL`.

### 5) خطوات النشر على السيرفر

1. على جهاز فيه إنترنت: `docker compose build` (يجلب الحزم + wrangler).
2. `docker save local-ai-ui-local-ai-ui -o ai-ui.tar` ونقل الملف للسيرفر.
3. على السيرفر: `docker load -i ai-ui.tar` ثم `docker compose up -d`.
4. التحقق: `docker logs local-ai-ui` يجب أن يظهر `Ready on http://0.0.0.0:8080`.
5. فتح `http://ai.localhost` عبر traefik.

### 6) خطة بديلة (إن رفض wrangler العمل لأي سبب)

تحويل المشروع لبناء SPA ثابت + خادم Node صغير لتمرير `/api/*` كـ proxy إلى Ollama/n8n/Supabase مباشرة. أكثر عملًا لكن يُلغي الاعتماد على workerd بالكامل.

## ملاحظة فنية

السبب لا يخص الشبكات أو Bad Gateway هذه المرة — هو فقط أن أمر التشغيل في الحاوية غير متوافق مع نوع البناء. بعد التعديل أعلاه ستختفي رسائل `ResolveMessage: Cannot find module .../dist/server/server.js` تمامًا.
