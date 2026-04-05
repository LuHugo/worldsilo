import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSiloStore } from '@/store/useSiloStore';
import { nutrientFormulas } from '@/data/nutrientFormulas';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Droplets, Thermometer, Beaker, ArrowLeft, Check, X } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/formulas_/$id')({
  component: FormulaDetailPage,
});

function FormulaDetailPage() {
  const { id } = Route.useParams();
  const { species } = useSiloStore();
  const navigate = useNavigate();
  const speciesMap = new Map(species.map(s => [s.id, s]));

  const formula = nutrientFormulas.find(f => f.id === id);

  if (!formula) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <div className="text-center py-20">
          <p className="text-muted-foreground font-mono">FORMULA_NOT_FOUND</p>
          <Button variant="outline" className="mt-4 font-mono" onClick={() => navigate({ to: '/formulas' })}>
            ← BACK_TO_FORMULAS
          </Button>
        </div>
      </div>
    );
  }

  const total = formula.n + formula.p + formula.k;
  const nPct = Math.round((formula.n / total) * 100);
  const pPct = Math.round((formula.p / total) * 100);
  const kPct = Math.round((formula.k / total) * 100);

  const categoryColors: Record<string, string> = {
    leafy: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    fruiting: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    herb: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="font-mono"
          onClick={() => navigate({ to: '/formulas' })}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          BACK
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-mono font-bold text-foreground">{formula.name}</h1>
            <Badge variant="outline" className={`text-[10px] font-mono ${categoryColors[formula.category]}`}>
              {formula.category.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{formula.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5">
              <Beaker className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-semibold text-muted-foreground">N-P-K RATIO</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold mb-3">
              {formula.n}-{formula.p}-{formula.k}
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
              <div className="bg-blue-500 transition-all flex items-center justify-center" style={{ width: `${nPct}%` }}>
                {nPct > 15 && <span className="text-[9px] font-mono text-white font-bold">N {nPct}%</span>}
              </div>
              <div className="bg-amber-500 transition-all flex items-center justify-center" style={{ width: `${pPct}%` }}>
                {pPct > 15 && <span className="text-[9px] font-mono text-white font-bold">P {pPct}%</span>}
              </div>
              <div className="bg-emerald-500 transition-all flex items-center justify-center" style={{ width: `${kPct}%` }}>
                {kPct > 15 && <span className="text-[9px] font-mono text-white font-bold">K {kPct}%</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono font-semibold text-muted-foreground">EC RANGE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono font-semibold text-muted-foreground">pH RANGE</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">EC</span>
              <span className="text-lg font-mono font-bold">{formula.ec_range[0]} - {formula.ec_range[1]} <span className="text-xs text-muted-foreground">mS/cm</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">pH</span>
              <span className="text-lg font-mono font-bold">{formula.ph_range[0]} - {formula.ph_range[1]}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Beaker className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-semibold text-muted-foreground">COMPOUND RECIPE</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{formula.macronutrients.length + formula.micronutrients.length} COMPOUNDS</span>
          </div>
        </CardHeader>
        <CardContent>
          <CompoundTable macronutrients={formula.macronutrients} micronutrients={formula.micronutrients} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Beaker className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-semibold text-muted-foreground">COMPATIBLE SPECIES</span>
            </div>
            <Badge variant="outline" className="font-mono">
              {formula.compatible_species.length} SPECIES
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formula.compatible_species.map((cs) => {
              const sp = speciesMap.get(cs.species_id);
              if (!sp) return null;
              return <SpeciesCompatibilityRow key={cs.species_id} species={sp} compatibility={cs.compatibility} />;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompoundTable({ macronutrients, micronutrients }: { macronutrients: any[]; micronutrients: any[] }) {
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 mb-2 px-1">
        <span className="text-[10px] font-mono font-semibold text-muted-foreground">COMPOUND</span>
        <span className="text-[10px] font-mono font-semibold text-muted-foreground text-right">ADD PER LITER</span>
        <span className="text-[10px] font-mono font-semibold text-muted-foreground text-right">PROVIDES</span>
      </div>
      <div className="space-y-1">
        {macronutrients.map((c) => (
          <div key={c.compound} className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-0.5 py-1.5 border-t border-border px-1">
            <div className="min-w-0">
              <div className="text-xs font-mono font-semibold text-foreground truncate">{c.compound}</div>
              <div className="text-[10px] font-mono text-muted-foreground">{c.formula}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-primary">{c.amount_per_liter} mg/L</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-muted-foreground">{c.provides}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <div className="text-[10px] font-mono font-semibold text-muted-foreground mb-2 px-1">MICRONUTRIENTS</div>
        <div className="space-y-1">
          {micronutrients.map((c) => (
            <div key={c.compound} className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-0.5 py-1.5 border-t border-border px-1">
              <div className="min-w-0">
                <div className="text-xs font-mono font-semibold text-foreground truncate">{c.compound}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{c.formula}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-primary">{c.amount_per_liter} mg/L</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-muted-foreground">{c.provides}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpeciesCompatibilityRow({ species, compatibility }: { species: any; compatibility: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(compatibility);

  const color = compatibility >= 85 ? 'text-emerald-500' : compatibility >= 70 ? 'text-amber-500' : 'text-red-500';
  const bgColor = compatibility >= 85 ? 'bg-emerald-500' : compatibility >= 70 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <span className="text-2xl">{species.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-mono font-semibold">{species.name}</span>
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                value={value}
                onChange={(e) => setValue(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-12 h-6 text-xs font-mono text-center bg-background border border-border rounded"
              />
              <button onClick={() => { setEditing(false); }} className="p-0.5 hover:text-foreground text-muted-foreground">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => { setEditing(false); setValue(compatibility); }} className="p-0.5 hover:text-foreground text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className={`text-sm font-mono font-bold ${color} hover:underline`}
            >
              {compatibility}%
            </button>
          )}
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${bgColor} transition-all`} style={{ width: `${editing ? value : compatibility}%` }} />
        </div>
      </div>
    </div>
  );
}
