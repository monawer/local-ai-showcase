## الهدف
تحويل العروض التجريبية الأربعة (تلخيص، تصنيف، استخلاص، أسئلة وأجوبة) من استدعاء Ollama مباشرة إلى استدعاء n8n webhooks بدلاً منها — تماماً كما يفعل "المستشار التقني".

## الحالة الحالية
- `DemoTiles.tsx` يستدعي `serviceConfig.ollamaUrl` لجلب النماذج ثم `api/generate` مباشرة.
- مجلد `n8n-workflows/` يحوي 4 سير عمل جاهزة: `summarize.json`, `classify.json`, `extract.json`, `qa.json` — كلٌّ منها webhook POST يستقبل `{ input }` ويرجّع `{ output }`.
- `serviceConfig.n8nWebhookBase` متاح (افتراضياً `/proxy/n8n/webhook`).

## التغييرات

### 1. `src/components/landing/DemoTiles.tsx`
- حذف دوال `resolveModel` و `buildPrompt` و `SYSTEM_PROMPTS` (المنطق سيعيش الآن داخل n8n).
- تعديل `run()` ليُرسل POST إلى:
  ```
  ${serviceConfig.n8nWebhookBase}/${demo.id}
  ```
  بجسم `{ input: text, context? }` لحالة `qa`.
- استخراج النص من الرد بنفس آلية `TechAdvisorChat.extractReply` (دعم `output`, `response`, ...). سننقلها إلى ملف مشترك أو ننسخها هنا للبساطة.
- استبدال رسائل الخطأ الخاصة بـ Ollama برسائل خاصة بـ n8n (webhook غير مفعّل / المسار غير موجود).
- استخلاص قاعدة المعرفة في `qa` يبقى من Supabase ويُمرَّر كـ `context` ضمن جسم الطلب (n8n سيقوم بدمجه في prompt الـ Ollama داخل سير العمل).

### 2. `n8n-workflows/qa.json`
- التأكد أن سير عمل `qa` يقبل حقل `context` ويُدمجه في prompt قبل إرساله إلى Ollama. (تعديل بسيط لـ `jsonBody`).

### 3. النص التعريفي في `DemoTiles`
- تحديث الفقرة التي تقول "تُعالج البيانات محلياً عبر Ollama" لتذكر n8n كطبقة تنسيق:
  > "كل بطاقة تستدعي سير عمل n8n محلي يُنسّق النموذج عبر Ollama — كلها داخل شبكتكم."

### 4. توثيق `docs/SETUP.ar.md`
- إضافة تعليمات استيراد سير العمل الأربعة في n8n وتفعيل كل webhook (URL النسبي `/webhook/summarize` ... إلخ).

## ما لن يتغيّر
- `service-config`, `SettingsContext`, `TechAdvisorChat`, البنية البصرية للبطاقات.
- استدعاء Supabase لقاعدة المعرفة في تجربة `qa`.

## التحقق
بعد التشغيل عبر Docker:
1. استيراد ملفات JSON في n8n وتفعيلها.
2. الضغط على "تشغيل النموذج" في كل بطاقة → يجب أن يصل الطلب إلى `/proxy/n8n/webhook/<id>` ويرجع نصاً.
