## السبب

في `nginx.conf` كتلة `/proxy/n8n/` تضبط ترويسة WebSocket بدون شرط:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

عندما يأتي طلب عادي (مثل `GET /api/v1/workflows` من زر "اختبار الاتصال")، يكون `$http_upgrade` فارغاً، لكن `Connection: upgrade` تُرسَل دائماً. هذا التركيب غير الصحيح يؤدي أحياناً إلى:
- إغلاق الاتصال من Traefik/n8n قبل إكمال الرد → يظهر للمتصفح كـ **Failed to fetch**.
- بينما طلبات Webhook تعمل أحياناً لأنها POST سريعة لا تنتظر upgrade.

نفس المشكلة قد تؤثر على OpenWebUI لاحقاً.

الدليل: Ollama و Supabase لا يستخدمان `Upgrade`/`Connection` لذلك يعملان، بينما n8n الذي يضبطهما هو الوحيد الفاشل — وهذا يطابق ما أبلغ عنه المستخدم.

## التغييرات

### 1. `nginx.conf`
- إضافة `map` على مستوى `http` لجعل `Connection` مشروطة بوجود `Upgrade`:
  ```nginx
  map $http_upgrade $connection_upgrade {
      default upgrade;
      ''      close;
  }
  ```
- استبدال `proxy_set_header Connection "upgrade";` بـ `proxy_set_header Connection $connection_upgrade;` في كتلتي `/proxy/n8n/` و `/proxy/webui/`.
- ملاحظة تقنية: `map` يجب أن يوضع في سياق `http`، لذلك سنضعه في ملف منفصل `/etc/nginx/conf.d/` أو نضيفه إلى Dockerfile.

### تفاصيل التنفيذ
بما أن قالب nginx الرسمي يحمّل `/etc/nginx/conf.d/*.conf` تلقائياً ضمن سياق `http`، سننقل `map` إلى ملف جانبي مثل `nginx-maps.conf` يُنسخ في `Dockerfile` إلى `/etc/nginx/conf.d/00-maps.conf`، ونحتفظ بـ `nginx.conf` الحالي كـ server block فقط.

أو الأبسط: نعدّل Dockerfile لينسخ ملف خفيف `nginx-maps.conf` إلى `/etc/nginx/conf.d/`، ونبقى `nginx.conf` يُنسخ إلى المكان المعتاد.

### 2. اختبار سريع بعد إعادة البناء
```bash
docker compose build && docker compose up -d
curl -i http://ai.localhost/proxy/n8n/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```
يجب أن يُرجِع 200 مع JSON بدلاً من انقطاع الاتصال.

## ملفات سيتم تعديلها
- `nginx.conf` — تعديل سطرين في `/proxy/n8n/` و `/proxy/webui/`.
- `nginx-maps.conf` — ملف جديد.
- `Dockerfile` — إضافة `COPY` لملف الـ map.

لن يتغيّر أي كود React أو سلوك الواجهة.
