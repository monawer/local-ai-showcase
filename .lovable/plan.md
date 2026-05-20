## الهدف
إعادة قسم "العروض التجريبية" إلى الصفحة، بتصميم تنفيذي يتماشى مع هوية Navy Trust + تخطيط Magazine، مع الحفاظ الكامل على المنطق الوظيفي الحالي (Ollama + قاعدة المعرفة).

## التغييرات

### 1) `src/components/landing/DemoTiles.tsx` — تجديد بصري فقط
- **رأس القسم بأسلوب Magazine**: عمود علوي يحوي eyebrow صغير ("AI WORKFLOWS · LIVE")، عنوان كبير بخط Sora، و"deck" نصي قصير على اليمين يشرح القيمة التنفيذية. خط فاصل أفقي رفيع تحت الرأس (border-border/40).
- **شريط KPI أعلى الشبكة**: 4 أرقام موجزة (نماذج جاهزة، زمن استجابة متوسط، تكلفة API، حدود البيانات) — يعرض حالة فعلية حيث ممكن من نفس استدعاء `api/tags`، والباقي ثابت تنفيذي.
- **بطاقات بتصميم تنفيذي**:
  - خلفية `bg-card/70 backdrop-blur` مع حد علوي ملوّن رفيع (accent بلون primary) يميّز كل بطاقة.
  - رقم تسلسلي كبير (01..04) بخط Sora خفيف في الزاوية كعنصر Magazine.
  - أيقونة داخل مربع بحدود `border-primary/30` بدل التعبئة الكاملة.
  - badge القسم يصبح uppercase tracking-wider صغير.
  - الوصف بخط Manrope بمسافة أسطر مريحة.
  - زر "تشغيل" بأسلوب outline-primary، ورابط "جرّب مثالاً" بخط أصغر.
  - منطقة النتيجة بإطار `border-l-2 border-primary` بدل الإطار الكامل، مع label صغير "OUTPUT".
- **تخطيط**: شبكة `md:grid-cols-2` تبقى، لكن مع `gap-6` وحواف داخلية أوسع `p-7`.
- **عدم تغيير أي منطق**: `DemoCard`, `run()`, `resolveModel()`, `buildPrompt()`, `fetchKnowledgeBase()`, `forwardRef/useImperativeHandle` — كلها كما هي.

### 2) `src/App.tsx` — إعادة الاستيراد والإدراج
- إضافة `import { DemoTiles } from "@/components/landing/DemoTiles"`.
- إدراج `<DemoTiles />` بعد `<ChatDemo />` وقبل `<TechAdvisorChat />` ليظهر تدفق:
  Hero → ValueProp → ServicesDashboard → ChatDemo → **DemoTiles** → TechAdvisorChat → UseCases → Architecture → Footer.

## ما لن يتغيّر
- لا تعديل على `ChatDemo` أو `TechAdvisorChat` أو باقي الأقسام.
- لا تعديل على المنطق، الـ webhooks، أو إعدادات الخدمات.
- يبقى الملف `DemoTiles.tsx` يستخدم نفس tokens التصميم (`bg-card`, `primary`, `muted-foreground`...) دون ألوان مباشرة.
