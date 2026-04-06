import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CompoundIngredient } from '@/types';

interface AddCompoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (compound: Omit<CompoundIngredient, 'formula'> & { chemicalFormula: string }, isMacro: boolean) => void;
}

export function AddCompoundDialog({ open, onOpenChange, onAdd }: AddCompoundDialogProps) {
  const [isMacro, setIsMacro] = useState(true);
  const [name, setName] = useState('');
  const [chemicalFormula, setChemicalFormula] = useState('');
  const [amount, setAmount] = useState('');
  const [provides, setProvides] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setIsMacro(true);
    setName('');
    setChemicalFormula('');
    setAmount('');
    setProvides('');
    setError('');
  };

  const handleSubmit = () => {
    setError('');

    if (!name.trim()) {
      setError('Compound name is required');
      return;
    }

    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    onAdd(
      {
        compound: name.trim(),
        chemicalFormula: chemicalFormula.trim(),
        amount_per_liter: amountVal,
        provides: provides.trim(),
      },
      isMacro
    );

    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ADD COMPOUND</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsMacro(true)}
              className={`flex-1 h-8 text-xs font-mono rounded border transition-all ${
                isMacro
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30'
              }`}
            >
              COMPOUND
            </button>
            <button
              type="button"
              onClick={() => setIsMacro(false)}
              className={`flex-1 h-8 text-xs font-mono rounded border transition-all ${
                !isMacro
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/30'
              }`}
            >
              MICRONUTRIENT
            </button>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">COMPOUND NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 text-sm font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              placeholder="e.g. Calcium Nitrate"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">CHEMICAL FORMULA</label>
            <input
              type="text"
              value={chemicalFormula}
              onChange={(e) => setChemicalFormula(e.target.value)}
              className="w-full h-9 px-3 text-sm font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              placeholder="e.g. Ca(NO₃)₂·4H₂O"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">AMOUNT PER LITER (mg/L)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-9 px-3 text-sm font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              placeholder="e.g. 470"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">PROVIDES</label>
            <input
              type="text"
              value={provides}
              onChange={(e) => setProvides(e.target.value)}
              className="w-full h-9 px-3 text-sm font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              placeholder="e.g. Ca, N"
            />
          </div>
        </div>

        {error && <p className="text-xs font-mono text-red-400">{error}</p>}

        <DialogFooter>
          <Button variant="outline" className="font-mono" onClick={() => handleOpenChange(false)}>
            CANCEL
          </Button>
          <Button className="font-mono" onClick={handleSubmit}>
            ADD
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
