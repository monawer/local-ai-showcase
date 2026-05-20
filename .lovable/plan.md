## الاتجاه المختار: Strategic Executive Magazine

عرض بأسلوب شرائح برزنتيشن تنفيذي، خلفية كحلية عميقة، خطوط Sora للعناوين وManrope للنص، أقسام كاملة العرض كل قسم = شريحة، نبرة استراتيجية لا تقنية.

## التغييرات

### 1) Design tokens — `src/index.css`
نسخ القيم حرفياً من النموذج المختار:
- `--background: 224 59% 15%` (#0f1b3d)
- `--card / surface: 213 53% 25%` (#1e3a5f)
- `--primary / accent: 209 47% 43%` (#3b6fa0)
- `--foreground: 215 27% 92%` (#e8edf3)
- تحميل خطي Google: `Sora` (700/800) للعناوين، `Manrope` (400/500/600) للنص الأساسي.
- تعريف فئات: `.font-display` → Sora، `.font-body` → Manrope.

### 2) `tailwind.config.ts`
إضافة `fontFamily.display: ['Sora', ...]` و`fontFamily.body: ['Manrope', ...]`.

### 3) إعادة بناء أقسام الـ Landing بنفس بنية النموذج
كل قسم بنفس الترتيب والكثافة الواردين في النموذج المختار:

- **`src/components/landing/Hero.tsx`**
  - شارة "سيادة كاملة على البيانات" (نقطة خضراء نابضة).
  - عنوان ضخم `text-6xl/text-8xl` بسطرين: "ذكاء اصطناعي / مؤسسي، تحت سيطرتك." مع تدرّج على السطر الثاني.
  - فقرة تنفيذية (≤2 أسطر).
  - زرّان: "ابدأ التحول الرقمي الآن" (primary) + "استعرض حالات الاستخدام" (outline).
  - شريط KPIs سفلي (4 أعمدة): `0 ريال` رسوم API، `100%` سيادة بيانات، `24/7` بدون إنترنت، `Offline` استقلالية.

- **`src/components/landing/WhyLocal.tsx`** (3 بطاقات بدل 4)
  - عنوان "لماذا الذكاء الاصطناعي المحلي؟" + خط فاصل 24px.
  - 3 بطاقات: الامتثال والخصوصية / عائد استثمار حقيقي / استقلالية تكنولوجية — بصياغة تنفيذية (لا "Air-Gapped" تقنية هنا).

- **`src/components/landing/LiveDashboard.tsx`**
  - عنوان "حالة الخدمات الحية" + شارة `System Health: Optimal`.
  - 4 بطاقات: Ollama (مع GPU load bar)، OpenWebUI (مع avatars stack)، Supabase (Vector Search)، n8n (Active Workflows). تبقى متصلة بـ `useServiceStatus`.

- **قسم جديد: `src/components/landing/UseCasesExecutive.tsx`** (يحل محل قسم "حالات الاستخدام" الحالي)
  - عمودين: قائمة 3 حالات (تحليل عقود قانونية، مساعد قاعدة معرفة، أتمتة تقارير أداء) + معاينة محادثة تنفيذية (mock chat).

- **`src/components/landing/ChatDemo.tsx`** — يبقى بعد UseCases بنفس وظيفته لكن بتنسيق الألوان الجديد.

- **`src/components/landing/TechAdvisorChat.tsx`** — يبقى بتنسيق الألوان الجديد (مربوط بالـ webhook).

- **`src/components/landing/Architecture.tsx`**
  - عنوان "هندسة عازلة تماماً (Air-Gapped)" مع رسم تخطيطي بـ 3 خانات: المستخدم ↔ خط متوهج ↔ مركز البيانات الخاص، مع اقتباس "السيادة الرقمية تبدأ من المكان الذي تضع فيه خوادمك."

- **`src/components/landing/Footer.tsx`** — شعار + روابط (الالتزام/التوثيق/الدعم المؤسسي).

### 4) `src/App.tsx`
ترتيب الأقسام: Hero → WhyLocal → LiveDashboard → ChatDemo → TechAdvisorChat → UseCasesExecutive → Architecture → Footer.

### 5) إزالة/تحديث
- إزالة `Stats` المنفصلة (مدمجة في Hero).
- إزالة `QuickLinks` (لا تناسب عرضاً تنفيذياً).
- `DemoTiles` يبقى محذوفاً.

## الملفات المتأثرة
- **تعديل**: `src/index.css`, `tailwind.config.ts`, `src/App.tsx`, `src/components/landing/Hero.tsx`, `WhyLocal.tsx`, `LiveDashboard.tsx`, `Architecture.tsx`, `Footer.tsx`, `ChatDemo.tsx`, `TechAdvisorChat.tsx`, `index.html` (إضافة preconnect لـ Google Fonts).
- **جديد**: `src/components/landing/UseCasesExecutive.tsx`.
- **حذف من الاستيراد**: `Stats.tsx`, `QuickLinks.tsx`, `UseCases.tsx` القديم (الملفات تبقى أرشيفاً).

## ملاحظات
- النصوص العربية بنبرة تنفيذية: ROI، سيادة، امتثال، استمرارية أعمال — لا مصطلحات تقنية في الواجهة الأمامية.
- جميع المكونات الحية (ChatDemo, TechAdvisorChat, LiveDashboard) تحتفظ بمنطقها الحالي؛ التغيير بصري فقط.

Used the redesign skill.