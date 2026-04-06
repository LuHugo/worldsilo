import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function ConnectModal({ onClose }: { onClose: () => void; instanceId?: string }) {
  const [deviceType, setDeviceType] = useState<string>('');

  const deviceTypes = [
    { id: 'spectrum', name: 'Spectrum Controller', icon: '💡', desc: 'LED grow light with RGB control' },
    { id: 'nutrient', name: 'Nutrient Doser', icon: '💧', desc: 'EC/pH automated dosing system' },
    { id: 'sensor', name: 'Environment Sensor', icon: '🌡️', desc: 'Temperature, humidity, CO₂' },
    { id: 'camera', name: 'Growth Camera', icon: '📷', desc: 'Time-lapse plant monitoring' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <CardTitle className="font-mono text-primary">CONNECT DEVICE</CardTitle>
          </div>
          <CardDescription>Link a hardware device to this silo controller</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {deviceTypes.map((device) => (
              <button
                key={device.id}
                onClick={() => setDeviceType(device.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  deviceType === device.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/30 hover:border-primary/30'
                }`}
              >
                <span className="text-xl">{device.icon}</span>
                <span className="text-xs font-mono text-foreground">{device.name}</span>
                <span className="text-[10px] text-muted-foreground text-center">{device.desc}</span>
              </button>
            ))}
          </div>

          {deviceType && (
            <div className="bg-muted/50 rounded-md p-3 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono text-primary">SCANNING...</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Searching for nearby {deviceTypes.find((d) => d.id === deviceType)?.name} devices
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 font-mono">
            CANCEL
          </Button>
          <Button
            disabled={!deviceType}
            className="flex-1 font-mono"
          >
            PAIR
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
