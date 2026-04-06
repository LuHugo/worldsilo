import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSiloStore } from '@/store/useSiloStore';
import { useFormulaStore } from '@/store/useFormulaStore';
import { useAuthStore } from '@/store/useAuthStore';
import { nutrientFormulas } from '@/data/nutrientFormulas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Droplets, Thermometer, Beaker, Plus, Trash2, AlertTriangle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { AddCompoundDialog } from '@/components/AddCompoundDialog';
import { AddSpeciesDialog } from '@/components/AddSpeciesDialog';

export const Route = createFileRoute('/formulas_/$id')({
  component: FormulaDetailPage,
});

function FormulaDetailPage() {
  const { id } = Route.useParams();
  const { species } = useSiloStore();
  const { userFormulas, addToMyFormulas, deleteUserFormula, addFormulaCompound, loadFormulaCompounds, deleteFormulaCompound, addFormulaSpecies, loadFormulaSpecies, removeFormulaSpecies } = useFormulaStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const speciesMap = new Map(species.map(s => [s.id, s]));

  const [userAddedSpecies, setUserAddedSpecies] = useState<any[]>([]);
  const [showSpeciesDialog, setShowSpeciesDialog] = useState(false);
  const [showCompoundDialog, setShowCompoundDialog] = useState(false);
  const [dbMacronutrients, setDbMacronutrients] = useState<any[]>([]);
  const [dbMicronutrients, setDbMicronutrients] = useState<any[]>([]);

  const allFormulas = [...nutrientFormulas, ...userFormulas];
  const formula = allFormulas.find(f => f.id === id);
  const isSystemFormula = formula?.is_system !== false;
  const isUserFormula = !isSystemFormula;

  useEffect(() => {
    async function load() {
      if (formula) {
        const userSpecies = await loadFormulaSpecies(formula.id);
        setUserAddedSpecies(userSpecies);
      }
    }
    load();
  }, [formula, loadFormulaSpecies]);

  useEffect(() => {
    async function loadCompounds() {
      if (isUserFormula && formula) {
        const compounds = await loadFormulaCompounds(formula.id);
        setDbMacronutrients(compounds.macronutrients);
        setDbMicronutrients(compounds.micronutrients);
      }
    }
    loadCompounds();
  }, [isUserFormula, formula, loadFormulaCompounds]);

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

  const alreadyInMyFormulas = userFormulas.some((f: any) => f.user_id === currentUser?.id && f.name === formula.name && f.is_system === false);

  const total = formula.n + formula.p + formula.k;
  const nPct = Math.round((formula.n / total) * 100);
  const pPct = Math.round((formula.p / total) * 100);
  const kPct = Math.round((formula.k / total) * 100);

  const categoryColors: Record<string, string> = {
    leafy: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    fruiting: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    herb: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  };

  const compatibleSpecies = formula.compatible_species || [];
  const systemSpecies = compatibleSpecies.filter((cs: any) => !cs.from_user);
  const addedSpeciesIds = new Set(userAddedSpecies.map(u => u.species_id));
  const availableSpecies = species.filter(s => !addedSpeciesIds.has(s.id) && !compatibleSpecies.some((cs: any) => cs.species_id === s.id));

  const handleAddSpecies = async (speciesId: string, compatibility: number) => {
    if (!speciesId || !formula) return;
    await addFormulaSpecies(formula.id, speciesId, compatibility);
    const updated = await loadFormulaSpecies(formula.id);
    setUserAddedSpecies(updated);
  };

  const handleRemoveSpecies = async (ufsId: string) => {
    await removeFormulaSpecies(ufsId);
    const updated = await loadFormulaSpecies(formula.id);
    setUserAddedSpecies(updated);
  };

  const handleAddCompound = async (compound: any, isMacro: boolean) => {
    if (!formula) return;
    await addFormulaCompound(formula.id, {
      compound: compound.compound,
      formula: compound.chemicalFormula,
      amount_per_liter: compound.amount_per_liter,
      provides: compound.provides,
      is_macro: isMacro,
    });
    const compounds = await loadFormulaCompounds(formula.id);
    setDbMacronutrients(compounds.macronutrients);
    setDbMicronutrients(compounds.micronutrients);
  };

  const handleDeleteCompound = async (compoundName: string, isMacro: boolean) => {
    if (!formula) return;
    const compounds = isMacro ? dbMacronutrients : dbMicronutrients;
    const compound = compounds.find((c: any) => c.compound === compoundName);
    if (compound && compound.id) {
      await deleteFormulaCompound(compound.id);
    }
    const updated = await loadFormulaCompounds(formula.id);
    setDbMacronutrients(updated.macronutrients);
    setDbMicronutrients(updated.micronutrients);
  };

  const actions = !isSystemFormula ? (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => { deleteUserFormula(formula.id); navigate({ to: '/formulas' }); }}
      className="text-muted-foreground hover:text-red-400 font-mono"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  ) : alreadyInMyFormulas ? (
    <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30">
      <Check className="w-3 h-3 mr-1" />
      IN MY FORMULAS
    </Badge>
  ) : undefined;

  return (
    <div className='min-h-screen'>
      <PageHeader
        title="FORMULA DETAILS"
        backTo="/formulas"
        actions={actions}
      />

      <div className="max-w-7xl mx-auto px-4 p-6">
        <div className='mb-6'>
          <Card>
            <CardHeader className='flex items-center justify-between'>
              <CardTitle className="text-sm font-mono font-semibold">{formula.name}</CardTitle>
              <Badge variant="outline" className={`text-[10px] font-mono ${categoryColors[formula.category]}`}>
                {formula.category.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-mono">{formula.description}</p>
            </CardContent>
          </Card>
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Beaker className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono font-semibold text-muted-foreground">COMPOUND RECIPE</span>
              </div>
              {isUserFormula && (
                <Button variant="ghost" size="icon-sm" onClick={() => setShowCompoundDialog(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const macros = isUserFormula ? dbMacronutrients : formula.macronutrients;
              const micros = isUserFormula ? dbMicronutrients : formula.micronutrients;
              const hasCompounds = macros.length > 0 || micros.length > 0;

              if (!hasCompounds && isUserFormula) {
                return (
                  <Empty className="border border-dashed">
                    <EmptyHeader>
                      <EmptyTitle>NO COMPOUNDS</EmptyTitle>
                      <EmptyDescription>
                        You have not added any compounds to this formula.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button variant="outline" size="sm" onClick={() => setShowCompoundDialog(true)}>
                        ADD COMPOUND
                      </Button>
                    </EmptyContent>
                  </Empty>
                );
              }

              return hasCompounds ? (
                <CompoundTable macronutrients={macros} micronutrients={micros} isUserFormula={isUserFormula} onDeleteCompound={handleDeleteCompound} />
              ) : null;
            })()}
          </CardContent>
        </Card>

        <AddCompoundDialog
          open={showCompoundDialog}
          onOpenChange={setShowCompoundDialog}
          onAdd={handleAddCompound}
        />

        <AddSpeciesDialog
          open={showSpeciesDialog}
          onOpenChange={setShowSpeciesDialog}
          availableSpecies={availableSpecies}
          onAdd={handleAddSpecies}
        />

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5">
              <Beaker className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-semibold text-muted-foreground">COMPATIBLE SPECIES</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-[10px] font-mono font-semibold text-muted-foreground mb-3">SYSTEM RECOMMENDED</div>
              <div className="space-y-2">
                {systemSpecies.map((cs: any) => {
                  const sp = speciesMap.get(cs.species_id);
                  if (!sp) return null;
                  return <SpeciesRow key={cs.species_id} species={sp} compatibility={cs.compatibility} />;
                })}
              </div>
            </div>

            {userAddedSpecies.length > 0 && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-mono font-semibold text-amber-500">USER ADDED (UNVERIFIED)</span>
                </div>
                <div className="space-y-2">
                  {userAddedSpecies.map((ufs) => {
                    const sp = speciesMap.get(ufs.species_id);
                    if (!sp) return null;
                    return (
                      <UserSpeciesRow
                        key={ufs.id}
                        species={sp}
                        compatibility={ufs.compatibility}
                        onRemove={() => handleRemoveSpecies(ufs.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}


            <div className="pt-4 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                className="font-mono text-xs w-full"
                onClick={() => setShowSpeciesDialog(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                ADD SPECIES
              </Button>
            </div>

          </CardContent>
        </Card>

        {isSystemFormula && (
          alreadyInMyFormulas ? (
            <Button
              disabled
              className="w-full font-mono text-emerald-500 border-emerald-500/30"
              variant="outline"
            >
              <Check className="w-4 h-4 mr-2" />
              IN MY FORMULAS
            </Button>
          ) : (
            <Button
              onClick={async () => {
                await addToMyFormulas(formula.id, currentUser?.id);
              }}
              className="w-full font-mono"
            >
              ADD TO MY FORMULAS →
            </Button>
          )
        )}
      </div>
    </div>
  );
}

function CompoundTable({ macronutrients, micronutrients, isUserFormula, onDeleteCompound }: { macronutrients: any[]; micronutrients: any[]; isUserFormula?: boolean; onDeleteCompound?: (compoundName: string, isMacro: boolean) => void }) {
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-1 mb-2 px-1">
        <span className="text-[10px] font-mono font-semibold text-muted-foreground">COMPOUND</span>
        <span className="text-[10px] font-mono font-semibold text-muted-foreground text-right">ADD PER LITER</span>
        <span className="text-[10px] font-mono font-semibold text-muted-foreground text-right">PROVIDES</span>
        {isUserFormula && <span className="w-4" />}
      </div>
      {macronutrients.length > 0 && <div className="space-y-1">
        {macronutrients.map((c) => (
          <div key={c.compound} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-0.5 py-1.5 border-t border-border px-1">
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
            {isUserFormula && onDeleteCompound && (
              <div className="flex items-center justify-end">
                <button onClick={() => onDeleteCompound(c.compound, true)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>}
      {micronutrients.length > 0 && <div className="mt-3 pt-3 border-t border-border">
        <div className="text-[10px] font-mono font-semibold text-muted-foreground mb-2 px-1">MICRONUTRIENTS</div>
        <div className="space-y-1">
          {micronutrients.map((c) => (
            <div key={c.compound} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-0.5 py-1.5 border-t border-border px-1">
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
              {isUserFormula && onDeleteCompound && (
                <div className="flex items-center justify-end">
                  <button onClick={() => onDeleteCompound(c.compound, false)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}

function SpeciesRow({ species, compatibility }: { species: any; compatibility: number }) {
  const color = compatibility >= 85 ? 'text-emerald-500' : compatibility >= 70 ? 'text-amber-500' : 'text-red-500';
  const bgColor = compatibility >= 85 ? 'bg-emerald-500' : compatibility >= 70 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <span className="text-2xl">{species.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-mono font-semibold">{species.name}</span>
          <span className={`text-sm font-mono font-bold ${color}`}>{compatibility}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${bgColor} transition-all`} style={{ width: `${compatibility}%` }} />
        </div>
      </div>
    </div>
  );
}

function UserSpeciesRow({ species, compatibility, onRemove }: { species: any; compatibility: number; onRemove: () => void }) {
  const color = compatibility >= 85 ? 'text-emerald-500' : compatibility >= 70 ? 'text-amber-500' : 'text-red-500';
  const bgColor = compatibility >= 85 ? 'bg-emerald-500' : compatibility >= 70 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
      <span className="text-2xl">{species.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-mono font-semibold">{species.name}</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono font-bold ${color}`}>{compatibility}%</span>
            <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${bgColor} transition-all`} style={{ width: `${compatibility}%` }} />
        </div>
      </div>
    </div>
  );
}
