import { Sprout, LayoutDashboard, Settings, Beaker } from 'lucide-react';
import { Link, useMatchRoute } from '@tanstack/react-router';

export function BottomNav() {
  const matchRoute = useMatchRoute();
  const isExplorer = !!matchRoute({ to: '/explorer', fuzzy: true });
  const isSilos = !!matchRoute({ to: '/silos', fuzzy: true });
  const isFormulas = !!matchRoute({ to: '/formulas', fuzzy: true });
  const isSettings = !!matchRoute({ to: '/settings', fuzzy: true });

  return (
    <nav className="bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        <Link
          to="/explorer"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            isExplorer ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sprout className="w-5 h-5" />
          <span className="text-[10px] font-mono">EXPLORER</span>
        </Link>

        <Link
          to="/silos"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            isSilos ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-mono">SILOS</span>
        </Link>

        <Link
          to="/formulas"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            isFormulas ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Beaker className="w-5 h-5" />
          <span className="text-[10px] font-mono">FORMULAS</span>
        </Link>

        <Link
          to="/settings"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            isSettings ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-mono">SETTINGS</span>
        </Link>
      </div>
    </nav>
  );
}
