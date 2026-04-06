import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/silos')({
  component: SilosPage,
});

function SilosPage() {
  return <Outlet />;
}
