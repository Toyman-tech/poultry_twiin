'use client';

import styles from './SensorPanel.module.css';
import type { SensorReading } from '@/lib/types';

interface SensorPanelProps {
  sensors: Record<string, SensorReading>;
}

const GAUGE_CONFIG: Record<string, { icon: string; color: string; criticalColor: string }> = {
  temperature: { icon: '🌡️', color: '#ff6b35', criticalColor: '#ff2200' },
  humidity:    { icon: '💧', color: '#00b4d8', criticalColor: '#ff6600' },
  co2:         { icon: '💨', color: '#7209b7', criticalColor: '#ff2200' },
  ammonia:     { icon: '☣️', color: '#f72585', criticalColor: '#ff2200' },
  light:       { icon: '💡', color: '#ffd60a', criticalColor: '#ff6600' },
  waterflow:   { icon: '🚰', color: '#06d6a0', criticalColor: '#ff2200' },
};

function ArcGauge({ sensor }: { sensor: SensorReading }) {
  const cfg = GAUGE_CONFIG[sensor.id] ?? { icon: '📊', color: '#00d4ff', criticalColor: '#ff2200' };

  const pct = Math.max(0, Math.min(1, (sensor.value - sensor.min) / (sensor.max - sensor.min)));

  const R = 54;
  const cx = 70;
  const cy = 74;
  const startAngle = -210;
  const totalAngle = 240;

  const toRad = (d: number) => (d * Math.PI) / 180;

  const arcPath = (from: number, to: number, r: number) => {
    const s = toRad(from);
    const e = toRad(to);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const fillAngle = startAngle + pct * totalAngle;
  const activeColor = sensor.status === 'critical' ? cfg.criticalColor
    : sensor.status === 'warning' ? '#ffc107'
    : sensor.status === 'fault' ? '#888'
    : cfg.color;

  const statusClass = sensor.status === 'critical' ? styles.statusCritical
    : sensor.status === 'warning' ? styles.statusWarning
    : sensor.status === 'fault' ? styles.statusFault
    : styles.statusNormal;

  return (
    <div className={`${styles.gaugeCard} ${statusClass}`}>
      <div className={styles.gaugeHeader}>
        <span className={styles.gaugeIcon}>{cfg.icon}</span>
        <span className={styles.gaugeName}>{sensor.name}</span>
        {sensor.isFault && <span className={styles.faultBadge}>FAULT</span>}
      </div>

      <svg viewBox="0 0 140 90" className={styles.gaugeSvg}>
        {/* Background arc */}
        <path
          d={arcPath(startAngle, startAngle + totalAngle, R)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Warning zone */}
        <path
          d={arcPath(startAngle + totalAngle * ((sensor.warningHigh - sensor.min) / (sensor.max - sensor.min)), startAngle + totalAngle, R)}
          fill="none"
          stroke="rgba(255,193,7,0.15)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {!sensor.isFault && pct > 0 && (
          <path
            d={arcPath(startAngle, fillAngle, R)}
            fill="none"
            stroke={activeColor}
            strokeWidth="10"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${activeColor})` }}
          />
        )}
        {/* Center value */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={sensor.isFault ? '#888' : activeColor}
          fontSize="18" fontWeight="700" fontFamily="'Roboto Mono', monospace">
          {sensor.isFault ? '---' : sensor.value.toFixed(sensor.id === 'co2' || sensor.id === 'waterflow' ? 0 : 1)}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)"
          fontSize="9" fontFamily="inherit">
          {sensor.unit}
        </text>

        {/* Min/Max labels */}
        <text x="18" y="88" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8">
          {sensor.min}
        </text>
        <text x="122" y="88" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8">
          {sensor.max}
        </text>
      </svg>

      {/* Sparkline */}
      <div className={styles.sparklineWrap}>
        <Sparkline values={sensor.history} color={activeColor} />
      </div>

      <div className={`${styles.statusBadge} ${statusClass}`}>
        {sensor.isFault ? '⚠ SENSOR FAULT' : sensor.status.toUpperCase()}
      </div>
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 110, h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 28, display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 3px ${color})`, opacity: 0.7 }} />
    </svg>
  );
}

export default function SensorPanel({ sensors }: SensorPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>📊 Sensor Readings</span>
        <span className={styles.panelSub}>Live telemetry · 1Hz update</span>
      </div>
      <div className={styles.grid}>
        {Object.values(sensors).map(s => (
          <ArcGauge key={s.id} sensor={s} />
        ))}
      </div>
    </div>
  );
}
