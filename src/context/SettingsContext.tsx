import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ServiceCfg = {
  url: string;
  apiKey?: string;
  enabled: boolean;
};

export type N8nCfg = ServiceCfg & { webhookBase?: string };
export type SupabaseCfg = ServiceCfg & { anonKey?: string };

export type CustomLink = {
  id: string;
  label: string;
  url: string;
  icon?: string;
  openInNewTab: boolean;
};

export type Settings = {
  services: {
    ollama: ServiceCfg;
    n8n: N8nCfg;
    supabase: SupabaseCfg;
  };
  customLinks: CustomLink[];
  refreshIntervalSec: number;
};

const STORAGE_KEY = "lovable.settings.v1";

const envDefaults: Settings = {
  services: {
    ollama: {
      // افتراضيًا نمرّ عبر بروكسي nginx (same-origin) لتجنّب CORS
      url: import.meta.env.VITE_OLLAMA_URL ?? "/proxy/ollama",
      enabled: true,
    },
    n8n: {
      url: import.meta.env.VITE_N8N_URL ?? "/proxy/n8n",
      webhookBase:
        import.meta.env.VITE_N8N_WEBHOOK_BASE ??
        (import.meta.env.VITE_N8N_URL
          ? `${import.meta.env.VITE_N8N_URL}/webhook`
          : "/proxy/n8n/webhook"),
      apiKey: import.meta.env.VITE_N8N_API_KEY ?? "",
      enabled: true,
    },
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL ?? "/proxy/supabase",
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
      enabled: true,
    },
  },
  customLinks: [
    {
      id: "n8n-studio",
      label: "n8n Studio",
      url: "http://n8n.localhost",
      icon: "Workflow",
      openInNewTab: true,
    },
    {
      id: "supabase-studio",
      label: "Supabase Studio",
      url: "http://supabase.localhost",
      icon: "Database",
      openInNewTab: true,
    },
    {
      id: "portainer",
      label: "Portainer",
      url: "http://portainer.localhost",
      icon: "Container",
      openInNewTab: true,
    },
  ],
  refreshIntervalSec: 15,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return envDefaults;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      services: {
        ollama: { ...envDefaults.services.ollama, ...parsed.services?.ollama },
        n8n: { ...envDefaults.services.n8n, ...parsed.services?.n8n },
        supabase: {
          ...envDefaults.services.supabase,
          ...parsed.services?.supabase,
        },
      },
      customLinks: parsed.customLinks ?? envDefaults.customLinks,
      refreshIntervalSec:
        parsed.refreshIntervalSec ?? envDefaults.refreshIntervalSec,
    };
  } catch {
    return envDefaults;
  }
}

type Ctx = {
  settings: Settings;
  setSettings: (s: Settings) => void;
  update: (patch: (s: Settings) => Settings) => void;
  reset: () => void;
};

const SettingsContext = createContext<Ctx | null>(null);

let externalSnapshot: Settings = envDefaults;
export function getSettingsSnapshot() {
  return externalSnapshot;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => {
    const s = loadSettings();
    externalSnapshot = s;
    return s;
  });

  useEffect(() => {
    externalSnapshot = settings;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota */
    }
  }, [settings]);

  const setSettings = useCallback((s: Settings) => setSettingsState(s), []);
  const update = useCallback(
    (patch: (s: Settings) => Settings) =>
      setSettingsState((prev) => patch(prev)),
    [],
  );
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettingsState(envDefaults);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ settings, setSettings, update, reset }),
    [settings, setSettings, update, reset],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
