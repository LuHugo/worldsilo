import { useState } from 'react';
import { useFormulaStore } from '../store/useFormulaStore';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardContent, CardHeader } from './ui/card';
import { Droplets, Thermometer, Plus, Database } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from './ui/button';
import { AddFormulaDialog } from './AddFormulaDialog';
import { PageHeader } from './PageHeader';

export function Formulas() {
  const { userFormulas } = useFormulaStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const myFormulas = userFormulas.filter((f: any) => f.is_system === false && (f.user_id === currentUser?.id || !f.user_id));

  return (
    <div className='min-h-screen'>
      <PageHeader
        title="MY FORMULAS"
        actions={
          <>
            <Button size="icon-sm" variant="outline" className="font-mono" onClick={() => navigate({ to: '/formulas/database' })}>
              <Database className="w-3.5 h-3.5" />
              
            </Button>
            <Button size="icon-sm" className="font-mono" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-3.5 h-3.5" />
              
            </Button>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 p-6">
        {myFormulas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myFormulas.map((formula) => (
              <MyFormulaCard key={formula.id} formula={formula} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-mono mb-1">No formulas yet</p>
            <p className="text-xs text-muted-foreground mb-4">Add formulas from the database or create your own</p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" className="font-mono" onClick={() => navigate({ to: '/formulas/database' })}>
                <Database className="w-3.5 h-3.5 mr-1" />
                BROWSE DATABASE
              </Button>
              <Button size="sm" className="font-mono" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                CREATE NEW
              </Button>
            </div>
          </div>
        )}
      </div>

      <AddFormulaDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}

function MyFormulaCard({ formula }: { formula: any }) {
  const navigate = useNavigate();
  const total = formula.n + formula.p + formula.k;
  const nPct = Math.round((formula.n / total) * 100);
  const pPct = Math.round((formula.p / total) * 100);
  const kPct = Math.round((formula.k / total) * 100);

  return (
    <Card
      className="overflow-hidden hover:border-amber-500/30 transition-all cursor-pointer border-amber-500/20"
      onClick={() => navigate({ to: '/formulas/$id', params: { id: formula.id } })}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-semibold text-foreground">{formula.name}</h3>
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
        <div className="flex gap-2 pt-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: '/formulas/$id', params: { id: formula.id } });
            }}
            variant="outline"
            size="sm"
            className="flex-1 font-mono"
          >
            VIEW
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
