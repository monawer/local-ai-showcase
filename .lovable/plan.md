## الهدف
تحديث `docker-compose.yml` ليبني الصورة تلقائياً من Portainer مع تمرير متغيرات `VITE_*` كـ build args، بدلاً من الاعتماد على صورة مبنية مسبقاً.

## التغييرات

### 1) `docker-compose.yml`
- إضافة قسم `build:` تحت الخدمة `local-ai-ui` يشير إلى `context: .` و `dockerfile: Dockerfile`.
- تمرير `args` لكل متغيرات `VITE_*` المدعومة في `Dockerfile`، مع قراءتها من بيئة الـ Stack (Portainer Environment variables) باستخدام صيغة `${VAR}`.
- الاحتفاظ بـ `image: local-ai-ui:1.0.0` ليُسمّى الناتج بعد البناء (وحتى يستطيع Portainer استخدامه لاحقاً دون إعادة بناء).
- الإبقاء على labels و `traefik-net` كما هي.

```yaml
services:
  local-ai-ui:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_OLLAMA_URL: ${VITE_OLLAMA_URL:-http://localhost:11434}
        VITE_N8N_URL: ${VITE_N8N_URL:-http://n8n.localhost}
        VITE_N8N_WEBHOOK_BASE: ${VITE_N8N_WEBHOOK_BASE:-http://n8n.localhost}
        VITE_N8N_API_KEY: ${VITE_N8N_API_KEY:-}
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:-http://supabase.localhost}
        VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:-}
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

### 2) `README.ar.md`
تحديث قسم النشر في Portainer ليصف الطريقة الجديدة:
- **Stacks → Add stack** باسم `local-ai-ui`.
- اختيار **Repository** (Git URL للمشروع) أو **Upload** لملف مضغوط يحوي المصدر، حتى يجد Portainer ملفات البناء.
- في قسم **Environment variables** أضف القيم المرغوبة:
  - `VITE_OLLAMA_URL`
  - `VITE_N8N_URL`
  - `VITE_N8N_WEBHOOK_BASE`
  - `VITE_N8N_API_KEY`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- اضغط **Deploy the stack** — Portainer سيبني الصورة محلياً ثم يشغّلها.
- لأي تغيير في القيم: عدّل المتغيرات ثم **Update the stack** مع تفعيل **Re-pull image and redeploy** أو إعادة البناء.

### 3) ملاحظة حول `.env`
إبقاء `.env.example` للإشارة فقط؛ في Portainer تُدار القيم من واجهة Environment variables الخاصة بالـ Stack (لا حاجة لرفع ملف `.env`).

## ملاحظات تقنية
- `VITE_*` تُحقن وقت البناء داخل bundle جافاسكربت، لذا أي تعديل يستوجب إعادة بناء (Portainer → Update + rebuild).
- Portainer CE يحتاج للوصول إلى مصدر الكود (Git repo أو رفع أرشيف) ليتمكن من تنفيذ `build`. إن كان Portainer يدير عقدة Docker بعيدة، يجب أن تتوفر ملفات المشروع على تلك العقدة (الـ Git repo هو الأسهل).
- لا تغييرات على `Dockerfile` أو كود التطبيق.
