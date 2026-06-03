'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const ZONE_CONFIGS = [
  {
    count: 1,
    label: '1 Zone',
    desc: 'Small flock, single controlled environment',
    capacity: '~5,000 birds',
  },
  {
    count: 2,
    label: '2 Zones',
    desc: 'Split house — separate growth stages',
    capacity: '~12,000 birds',
  },
  {
    count: 3,
    label: '3 Zones',
    desc: 'Full production farm — chick to finisher',
    capacity: '~20,000 birds',
  },
];

const ZONE_COLORS = ['#00d4ff', '#a78bfa', '#00ff88'];

function ZonePreview({ count }: { count: number }) {
  const zones = Array.from({ length: count });
  const totalW = 180;
  const gap = 6;
  const zoneW = (totalW - gap * (count + 1)) / count;

  return (
    <svg viewBox="0 0 180 80" className={styles.previewSvg}>
      {zones.map((_, i) => {
        const x = gap + i * (zoneW + gap);
        const color = ZONE_COLORS[i];
        return (
          <g key={i}>
            <rect
              x={x} y={10} width={zoneW} height={60}
              fill={`${color}12`} stroke={`${color}60`}
              strokeWidth="1.5" rx="4"
            />
            <text x={x + zoneW / 2} y={34} textAnchor="middle"
              fontSize="8" fill={`${color}BB`} letterSpacing="0.04em">
              Zone {String.fromCharCode(65 + i)}
            </text>
            <text x={x + zoneW / 2} y={58} textAnchor="middle" fontSize={count === 3 ? 13 : 16}>
              🐔🐔
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(3);
  const [farmName, setFarmName] = useState('AgroTech Poultry Farm');
  const [flockSize, setFlockSize] = useState(20000);
  const [launching, setLaunching] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!launching) return;
    const id = setInterval(() => setDots(d => (d.length < 3 ? d + '.' : '')), 350);
    return () => clearInterval(id);
  }, [launching]);

  // Adjust flock size when zone count changes
  useEffect(() => {
    setFlockSize(selected * 6667);
  }, [selected]);

  function handleLaunch() {
    setLaunching(true);
    localStorage.setItem(
      'pdt_config',
      JSON.stringify({ zones: selected, farmName: farmName.trim() || 'AgroTech Poultry Farm', flockSize })
    );
    setTimeout(() => router.push('/dashboard'), 1400);
  }

  return (
    <div className={styles.root}>
      <div className={styles.bgGrid} />
      <div className={styles.glowA} />
      <div className={styles.glowB} />

      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <span className={styles.logoIcon}>🐔</span>
          <div>
            <h1 className={styles.logoTitle}>PoultryTwin</h1>
            <p className={styles.logoSub}>Digital Twin Monitoring System</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Configure Your Farm</h2>
            <p className={styles.cardDesc}>
              Set up simulation parameters before entering the live dashboard.
            </p>
          </div>

          {/* Farm Name */}
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="farm-name">
              Farm Name
            </label>
            <input
              id="farm-name"
              type="text"
              className={styles.input}
              value={farmName}
              onChange={e => setFarmName(e.target.value)}
              placeholder="Enter your farm name"
              maxLength={40}
            />
          </div>

          {/* Zone count */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Number of Zones</label>
            <div className={styles.zoneGrid}>
              {ZONE_CONFIGS.map(cfg => (
                <button
                  key={cfg.count}
                  id={`zone-${cfg.count}`}
                  className={`${styles.zoneCard} ${selected === cfg.count ? styles.zoneCardActive : ''}`}
                  onClick={() => setSelected(cfg.count)}
                >
                  <div className={styles.zonePreview}>
                    <ZonePreview count={cfg.count} />
                  </div>
                  <div className={styles.zoneInfo}>
                    <span className={styles.zoneLabel}>{cfg.label}</span>
                    <span className={styles.zoneDesc}>{cfg.desc}</span>
                    <span className={styles.zoneCapacity}>{cfg.capacity}</span>
                  </div>
                  {selected === cfg.count && (
                    <span className={styles.selectedBadge}>✓ Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Flock size slider */}
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="flock-size">
              Flock Size
              <span className={styles.fieldNote}>{flockSize.toLocaleString()} birds</span>
            </label>
            <input
              id="flock-size"
              type="range"
              className={styles.slider}
              min={1000}
              max={50000}
              step={500}
              value={flockSize}
              onChange={e => setFlockSize(Number(e.target.value))}
            />
            <div className={styles.sliderLabels}>
              <span>1,000</span>
              <span>25,000</span>
              <span>50,000</span>
            </div>
          </div>

          {/* Launch */}
          <button
            id="launch-btn"
            className={`${styles.launchBtn} ${launching ? styles.launchBtnLoading : ''}`}
            onClick={handleLaunch}
            disabled={launching}
          >
            {launching ? `Initialising simulation${dots}` : '🚀  Launch Dashboard'}
          </button>
        </div>

        <p className={styles.footer}>
          Hackathon Demo · Engineering Track · Digital Twin Simulation
        </p>
      </div>
    </div>
  );
}
