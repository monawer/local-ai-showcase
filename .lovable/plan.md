## السياق

- سيرفر Windows بدون إنترنت، يُدار عبر **Portainer CE 2.39.2**.
- لا يمكن لـ Portainer تنفيذ `bun install` / `vite build` داخل الحاوية لأن السيرفر أوفلاين.
- لذلك: نبني الصورة على جهاز فيه إنترنت، نصدّرها كملف tar، نستوردها داخل Portainer، ثم نشغّل Stack يشير للصورة بالاسم (بدون `build:`).

## 1) تجهيز الصورة على جهاز فيه إنترنت

داخل مجلد المشروع:

```
docker build -t local-ai-ui:1.0.0 .
docker save local-ai-ui:1.0.0 -o local-ai-ui-1.0.0.tar
```

ينتج ملف `local-ai-ui-1.0.0.tar` (انقله للسيرفر عبر USB/شبكة داخلية).

> `Dockerfile` الحالي يبني الـ Worker ثم يشغّله عبر `wrangler --local` (workerd) أوفلاين — لا يحتاج إنترنت وقت التشغيل.

## 2) استيراد الصورة داخل Portainer

في Portainer:

1. **Images** → **Import**.
2. اختر الملف `local-ai-ui-1.0.0.tar` → **Upload**.
3. تأكد من ظهور `local-ai-ui:1.0.0` في قائمة الصور.

## 3) تجهيز شبكات Docker المطلوبة (مرة واحدة)

من **Networks** في Portainer أو من PowerShell:

```
docker network create traefik-net   # إن لم تكن موجودة
```

أما `supabase_default` و `n8n_default` فهي تُنشأ تلقائيًا عند تشغيل ستاكات Supabase و n8n. لو أسماؤها مختلفة عندك تحقق من **Networks** وانسخ الأسماء الفعلية.

## 4) إنشاء Stack في Portainer

**Stacks → Add stack** باسم `local-ai-ui`، اختر **Web editor**، والصق:

```yaml
services:
  local-ai-ui:
    image: local-ai-ui:1.0.0
    container_name: local-ai-ui
    restart: unless-stopped
    environment:
      OLLAMA_URL: http://host.docker.internal:11434
      N8N_URL: http://n8n:5678
      N8N_WEBHOOK_BASE: http://n8n:5678/webhook
      N8N_API_KEY: ""
      SUPABASE_URL: http://supabase-kong:8000
      SUPABASE_ANON_KEY: ""
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - traefik-net
      - supabase_default
      - n8n_default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ai.rule=Host(`ai.localhost`)"
      - "traefik.http.routers.ai.entrypoints=web"
      - "traefik.http.services.ai.loadbalancer.server.port=8080"

networks:
  traefik-net:
    external: true
  supabase_default:
    external: true
  n8n_default:
    external: true
```

ثم **Deploy the stack**.

> ملاحظات:
> - لا يوجد `build:` — Portainer لن يحاول البناء.
> - عدّل أسماء الشبكات الخارجية لتطابق ما عندك فعلًا.
> - لو Ollama يعمل داخل Docker بدل Windows: غيّر `OLLAMA_URL` إلى `http://ollama:11434` وأضف شبكة Ollama.

## 5) التحقق

في Portainer → Containers → `local-ai-ui` → **Logs**:

- يجب أن تظهر رسالة مشابهة لـ `Ready on http://0.0.0.0:8080`.
- لا يجب أن تظهر `Cannot find module .../dist/server/server.js` (تلك كانت مشكلة `vite preview` السابقة).

ثم افتح من المتصفح: `http://ai.localhost`.

## 6) التحديثات اللاحقة

أي تعديل على الكود:

1. أعد البناء على جهاز الإنترنت برقم نسخة جديد، مثل `local-ai-ui:1.0.1`.
2. صدّر، استورد في Portainer.
3. في **Stacks → local-ai-ui → Editor**: غيّر `image: local-ai-ui:1.0.1` → **Update the stack** (مع **Re-pull image** = OFF لأنها محلية).

## خلاصة الفرق عن الخطة السابقة

- لا يوجد `docker compose build` على السيرفر — البناء يحدث خارج السيرفر.
- يُستبدل `docker compose up -d` بـ **Stack في Portainer** يشير لصورة محلية مستوردة.
- باقي الإعدادات (Traefik labels، شبكات، متغيرات بيئة، wrangler كأمر تشغيل) كما هي.
