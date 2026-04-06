import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { isFirstRun, registerAdmin, login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = isFirstRun;

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
      navigate({ to: '/plants' });
    } else {
      setError(isRegister ? 'Failed to create admin account' : 'Invalid username or password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-muted-foreground animate-pulse">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-sm bg-primary" />
            <span className="font-mono font-bold text-lg tracking-wider">WORLDSILO</span>
          </div>
          <h1 className="text-sm font-mono font-bold text-foreground">
            {isRegister ? 'CREATE_ADMIN' : 'SIGN_IN'}
          </h1>
          {isRegister && (
            <p className="text-xs text-muted-foreground mt-1">Set up your admin account</p>
          )}
        </div>

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-9 bg-primary text-primary-foreground font-mono text-sm rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'PROCESSING...' : isRegister ? 'CREATE_ADMIN' : 'SIGN_IN'}
          </button>
        </form>
      </div>
    </div>
  );
}
