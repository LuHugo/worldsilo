import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUsertore } from '@/store/useUserStore';
import { useThemeStore, applyAccentTheme, type AccentColor, type NavPosition } from '@/store/useThemeStore';
import { useTheme } from '@/components/theme-provider';
import { LoginDialog } from '@/components/LoginDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Sprout,
  Settings2,
  Trash2,
  AlertTriangle,
  Palette,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
  FileDown,
  Check,
  PanelLeft,
  PanelBottom,
  PanelRight,
  User,
} from 'lucide-react';

export const Route = createFileRoute('/user')({
  component: SettingsPage,
});

const ACCENT_COLORS: { id: AccentColor; label: string; value: string }[] = [
  { id: 'amber', label: 'Amber', value: '#F59E0B' },
  { id: 'blue', label: 'Blue', value: '#3B82F6' },
  { id: 'cyan', label: 'Cyan', value: '#06B6D4' },
  { id: 'emerald', label: 'Emerald', value: '#10B981' },
  { id: 'fuchsia', label: 'Fuchsia', value: '#D946EF' },
  { id: 'green', label: 'Green', value: '#22C55E' },
  { id: 'indigo', label: 'Indigo', value: '#6366F1' },
  { id: 'lime', label: 'Lime', value: '#84CC16' },
  { id: 'orange', label: 'Orange', value: '#F97316' },
  { id: 'pink', label: 'Pink', value: '#EC4899' },
  { id: 'purple', label: 'Purple', value: '#A855F7' },
  { id: 'red', label: 'Red', value: '#EF4444' },
  { id: 'rose', label: 'Rose', value: '#F43F5E' },
  { id: 'sky', label: 'Sky', value: '#0EA5E9' },
  { id: 'teal', label: 'Teal', value: '#14B8A6' },
  { id: 'violet', label: 'Violet', value: '#8B5CF6' },
  { id: 'yellow', label: 'Yellow', value: '#EAB308' },
];

function SettingsPage() {
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const { autoAdvance, setAutoAdvance, exportData } = useUsertore();
  const { accentColor, setAccentColor, navPosition, setNavPosition } = useThemeStore();
  const { theme, setTheme } = useTheme();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    applyAccentTheme(accentColor);
  }, [accentColor]);


  const handleExport = async () => {
    await exportData();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const handleAccentChange = (color: AccentColor) => {
    setAccentColor(color);
    applyAccentTheme(color);
  };

  return (
    <div className="max-w-lg mx-auto py-6 px-4 space-y-6">

      {/* User Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <CardTitle className="font-mono text-sm text-foreground">USER_INFO</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-4 bg-muted/50 rounded-lg p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-mono font-bold text-foreground">{currentUser?.username || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.is_admin ? 'Administrator' : 'User'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 font-mono"
                  onClick={() => logout()}
                >
                  LOGOUT
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                className="flex-1 font-mono"
                onClick={() => {
                  setLoginMode('login');
                  setShowLoginDialog(true);
                }}
              >
                LOGIN
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <CardTitle className="font-mono text-sm text-foreground">APPEARANCE</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme mode */}
          <div>
            <p className="text-sm font-mono text-foreground mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light' as const, icon: Sun, label: 'Light' },
                { value: 'dark' as const, icon: Moon, label: 'Dark' },
                { value: 'system' as const, icon: Monitor, label: 'System' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                    theme === value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/30 hover:border-primary/30',
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5',
                    theme === value ? 'text-primary' : 'text-muted-foreground',
                  )} />
                  <span className={cn(
                    'text-xs font-mono',
                    theme === value ? 'text-primary' : 'text-muted-foreground',
                  )}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Accent Color */}
          <div>
            <p className="text-sm font-mono text-foreground mb-3">Accent Color</p>
            <div className="grid grid-cols-9 gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleAccentChange(color.id)}
                  className={cn(
                    'relative w-8 h-8 rounded-full border-2 transition-all mx-auto',
                    accentColor === color.id
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:border-muted-foreground/30',
                  )}
                  title={color.label}
                >
                  <span
                    className="absolute inset-1 rounded-full block"
                    style={{ backgroundColor: color.value }}
                  />
                  {accentColor === color.id && (
                    <Check className="absolute inset-0 m-auto w-3.5 h-3.5 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Layout */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <CardTitle className="font-mono text-sm text-foreground">APP_LAYOUT</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground mb-3">Navigation position</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'left' as NavPosition, label: 'Left', icon: <PanelLeft className="w-5 h-5" /> },
              { value: 'bottom' as NavPosition, label: 'Bottom', icon: <PanelBottom className="w-5 h-5" /> },
              { value: 'right' as NavPosition, label: 'Right', icon: <PanelRight className="w-5 h-5" /> },
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setNavPosition(value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
                  navPosition === value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/30 hover:border-primary/30',
                )}
              >
                <span className={cn(
                  'text-lg font-mono',
                  navPosition === value ? 'text-primary' : 'text-muted-foreground',
                )}>{icon}</span>
                <span className={cn(
                  'text-xs font-mono',
                  navPosition === value ? 'text-primary' : 'text-muted-foreground',
                )}>{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Settings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-primary" />
            <CardTitle className="font-mono text-sm text-foreground">GROWTH_SETTINGS</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-foreground">Auto Advance</p>
              <p className="text-xs text-muted-foreground">Automatically simulate next day</p>
            </div>
            <Switch
              checked={autoAdvance}
              onCheckedChange={setAutoAdvance}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <CardTitle className="font-mono text-sm text-foreground">DATA_EXPORT</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-3 mb-3">
            <FileDown className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-mono text-foreground">Export all data</p>
              <p className="text-xs text-muted-foreground mt-0.5">Species, silo instances, and growth logs as JSON</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 font-mono"
              onClick={handleExport}
            >
              {exportSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-primary" />
                  EXPORTED
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  EXPORT JSON
                </>
              )}
            </Button>
            <Button variant="outline" size="icon" className="font-mono">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-destructive" />
            <CardTitle className="font-mono text-sm text-destructive">DATA_MANAGEMENT</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!showClearConfirm ? (
            <Button
              variant="outline"
              className="w-full font-mono border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              CLEAR ALL DATA
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-mono text-destructive">This action cannot be undone</p>
                  <p className="text-xs text-muted-foreground mt-0.5">All silos, growth logs, and custom data will be permanently deleted.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 font-mono"
                  onClick={() => setShowClearConfirm(false)}
                >
                  CANCEL
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 font-mono"
                >
                  CONFIRM DELETE
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <CardTitle className="font-mono text-sm text-foreground">ABOUT</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            WorldSilo is a decentralized digital farm protocol that lets you scientifically simulate and manage plant growth locally.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm bg-primary" />
            <span className="text-xs font-mono text-muted-foreground">Local-first • Open Source • PGlite Powered</span>
          </div>
        </CardContent>
      </Card>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        mode={loginMode}
      />
    </div>
  );
}
