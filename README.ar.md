# local-ai-ui

واجهة ويب خفيفة (Vite + React SPA خلف Nginx) لاستعراض/تشغيل خدمات الذكاء الاصطناعي
المحلية على سيرفرك: **Ollama** و **n8n** و **Supabase** — كل شيء داخل شبكتك بدون
أي اتصال خارجي.

## النشر السريع على Docker Desktop + Traefik

### 1) بناء الصورة

```bash
docker build -t local-ai-ui:1.0.0 .
```

> لتغيير العناوين الافتراضية وقت البناء استخدم `--build-arg`:
> ```bash
> docker build \
>   --build-arg VITE_OLLAMA_URL=http://host.docker.internal:11434 \
>   --build-arg VITE_N8N_URL=http://n8n.localhost \
>   --build-arg VITE_N8N_API_KEY=YOUR_KEY \
>   -t local-ai-ui:1.0.0 .
> ```

### 2) إنشاء شبكة Traefik (إذا لم تكن موجودة)

```bash
docker network create traefik-net
```

### 3) التشغيل

```bash
docker compose up -d
```

ثم افتح: <http://ai.localhost>

## متطلبات على Windows host

- **Ollama**: لتمكين المتصفح من استدعائه مباشرة، فعّل CORS:
  ```powershell
  setx OLLAMA_ORIGINS "*"
  ```
  ثم أعد تشغيل خدمة Ollama.

- **n8n**: لقراءة قائمة الـ workflows ولوحة الحالة، أنشئ **API Key** من
  `Settings → API` وضعه في `VITE_N8N_API_KEY` (يتطلب إعادة بناء الصورة).

## التطوير المحلي

```bash
bun install
bun run dev    # http://localhost:8080
```

## المعمارية

```
المتصفح (ai.localhost)
        │
     Traefik :80
        │
   حاوية local-ai-ui (Nginx :8080)
        │
   ملفات React الثابتة تستدعي من المتصفح مباشرة:
     • http://localhost:11434         → Ollama
     • http://n8n.localhost           → n8n
     • http://supabase.localhost      → Supabase
```

لا يوجد باك-إند داخل الحاوية — مجرد ملفات ثابتة. هذا يجعل الصورة صغيرة
(< 30MB) والنشر بدون أي تعقيدات SSR أو Worker.
