export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10 bg-background/40">
      <div className="container mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          <span className="font-mono text-primary">local-ai-server</span> · يعمل
          بدون اتصال بالإنترنت
        </div>
        <div className="flex items-center gap-5">
          <a
            href="http://localhost:5678"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            n8n Studio
          </a>
          <a
            href="http://localhost:8000"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Supabase Studio
          </a>
          <a
            href="http://localhost:11434"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Ollama API
          </a>
        </div>
      </div>
    </footer>
  );
}
