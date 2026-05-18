# سبب الخطأ Bad Gateway

Traefik يُرجع **Bad Gateway** عندما لا يستطيع الوصول إلى الحاوية على المنفذ الذي يحاول توجيه الطلب إليه. في الإعداد الحالي:

- الحاوية تكشف منفذين: `8080` و `8282`
- التطبيق يستمع فعلياً على `8080` فقط
- لم نخبر Traefik أي منفذ يستخدم → يختار خطأً → 502

بالإضافة لذلك، حتى لو وصلت الصفحة، فإن استدعاءات `/api/ollama/*` و `/api/supabase/*` و `/api/n8n/*` ستفشل لأن `local-ai-ui` على شبكة `traefik-net` فقط، بينما `ollama` و `supabase-kong` و `n8n` على الأرجح على شبكات أخرى (مثل `supabase_default`).

---

# خطة الإصلاح

## 1. تعديل `docker-compose.yml`

أ. إضافة label لتحديد منفذ Traefik:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.ai.entrypoints=web"
  - "traefik.http.routers.ai.rule=Host(`ai.localhost`)"
  - "traefik.http.services.ai.loadbalancer.server.port=8080"
```

ب. إزالة `ports: - "80:80"` (Traefik هو من ينشر الخدمة، لا حاجة لربط منافذ host).

ج. ربط الحاوية بجميع الشبكات اللازمة:
```yaml
networks:
  - traefik-net      # للوصول من المتصفح عبر Traefik
  - supabase_default # للوصول إلى supabase-kong
  - n8n_default      # للوصول إلى n8n
  # + شبكة ollama إن كانت منفصلة

networks:
  traefik-net:
    external: true
  supabase_default:
    external: true
  n8n_default:
    external: true
```

د. تصحيح `N8N_URL`: حالياً `http://n8n.localhost` — هذا اسم host لـ Traefik من خارج الحاوية. من داخل شبكة Docker يجب استخدام اسم الحاوية مباشرة، مثلاً:
```yaml
N8N_URL: "http://n8n:5678"
N8N_WEBHOOK_BASE: "http://n8n:5678/webhook"
OLLAMA_URL: "http://ollama:11434"   # أو host.docker.internal:11434 إذا Ollama على Windows host
```

## 2. اكتشاف الأسماء الصحيحة للحاويات والشبكات

قبل تعديل الـ compose، شغّل على السيرفر:
```powershell
docker ps --format "table {{.Names}}\t{{.Networks}}\t{{.Ports}}"
docker network ls
```
ثم استبدل `supabase_default` / `n8n_default` / `n8n` / `supabase-kong` بالأسماء الفعلية.

## 3. حالة Ollama الخاصة (مهم لويندوز)

إذا كان Ollama مثبّتاً مباشرة على Windows (وليس داخل Docker)، فاستخدم:
```yaml
OLLAMA_URL: "http://host.docker.internal:11434"
extra_hosts:
  - "host.docker.internal:host-gateway"
```

أما إن كان Ollama في حاوية، فاستخدم اسم الحاوية وتأكد من ربط `local-ai-ui` بنفس شبكتها.

## 4. إعادة البناء والتشغيل
```powershell
docker compose -f docker-compose.yml up -d --build --force-recreate
docker logs -f local-ai-ui
```
ثم افتح: `http://ai.localhost`

## 5. تحقق سريع من داخل الحاوية
```powershell
docker exec -it local-ai-ui sh
wget -qO- http://ollama:11434/api/tags
wget -qO- http://supabase-kong:8000
wget -qO- http://n8n:5678
```
أي فشل = مشكلة شبكة، أي نجاح = الإعداد صحيح.

---

# قبل التنفيذ — أحتاج منك معلومتين

1. **أين يعمل Ollama؟** داخل Docker (اسم الحاوية) أم مباشرة على Windows host؟
2. **مخرجات `docker network ls` و `docker ps`** لمعرفة أسماء شبكات supabase و n8n الحقيقية.

عند تأكيد ذلك، سأحدّث `docker-compose.yml` بالقيم الصحيحة مباشرة.
