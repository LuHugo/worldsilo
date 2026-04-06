import { createFileRoute } from '@tanstack/react-router';
import { Plants } from '@/components/Plants';

export const Route = createFileRoute('/plants/')({
  component: PlantsIndexPage,
});

function PlantsIndexPage() {
  return <Plants />;
}
