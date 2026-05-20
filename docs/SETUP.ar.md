# دليل الإعداد الكامل (Windows + Docker Desktop)

هذا الدليل يشرح خطوة بخطوة كيف تجهّز بيئة كاملة لتشغيل منصة الذكاء الاصطناعي المحلية.

---

## 1. متطلبات النظام
- **Windows 10/11** بتحديث حديث
- **Docker Desktop** مع تفعيل WSL2 backend
- **معالج 8 أنوية** على الأقل و **16 GB RAM** كحد أدنى (32 GB موصى به)
- **مساحة 50 GB** فارغة على القرص (للنماذج وقواعد البيانات)
- **(اختياري)** بطاقة رسومات NVIDIA لتسريع الاستدلال

---

## 2. تثبيت Ollama على Windows

### التثبيت
1. حمّل المثبّت من https://ollama.com/download/windows
2. شغّل المثبّت واتبع التعليمات

### الإعداد الإلزامي — `OLLAMA_ORIGINS`
هذا المتغير **ضروري** ليُسمح للمتصفح وحاويات Docker بالاتصال بـ Ollama:

```powershell
# في PowerShell كمسؤول:
[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
# أعد تشغيل Windows أو Ollama لتطبيق التغيير
```

### تحقّق من التثبيت
```powershell
curl http://localhost:11434/api/tags
```
يجب أن يعيد JSON بقائمة النماذج (قد تكون فارغة في البداية).

### تنزيل النماذج
```powershell
ollama pull llama3.1
ollama pull qwen2.5:7b   # نموذج جيد للعربية
```

---

## 3. إنشاء شبكة Docker

```powershell
docker network create traefik-net
```

---

## 4. تشغيل Traefik

أنشئ ملف `traefik-compose.yml`:

```yaml
services:
  traefik:
    image: traefik:v3
    command:
      - --api.insecure=true
      - --providers.docker
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
    ports:
      - "80:80"
      - "8081:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - traefik-net

networks:
  traefik-net:
    external: true
```

```powershell
docker compose -f traefik-compose.yml up -d
```

تحقق: افتح `http://localhost:8081` — يجب أن تظهر لوحة Traefik.

---

## 5. تشغيل Supabase

استخدم [Supabase Self-Hosting Docker](https://supabase.com/docs/guides/self-hosting/docker):

```powershell
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
# عدّل .env: غيّر POSTGRES_PASSWORD و JWT_SECRET
docker compose up -d
```

أضف Traefik labels لخدمة `kong` في `docker-compose.yml`:
```yaml
kong:
  # ... باقي الإعدادات
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.supabase-api.rule=Host(`api.supabase.localhost`)"
    - "traefik.http.routers.supabase-api.entrypoints=web"
    - "traefik.http.services.supabase-api.loadbalancer.server.port=8000"
  networks:
    - default
    - traefik-net

networks:
  traefik-net:
    external: true
```

### استيراد قاعدة المعرفة
- افتح Supabase Studio على `http://supabase.localhost`
- اذهب إلى **SQL Editor** ← New query
- ألصق محتوى `supabase/seed.sql` من هذا المشروع واضغط Run

---

## 6. تشغيل n8n

```yaml
# n8n-compose.yml
services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    environment:
      - N8N_HOST=n8n.localhost
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://n8n.localhost
      - N8N_SECURE_COOKIE=false
    volumes:
      - n8n_data:/home/node/.n8n
    extra_hosts:
      - "host.docker.internal:host-gateway"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`n8n.localhost`)"
      - "traefik.http.routers.n8n.entrypoints=web"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"
    networks:
      - traefik-net

volumes:
  n8n_data:

networks:
  traefik-net:
    external: true
```

```powershell
docker compose -f n8n-compose.yml up -d
```

### استيراد Workflows
- افتح `http://n8n.localhost` وأنشئ حساباً
- اذهب إلى **Workflows** ← **Import from file**
- استورد الملفات الأربعة من مجلد `n8n-workflows/`:
  - `summarize.json`
  - `classify.json`
  - `extract.json`
  - `qa.json`
- **مهم:** فعّل كل workflow بالضغط على زر **Active** في الأعلى

### الحصول على API Key (اختياري لحالة الخدمات)
- في n8n: **Settings** ← **API** ← **Create API Key**
- استخدمه في صفحة `/settings` في هذا المشروع لرؤية حالة الـ workflows

---

## 7. تشغيل OpenWebUI

```yaml
# webui-compose.yml
services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    restart: unless-stopped
    environment:
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
    volumes:
      - open-webui-data:/app/backend/data
    extra_hosts:
      - "host.docker.internal:host-gateway"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.webui.rule=Host(`webui.localhost`)"
      - "traefik.http.routers.webui.entrypoints=web"
      - "traefik.http.services.webui.loadbalancer.server.port=8080"
    networks:
      - traefik-net

volumes:
  open-webui-data:

networks:
  traefik-net:
    external: true
```

```powershell
docker compose -f webui-compose.yml up -d
```

---

## 8. تشغيل واجهة العرض (هذا المشروع)

```powershell
cd local-ai-showcase
docker compose up -d --build
```

افتح `http://ai.localhost` في المتصفح.

---

## 9. التحقق من العمل بالكامل

### اختبار سريع
1. افتح `http://ai.localhost`
2. تأكد من ظهور 4 بطاقات خضراء في "حالة الخدمات"
3. لا يجب ظهور تنبيه أصفر عن workflows ناقصة
4. جرّب كل عرض في "العروض التجريبية"

### إذا ظهرت مشاكل
- **بطاقة Ollama حمراء** → تحقق من `OLLAMA_ORIGINS=*` ومن إعادة تشغيل Ollama
- **بطاقة n8n حمراء** → تحقق من تشغيل حاوية n8n
- **بطاقة Supabase حمراء** → تحقق من `api.supabase.localhost` يعمل
- **بطاقة OpenWebUI حمراء** → تحقق من تشغيل حاوية webui
- **تنبيه أصفر "workflows ناقصة"** → استورد ملفات JSON في n8n وفعّلها
- **عرض يعيد 404** → workflow غير مستورد أو غير مفعّل

---

## 10. ملاحظات الأداء

- **النماذج الصغيرة (3B-7B)** أسرع لكن إجاباتها أقل دقة. مناسبة للعرض.
- **النماذج الكبيرة (13B+)** أبطأ لكن أدق. تحتاج RAM أكثر.
- **GPU NVIDIA** يُسرّع الاستدلال 5-10 أضعاف. ثبّت [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/).
- اضبط `OLLAMA_NUM_PARALLEL=4` لتشغيل عدة طلبات بالتوازي.
