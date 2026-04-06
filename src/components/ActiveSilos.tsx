import { useSiloStore } from '../store/useSiloStore';
import { useNavigate } from '@tanstack/react-router';
import { calculateHealthFromInstance } from '../engine/growth';
import { Sprout, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { PageHeader } from './PageHeader';

export function ActiveSilos() {
  const { instances, species, advanceDay } = useSiloStore();
  const navigate = useNavigate();

  if (instances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-2 border-border rounded-lg flex items-center justify-center mb-4">
          <Sprout className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-mono text-sm text-muted-foreground mb-2">NO ACTIVE SILOS</h2>
        <p className="text-xs text-muted-foreground/60">Visit the Explorer to start your first silo</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <PageHeader
        title="SILOS"
      />

      <div className="max-w-7xl mx-auto px-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instances.map((instance) => {
            const sp = species.find((s) => s.id === instance.species_id);
            if (!sp) return null;

            const health = calculateHealthFromInstance(
              instance.applied_spectrum,
              sp.ideal_spectrum,
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
                onClick={() => navigate({ to: '/silos/$id', params: { id: instance.id } })}
                onAdvance={() => advanceDay(instance.id)}
              />
            );
          })}
        </div>
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
}) {
  const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-blue-400', label: 'COMPLETED' },
    abandoned: { icon: XCircle, color: 'text-red-400', label: 'ABANDONED' },
  };

  const status = statusConfig[instance.status as keyof typeof statusConfig];
  const StatusIcon = status?.icon;

  const healthColor = health >= 80 ? 'text-primary' : health >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <Card
      className="overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{sp.icon}</span>
            <div>
              <h3 className="font-mono text-sm font-semibold text-foreground">{instance.name}</h3>
              <p className="text-xs text-muted-foreground">{sp.name}</p>
            </div>
          </div>
          {status && StatusIcon && (
            <div className={`flex items-center gap-1.5 text-xs font-mono ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-muted-foreground">DAY {instance.current_day}/{sp.total_days}</span>
            <span className={healthColor}>HEALTH: {health}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
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
      </CardContent>
      {instance.status === 'active' && (
        <CardFooter>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAdvance();
            }}
            variant="outline"
            size="sm"
            className="w-full font-mono"
          >
            NEXT DAY
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
