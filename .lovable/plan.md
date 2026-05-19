## المشكلة الفعلية
الطلبات ما زالت تخرج إلى `http://localhost:11434` و `http://n8n.localhost` لأن التطبيق يحتفظ بالإعدادات القديمة داخل `localStorage` تحت المفتاح `lovable.settings.v1`. حتى بعد تغيير القيم الافتراضية إلى `/proxy/*`، القيم المحفوظة سابقًا تتغلب على الافتراضيات الجديدة.

يوجد سبب إضافي محتمل: ملف `Dockerfile` ما زالت قيمه الافتراضية القديمة إذا تم البناء بدون تمرير build args من `docker-compose.yml`.

## خطة الإصلاح
1. تحديث `Dockerfile`
   - تغيير قيم `ARG` الافتراضية من الروابط المطلقة القديمة إلى:
     - `VITE_OLLAMA_URL=/proxy/ollama`
     - `VITE_N8N_URL=/proxy/n8n`
     - `VITE_N8N_WEBHOOK_BASE=/proxy/n8n/webhook`
     - `VITE_SUPABASE_URL=/proxy/supabase`

2. إضافة ترقية تلقائية للإعدادات القديمة في `SettingsContext.tsx`
   - عند قراءة `localStorage`، إذا وجدنا القيم القديمة:
     - `http://localhost:11434` → `/proxy/ollama`
     - `http://n8n.localhost` → `/proxy/n8n`
     - `http://n8n.localhost/webhook` → `/proxy/n8n/webhook`
     - `http://supabase.localhost` → `/proxy/supabase`
   - بذلك لن يحتاج المستخدم لمسح إعدادات المتصفح يدويًا.

3. تحسين التعامل مع الشرطة النهائية في الروابط
   - إضافة دالة صغيرة لتجميع URL بدون تكرار أو فقدان `/`.
   - استخدامها في فحوصات الخدمات وطلبات n8n/Ollama حتى تصبح `/proxy/n8n/api/v1/workflows` صحيحة دائمًا.

4. توضيح خطوة النشر بعد التنفيذ
   - بعد التعديل يجب إعادة Build للصورة في Portainer، وليس مجرد Restart للحاوية، لأن قيم Vite تُحقن وقت البناء.

## النتيجة المتوقعة
بعد إعادة البناء وفتح `http://ai.localhost`، الطلبات يجب أن تصبح:
- `/proxy/ollama/api/tags`
- `/proxy/n8n/api/v1/workflows`
- `/proxy/supabase/auth/v1/health`

بدل الروابط المطلقة القديمة، وبذلك تختفي مشكلة CORS من جهة المتصفح.