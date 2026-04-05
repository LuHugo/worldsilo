import { createFileRoute } from '@tanstack/react-router';
import { Formulas } from '@/components/Formulas';

export const Route = createFileRoute('/formulas')({
  component: FormulasPage,
});

function FormulasPage() {
  return <Formulas />;
}
