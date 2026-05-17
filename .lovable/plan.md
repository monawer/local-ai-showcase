# خطة: صفحة عرض السيرفر المحلي للذكاء الاصطناعي (Docker-ready)

## الفكرة العامة
صفحة ويب واحدة (SPA + Server Routes) تعمل داخل حاوية Docker على نفس السيرفر، تتصل بالخدمات المحلية عبر شبكة Docker الداخلية (`http://ollama:11434`, `http://n8n:5678`, `http://supabase-kong:8000`)، وتعرض إمكانيات الذكاء الاصطناعي بشكل تفاعلي مباشر.

## الاتجاه البصري
- **Midnight Indigo**: أزرق غامق + إنديغو، إحساس تقني فاخر مناسب لـ AI/Infra.
- **اللغة**: عربية كاملة مع RTL.
- **الخط**: IBM Plex Sans Arabic.

## أقسام الصفحة

### 1. Hero
- عنوان: "ذكاؤك الاصطناعي… داخل جدرانك"
- وصف: خصوصية كاملة، بدون إنترنت، بدون رسوم API.
- شارات حالة فورية لكل خدمة (نقاط خضراء/حمراء).
- زرّان: "جرّب النموذج" + "استعرض الخدمات".

### 2. لوحة حالة الخدمات (Live Dashboard)
بطاقات تُحدَّث كل 10 ثوانٍ:
- **Ollama**: عدد النماذج المحمّلة + أسماؤها + حجم كل نموذج.
- **n8n**: عدد الـ workflows النشطة + آخر تنفيذ.
- **Supabase**: حالة Postgres + REST + Auth.
- **النظام**: RAM/CPU/Disk (اختياري عبر endpoint مخصص).

### 3. تجربة Chat مباشرة مع Ollama (الميزة الأهم)
- اختيار النموذج من dropdown (يُملأ ديناميكياً من `/api/tags`).
- streaming حقيقي عبر `/api/chat` بـ Server-Sent Events.
- مؤشرات: زمن الاستجابة، tokens/sec، طول السياق.
- دعم النصوص العربية والإنجليزية.

### 4. سيناريوهات حية (Demo Tiles)
4 بطاقات قابلة للتشغيل بضغطة واحدة، كل واحدة تستدعي workflow في n8n عبر Webhook:
- **تلخيص مستند**: لصق نص → استدعاء n8n → يستخدم Ollama → يعيد ملخّصاً.
- **تصنيف بريد**: نص → تصنيف (مهم/عادي/سبام).
- **استخراج بيانات**: نص حر → JSON منظّم.
- **إجابة من قاعدة المعرفة**: سؤال → استعلام Supabase + Ollama → جواب.

### 5. معمارية النظام
رسم SVG بسيط يوضح: المستخدم ← الواجهة (هذه الصفحة) ← {Ollama, n8n, Supabase} داخل صندوق "Air-Gapped Server".
كل عنصر قابل للنقر يعرض رابطه الداخلي (مثل `http://server.local:5678`).

### 6. Footer
روابط لواجهات الخدمات (n8n UI، Supabase Studio)، نسخة الخادم، آخر تحديث.

## البنية التقنية

### الاتصال بالخدمات — Server Routes (مهم)
المتصفح لا يستطيع الوصول مباشرة لـ `http://ollama:11434` (شبكة Docker الداخلية)، لذلك كل الاتصالات تمرّ عبر server routes داخل التطبيق:

```
/api/ollama/tags         → proxy إلى Ollama
/api/ollama/chat         → streaming proxy
/api/n8n/workflows       → حالة workflows
/api/n8n/trigger/:name   → تشغيل webhook
/api/supabase/health     → فحص الخدمات
/api/system/stats        → CPU/RAM (اختياري)
```

**فوائد هذا التصميم**: لا حاجة لـ CORS، عناوين الخدمات تبقى داخلية وآمنة، وتُضبط عبر متغيرات بيئة فقط.

### متغيرات البيئة (تُضبط في docker-compose)
```
OLLAMA_URL=http://ollama:11434
N8N_URL=http://n8n:5678
N8N_WEBHOOK_BASE=http://n8n:5678/webhook
SUPABASE_URL=http://supabase-kong:8000
SUPABASE_ANON_KEY=...
```

### النشر بـ Docker
أُنشئ:
- `Dockerfile` (multi-stage: build مع Bun ثم runtime نحيف بـ Node).
- `docker-compose.example.yml` يوضح كيف تربط الصفحة بشبكة الخدمات الموجودة (external network).
- `.env.example` بكل المتغيرات.
- `README.ar.md` بخطوات النشر بالعربية.

### الملفات الجديدة في المشروع
```
src/routes/index.tsx                       (محتوى الصفحة الرئيسية)
src/components/landing/Hero.tsx
src/components/landing/ServicesDashboard.tsx
src/components/landing/ServiceCard.tsx
src/components/landing/ChatDemo.tsx
src/components/landing/DemoTiles.tsx
src/components/landing/Architecture.tsx
src/components/landing/SiteFooter.tsx

src/routes/api/ollama/tags.ts
src/routes/api/ollama/chat.ts              (streaming)
src/routes/api/n8n/workflows.ts
src/routes/api/n8n/trigger.$name.ts
src/routes/api/supabase/health.ts
src/routes/api/system/stats.ts

src/lib/service-config.ts                  (قراءة env)
src/hooks/useServiceStatus.ts              (polling)
src/hooks/useOllamaChat.ts                 (SSE)

src/routes/__root.tsx                      (تعديل: lang="ar" dir="rtl" + خط عربي)
src/styles.css                             (tokens Midnight Indigo)

Dockerfile
docker-compose.example.yml
.env.example
README.ar.md
```

### وضع Fallback
إذا فشل أي endpoint (مثلاً Ollama متوقف)، البطاقة تعرض حالة حمراء + رسالة واضحة بدل ما تنكسر الصفحة.

## ما هو خارج النطاق (لاحقاً عند الحاجة)
- تسجيل دخول وإدارة مستخدمين.
- حفظ المحادثات في Supabase.
- RAG كامل بـ embeddings.
- إدارة workflows من الواجهة.

## ملاحظة مهمة عن n8n
لتشغيل السيناريوهات الحية، ستحتاج إنشاء 4 workflows في n8n لكل سيناريو، كلٌّ منها يبدأ بعقدة Webhook وينتهي بعقدة Respond. سأوفّر ملف JSON جاهز لكل workflow ضمن مجلد `n8n-workflows/` لاستيراده مرة واحدة.

---

هل أبدأ بهذه الخطة؟ أو تريد تعديل شيء (مثلاً: إزالة سيناريوهات n8n إن لم تكن جاهزة، أو تغيير اللغة، أو تركيز أكثر على Chat فقط)؟
