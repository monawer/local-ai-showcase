# إصلاح أخطاء CORS الظاهرة في الكونسول

الأخطاء الثلاثة كلها سببها **CORS** — الخدمات الخلفية لا ترسل ترويسة `Access-Control-Allow-Origin: http://ai.localhost`. لا حاجة لأي تعديل في كود الواجهة؛ الإصلاح كله على إعدادات الخدمات.

## 1) Ollama (على ويندوز خارج Docker) — 403 + CORS

السبب: `OLLAMA_ORIGINS` غير مفعّل، فيرفض المتصفح الاستجابة ويرد 403.

**PowerShell كمسؤول:**
```powershell
setx OLLAMA_ORIGINS "*" /M
setx OLLAMA_HOST "0.0.0.0:11434" /M
```
ثم أوقف Ollama من الـ system tray وأعد تشغيله. تحقق:
```
http://localhost:11434/api/tags
```
يجب أن يرجع JSON.

> ملاحظة: في الإنتاج استبدل `*` بـ `http://ai.localhost` فقط.

## 2) n8n — 401 + CORS

سببان مجتمعان:
- **401**: مفتاح API غير معبأ. عيّن `VITE_N8N_API_KEY` في Portainer Stack → Environment، ثم Re-deploy (لأنه يُحقن وقت البناء).
- **CORS**: n8n لا يفعّل CORS افتراضياً على `/api/v1`. أضف في خدمة n8n (في compose الخاص بـ n8n عندك) المتغيرات:
```yaml
environment:
  N8N_CORS_ALLOW_ORIGIN: "http://ai.localhost"
  # أو للسماح بكل شيء أثناء التجربة:
  # N8N_CORS_ALLOW_ORIGIN: "*"
```
أعد تشغيل حاوية n8n.

بديل أنظف: أضف middleware CORS في Traefik على راوتر n8n بدل تعديل n8n نفسه.

## 3) Supabase (self-hosted على `supabase.localhost`) — 404 + CORS

- **404** على `/auth/v1/health`: إما GoTrue غير مركّب على هذا المسار، أو راوتر Traefik يوجّه إلى خدمة خاطئة. تحقق أن `supabase.localhost` يصل فعلاً إلى Kong/GoTrue.
- **CORS**: Kong/GoTrue يجب أن يسمحا بـ `http://ai.localhost`. في إعداد Kong أضف plugin `cors` مع `origins: http://ai.localhost`، وفي GoTrue تأكد من `GOTRUE_SITE_URL=http://ai.localhost` و `GOTRUE_URI_ALLOW_LIST=http://ai.localhost`.

## ملخص ما يجب فعله بالترتيب

1. فعّل `OLLAMA_ORIGINS=*` وأعد تشغيل Ollama → يحل Ollama.
2. في Portainer: عيّن `VITE_N8N_API_KEY` ثم أضف `N8N_CORS_ALLOW_ORIGIN=http://ai.localhost` على حاوية n8n → يحل n8n.
3. تحقق من توجيه Traefik لـ `supabase.localhost` وأضف إعدادات CORS في Kong/GoTrue → يحل Supabase.

## لا تغييرات على كود المشروع

`src/lib/service-config.ts` و `docker-compose.yml` و `.lovable/plan.md` تبقى كما هي. كل الإصلاحات على بيئة التشغيل والخدمات الخارجية.
