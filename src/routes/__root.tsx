import { createRootRouteWithContext, Outlet, useMatchRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { SideNav } from '@/components/SideNav';
import { useThemeStore, ACCENT_THEMES } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { RouterContext } from '@/router';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const matchRoute = useMatchRoute();
  const { accentColor, navPosition } = useThemeStore();
  const { loading } = useAuthStore();
  const isLoginPage = !!matchRoute({ to: '/login' });

  useEffect(() => {
    const theme = ACCENT_THEMES[accentColor];
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    theme.chart.forEach((c, i) => {
      root.style.setProperty(`--chart-${i + 1}`, c);
    });
  }, [accentColor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-muted-foreground animate-pulse">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <div className="h-screen bg-background text-foreground flex flex-col min-h-0">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  if (navPosition === 'left') {
    return (
      <div className="h-screen bg-background text-foreground flex min-h-0">
        <SideNav className='border-r' />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  if (navPosition === 'right') {
    return (
      <div className="h-screen bg-background text-foreground flex min-h-0">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <SideNav className='border-l' />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col min-h-0">
      <main className="flex-1 overflow-auto pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
