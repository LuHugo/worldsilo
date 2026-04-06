import { useEffect, useState } from 'react';
import { useSiloStore } from '../store/useSiloStore';
import { calculateHealthFromInstance, getIdealBiomassCurve, simulateDay } from '../engine/growth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from './ui/chart';
import { Zap, Droplets, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import type { Spectrum4 } from '../types';

interface GrowthControllerProps {
  instance: any;
}

const CHANNEL_LABELS = [
  { key: 'B', label: 'Blue (400-520nm)', color: 'text-blue-500', barColor: 'rgba(59, 130, 246, 0.8)' },
  { key: 'G', label: 'Green (520-610nm)', color: 'text-green-500', barColor: 'rgba(34, 197, 94, 0.8)' },
  { key: 'R', label: 'Red (610-720nm)', color: 'text-red-500', barColor: 'rgba(239, 68, 68, 0.8)' },
  { key: 'FR', label: 'Far-Red (720-1000nm)', color: 'text-rose-400', barColor: 'rgba(251, 113, 133, 0.8)' },
];

export function GrowthController({ instance }: GrowthControllerProps) {
  const { species, logs, advanceDay, updateInstanceSettings, refreshLogs } = useSiloStore();
  const [localEC, setLocalEC] = useState(instance.applied_ec);
  const [localSpectrum, setLocalSpectrum] = useState<Spectrum4>(instance.applied_spectrum as Spectrum4);

  const sp = species.find((s) => s.id === instance.species_id);

  useEffect(() => {
    refreshLogs(instance.id);
  }, [instance.id]);

  useEffect(() => {
    setLocalEC(instance.applied_ec);
    setLocalSpectrum(instance.applied_spectrum as Spectrum4);
  }, [instance.applied_ec, instance.applied_spectrum]);

  if (!sp) return null;

  const health = calculateHealthFromInstance(
    localSpectrum,
    sp.ideal_spectrum,
    localEC,
    sp.ideal_ec,
  );

  const [r, g, b, fr] = localSpectrum;
  const spectrumBg = `rgba(${r}, ${g}, ${b}, 0.1)`;
  const brightness = Math.round(((r + g + b + fr) / (255 * 4)) * 100);

  const handleApplySettings = async () => {
    await updateInstanceSettings(instance.id, localEC, localSpectrum);
  };

  const handleAdvanceDay = async () => {
    await advanceDay(instance.id);
  };

  const idealCurve = getIdealBiomassCurve(sp.base_growth_rate, sp.total_days);
  const chartData = logs.map((log) => ({
    day: log.day,
    actual: Math.round(log.total_biomass * 10) / 10,
    ideal: Math.round(idealCurve[log.day] * 10) / 10,
  }));

  const remainingDays = Math.max(0, sp.total_days - instance.current_day);
  const progress = Math.min(100, (instance.current_day / sp.total_days) * 100);

  const { spectrumMatch, brightnessFactor: _, nutrientEff, rFrRatio: rfr } = simulateDay(
    sp.base_growth_rate,
    localSpectrum,
    sp.ideal_spectrum,
    localEC,
    sp.ideal_ec,
  );

  const idealRFR = (sp.ideal_spectrum[3] || 1) > 0 ? sp.ideal_spectrum[0] / sp.ideal_spectrum[3] : sp.ideal_spectrum[0];

  const updateChannel = (index: number, value: number) => {
    const next = [...localSpectrum] as Spectrum4;
    next[index] = value;
    setLocalSpectrum(next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{sp.icon}</span>
          <div>
            <h2 className="text-lg font-mono font-bold text-foreground">{instance.name}</h2>
            <p className="text-sm text-muted-foreground">{sp.name} — Day {instance.current_day}/{sp.total_days}</p>
          </div>
        </div>
        <Badge variant={health >= 80 ? 'default' : health >= 50 ? 'secondary' : 'destructive'} className="font-mono px-4 py-1.5">
          HEALTH: {health}%
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-muted-foreground">PROGRESS</span>
            <span className="text-foreground">{remainingDays} DAYS REMAINING</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Digital Twin Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="text-center">
          <CardContent className="pt-5">
            <Sun className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] font-mono text-muted-foreground">BRIGHTNESS</p>
            <p className="text-xl font-mono font-bold text-foreground">{brightness}%</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5">
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] font-mono text-muted-foreground">SPECTRUM</p>
            <p className="text-xl font-mono font-bold text-foreground">{Math.round(spectrumMatch * 100)}%</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5">
            <Droplets className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] font-mono text-muted-foreground">NUTRIENT</p>
            <p className="text-xl font-mono font-bold text-foreground">{Math.round(nutrientEff * 100)}%</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-5">
            <p className="text-[10px] font-mono text-muted-foreground">R/FR RATIO</p>
            <p className="text-xl font-mono font-bold text-foreground">{rfr.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      {/* The Mixer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spectrum Sliders */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <CardTitle className="font-mono text-sm">SPECTRUM MIXER</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-lg p-4 mb-4 border border-border"
              style={{ backgroundColor: spectrumBg }}
            >
              <div className="space-y-4">
                {CHANNEL_LABELS.map((ch, i) => (
                  <div key={ch.key} className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold w-6 ${ch.color}`}>{ch.key}</span>
                    <Slider
                      min={0}
                      max={255}
                      value={[localSpectrum[i]]}
                      onValueChange={(v) => updateChannel(i, Array.isArray(v) ? v[0] : v)}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-8 text-right text-foreground">{localSpectrum[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">
                IDEAL: R:{sp.ideal_spectrum[0]} G:{sp.ideal_spectrum[1]} B:{sp.ideal_spectrum[2]} FR:{sp.ideal_spectrum[3]}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono mt-1">
              <span className="text-muted-foreground">IDEAL R/FR: {idealRFR.toFixed(1)}</span>
              <span className="text-muted-foreground">BRIGHTNESS: {brightness}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Nutrient Input */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <CardTitle className="font-mono text-sm">NUTRIENT INPUT</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">EC VALUE (mS/cm)</label>
                <Slider
                  min={0.5}
                  max={4.0}
                  step={0.1}
                  value={[localEC]}
                  onValueChange={(v) => setLocalEC(Array.isArray(v) ? v[0] : v)}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono text-muted-foreground">0.5</span>
                  <span className="text-xl font-mono font-bold text-foreground">{localEC.toFixed(1)}</span>
                  <span className="text-xs font-mono text-muted-foreground">4.0</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-xs font-mono text-muted-foreground mb-1">IDEAL EC</p>
                  <p className="text-lg font-mono font-bold text-primary">{sp.ideal_ec} mS/cm</p>
                </div>
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-xs font-mono text-muted-foreground mb-1">DEVIATION</p>
                  <p className={`text-lg font-mono font-bold ${Math.abs(localEC - sp.ideal_ec) < 0.3 ? 'text-primary' : 'text-yellow-400'}`}>
                    {(localEC - sp.ideal_ec).toFixed(1)} mS/cm
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apply Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleApplySettings}
          variant="outline"
          className="flex-1 font-mono"
        >
          APPLY SETTINGS
        </Button>
        {instance.status === 'active' && (
          <Button
            onClick={handleAdvanceDay}
            className="flex-1 font-mono"
          >
            NEXT DAY
          </Button>
        )}
      </div>

      {/* The Trace - Growth Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <CardTitle className="font-mono text-sm">GROWTH TRACE</CardTitle>
          </div>
          <CardDescription>Standard vs actual growth curve</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              ideal: {
                label: "STANDARD",
                color: "#3b82f6",
              },
              actual: {
                label: "ACTUAL",
                color: "#39FF14",
              },
            }}
            className="h-64"
          >
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                label={{ value: 'DAY', position: 'insideBottom', offset: -5, fill: 'var(--color-muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                label={{ value: 'BIOMASS', angle: -90, position: 'insideLeft', fill: 'var(--color-muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="var(--color-ideal)"
                strokeWidth={2}
                dot={false}
                name="STANDARD"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--color-actual)"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="ACTUAL"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
