import { useEffect, useState } from 'react';
import { useSiloStore } from '../store/useSiloStore';
import { calculateHealthFromInstance, getIdealBiomassCurve, simulateDay } from '../engine/growth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Zap, Droplets, ThermometerSun, ArrowRight, Play } from 'lucide-react';

interface GrowthControllerProps {
  instance: any;
}

export function GrowthController({ instance }: GrowthControllerProps) {
  const { species, logs, advanceDay, updateInstanceSettings, refreshLogs } = useSiloStore();
  const [localEC, setLocalEC] = useState(instance.applied_ec);
  const [localRGB, setLocalRGB] = useState<[number, number, number]>(instance.applied_rgb as [number, number, number]);

  const sp = species.find((s) => s.id === instance.species_id);

  useEffect(() => {
    refreshLogs(instance.id);
  }, [instance.id]);

  useEffect(() => {
    setLocalEC(instance.applied_ec);
    setLocalRGB(instance.applied_rgb as [number, number, number]);
  }, [instance.applied_ec, instance.applied_rgb]);

  if (!sp) return null;

  const health = calculateHealthFromInstance(
    localRGB,
    sp.ideal_spectrum_rgb,
    localEC,
    sp.ideal_ec,
  );

  const spectrumBg = `rgba(${localRGB[0]}, ${localRGB[1]}, ${localRGB[2]}, 0.08)`;

  const handleApplySettings = async () => {
    await updateInstanceSettings(instance.id, localEC, localRGB);
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
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-mono text-muted-foreground">HEALTH</p>
            <p className={`text-2xl font-mono font-bold ${health >= 80 ? 'text-primary' : health >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {health}%
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-muted-foreground">PROGRESS</span>
          <span className="text-foreground">{remainingDays} DAYS REMAINING</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Digital Twin Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <ThermometerSun className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xs font-mono text-muted-foreground">BIOMASS</p>
          <p className="text-2xl font-mono font-bold text-foreground">{instance.current_biomass.toFixed(1)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xs font-mono text-muted-foreground">SPECTRUM MATCH</p>
          <p className="text-2xl font-mono font-bold text-foreground">
            {Math.round(simulateDay(sp.base_growth_rate, localRGB, sp.ideal_spectrum_rgb, localEC, sp.ideal_ec).spectrumMatch * 100)}%
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Droplets className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xs font-mono text-muted-foreground">NUTRIENT EFF</p>
          <p className="text-2xl font-mono font-bold text-foreground">
            {Math.round(simulateDay(sp.base_growth_rate, localRGB, sp.ideal_spectrum_rgb, localEC, sp.ideal_ec).nutrientEff * 100)}%
          </p>
        </div>
      </div>

      {/* The Mixer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spectrum Sliders */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            SPECTRUM_MIXER
          </h3>

          <div
            className="rounded-lg p-4 mb-4 border border-border"
            style={{ backgroundColor: spectrumBg }}
          >
            <div className="space-y-4">
              <Slider
                label="R"
                value={localRGB[0]}
                color="#ef4444"
                onChange={(v) => setLocalRGB([v, localRGB[1], localRGB[2]])}
              />
              <Slider
                label="G"
                value={localRGB[1]}
                color="#22c55e"
                onChange={(v) => setLocalRGB([localRGB[0], v, localRGB[2]])}
              />
              <Slider
                label="B"
                value={localRGB[2]}
                color="#3b82f6"
                onChange={(v) => setLocalRGB([localRGB[0], localRGB[1], v])}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">IDEAL: R:{sp.ideal_spectrum_rgb[0]} G:{sp.ideal_spectrum_rgb[1]} B:{sp.ideal_spectrum_rgb[2]}</span>
          </div>
        </div>

        {/* Nutrient Input */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            NUTRIENT_INPUT
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">EC VALUE (mS/cm)</label>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={localEC}
                onChange={(e) => setLocalEC(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono text-muted-foreground">0.5</span>
                <span className="text-xl font-mono font-bold text-foreground">{localEC.toFixed(1)}</span>
                <span className="text-xs font-mono text-muted-foreground">4.0</span>
              </div>
            </div>

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
      </div>

      {/* Apply Button */}
      <div className="flex gap-3">
        <button
          onClick={handleApplySettings}
          className="flex-1 px-4 py-3 text-sm font-mono bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          APPLY_SETTINGS
        </button>
        {instance.status === 'active' && (
          <button
            onClick={handleAdvanceDay}
            className="flex-1 px-4 py-3 text-sm font-mono bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            NEXT_DAY
          </button>
        )}
      </div>

      {/* The Trace - Growth Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          GROWTH_TRACE
        </h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="day"
                stroke="#71717a"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                label={{ value: 'DAY', position: 'insideBottom', offset: -5, fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                label={{ value: 'BIOMASS', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11, fontFamily: 'monospace' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="STANDARD"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#39FF14"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="ACTUAL"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, color, onChange }: { label: string; value: number; color: string; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono font-bold w-4" style={{ color }}>{label}</span>
      <input
        type="range"
        min="0"
        max="255"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 accent-primary"
        style={{ accentColor: color }}
      />
      <span className="text-xs font-mono w-8 text-right text-foreground">{value}</span>
    </div>
  );
}
