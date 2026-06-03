'use client';

import styles from './FarmSchematic.module.css';
import type { SimulationState } from '@/lib/types';

interface FarmSchematicProps {
  state: SimulationState;
}

const ZONE_COLORS: Record<string, string> = {
  normal: 'rgba(0,255,136,0.08)',
  warning: 'rgba(255,193,7,0.12)',
  critical: 'rgba(255,68,68,0.15)',
};

function getZoneColor(tempValue: number): { fill: string; stroke: string } {
  if (tempValue >= 34) return { fill: ZONE_COLORS.critical, stroke: 'rgba(255,68,68,0.6)' };
  if (tempValue >= 30) return { fill: ZONE_COLORS.warning, stroke: 'rgba(255,193,7,0.5)' };
  return { fill: ZONE_COLORS.normal, stroke: 'rgba(0,255,136,0.3)' };
}

export default function FarmSchematic({ state }: FarmSchematicProps) {
  const temp = state.sensors.temperature?.value ?? 27;
  const humidity = state.sensors.humidity?.value ?? 65;
  const co2 = state.sensors.co2?.value ?? 1200;
  const nh3 = state.sensors.ammonia?.value ?? 5;
  const isOutage = state.activeScenario === 'power_outage';

  const fan1State = state.machines.fan1?.state;
  const fan2State = state.machines.fan2?.state;
  const fan3State = state.machines.fan3?.state;
  const heaterState = state.machines.heater?.state;
  const feederState = state.machines.feeder?.state;
  const lightState = state.machines.lighting?.state;

  const machineColor = (s: string | undefined) =>
    s === 'ON' ? '#00ff88' : s === 'FAULT' ? '#ff4444' : s === 'STANDBY' ? '#ffc107' : '#2a4060';

  const zoneCount = state.zoneCount ?? 3;
  const ZONE_COLORS_MAP = ['#00d4ff', '#a78bfa', '#00ff88'];
  const ZONE_LABELS = ['Zone A — Chicks', 'Zone B — Growers', 'Zone C — Finishers'];

  const totalW = 660;
  const gap = 10;
  const zoneW = (totalW - gap * (zoneCount + 1)) / zoneCount;

  const zones = Array.from({ length: zoneCount }, (_, i) => ({
    id: String.fromCharCode(65 + i),
    x: 40 + gap + i * (zoneW + gap),
    y: 70,
    w: zoneW,
    h: 140,
    label: ZONE_LABELS[i] ?? `Zone ${String.fromCharCode(65 + i)}`,
    color: ZONE_COLORS_MAP[i],
  }));

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>🏠 Farm Schematic — Live Overview</span>
        {isOutage && <span className={styles.outageBadge}>⚡ POWER OUTAGE — UPS MODE</span>}
      </div>

      <svg
        viewBox="0 0 720 280"
        className={styles.svg}
        style={{ filter: isOutage ? 'brightness(0.5) sepia(0.5)' : 'none' }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="0.5"/>
          </pattern>
          <radialGradient id="heatGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,68,68,0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="720" height="280" fill="url(#grid)" />

        {/* Farm boundary */}
        <rect x="20" y="20" width="680" height="240" fill="rgba(5,10,25,0.5)"
          stroke="rgba(0,212,255,0.2)" strokeWidth="1.5" rx="6" />

        {/* Roof line */}
        <polyline points="20,20 360,4 700,20"
          fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="1.5" />

        {/* Zones */}
        {zones.map((z, i) => {
          const zoneTemp = temp + (i - 1) * 0.8;
          const { fill, stroke } = getZoneColor(zoneTemp);
          // Fewer birds per zone when zones are narrower
          const birdCols = zoneCount === 1 ? 4 : zoneCount === 2 ? 3 : 2;
          const birdRows = 2;
          const birdSpacingX = z.w / (birdCols + 1);
          const birdSpacingY = 44;

          return (
            <g key={z.id}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h}
                fill={fill} stroke={stroke} strokeWidth="1.5" rx="4"
                style={{ transition: 'fill 0.5s, stroke 0.5s' }} />
              {/* Zone label with per-zone color */}
              <text x={z.x + z.w / 2} y={z.y + 18} textAnchor="middle"
                fill={z.color + 'CC'} fontSize="8" fontWeight="700" letterSpacing="0.08em">
                {z.label}
              </text>

              {/* Bird icons — dynamic grid */}
              {Array.from({ length: birdCols * birdRows }).map((_, bi) => {
                const col = bi % birdCols;
                const row = Math.floor(bi / birdCols);
                const bx = z.x + birdSpacingX * (col + 1);
                const by = z.y + 42 + row * birdSpacingY;
                return (
                  <text key={bi} x={bx} y={by} textAnchor="middle"
                    fontSize={zoneCount === 1 ? 20 : 16}
                    style={{ animation: `bob ${0.8 + bi * 0.2}s infinite alternate ease-in-out` }}>
                    🐔
                  </text>
                );
              })}

              {/* Zone temp readout */}
              <rect x={z.x + z.w - 56} y={z.y + z.h - 26} width="50" height="20" rx="3"
                fill="rgba(0,0,0,0.55)" stroke={z.color + '33'} strokeWidth="1" />
              <text x={z.x + z.w - 31} y={z.y + z.h - 11} textAnchor="middle"
                fill={zoneTemp >= 34 ? '#ff4444' : zoneTemp >= 30 ? '#ffc107' : '#00ff88'}
                fontSize="9" fontWeight="700" suppressHydrationWarning>
                {zoneTemp.toFixed(1)}°C
              </text>
            </g>
          );
        })}

        {/* Ventilation Fans — top wall */}
        <MachineNode cx={160} cy={55} label="FAN 1" state={fan1State} icon="🌀" />
        <MachineNode cx={360} cy={55} label="FAN 2" state={fan2State} icon="🌀" />
        <MachineNode cx={560} cy={55} label="EXHAUST" state={fan3State} icon="💨" />

        {/* Heater — bottom left */}
        <MachineNode cx={90} cy={230} label="HEATER" state={heaterState} icon="🔥" />

        {/* Feeder — center bottom */}
        <MachineNode cx={360} cy={230} label="FEEDER" state={feederState} icon="🌾" />

        {/* Lighting — top right */}
        <MachineNode cx={630} cy={55} label="LIGHTS" state={lightState} icon="💡" />

        {/* Sensor readouts bar */}
        <rect x="20" y="247" width="680" height="30" fill="rgba(0,0,0,0.4)"
          stroke="rgba(0,212,255,0.1)" strokeWidth="0.5" />
        <SensorBar temp={temp} humidity={humidity} co2={co2} nh3={nh3} />

        {/* Conveyor line (feeder) */}
        <line x1="100" y1="215" x2="620" y2="215" stroke="rgba(255,255,255,0.06)"
          strokeWidth="2" strokeDasharray="8 4" />
        {feederState === 'ON' && (
          <line x1="100" y1="215" x2="620" y2="215" stroke="rgba(0,255,136,0.4)"
            strokeWidth="2" strokeDasharray="8 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-24"
              dur="0.4s" repeatCount="indefinite" />
          </line>
        )}
      </svg>
    </div>
  );
}

function MachineNode({ cx, cy, label, state, icon }: {
  cx: number; cy: number; label: string; state: string | undefined; icon: string;
}) {
  const color = state === 'ON' ? '#00ff88' : state === 'FAULT' ? '#ff4444' : state === 'STANDBY' ? '#ffc107' : '#2a4060';
  const glowColor = state === 'ON' ? 'rgba(0,255,136,0.4)' : state === 'FAULT' ? 'rgba(255,68,68,0.4)' : 'none';

  return (
    <g>
      <circle cx={cx} cy={cy} r="18" fill="rgba(0,0,0,0.6)"
        stroke={color} strokeWidth="1.5"
        style={{ filter: glowColor !== 'none' ? `drop-shadow(0 0 6px ${glowColor})` : 'none' }} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14">{icon}</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="rgba(255,255,255,0.5)"
        fontSize="7" letterSpacing="0.06em">{label}</text>
      <text x={cx} y={cy + 36} textAnchor="middle" fill={color}
        fontSize="7" fontWeight="700">{state ?? 'OFF'}</text>
    </g>
  );
}

function SensorBar({ temp, humidity, co2, nh3 }: {
  temp: number; humidity: number; co2: number; nh3: number;
}) {
  const items = [
    { label: 'TEMP', value: `${temp.toFixed(1)}°C`, color: temp > 32 ? '#ff4444' : temp > 28 ? '#ffc107' : '#00ff88' },
    { label: 'HUMID', value: `${humidity.toFixed(0)}%`, color: humidity > 80 ? '#ffc107' : '#00d4ff' },
    { label: 'CO₂', value: `${co2.toFixed(0)} ppm`, color: co2 > 2500 ? '#ff4444' : co2 > 2000 ? '#ffc107' : '#a78bfa' },
    { label: 'NH₃', value: `${nh3.toFixed(1)} ppm`, color: nh3 > 20 ? '#ff4444' : nh3 > 10 ? '#ffc107' : '#06d6a0' },
  ];

  return (
    <g>
      {items.map((item, i) => (
        <g key={item.label} transform={`translate(${60 + i * 170}, 252)`}>
          <text textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" y="8" letterSpacing="0.08em">
            {item.label}
          </text>
          <text textAnchor="middle" fill={item.color} fontSize="10" fontWeight="700" y="21">
            {item.value}
          </text>
        </g>
      ))}
    </g>
  );
}
