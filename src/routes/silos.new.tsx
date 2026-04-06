import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useSiloStore } from '@/store/useSiloStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Droplets, Clock, Lightbulb, Beaker, ArrowLeft, Sprout } from 'lucide-react';

export const Route = createFileRoute('/silos/new')({
  validateSearch: (search: Record<string, unknown>) => ({
    speciesId: search.speciesId as string | undefined,
  }),
  component: NewSiloPage,
});

function NewSiloPage() {
  const navigate = useNavigate();
  const { species, createSiloInstance } = useSiloStore();
  const { speciesId } = Route.useSearch();
  const [name, setName] = useState('');

  const selected = species.find((s) => s.id === speciesId);

  const handleCreate = async () => {
    if (!speciesId || !name.trim()) return;
    await createSiloInstance(speciesId, name.trim());
    navigate({ to: '/silos' });
  };

  if (!selected) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <p className="font-mono text-muted-foreground mb-4">NO SPECIES SELECTED</p>
        <Button onClick={() => navigate({ to: '/plants' })} className="font-mono">
          BROWSE PLANTS
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/plants' })}
          className="text-muted-foreground hover:text-primary font-mono"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          BACK
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h1 className="text-lg font-mono font-bold text-foreground">NEW_SILO_INSTANCE</h1>
        </div>
      </div>

      {/* Species Preview */}
      <Card className="mb-6 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selected.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="font-mono text-sm text-foreground">{selected.name}</CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">{selected.total_days} DAYS</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="h-1 w-full rounded-full mb-4"
            style={{ backgroundColor: `rgb(${selected.ideal_spectrum[0]}, ${selected.ideal_spectrum[1]}, ${selected.ideal_spectrum[2]})` }}
          />
          <div className="grid grid-cols-4 gap-3">
            <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-2">
              <Droplets className="w-3.5 h-3.5 text-primary" />
              <div>
                <p className="text-[10px] font-mono text-muted-foreground">EC</p>
                <p className="text-sm font-mono text-foreground">{selected.ideal_ec}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-2">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <div>
                <p className="text-[10px] font-mono text-muted-foreground">CYCLE</p>
                <p className="text-sm font-mono text-foreground">{selected.total_days}d</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-2">
              <Lightbulb className="w-3.5 h-3.5 text-primary" />
              <div>
                <p className="text-[10px] font-mono text-muted-foreground">R:G:B:FR</p>
                <p className="text-sm font-mono text-foreground">
                  {selected.ideal_spectrum[0]}:{selected.ideal_spectrum[1]}:{selected.ideal_spectrum[2]}:{selected.ideal_spectrum[3]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-2">
              <Beaker className="w-3.5 h-3.5 text-primary" />
              <div>
                <p className="text-[10px] font-mono text-muted-foreground">GROWTH</p>
                <p className="text-sm font-mono text-foreground">{selected.base_growth_rate}/d</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name the Silo */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-primary" />
            <CardTitle className="font-mono text-sm text-foreground">SILO_NAME</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Kitchen Window #1"
            className="font-mono"
            autoFocus
          />
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: '/plants' })} className="flex-1 font-mono">
            CANCEL
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 font-mono"
          >
            START_SOWING →
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
