import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSiloStore } from '@/store/useSiloStore';
import { usePlantStore } from '@/store/usePlantStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Clock, Check } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CategoryTabs } from '@/components/CategoryTabs';
import { SpeciesCategory } from '@/types';

export const Route = createFileRoute('/plants/database')({
  component: DatabasePage,
});

function DatabasePage() {
  const navigate = useNavigate();
  const { species } = useSiloStore();
  const { addToMyPlants } = usePlantStore();
  const { currentUser } = useAuthStore();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<SpeciesCategory | 'all'>('all');

  const systemSpecies = species.filter(s => s.is_system !== false);
  const filteredSpecies = activeCategory === 'all' ? systemSpecies : systemSpecies.filter(s => s.category === activeCategory);

  const handleAdd = async (sp: any) => {
    const success = await addToMyPlants(sp.id, currentUser?.id);
    if (success) {
      setAddedIds(prev => new Set(prev).add(sp.id));
    }
  };

  const isAlreadyAdded = (sp: any) => {
    return addedIds.has(sp.id) || species.some(s => s.user_id === currentUser?.id && s.name === sp.name && s.is_system === false);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="PLANTS_DATABASE"
        backTo="/plants"
        actions={
          <Badge variant="outline" className="font-mono">
            {systemSpecies.length} SPECIES
          </Badge>
        }
      />

      <div className="max-w-7xl mx-auto px-4 p-6">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          getCount={(key) => key === 'all' ? systemSpecies.length : systemSpecies.filter(s => s.category === key).length}
        />

        {filteredSpecies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpecies.map((sp) => {
              const alreadyAdded = isAlreadyAdded(sp);
              return (
                <Card
                  key={sp.id}
                  className="group overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => navigate({ to: '/plants/$id', params: { id: sp.id } })}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{sp.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-sm font-semibold text-foreground">{sp.name}</h3>
                          {alreadyAdded && (
                            <Badge variant="outline" className="text-[9px] font-mono text-emerald-500 border-emerald-500/30">
                              <Check className="w-3 h-3 mr-0.5" />
                              ADDED
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{sp.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-mono text-muted-foreground">EC {sp.ideal_ec}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-mono text-muted-foreground">{sp.total_days}d</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {alreadyAdded ? (
                      <Button
                        disabled
                        variant="outline"
                        size="sm"
                        className="w-full font-mono text-emerald-500 border-emerald-500/30"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        IN MY PLANTS
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(sp);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full font-mono"
                      >
                        ADD TO MY PLANTS →
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground font-mono">No species in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
