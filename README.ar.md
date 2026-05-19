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
VITE_OLLAMA_URL=/proxy/ollama
VITE_N8N_URL=/proxy/n8n
VITE_N8N_WEBHOOK_BASE=/proxy/n8n/webhook
VITE_N8N_API_KEY=
VITE_SUPABASE_URL=/proxy/supabase
VITE_SUPABASE_ANON_KEY=
```

### الطريقة (ب) — Portainer CE: بناء مباشر من GitHub + Webhook (موصى به)

أي تعديل في Lovable → push تلقائي إلى GitHub → Portainer يعيد البناء والنشر تلقائياً.

1. **Networks → Add network** باسم `traefik-net` (Bridge) إن لم تكن موجودة.
2. **Stacks → Add stack** باسم `local-ai-ui`.
3. **Build method**: اختر **Repository**.
   - **Repository URL**: رابط مستودع GitHub العام للمشروع.
   - **Repository reference**: `refs/heads/main`.
   - **Compose path**: `docker-compose.yml`.
4. فعّل **Automatic updates** → اختر **Webhook** → انسخ الرابط الذي يولّده Portainer
   (بصيغة `https://<portainer-host>/api/stacks/webhooks/<uuid>`).
5. في GitHub: **Settings → Webhooks → Add webhook**:
   - **Payload URL**: ألصق رابط Portainer.
   - **Content type**: `application/json`.
   - **Which events**: *Just the push event*.
   - **Active**: ✓
6. في قسم **Environment variables** داخل Portainer أضف:
   `VITE_OLLAMA_URL`, `VITE_N8N_URL`, `VITE_N8N_WEBHOOK_BASE`,
   `VITE_N8N_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
7. اضغط **Deploy the stack** — سيقوم Portainer بسحب الكود من GitHub وبناء
   الصورة محلياً من `Dockerfile` ثم تشغيلها.

> بفضل `pull_policy: build` في `docker-compose.yml`، Portainer يعيد البناء
> في كل تحديث Stack أو عند استقبال الـ webhook — **بدون الحاجة لتغيير image tag**.

#### تغيير قيم `VITE_*` فقط (بدون commit جديد)

عدّل المتغير من Stack → **Update the stack** → فعّل
**Re-pull image and redeploy** → سيُعاد البناء بالقيم الجديدة.

#### التحقق بعد النشر

```bash
docker logs -f local-ai-ui
docker exec local-ai-ui sh -c "grep -o '/proxy/[A-Za-z0-9_/.-]*' /usr/share/nginx/html/assets/*.js | sort -u"
```

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
    ملفات React الثابتة تستدعي نفس الأصل:
      • /proxy/ollama                  → Ollama
      • /proxy/n8n                     → n8n
      • /proxy/supabase                → Supabase
```

لا يوجد باك-إند داخل الحاوية — فقط Nginx يخدم ملفات React ويعمل كبروكسي محلي
للخدمات لتجنب CORS من المتصفح.
