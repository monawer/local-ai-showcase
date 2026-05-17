# واجهة عرض السيرفر المحلي للذكاء الاصطناعي

صفحة واحدة تُعرّف بإمكانيات سيرفرك المحلي وتشغّل خدماته بشكل تفاعلي،
مصمَّمة للعمل داخل حاوية Docker على نفس السيرفر بدون اتصال بالإنترنت.

## ما تتصل به الصفحة

- **Ollama** (`/api/tags`, `/api/chat`) — قائمة النماذج المحلية + chat مباشر بـ streaming.
- **n8n** (`/api/v1/workflows`, `/webhook/*`) — حالة الـ workflows وتشغيلها.
- **Supabase** (Kong gateway) — فحص حالة REST/Auth.
- **نظام التشغيل** — إحصائيات RAM/CPU (متاحة عند التشغيل على Node).

كل الاتصالات تمرّ عبر server routes داخلية (`/api/*`) لتفادي مشاكل CORS
وإبقاء عناوين الخدمات داخل شبكة Docker.

## التشغيل بـ Docker

1. تأكد من وجود شبكة Docker خارجية تضم الخدمات (المثال يستخدم `ai-stack`):

   ```bash
   docker network create ai-stack
   ```
   ثم اربط حاويات `ollama` و `n8n` و `supabase-kong` بنفس الشبكة.

2. عدّل `docker-compose.example.yml` ليطابق أسماء حاوياتك.

3. شغّل:

   ```bash
   docker compose -f docker-compose.example.yml up -d --build
   ```

4. افتح المتصفح على: `http://<server-ip>:8080`

## متغيرات البيئة

| المتغير | الوصف | الافتراضي |
|---------|-------|-----------|
| `OLLAMA_URL` | عنوان Ollama الداخلي | `http://ollama:11434` |
| `N8N_URL` | عنوان n8n الداخلي | `http://n8n:5678` |
| `N8N_WEBHOOK_BASE` | الجذر لاستدعاء Webhooks | `http://n8n:5678/webhook` |
| `N8N_API_KEY` | مفتاح n8n API (اختياري — لقائمة workflows) | — |
| `SUPABASE_URL` | عنوان Kong gateway | `http://supabase-kong:8000` |
| `SUPABASE_ANON_KEY` | المفتاح العام لـ Supabase | — |

## سيناريوهات n8n الجاهزة

ضمن مجلد `n8n-workflows/` ستجد ملف JSON واحد كنموذج (`summarize.json`).
استورده في n8n، عدّل اسم النموذج إن لزم، فعّل الـ workflow، وسيعمل الزر
المقابل في الصفحة فوراً.

أنشئ workflows مماثلة للأزرار الأخرى بمسارات Webhook:
`classify`, `extract`, `qa`.

## ملاحظات

- الصفحة تعمل بكامل وظائفها فقط داخل بيئة السيرفر حيث الخدمات متاحة على
  الشبكة الداخلية. في معاينة Lovable ستظهر كل البطاقات بحالة "غير متاح"
  وهذا متوقّع.
- لا توجد تبعيات شبكية خارجية أثناء التشغيل (الخطوط مضمّنة عبر Google
  Fonts فقط — يمكن استبدالها بنسخة محلية إذا أردت عزلاً تاماً).
