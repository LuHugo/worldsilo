import { useSiloStore } from '../store/useSiloStore';
import { calculateHealthFromInstance } from '../engine/growth';
import { Play, Sprout, CheckCircle, XCircle } from 'lucide-react';

export function ActiveSilos() {
  const { instances, species, selectInstance, advanceDay, autoAdvance, setAutoAdvance } = useSiloStore();

  if (instances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-2 border-border rounded-lg flex items-center justify-center mb-4">
          <Sprout className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-mono text-sm text-muted-foreground mb-2">NO_ACTIVE_SILOS</h2>
        <p className="text-xs text-muted-foreground/60">Visit the Explorer to start your first silo</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-mono font-bold text-foreground">ACTIVE_SILOS</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor and manage your growing instances</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="accent-primary"
            />
            AUTO_ADVANCE
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {instances.map((instance) => {
          const sp = species.find((s) => s.id === instance.species_id);
          if (!sp) return null;

          const health = calculateHealthFromInstance(
            instance.applied_rgb,
            sp.ideal_spectrum_rgb,
            instance.applied_ec,
            sp.ideal_ec,
          );

          const progress = Math.min(100, (instance.current_day / sp.total_days) * 100);

          return (
            <SiloCard
              key={instance.id}
              instance={instance}
              species={sp}
              health={health}
              progress={progress}
              onClick={() => selectInstance(instance)}
              onAdvance={() => advanceDay(instance.id)}
              autoAdvance={autoAdvance}
            />
          );
        })}
      </div>
    </div>
  );
}

function SiloCard({
  instance,
  species: sp,
  health,
  progress,
  onClick,
  onAdvance,
}: {
  instance: any;
  species: any;
  health: number;
  progress: number;
  onClick: () => void;
  onAdvance: () => void;
  autoAdvance: boolean;
}) {
  const statusConfig = {
    active: { icon: Play, color: 'text-primary', label: 'RUNNING' },
    completed: { icon: CheckCircle, color: 'text-blue-400', label: 'COMPLETED' },
    abandoned: { icon: XCircle, color: 'text-red-400', label: 'ABANDONED' },
  };

  const status = statusConfig[instance.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  const healthColor = health >= 80 ? 'text-primary' : health >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{sp.icon}</span>
            <div>
              <h3 className="font-mono text-sm font-semibold text-foreground">{instance.name}</h3>
              <p className="text-xs text-muted-foreground">{sp.name}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-mono ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-muted-foreground">DAY {instance.current_day}/{sp.total_days}</span>
            <span className={healthColor}>HEALTH: {health}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-muted/50 rounded px-2 py-1.5 text-center">
            <p className="text-[10px] font-mono text-muted-foreground">BIOMASS</p>
            <p className="text-sm font-mono text-foreground">{instance.current_biomass.toFixed(1)}</p>
          </div>
          <div className="bg-muted/50 rounded px-2 py-1.5 text-center">
            <p className="text-[10px] font-mono text-muted-foreground">EC</p>
            <p className="text-sm font-mono text-foreground">{instance.applied_ec.toFixed(1)}</p>
          </div>
          <div className="bg-muted/50 rounded px-2 py-1.5 text-center">
            <p className="text-[10px] font-mono text-muted-foreground">GROWTH</p>
            <p className="text-sm font-mono text-foreground">{sp.base_growth_rate}/d</p>
          </div>
        </div>

        {instance.status === 'active' && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdvance();
              }}
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors"
            >
              NEXT_DAY →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
