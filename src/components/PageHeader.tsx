import { useNavigate } from '@tanstack/react-router';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, backTo, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 min-h-[56px] flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {backTo && (
          <Button
            variant="ghost"

            onClick={() => navigate({ to: backTo })}
            className="text-muted-foreground hover:text-primary font-mono text-sm"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        )}
        <h1 className="font-mono text-sm font-semibold text-foreground truncate">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
