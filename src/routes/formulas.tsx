import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/formulas')({
  component: FormulasPage,
});

function FormulasPage() {
  return <Outlet />;
}
