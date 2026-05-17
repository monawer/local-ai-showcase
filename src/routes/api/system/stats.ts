import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/system/stats")({
  server: {
    handlers: {
      GET: async () => {
        // Best-effort: works on Node runtimes, gracefully degrades on Workers.
        try {
          const os = await import("node:os").catch(() => null);
          if (!os) {
            return Response.json({ ok: false, available: false });
          }
          const totalMem = os.totalmem();
          const freeMem = os.freemem();
          const loadavg = os.loadavg();
          const cpus = os.cpus();
          return Response.json({
            ok: true,
            available: true,
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            uptime: Math.round(os.uptime()),
            memory: {
              total: totalMem,
              free: freeMem,
              usedPct: Math.round(((totalMem - freeMem) / totalMem) * 100),
            },
            cpu: {
              count: cpus.length,
              model: cpus[0]?.model ?? "unknown",
              load1: loadavg[0] ?? 0,
            },
          });
        } catch (e) {
          return Response.json({
            ok: false,
            available: false,
            error: e instanceof Error ? e.message : "unavailable",
          });
        }
      },
    },
  },
});
