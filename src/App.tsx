import { useEffect, useState } from 'react';
import { initDB } from './db';
import { useSiloStore } from './store/useSiloStore';
import { AppLayout } from './components/AppLayout';
import './App.css';

function App() {
  const { init, loading } = useSiloStore();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        const db = await initDB();
        await init(db);
        setInitialized(true);
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

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-muted-foreground animate-pulse">INITIALIZING_WORLDSILO...</p>
        </div>
      </div>
    );
  }

  return <AppLayout />;
}

export default App;
