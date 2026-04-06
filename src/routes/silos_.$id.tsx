import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { GrowthController } from '@/components/GrowthController';
import { useSiloStore } from '@/store/useSiloStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ConnectModal } from '@/components/ConnectModal';
import { PageHeader } from '@/components/PageHeader';

export const Route = createFileRoute('/silos_/$id')({
  component: SiloDetailPage,
});

function SiloDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { instances } = useSiloStore();
  const [showConnect, setShowConnect] = useState(false);

  const instance = instances.find((i) => i.id === id);

  if (!instance) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="font-mono text-muted-foreground mb-4">SILO NOT FOUND</p>
        <Button onClick={() => navigate({ to: '/silos' })} className="font-mono">
          BACK TO SILOS
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="SILO CONTROLLER"
        backTo="/silos"
        actions={
          <Button
            size="icon-sm"
            onClick={() => setShowConnect(true)}
          >
            <Plus className="size-4" />
          </Button>
        }
      />
      <main className="max-w-7xl mx-auto px-4 p-6">
        <GrowthController instance={instance} />
      </main>
      {showConnect && <ConnectModal onClose={() => setShowConnect(false)} instanceId={id} />}
    </div>
  );
}
