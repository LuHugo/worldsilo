import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'register';
}

export function LoginDialog({ open, onOpenChange, mode }: LoginDialogProps) {
  const { registerAdmin, login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    let success: boolean;
    if (isRegister) {
      success = await registerAdmin(username, password);
    } else {
      success = await login(username, password);
    }

    setIsSubmitting(false);

    if (success) {
      onOpenChange(false);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(isRegister ? 'Failed to create admin account' : 'Invalid username or password');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isRegister ? 'CREATE_ADMIN' : 'SIGN_IN'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-9 px-3 text-sm font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-9 px-3 text-sm font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
              placeholder="••••••"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1 block">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-9 px-3 text-sm font-mono bg-background border border-border rounded focus:outline-none focus:border-primary"
                placeholder="••••••"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <p className="text-xs font-mono text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full font-mono"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'PROCESSING...' : isRegister ? 'CREATE_ADMIN' : 'SIGN_IN'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
