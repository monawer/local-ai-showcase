# Ollama خارج Docker — لا تغييرات على الكود

الإعداد الحالي صحيح لحالتك: المتصفح على نفس جهاز ويندوز، لذا `VITE_OLLAMA_URL=http://localhost:11434` يصل مباشرة إلى Ollama على الهوست بدون أي وسيط. **لا حاجة لتعديل ملفات المشروع.**

المتطلب الوحيد المتبقي: تفعيل CORS في Ollama، وإلا المتصفح سيرفض الاستجابة (وهذا سبب `Failed to fetch` الحالي في `/api/tags`).

## خطوات تفعيل CORS على ويندوز

افتح **PowerShell كمسؤول** ونفّذ:

```powershell
setx OLLAMA_ORIGINS "*" /M
setx OLLAMA_HOST "0.0.0.0:11434" /M
```

ثم أعد تشغيل خدمة Ollama:
- أيقونة Ollama في الـ system tray → Quit
- شغّلها من قائمة Start مجدداً

أو من PowerShell:
```powershell
Get-Process ollama | Stop-Process -Force
Start-Process "ollama" -ArgumentList "serve"
```

## التحقق

من المتصفح على نفس الجهاز:
```
http://localhost:11434/api/tags
```
يجب أن ترجع JSON بقائمة الموديلات. إذا نجحت، الواجهة في `http://ai.localhost` ستظهر Ollama كـ Online مباشرة.

## ملاحظات

- `VITE_OLLAMA_URL` يبقى `http://localhost:11434` في Portainer Stack Environment.
- إذا لاحقاً أردت الوصول من جهاز آخر في الشبكة، نضيف خطوة لاستبدال القيمة بـ `http://<IP-ويندوز>:11434` ونفتح المنفذ في Windows Firewall.
- داخل الحاوية (لو احتجنا لاحقاً sidecar يتحدث مع Ollama)، نستخدم `http://host.docker.internal:11434` — لكن غير مطلوب الآن لأن الاتصال من المتصفح مباشرة.
