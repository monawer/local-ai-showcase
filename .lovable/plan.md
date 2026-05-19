# إصلاح أخطاء CORS عبر بروكسي على نفس الأصل

## السبب الجذري
المتصفح يفتح التطبيق من `http://ai.localhost` لكن الكود يطلب:
- `http://localhost:11434` (Ollama)
- `http://n8n.localhost`
- `http://supabase.localhost`

كلٌّ منها أصل مختلف، فيرفضها المتصفح ما لم يُضبط CORS بدقّة في كل خدمة. الحل الأنظف: تمرير الطلبات عبر nginx الخاص بحاوية الواجهة، فتصبح كلها من نفس الأصل `ai.localhost` ولا حاجة لأي CORS.

## التغييرات

### 1) `nginx.conf` — إضافة مواقع بروكسي

```nginx
# Ollama على مضيف ويندوز
location /proxy/ollama/ {
  proxy_pass http://host.docker.internal:11434/;
  proxy_set_header Host localhost:11434;
  proxy_http_version 1.1;
  proxy_buffering off;
}

# n8n عبر Traefik داخل نفس شبكة docker
location /proxy/n8n/ {
  resolver 127.0.0.11 valid=30s;
  proxy_pass http://n8n.localhost/;
  proxy_set_header Host n8n.localhost;
}

# Supabase Kong
location /proxy/supabase/ {
  resolver 127.0.0.11 valid=30s;
  proxy_pass http://supabase.localhost/;
  proxy_set_header Host supabase.localhost;
}
```

### 2) `docker-compose.yml`
- إضافة `extra_hosts: ["host.docker.internal:host-gateway"]` للوصول إلى Ollama على ويندوز.
- تغيير الافتراضيات إلى مسارات نسبية:
  - `VITE_OLLAMA_URL=/proxy/ollama`
  - `VITE_N8N_URL=/proxy/n8n`
  - `VITE_N8N_WEBHOOK_BASE=/proxy/n8n/webhook`
  - `VITE_SUPABASE_URL=/proxy/supabase`

### 3) `src/context/SettingsContext.tsx`
- تعديل `envDefaults` لاستخدام نفس المسارات النسبية افتراضيًا (`/proxy/ollama`، `/proxy/n8n`، `/proxy/supabase`) حتى يعمل التطبيق فورًا دون أي إعداد يدوي من المستخدم.

### 4) `src/pages/Settings.tsx` / `ServicesForm.tsx`
- إضافة شرح صغير تحت كل حقل URL يوضح أن القيمة الافتراضية تستخدم بروكسي داخلي ولا تحتاج CORS، وأن وضع URL مطلق (مثل `http://n8n.localhost`) يتطلب ضبط CORS في الخدمة.

### 5) `src/lib/service-config.ts`
- لا تغيير في المنطق، فقط التأكد أن المسارات النسبية تُمرَّر كما هي إلى `fetch` (يتعامل معها المتصفح ضمن نفس الأصل تلقائيًا).

## النتيجة
- من `http://ai.localhost` ستنجح فحوصات الحالة وزر "اختبار الاتصال" لأن كل الطلبات تصبح `same-origin`.
- لا حاجة لتعديل `OLLAMA_ORIGINS` أو `N8N_CORS_ALLOWED_ORIGINS`.
- معاينة Lovable السحابية ستظل تفشل (متوقَّع — لأنها لا تستطيع الوصول لشبكتك المحلية)، وسنُبقي تنبيهًا واضحًا في صفحة الإعدادات.

## ملفات ستُعدَّل
- `nginx.conf`
- `docker-compose.yml`
- `src/context/SettingsContext.tsx`
- `src/components/settings/ServicesForm.tsx` (نص توضيحي فقط)
