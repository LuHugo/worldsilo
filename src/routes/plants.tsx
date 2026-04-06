import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/plants')({
  component: PlantsPage,
});

function PlantsPage() {
  return <Outlet />;
}
