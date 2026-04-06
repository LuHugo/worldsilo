import { useState } from 'react';
import { usePlantStore } from '@/store/usePlantStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CardFooter } from './ui/card';

interface AddPlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPlantDialog({ open, onOpenChange }: AddPlantDialogProps) {
  const { addUserSpecies } = usePlantStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🌱');
  const [description, setDescription] = useState('');
  const [idealEc, setIdealEc] = useState('1.5');
  const [totalDays, setTotalDays] = useState('45');
  const [growthRate, setGrowthRate] = useState('2.0');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const ec = parseFloat(idealEc);
    const days = parseInt(totalDays);
    const rate = parseFloat(growthRate);

    if (isNaN(ec) || ec < 0.5 || ec > 4.0) {
      setError('EC must be between 0.5 and 4.0');
      return;
    }

    if (isNaN(days) || days < 1) {
      setError('Growth cycle must be at least 1 day');
      return;
    }

    if (isNaN(rate) || rate < 0.1) {
      setError('Growth rate must be at least 0.1');
      return;
    }

    await addUserSpecies(
      {
        id: `user-${Date.now()}`,
        name: name.trim(),
        icon: icon.trim() || '🌱',
        description: description.trim(),
        ideal_ec: ec,
        ideal_spectrum: [200, 100, 180, 20] as const,
        total_days: days,
        base_growth_rate: rate,
        note: note.trim() || undefined,
      },
      currentUser?.id,
    );

    onOpenChange(false);
    setName('');
    setIcon('🌱');
    setDescription('');
    setIdealEc('1.5');
    setTotalDays('45');
    setGrowthRate('2.0');
    setNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ADD PLANT</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-[48px_1fr] gap-2">
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="h-9 text-center text-lg bg-background border border-border rounded focus:outline-none focus:border-primary"
              maxLength={2}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 px-3 text-sm font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              placeholder="Plant name"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-16 px-3 py-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary resize-none"
            placeholder="Description"
          />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-mono text-muted-foreground mb-1 block">EC (mS/cm)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="4.0"
                value={idealEc}
                onChange={(e) => setIdealEc(e.target.value)}
                className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted-foreground mb-1 block">CYCLE (days)</label>
              <input
                type="number"
                min="1"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted-foreground mb-1 block">GROWTH/day</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              />
            </div>
          </div>

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

          <CardFooter className='justify-end gap-4'>
            <Button variant="outline" type="button" className="font-mono" onClick={() => { onOpenChange(false); navigate({ to: '/plants/database' }); }}>
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
