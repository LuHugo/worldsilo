import { createFileRoute } from '@tanstack/react-router';
import { Formulas } from '@/components/Formulas';

export const Route = createFileRoute('/formulas/')({
  component: FormulasIndexPage,
});

function FormulasIndexPage() {
  return <Formulas />;
}
