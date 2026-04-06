import { useState } from 'react';
import { useSiloStore } from '../store/useSiloStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AddPlantDialog } from './AddPlantDialog';
import { PageHeader } from './PageHeader';

export function Plants() {
  const { species, loading } = useSiloStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-muted-foreground">INITIALIZING_DATABASE...</p>
        </div>
      </div>
    );
  }

  const myPlants = species.filter(s => s.is_system === false && (s.user_id === currentUser?.id || !s.user_id));

  return (
    <div className='min-h-screen'>
      <PageHeader
        title="MY PLANTS"
        actions={
          <>
            <Button size="icon-sm" variant="outline" className="font-mono" onClick={() => navigate({ to: '/plants/database' })}>
              <Database className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon-sm" className="font-mono" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </>
        }
      />

      <div className="max-w-7xl mx-auto px-4 p-6">
        {myPlants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPlants.map((sp) => (
              <MyPlantCard key={sp.id} species={sp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-mono mb-1">No plants yet</p>
            <p className="text-xs text-muted-foreground mb-4">Add plants from the database or create your own</p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" className="font-mono" onClick={() => navigate({ to: '/plants/database' })}>
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

      <AddPlantDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}

function MyPlantCard({ species: sp }: { species: any }) {
  const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden hover:border-amber-500/30 transition-all cursor-pointer border-amber-500/20" onClick={() => navigate({ to: '/plants/$id', params: { id: sp.id } })}>
      <CardHeader className='flex items-center'>
        <span className="text-3xl">{sp.icon}</span>
        <CardTitle>{sp.name}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-10">
        <CardDescription className="line-clamp-2">{sp.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: '/silos/new', search: { speciesId: sp.id } });
          }}
          variant="outline"
          size="sm"
          className="w-full font-mono"
        >
          START SOWING
        </Button>
      </CardFooter>
    </Card>
  );
}
