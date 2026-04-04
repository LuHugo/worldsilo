import { useState } from 'react';
import { Sprout, LayoutDashboard } from 'lucide-react';
import { useSiloStore } from '../store/useSiloStore';
import { Explorer } from './Explorer';
import { ActiveSilos } from './ActiveSilos';
import { GrowthController } from './GrowthController';

export function AppLayout() {
  const { activeTab, setActiveTab, selectedInstance, selectInstance } = useSiloStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (selectedInstance) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => selectInstance(null)}
              className="text-muted-foreground hover:text-primary transition-colors text-sm font-mono"
            >
              ← BACK
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-sm text-primary">SILO_CONTROLLER</span>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <GrowthController instance={selectedInstance} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="font-mono font-bold text-lg tracking-wider">WORLDSILO</span>
              <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 border border-border rounded">v0.1.0</span>
            </div>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('explorer')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-md transition-all ${
                  activeTab === 'explorer'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Sprout className="w-4 h-4" />
                EXPLORER
              </button>
              <button
                onClick={() => setActiveTab('silos')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-md transition-all ${
                  activeTab === 'silos'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                ACTIVE SILOS
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'explorer' && <Explorer onStartSowing={() => setShowCreateModal(true)} />}
        {activeTab === 'silos' && <ActiveSilos />}
      </main>

      {showCreateModal && <CreateModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const { species, createSiloInstance } = useSiloStore();
  const [selectedSpecies, setSelectedSpecies] = useState(species[0]?.id || '');
  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (!selectedSpecies || !name.trim()) return;
    await createSiloInstance(selectedSpecies, name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h2 className="font-mono text-sm text-primary">NEW_SILO_INSTANCE</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">SILO_NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kitchen Window #1"
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">SPECIES</label>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              {species.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-mono border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 text-sm font-mono bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
