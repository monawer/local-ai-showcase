## الفكرة
إنشاء صفحة `/settings` تتيح للمستخدم:
1. تعديل روابط الخدمات (Ollama, n8n, Supabase) ومفاتيحها من المتصفح مباشرة بدون إعادة بناء Docker.
2. إضافة/حذف أزرار روابط مخصصة (مثل Portainer, Grafana, Traefik Dashboard…) تظهر في الصفحة الرئيسية والـ Header.
3. اختبار اتصال كل خدمة بزر "Test Connection" لمعرفة السبب فورًا (CORS / 401 / 404 …).

## التخزين
- استخدام `localStorage` تحت مفتاح واحد `lovable.settings.v1`.
- إنشاء `SettingsContext` يقرأ القيم عند الإقلاع ويُغلّب قيم localStorage على قيم `import.meta.env` (تصبح القيم في Dockerfile مجرد افتراضيات).
- تحديث `src/lib/service-config.ts` ليقرأ من الـ context بدلاً من `import.meta.env` مباشرة، مع helper `getServiceConfig()` للاستخدام في hooks.

## الصفحات والمكوّنات الجديدة
```text
src/
  pages/Settings.tsx                ← الصفحة الجديدة (تبويبات)
  context/SettingsContext.tsx       ← state + persistence
  components/settings/
    ServicesForm.tsx                ← Ollama / n8n / Supabase (URL + key + test)
    CustomLinksManager.tsx          ← قائمة + إضافة/حذف/ترتيب
    AdvancedTab.tsx                 ← Export/Import JSON + Reset
  components/landing/QuickLinks.tsx ← يعرض الروابط المخصصة في الصفحة الرئيسية
```

## بنية الإعدادات
```ts
type ServiceCfg = { url: string; apiKey?: string; enabled: boolean };
type CustomLink = { id: string; label: string; url: string; icon?: string; openInNewTab: boolean };
type Settings = {
  services: {
    ollama: ServiceCfg;
    n8n: ServiceCfg & { webhookBase?: string };
    supabase: ServiceCfg & { anonKey?: string };
  };
  customLinks: CustomLink[];
  refreshIntervalSec: number;   // ServicesDashboard
};
```

## التبويبات داخل `/settings`
1. **الخدمات** – نموذج لكل خدمة + زر "اختبار" يستدعي endpoint الفحص ويُظهر النتيجة (OK / CORS / 401…).
2. **الروابط السريعة** – جدول إضافة/تعديل/حذف مع معاينة الأيقونة (اختيار من lucide).
3. **عام** – فترة التحديث + Export/Import JSON + Reset.

## دمج مع الواجهة
- `Header`/`SiteFooter`: إضافة أيقونة ⚙️ تذهب إلى `/settings`.
- `Hero` أو قسم جديد فوق `ServicesDashboard`: عرض `QuickLinks` من `customLinks`.
- `ServicesDashboard` و hooks في `useServiceStatus` تقرأ من `SettingsContext` لتلتقط أي تعديل لحظيًا.

## خدمات مقترحة إضافيًا (كقوالب جاهزة في "إضافة رابط")
Portainer, Traefik Dashboard, Grafana, Prometheus, Qdrant, Open WebUI, MinIO, Uptime Kuma.

## ملاحظات تقنية
- لا حاجة لتعديل Dockerfile؛ القيم في `VITE_*` تبقى افتراضيات أولية فقط.
- المفاتيح الحساسة (n8n API key, supabase anon) تُخزَّن في localStorage للمتصفح المحلي فقط — تنبيه واضح في الصفحة.
- إضافة Route جديد في `src/App.tsx`: `<Route path="/settings" element={<Settings />} />`.
