import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { initDB } from './db';
import { useSiloStore } from './store/useSiloStore';
import { useAuthStore } from './store/useAuthStore';
import { useUsertore } from './store/useUserStore';
import { ThemeProvider } from './components/theme-provider';
import './App.css';

function App() {
  const { init, loading: siloLoading } = useSiloStore();
  const { init: initAuth, loading: authLoading } = useAuthStore();
  const { init: initSettings } = useUsertore();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        const db = await initDB();
        await init(db);
        await initAuth(db);
        initSettings(db);
        router.update({
          ...router.options,
          context: { db },
        });
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to initialize');
      }
    }
    bootstrap();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-4 animate-pulse" />
          <h1 className="font-mono text-sm text-red-400 mb-2">INITIALIZATION_FAILED</h1>
          <p className="text-xs font-mono text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready || siloLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-muted-foreground animate-pulse">INITIALIZING_WORLDSILO...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="worldsilo-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
