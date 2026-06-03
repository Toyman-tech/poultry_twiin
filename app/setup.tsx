'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './setup.module.css';

const ZONE_CONFIGS = [
  {
    count: 1,
    label: '1 Zone',
    desc: 'Small flock, single controlled environment',
    capacity: '~5,000 birds',
    preview: (
      <svg viewBox="0 0 180 80" className={styles.previewSvg}>
        <rect x="15" y="10" width="150" height="60" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" rx="4" />
        <text x="90" y="44" textAnchor="middle" fontSize="10" fill="rgba(0,212,255,0.7)">Zone A</text>
        <text x="90" y="58" textAnchor="middle" fontSize="16">🐔 🐔 🐔</text>
      </svg>
    ),
  },
  {
    count: 2,
    label: '2 Zones',
    desc: 'Split house — separate growth stages',
    capacity: '~12,000 birds',
    preview: (
      <svg viewBox="0 0 180 80" className={styles.previewSvg}>
        <rect x="10" y="10" width="75" height="60" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" rx="4" />
        <text x="47" y="38" textAnchor="middle" fontSize="9" fill="rgba(0,212,255,0.7)">Zone A</text>
        <text x="47" y="55" textAnchor="middle" fontSize="14">🐔 🐔</text>
        <rect x="95" y="10" width="75" height="60" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" rx="4" />
        <text x="132" y="38" textAnchor="middle" fontSize="9" fill="rgba(167,139,250,0.7)">Zone B</text>
        <text x="132" y="55" textAnchor="middle" fontSize="14">🐔 🐔</text>
      </svg>
    ),
  },
  {
    count: 3,
    label: '3 Zones',
    desc: 'Full production farm — chick to finisher',
    capacity: '~20,000 birds',
    preview: (
      <svg viewBox="0 0 180 80" className={styles.previewSvg}>
        <rect x="5" y="10" width="50" height="60" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" rx="4" />
        <text x="30" y="36" textAnchor="middle" fontSize="8" fill="rgba(0,212,255,0.7)">Zone A</text>
        <text x="30" y="52" textAnchor="middle" fontSize="13">🐔🐔</text>
        <rect x="65" y="10" width="50" height="60" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" rx="4" />
        <text x="90" y="36" textAnchor="middle" fontSize="8" fill="rgba(167,139,250,0.7)">Zone B</text>
        <text x="90" y="52" textAnchor="middle" fontSize="13">🐔🐔</text>
        <rect x="125" y="10" width="50" height="60" fill="rgba(0,255,136,0.06)" stroke="rgba(0,255,136,0.35)" strokeWidth="1.5" rx="4" />
        <text x="150" y="36" textAnchor="middle" fontSize="8" fill="rgba(0,255,136,0.7)">Zone C</text>
        <text x="150" y="52" textAnchor="middle" fontSize="13">🐔🐔</text>
      </svg>
    ),
  },
];

export default function SetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(3);
  const [farmName, setFarmName] = useState('AgroTech Poultry Farm');
  const [flockSize, setFlockSize] = useState(20000);
  const [launching, setLaunching] = useState(false);
  const [dots, setDots] = useState('');

  // Animate dots when launching
  useEffect(() => {
    if (!launching) return;
    const id = setInterval(() => setDots(d => d.length < 3 ? d + '.' : ''), 350);
    return () => clearInterval(id);
  }, [launching]);

  function handleLaunch() {
    setLaunching(true);
    localStorage.setItem('pdt_config', JSON.stringify({ zones: selected, farmName, flockSize }));
    setTimeout(() => router.push('/dashboard'), 1200);
  }

  return (
    <div className={styles.root}>
      {/* Background grid */}
      <div className={styles.grid} />
      {/* Ambient glows */}
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
            <p className={styles.cardDesc}>Set up the simulation parameters before entering the dashboard.</p>
          </div>

          {/* Farm Name */}
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="farmName">Farm Name</label>
            <input
              id="farmName"
              type="text"
              className={styles.input}
              value={farmName}
              onChange={e => setFarmName(e.target.value)}
              placeholder="Enter farm name"
              maxLength={40}
            />
          </div>

          {/* Zone count selector */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Number of Zones</label>
            <div className={styles.zoneGrid}>
              {ZONE_CONFIGS.map(cfg => (
                <button
                  key={cfg.count}
                  className={`${styles.zoneCard} ${selected === cfg.count ? styles.zoneCardActive : ''}`}
                  onClick={() => { setSelected(cfg.count); setFlockSize(cfg.count * 6666); }}
                >
                  <div className={styles.zonePreview}>{cfg.preview}</div>
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

          {/* Flock size */}
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="flockSize">
              Flock Size
              <span className={styles.fieldNote}>{flockSize.toLocaleString()} birds</span>
            </label>
            <input
              id="flockSize"
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
              <span>50,000</span>
            </div>
          </div>

          {/* Launch button */}
          <button
            id="launch-btn"
            className={`${styles.launchBtn} ${launching ? styles.launchBtnLoading : ''}`}
            onClick={handleLaunch}
            disabled={launching}
          >
            {launching ? `Initialising simulation${dots}` : '🚀 Launch Dashboard'}
          </button>
        </div>

        <p className={styles.footer}>
          Hackathon Demo · Engineering Track · Digital Twin Simulation
        </p>
      </div>
    </div>
  );
}
