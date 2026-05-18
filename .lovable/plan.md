## الهدف
جعل Portainer يبني الصورة مباشرة من GitHub (بدون سحب الكود محلياً)، وأي push من Lovable إلى GitHub يُطلق إعادة بناء ونشر تلقائي عبر Webhook.

## كيف ستعمل السلسلة

```text
Lovable (تعديل)
   ↓ push تلقائي
GitHub (main)
   ↓ webhook عند كل push
Portainer Stack
   ↓ git pull + docker build (من Dockerfile)
   ↓ docker up -d
حاوية local-ai-ui محدّثة خلف Traefik
```

## التغييرات في الكود

### 1) `docker-compose.yml` — تبسيط مناسب لـ "Build from Git"
- إبقاء قسم `build:` كما هو (Portainer سيستخدم `context: .` على الكود الذي سحبه من Git).
- إزالة الحاجة لتغيير `image tag` يدوياً عبر إضافة `pull_policy: build` وضمان إعادة البناء عند كل تحديث Stack.
- إبقاء `args` تأخذ القيم من Environment variables التي تُضبط داخل Portainer.
- وسم الصورة بـ `local-ai-ui:latest` (التاغ لم يعد آلية التحديث، الـ webhook هو الذي يُجبر البناء).

### 2) `README.ar.md` — إضافة قسم "النشر من GitHub عبر Portainer"
خطوات واضحة:
1. **Portainer → Stacks → Add stack → اسم: `local-ai-ui`**.
2. اختيار **Build method: Repository**.
3. **Repository URL**: رابط مستودع GitHub العام.
4. **Reference**: `refs/heads/main`.
5. **Compose path**: `docker-compose.yml`.
6. تفعيل **Automatic updates → Webhook** → نسخ الـ URL الذي يولّده Portainer (يكون بصيغة `https://portainer.example/api/stacks/webhooks/<uuid>`).
7. في **GitHub → Settings → Webhooks → Add webhook**:
   - Payload URL: ألصق رابط Portainer.
   - Content type: `application/json`.
   - Events: **Just the push event**.
8. في قسم **Environment variables** داخل Portainer، أضف الـ `VITE_*` (Ollama / n8n / Supabase URLs).
9. اضغط **Deploy the stack**.

### 3) ملاحظات تشغيل مهمة (تُذكر في README)
- مع "Build from Git" يقوم Portainer بـ `git pull` + `docker build` في كل تحديث، لذا **لا حاجة لتغيير image tag** بعد الآن.
- عند تغيير `VITE_*` فقط بدون commit جديد: من Portainer → Stack → **Update the stack** → فعّل **Re-pull image and redeploy** (يُجبر إعادة البناء بالقيم الجديدة).
- على Windows: يجب أن يكون Portainer قادراً على الوصول لـ `github.com` (عادي للسيرفر).
- المستودع عام، لذا لا حاجة لـ Git credentials في Portainer.

## التحقق بعد النشر
```bash
docker logs -f local-ai-ui
docker exec local-ai-ui sh -c "grep -o 'http://[^\"]*' /usr/share/nginx/html/assets/*.js | sort -u"
```
يجب أن تظهر روابط `VITE_*` التي ضبطتها.

## الملفات المتأثرة
- `docker-compose.yml` (تعديل بسيط: `pull_policy`, تاغ `latest`, تعليقات).
- `README.ar.md` (إضافة قسم Webhook + إزالة تعليمات تغيير التاغ يدوياً).

لا تغييرات في كود التطبيق (`src/`) أو `Dockerfile`.