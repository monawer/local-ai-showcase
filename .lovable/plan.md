## الهدف
إرجاع البطاقات الأربع (تلخيص، تصنيف، استخلاص، أسئلة وأجوبة) لتستدعي Ollama مباشرة بدلاً من n8n، مؤقتاً حتى تُحلّ مشكلة اتصال n8n بـ Supabase.

## التغييرات

### `src/components/landing/DemoTiles.tsx` (إعادة كتابة `run()`)
- إعادة استيراد `serviceConfig.ollamaUrl` بدل `n8nWebhookBase`.
- إعادة إدخال:
  - `SYSTEM_PROMPTS` لكل من `summarize` / `classify` / `extract` / `qa`.
  - `resolveModel()` — يجلب `GET ${ollamaUrl}/api/tags` ويختار أول نموذج متاح (أو الافتراضي من الإعدادات).
  - `buildPrompt(demoId, input, context?)` — يدمج system prompt مع المدخل، ولحالة `qa` يضيف `context` من قاعدة معرفة Supabase.
- `run()` يُرسل `POST ${ollamaUrl}/api/generate` بجسم `{ model, prompt, stream: false }` ويستخرج `response`.
- إبقاء استدعاء Supabase في `qa` لجلب المعرفة كما كان.
- استبدال رسائل أخطاء n8n برسائل خاصة بـ Ollama (الخدمة غير متاحة / لا توجد نماذج مثبتة / CORS).
- تحديث الفقرة التعريفية لتعود لذكر Ollama كمحرّك المعالجة المحلي.

## ما لن يتغيّر
- `TechAdvisorChat` يبقى على n8n (لأنه يعمل).
- ملفات `n8n-workflows/*.json` تبقى كما هي للاستخدام لاحقاً.
- `nginx.conf` / `Dockerfile` / `service-config` / `SettingsContext` — بدون تعديل.
- شكل البطاقات وKPI.

## التحقق
بعد إعادة البناء:
1. فتح الصفحة الرئيسية.
2. كل بطاقة عند الضغط "تشغيل النموذج" تصل عبر `/proxy/ollama/api/generate` وتُرجع نصاً.
3. بطاقة "أسئلة وأجوبة" تجلب من Supabase ثم تُمرّر `context` ضمن الـ prompt.

## لاحقاً (بعد حلّ مشكلة n8n ↔ Supabase)
نُعيد توجيه البطاقات إلى n8n وفق الخطة السابقة المحفوظة في `.lovable/plan.md`.
