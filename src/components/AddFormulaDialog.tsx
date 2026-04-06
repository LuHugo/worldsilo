import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useFormulaStore } from '@/store/useFormulaStore';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CardFooter } from './ui/card';

interface AddFormulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFormulaDialog({ open, onOpenChange }: AddFormulaDialogProps) {
  const { currentUser } = useAuthStore();
  const { addUserFormula } = useFormulaStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'leafy' | 'fruiting' | 'herb'>('leafy');
  const [n, setN] = useState('3');
  const [p, setP] = useState('1');
  const [k, setK] = useState('4');
  const [ecMin, setEcMin] = useState('1.0');
  const [ecMax, setEcMax] = useState('2.4');
  const [phMin, setPhMin] = useState('5.5');
  const [phMax, setPhMax] = useState('7.0');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const ecMinVal = parseFloat(ecMin);
    const ecMaxVal = parseFloat(ecMax);
    const phMinVal = parseFloat(phMin);
    const phMaxVal = parseFloat(phMax);
    const nVal = parseInt(n);
    const pVal = parseInt(p);
    const kVal = parseInt(k);

    if (isNaN(ecMinVal) || isNaN(ecMaxVal) || ecMinVal >= ecMaxVal) {
      setError('EC range must be valid (min < max)');
      return;
    }

    if (isNaN(phMinVal) || isNaN(phMaxVal) || phMinVal >= phMaxVal) {
      setError('pH range must be valid (min < max)');
      return;
    }

    if (isNaN(nVal) || isNaN(pVal) || isNaN(kVal) || nVal < 0 || pVal < 0 || kVal < 0) {
      setError('N-P-K values must be non-negative numbers');
      return;
    }

    await addUserFormula(
      {
        id: `formula-${Date.now()}`,
        name: name.trim(),
        category,
        n: nVal,
        p: pVal,
        k: kVal,
        ecMin: ecMinVal,
        ecMax: ecMaxVal,
        phMin: phMinVal,
        phMax: phMaxVal,
        description: description.trim(),
        note: note.trim() || undefined,
      },
      currentUser?.id,
    );

    onOpenChange(false);
    setName('');
    setCategory('leafy');
    setN('3');
    setP('1');
    setK('4');
    setEcMin('1.0');
    setEcMax('2.4');
    setPhMin('5.5');
    setPhMax('7.0');
    setDescription('');
    setNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ADD FORMULA</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-9 px-3 text-sm font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
            placeholder="Formula name"
          />

          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">CATEGORY</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'leafy' as const, label: 'Leafy' },
                { value: 'fruiting' as const, label: 'Fruiting' },
                { value: 'herb' as const, label: 'Herb' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`h-8 text-xs font-mono rounded border transition-all ${category === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">N-P-K RATIO</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="0"
                value={n}
                onChange={(e) => setN(e.target.value)}
                className="h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
                placeholder="N"
              />
              <input
                type="number"
                min="0"
                value={p}
                onChange={(e) => setP(e.target.value)}
                className="h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
                placeholder="P"
              />
              <input
                type="number"
                min="0"
                value={k}
                onChange={(e) => setK(e.target.value)}
                className="h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
                placeholder="K"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground mb-1 block">EC RANGE</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={ecMin}
                  onChange={(e) => setEcMin(e.target.value)}
                  className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
                  placeholder="Min"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <input
                  type="number"
                  step="0.1"
                  value={ecMax}
                  onChange={(e) => setEcMax(e.target.value)}
                  className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted-foreground mb-1 block">pH RANGE</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={phMin}
                  onChange={(e) => setPhMin(e.target.value)}
                  className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
                  placeholder="Min"
                />
                <span className="text-xs text-muted-foreground">-</span>
                <input
                  type="number"
                  step="0.1"
                  value={phMax}
                  onChange={(e) => setPhMax(e.target.value)}
                  className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-16 px-3 py-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary resize-none"
            placeholder="Description"
          />

          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">NOTE (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-8 px-3 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              placeholder="Add a note..."
            />
          </div>

          {error && <p className="text-xs font-mono text-red-400">{error}</p>}

          <CardFooter className='flex justify-end gap-4'>
            <Button type='button' variant="outline" className="font-mono" onClick={() => { onOpenChange(false); navigate({ to: '/formulas/database' }); }}>
              ADD FROM DATABASE
            </Button>
            <Button type="submit" className="font-mono">
              SAVE
            </Button>
          </CardFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
