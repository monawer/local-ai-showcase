import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Settings from "./pages/Settings";
import { SettingsProvider } from "./context/SettingsContext";
import { Toaster } from "@/components/ui/sonner";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </SettingsProvider>
    </QueryClientProvider>
  </StrictMode>,
);
