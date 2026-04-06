import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSiloStore } from '@/store/useSiloStore';
import { usePlantStore } from '@/store/usePlantStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Clock, Sprout, Trash2, Check, Pencil, X, Save } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';

export const Route = createFileRoute('/plants_/$id')({
  component: SpeciesDetailPage,
});

function SpeciesDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { species } = useSiloStore();
  const { deleteUserSpecies, addToMyPlants, updateUserSpeciesNote } = usePlantStore();
  const { currentUser } = useAuthStore();
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState('');

  const sp = species.find((s) => s.id === id);

  if (!sp) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <p className="font-mono text-muted-foreground mb-4">SPECIES NOT FOUND</p>
        <Button onClick={() => navigate({ to: '/plants' })} className="font-mono">
          BACK TO PLANTS
        </Button>
      </div>
    );
  }

  const isUserSpecies = !sp.is_system;
  const alreadyInMyPlants = species.some(s => s.user_id === currentUser?.id && s.name === sp.name && s.is_system === false);

  const handleSaveNote = async () => {
    await updateUserSpeciesNote(sp.id, noteValue);
    setEditingNote(false);
  };

  const [r, g, b, fr] = sp.ideal_spectrum;
  const rh = Math.round((r / 255) * 100);
  const gh = Math.round((g / 255) * 100);
  const bh = Math.round((b / 255) * 100);
  const frh = Math.round((fr / 255) * 100);
  const rfr = fr > 0 ? (r / fr).toFixed(1) : '∞';

  const actions = isUserSpecies ? (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => { deleteUserSpecies(sp.id); navigate({ to: '/plants' }); }}
      className="text-muted-foreground hover:text-red-400 font-mono"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  ) : alreadyInMyPlants ? (
    <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30">
      <Check className="w-3 h-3 mr-1" />
      IN MY PLANTS
    </Badge>
  ) : undefined;

  return (
    <div className="min-h-screen">
      <PageHeader
        title={sp.name}
        backTo="/plants"
        actions={actions}
      />

      <div className="max-w-7xl mx-auto px-4 p-6 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{sp.icon}</span>
              <div className="flex-1">
                <CardTitle className="font-mono text-lg text-foreground">{sp.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{sp.description}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <span className="text-xs font-mono font-semibold text-muted-foreground">GROWTH PARAMETERS</span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                <Droplets className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground">IDEAL EC</p>
                  <p className="text-sm font-mono font-bold text-foreground">{sp.ideal_ec} mS/cm</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground">GROWTH CYCLE</p>
                  <p className="text-sm font-mono font-bold text-foreground">{sp.total_days} days</p>
                </div>
              </div>
              <div className="col-span-2 bg-muted/50 rounded-md px-3 py-2">
                <p className="text-[10px] font-mono text-muted-foreground">BASE GROWTH RATE</p>
                <p className="text-sm font-mono font-bold text-foreground">{sp.base_growth_rate} biomass/day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-muted-foreground">SPECTRUM PROFILE</span>
              <Badge variant="outline" className="font-mono text-[10px]">R/FR: {rfr}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="w-full h-8 rounded-sm mb-2 border border-border/50"
              style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
            />
            <div className="flex items-end gap-2 h-12">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm transition-all" style={{ height: `${bh}%`, minHeight: 4, backgroundColor: `rgba(59, 130, 246, 0.8)` }} />
                <span className="text-[10px] font-mono text-muted-foreground">B</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm transition-all" style={{ height: `${gh}%`, minHeight: 4, backgroundColor: `rgba(34, 197, 94, 0.8)` }} />
                <span className="text-[10px] font-mono text-muted-foreground">G</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm transition-all" style={{ height: `${rh}%`, minHeight: 4, backgroundColor: `rgba(239, 68, 68, 0.8)` }} />
                <span className="text-[10px] font-mono text-muted-foreground">R</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm transition-all" style={{ height: `${frh}%`, minHeight: 4, backgroundColor: `rgba(251, 113, 133, 0.8)` }} />
                <span className="text-[10px] font-mono text-muted-foreground">FR</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <div className="text-center">
                <p className="text-[9px] font-mono text-blue-400">400-520nm</p>
                <p className="text-[9px] font-mono text-foreground">{b}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-mono text-green-400">520-610nm</p>
                <p className="text-[9px] font-mono text-foreground">{g}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-mono text-red-400">610-720nm</p>
                <p className="text-[9px] font-mono text-foreground">{r}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-mono text-rose-400">720-1000nm</p>
                <p className="text-[9px] font-mono text-foreground">{fr}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isUserSpecies && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-muted-foreground">NOTE</span>
                {!editingNote && (
                  <button onClick={() => { setNoteValue(sp.note || ''); setEditingNote(true); }} className="text-muted-foreground hover:text-primary">
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingNote ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    className="flex-1 h-8 px-2 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
                    placeholder="Add a note..."
                  />
                  <button onClick={handleSaveNote} className="p-1 text-emerald-500 hover:text-emerald-400"><Save className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingNote(false)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <p className="text-xs font-mono text-muted-foreground">{sp.note || 'No note yet'}</p>
              )}
            </CardContent>
          </Card>
        )}

        {sp.is_system ? (
          alreadyInMyPlants ? (
            <Button
              disabled
              className="w-full font-mono text-emerald-500 border-emerald-500/30"
              variant="outline"
            >
              <Check className="w-4 h-4 mr-2" />
              IN MY PLANTS
            </Button>
          ) : (
            <Button
              onClick={async () => {
                await addToMyPlants(sp.id, currentUser?.id);
              }}
              className="w-full font-mono"
            >
              ADD TO MY PLANTS →
            </Button>
          )
        ) : (
          <Button
            onClick={() => navigate({ to: '/silos/new', search: { speciesId: sp.id } })}
            className="w-full font-mono"
          >
            <Sprout className="w-4 h-4 mr-2" />
            START_SOWING →
          </Button>
        )}
      </div>
    </div>
  );
}
