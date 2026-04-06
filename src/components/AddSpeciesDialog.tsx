import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxContent, ComboboxInput } from '@/components/ui/combobox';
import { Slider } from '@/components/ui/slider';
import { InputGroupAddon } from './ui/input-group';

interface AddSpeciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSpecies: any[];
  onAdd: (speciesId: string, compatibility: number) => void;
}

export function AddSpeciesDialog({ open, onOpenChange, availableSpecies, onAdd }: AddSpeciesDialogProps) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('');
  const [compatibilityValue, setCompatibilityValue] = useState(50);
  const [error, setError] = useState('');

  const resetForm = () => {
    setSelectedSpeciesId('');
    setCompatibilityValue(50);
    setError('');
  };

  const handleSubmit = () => {
    setError('');

    if (!selectedSpeciesId) {
      setError('Please select a species');
      return;
    }

    onAdd(selectedSpeciesId, compatibilityValue);
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
          <DialogTitle>ADD SPECIES</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">SPECIES</label>
            <Combobox items={availableSpecies} itemToStringLabel={() => availableSpecies.find(s => s.id === selectedSpeciesId)?.name} value={selectedSpeciesId} onValueChange={(v) => setSelectedSpeciesId(v as string)}>
              <ComboboxInput placeholder='Search...'>
                <InputGroupAddon>
                  <span>{availableSpecies.find(s => s.id === selectedSpeciesId)?.icon}</span>
                </InputGroupAddon>
              </ComboboxInput>
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {availableSpecies.map(s => (
                    <ComboboxItem key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div>
            <label className="text-[10px] font-mono text-muted-foreground mb-1 block">COMPATIBILITY: {compatibilityValue}%</label>
            <Slider
              value={[compatibilityValue]}
              onValueChange={(v) => setCompatibilityValue(Array.isArray(v) ? v[0] : v)}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>

        {error && <p className="text-xs font-mono text-red-400">{error}</p>}

        <DialogFooter>
          <Button variant="outline" className="font-mono" onClick={() => handleOpenChange(false)}>
            CANCEL
          </Button>
          <Button className="font-mono" onClick={handleSubmit} disabled={!selectedSpeciesId}>
            ADD
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
