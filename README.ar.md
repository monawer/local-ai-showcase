# local-ai-ui

واجهة ويب خفيفة (Vite + React SPA خلف Nginx) لاستعراض/تشغيل خدمات الذكاء الاصطناعي
المحلية على سيرفرك: **Ollama** و **n8n** و **Supabase** — كل شيء داخل شبكتك بدون
أي اتصال خارجي.

## النشر السريع على Docker Desktop + Traefik

### الطريقة (أ) — سطر الأوامر

```bash
docker network create traefik-net   # مرة واحدة فقط
docker compose build                 # يبني الصورة مع VITE_* من .env
docker compose up -d
```

ضع القيم في ملف `.env` بجوار `docker-compose.yml` (انظر `.env.example`):

```env
VITE_OLLAMA_URL=http://localhost:11434
VITE_N8N_URL=http://n8n.localhost
VITE_N8N_WEBHOOK_BASE=http://n8n.localhost
VITE_N8N_API_KEY=
VITE_SUPABASE_URL=http://supabase.localhost
VITE_SUPABASE_ANON_KEY=
```

### الطريقة (ب) — Portainer CE (بناء تلقائي)

1. **Networks → Add network** باسم `traefik-net` (Bridge) إن لم تكن موجودة.
2. **Stacks → Add stack** باسم `local-ai-ui`.
3. اختر مصدر الكود:
   - **Repository**: ضع رابط Git للمشروع وفرع التشغيل.
   - أو **Upload**: ارفع أرشيف `.zip` يحوي المصدر كاملاً.
4. في قسم **Environment variables** أضف ما تحتاجه من:
   `VITE_OLLAMA_URL`, `VITE_N8N_URL`, `VITE_N8N_WEBHOOK_BASE`,
   `VITE_N8N_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. اضغط **Deploy the stack** — سيقرأ Portainer ملف `docker-compose.yml`
   ويبني الصورة محلياً من `Dockerfile` ثم يشغّلها.

لأي تغيير في قيم `VITE_*` لاحقاً: عدّل المتغيّر من واجهة الـ Stack ثم
**Update the stack** مع تفعيل خيار إعادة البناء (Re-build).

ثم افتح: <http://ai.localhost>

## متطلبات على Windows host

- **Ollama**: لتمكين المتصفح من استدعائه مباشرة، فعّل CORS:
  ```powershell
  setx OLLAMA_ORIGINS "*"
  ```
  ثم أعد تشغيل خدمة Ollama.

- **n8n**: لقراءة قائمة الـ workflows ولوحة الحالة، أنشئ **API Key** من
  `Settings → API` وضعه في `VITE_N8N_API_KEY` (يتطلب إعادة بناء الصورة).

## التطوير المحلي

```bash
bun install
bun run dev    # http://localhost:8080
```

## المعمارية

```
المتصفح (ai.localhost)
        │
     Traefik :80
        │
   حاوية local-ai-ui (Nginx :8080)
        │
   ملفات React الثابتة تستدعي من المتصفح مباشرة:
     • http://localhost:11434         → Ollama
     • http://n8n.localhost           → n8n
     • http://supabase.localhost      → Supabase
```

لا يوجد باك-إند داخل الحاوية — مجرد ملفات ثابتة. هذا يجعل الصورة صغيرة
(< 30MB) والنشر بدون أي تعقيدات SSR أو Worker.
