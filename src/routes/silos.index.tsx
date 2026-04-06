import { createFileRoute } from '@tanstack/react-router';
import { ActiveSilos } from '@/components/ActiveSilos';

export const Route = createFileRoute('/silos/')({
  component: SilosIndexPage,
});

function SilosIndexPage() {
  return <ActiveSilos />;
}
