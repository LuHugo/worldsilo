import { useSiloStore } from '../store/useSiloStore';
import { nutrientFormulas } from '@/data/nutrientFormulas';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Droplets, Thermometer, Beaker } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export function Formulas() {
  const { species, loading } = useSiloStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-muted-foreground">LOADING_FORMULAS...</p>
        </div>
      </div>
    );
  }

  const speciesMap = new Map(species.map(s => [s.id, s]));

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-mono font-bold text-foreground">NUTRIENT_FORMULAS</h1>
          <p className="text-sm text-muted-foreground mt-1">Nutrient solution recipes with species compatibility</p>
        </div>
        <Badge variant="outline" className="font-mono">
          {nutrientFormulas.length} FORMULAS
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nutrientFormulas.map((formula) => (
          <FormulaCard key={formula.id} formula={formula} speciesMap={speciesMap} />
        ))}
      </div>
    </div>
  );
}

function FormulaCard({ formula, speciesMap }: { formula: any; speciesMap: Map<string, any> }) {
  const navigate = useNavigate();
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
    <Card
      className="overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => navigate({ to: '/formulas/$id', params: { id: formula.id } })}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-mono text-sm font-semibold text-foreground">{formula.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">N-P-K {formula.n}-{formula.p}-{formula.k}</p>
          </div>
          <Badge variant="outline" className={`text-[10px] font-mono ${categoryColors[formula.category]}`}>
            {formula.category.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex h-3 rounded-full overflow-hidden bg-muted">
          <div className="bg-blue-500 transition-all" style={{ width: `${nPct}%` }} title={`N: ${nPct}%`} />
          <div className="bg-amber-500 transition-all" style={{ width: `${pPct}%` }} title={`P: ${pPct}%`} />
          <div className="bg-emerald-500 transition-all" style={{ width: `${kPct}%` }} title={`K: ${kPct}%`} />
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">EC</span>
            <span>{formula.ec_range[0]}-{formula.ec_range[1]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">pH</span>
            <span>{formula.ph_range[0]}-{formula.ph_range[1]}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Beaker className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono font-semibold text-muted-foreground">COMPATIBLE SPECIES</span>
          </div>
          <div className="space-y-1.5">
            {formula.compatible_species.map((cs: any) => {
              const sp = speciesMap.get(cs.species_id);
              if (!sp) return null;
              return (
                <div key={cs.species_id} className="flex items-center gap-2">
                  <span className="text-sm">{sp.icon}</span>
                  <span className="text-xs flex-1 truncate">{sp.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cs.compatibility >= 85 ? 'bg-emerald-500' :
                          cs.compatibility >= 70 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${cs.compatibility}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{cs.compatibility}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
