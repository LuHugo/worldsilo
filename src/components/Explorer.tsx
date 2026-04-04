import { useSiloStore } from '../store/useSiloStore';
import { Beaker, Droplets, Lightbulb, Clock } from 'lucide-react';

interface ExplorerProps {
  onStartSowing: () => void;
}

export function Explorer({ onStartSowing }: ExplorerProps) {
  const { species, loading } = useSiloStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-muted-foreground">INITIALIZING_DATABASE...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-mono font-bold text-foreground">SILO_EXPLORER</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse available species presets</p>
        </div>
        <span className="text-xs font-mono text-muted-foreground px-2 py-1 border border-border rounded">
          {species.length} SPECIES
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {species.map((sp) => (
          <SpeciesCard key={sp.id} species={sp} onStartSowing={onStartSowing} />
        ))}
      </div>
    </div>
  );
}

function SpeciesCard({ species: sp, onStartSowing }: { species: any; onStartSowing: () => void }) {
  const spectrumColor = `rgb(${sp.ideal_spectrum_rgb[0]}, ${sp.ideal_spectrum_rgb[1]}, ${sp.ideal_spectrum_rgb[2]})`;

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all">
      <div
        className="h-2 w-full"
        style={{ backgroundColor: spectrumColor, opacity: 0.6 }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{sp.icon}</span>
            <div>
              <h3 className="font-mono text-sm font-semibold text-foreground">{sp.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{sp.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-1.5">
            <Droplets className="w-3 h-3 text-primary" />
            <div>
              <p className="text-[10px] font-mono text-muted-foreground">EC</p>
              <p className="text-xs font-mono text-foreground">{sp.ideal_ec}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-1.5">
            <Clock className="w-3 h-3 text-primary" />
            <div>
              <p className="text-[10px] font-mono text-muted-foreground">CYCLE</p>
              <p className="text-xs font-mono text-foreground">{sp.total_days}d</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-1.5">
            <Lightbulb className="w-3 h-3 text-primary" />
            <div>
              <p className="text-[10px] font-mono text-muted-foreground">SPECTRUM</p>
              <p className="text-xs font-mono text-foreground">
                R:{sp.ideal_spectrum_rgb[0]} G:{sp.ideal_spectrum_rgb[1]} B:{sp.ideal_spectrum_rgb[2]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-1.5">
            <Beaker className="w-3 h-3 text-primary" />
            <div>
              <p className="text-[10px] font-mono text-muted-foreground">GROWTH</p>
              <p className="text-xs font-mono text-foreground">{sp.base_growth_rate}/d</p>
            </div>
          </div>
        </div>

        <button
          onClick={onStartSowing}
          className="w-full px-4 py-2 text-xs font-mono bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors"
        >
          START_SOWING →
        </button>
      </div>
    </div>
  );
}
