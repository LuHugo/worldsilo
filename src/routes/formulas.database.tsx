import { createFileRoute } from '@tanstack/react-router';
import { useFormulaStore } from '@/store/useFormulaStore';
import { useAuthStore } from '@/store/useAuthStore';
import { nutrientFormulas } from '@/data/nutrientFormulas';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Thermometer, Check } from 'lucide-react';
import { type SpeciesCategory } from '@/types';
import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CategoryTabs } from '@/components/CategoryTabs';

export const Route = createFileRoute('/formulas/database')({
  component: FormulaDatabasePage,
});

function FormulaDatabasePage() {
  const { userFormulas, addToMyFormulas } = useFormulaStore();
  const { currentUser } = useAuthStore();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<SpeciesCategory | 'all'>('all');

  const filteredFormulas = activeCategory === 'all'
    ? nutrientFormulas
    : nutrientFormulas.filter(f => f.category === activeCategory);

  const handleAdd = async (formula: any) => {
    const success = await addToMyFormulas(formula.id, currentUser?.id);
    if (success) {
      setAddedIds(prev => new Set(prev).add(formula.id));
    }
  };

  const isAlreadyAdded = (formula: any) => {
    return addedIds.has(formula.id) || userFormulas.some((f: any) => f.user_id === currentUser?.id && f.name === formula.name && f.is_system === false);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="FORMULA DATABASE"
        backTo="/formulas"
        actions={
          <Badge variant="outline" className="font-mono">
            {nutrientFormulas.length} FORMULAS
          </Badge>
        }
      />

      <div className="max-w-7xl mx-auto px-4 p-6">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          getCount={(key) => key === 'all' ? nutrientFormulas.length : nutrientFormulas.filter(f => f.category === key).length}
        />

        {filteredFormulas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFormulas.map((formula) => {
              const alreadyAdded = isAlreadyAdded(formula);
              const total = formula.n + formula.p + formula.k;
              const nPct = Math.round((formula.n / total) * 100);
              const pPct = Math.round((formula.p / total) * 100);
              const kPct = Math.round((formula.k / total) * 100);

              return (
                <Card
                  key={formula.id}
                  className="overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-sm font-semibold text-foreground">{formula.name}</h3>
                          {alreadyAdded && (
                            <Badge variant="outline" className="text-[9px] font-mono text-emerald-500 border-emerald-500/30">
                              <Check className="w-3 h-3 mr-0.5" />
                              ADDED
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">N-P-K {formula.n}-{formula.p}-{formula.k}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                      <div className="bg-blue-500 transition-all" style={{ width: `${nPct}%` }} />
                      <div className="bg-amber-500 transition-all" style={{ width: `${pPct}%` }} />
                      <div className="bg-emerald-500 transition-all" style={{ width: `${kPct}%` }} />
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
                    {alreadyAdded ? (
                      <Button
                        disabled
                        variant="outline"
                        size="sm"
                        className="w-full font-mono text-emerald-500 border-emerald-500/30"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        IN MY FORMULAS
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleAdd(formula)}
                        variant="outline"
                        size="sm"
                        className="w-full font-mono"
                      >
                        ADD TO MY FORMULAS
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground font-mono">No formulas in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
