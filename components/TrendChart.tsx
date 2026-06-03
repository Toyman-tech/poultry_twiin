'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './TrendChart.module.css';
import type { SensorReading } from '@/lib/types';

Chart.register(
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Filler, Tooltip, Legend
);

interface TrendChartProps {
  sensors: Record<string, SensorReading>;
}

const CHART_SENSORS = [
  { id: 'temperature', label: 'Temperature (°C)', color: '#ff6b35' },
  { id: 'humidity',    label: 'Humidity (%RH)',   color: '#00b4d8' },
  { id: 'co2',         label: 'CO₂ (ppm)',        color: '#a78bfa' },
  { id: 'ammonia',     label: 'NH₃ (ppm)',         color: '#f72585' },
];

function MiniLineChart({
  sensorId,
  label,
  color,
  sensors,
}: {
  sensorId: string;
  label: string;
  color: string;
  sensors: Record<string, SensorReading>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const sensor = sensors[sensorId];

  useEffect(() => {
    if (!canvasRef.current || !sensor) return;

    const labels = Array.from({ length: 60 }, (_, i) => (i % 10 === 0 ? `-${60 - i}s` : ''));

    if (!chartRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label,
              data: [...sensor.history],
              borderColor: color,
              backgroundColor: `${color}18`,
              borderWidth: 1.5,
              pointRadius: 0,
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(5,10,25,0.9)',
              borderColor: color,
              borderWidth: 1,
              titleColor: color,
              bodyColor: '#c0d8f0',
              padding: 8,
              callbacks: {
                label: ctx => ` ${ctx.parsed.y.toFixed(1)} ${sensor.unit}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 8 } },
              border: { color: 'rgba(255,255,255,0.08)' },
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.04)' },
              ticks: {
                color: 'rgba(255,255,255,0.25)',
                font: { size: 8 },
                maxTicksLimit: 4,
              },
              border: { color: 'rgba(255,255,255,0.08)' },
              min: sensor.min,
              max: sensor.max,
            },
          },
        },
      });
    } else {
      chartRef.current.data.datasets[0].data = [...sensor.history];
      chartRef.current.update('none');
    }

    return () => {};
  }, [sensor, label, color]);

  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  if (!sensor) return null;

  const current = sensor.value;
  const statusColor =
    sensor.status === 'critical' ? '#ff4444' :
    sensor.status === 'warning'  ? '#ffc107' :
    sensor.status === 'fault'    ? '#888'    :
    '#00ff88';

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <span className={styles.chartLabel} style={{ color }}>{label}</span>
        <span className={styles.chartValue} style={{ color: statusColor }}>
          {sensor.isFault ? '---' : current.toFixed(sensor.id === 'co2' ? 0 : 1)}
          <span className={styles.chartUnit}> {sensor.unit}</span>
        </span>
      </div>
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default function TrendChart({ sensors }: TrendChartProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>📈 Sensor Trends</span>
        <span className={styles.panelSub}>Rolling 60-second history</span>
      </div>
      <div className={styles.grid}>
        {CHART_SENSORS.map(cfg => (
          <MiniLineChart key={cfg.id} {...cfg} sensors={sensors} />
        ))}
      </div>
    </div>
  );
}
