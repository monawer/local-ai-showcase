## الهدف
تعديل **بطاقة "مساعد قاعدة المعرفة" (qa) فقط** لتستدعي n8n بدل Ollama. باقي البطاقات الثلاث تبقى على Ollama كما هي.

## التغيير الوحيد في `src/components/landing/DemoTiles.tsx`

داخل دالة `run()` في `DemoCard`، نضيف فرعاً مبكراً عندما `demo.id === "qa"`:

1. جلب قاعدة المعرفة من Supabase (كما هو حالياً).
2. إرسال `POST ${serviceConfig.n8nWebhookBase}/qa` بجسم:
   ```json
   { "input": "<سؤال المستخدم>", "context": "<قاعدة المعرفة>" }
   ```
3. استخراج الإجابة عبر `extractReply()` الموجود.
4. رسائل أخطاء خاصة بـ n8n (404 = الـ workflow غير مفعّل / Failed to fetch = n8n غير متاح).
5. عدم استدعاء `resolveModel()` ولا `api/generate` لهذه البطاقة.

أما `summarize` / `classify` / `extract` فتظل تمر على نفس مسار Ollama الحالي بلا أي تغيير.

## ما لن يتغيّر
- منطق البطاقات الثلاث الأخرى.
- `SYSTEM_PROMPTS`, `resolveModel`, `buildPrompt`, الواجهة، الـ KPIs.
- `TechAdvisorChat`, `nginx.conf`, `SettingsContext`, ملفات `n8n-workflows/*`.

## التحقق
- البطاقات الثلاث تعمل كما قبل.
- بطاقة "مساعد قاعدة المعرفة" تطلب `/proxy/n8n/webhook/qa` وتُرجع إجابة مبنية على معرفة Supabase داخل n8n.
