import { Sprout, LayoutDashboard, Beaker, User as UserIcon } from 'lucide-react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface SideNavProps {
  className?: string
}

export function SideNav({ className }: SideNavProps) {
  const matchRoute = useMatchRoute();
  const isPlants = !!matchRoute({ to: '/plants', fuzzy: true });
  const isSilos = !!matchRoute({ to: '/silos', fuzzy: true });
  const isFormulas = !!matchRoute({ to: '/formulas', fuzzy: true });
  const isUser = !!matchRoute({ to: '/user', fuzzy: true });

  const navItems = [
    { to: '/plants' as const, label: 'Plants', icon: Sprout, active: isPlants },
    { to: '/silos' as const, label: 'Silos', icon: LayoutDashboard, active: isSilos },
    { to: '/formulas' as const, label: 'Formulas', icon: Beaker, active: isFormulas },
    { to: '/user' as const, label: 'User', icon: UserIcon, active: isUser },
  ];

  return (
    <nav className={cn("w-56 bg-card/95 backdrop-blur-sm border-border flex flex-col shrink-0", className)}>
      <div className="px-4 py-4">WORLDSILO
      </div>

      <div className="flex-1 flex flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon, active }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-sm font-mono">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
