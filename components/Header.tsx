'use client';

import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import type { SimulationState } from '@/lib/types';

interface HeaderProps {
  state: SimulationState;
  isRunning: boolean;
  onToggleRunning: () => void;
}

export default function Header({ state, isRunning, onToggleRunning }: HeaderProps) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const activeAlarms = state.alarms.filter(a => !a.resolvedAt && !a.acknowledged);
  const criticalCount = activeAlarms.filter(a => a.severity === 'critical').length;
  const hasAlarms = activeAlarms.length > 0;

  const systemStatus = criticalCount > 0 ? 'CRITICAL' : hasAlarms ? 'WARNING' : 'NOMINAL';
  const statusClass = criticalCount > 0 ? styles.statusCritical : hasAlarms ? styles.statusWarning : styles.statusNominal;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🐔</span>
          <div>
            <div className={styles.farmName}>{state.farmName}</div>
            <div className={styles.subtitle}>Digital Twin Monitoring System</div>
          </div>
        </div>
      </div>

      <div className={styles.center}>
        <div className={`${styles.systemStatus} ${statusClass}`}>
          <span className={styles.statusDot} />
          SYSTEM STATUS: {systemStatus}
        </div>
        {criticalCount > 0 && (
          <div className={styles.alarmBadge}>
            🚨 {criticalCount} CRITICAL ALARM{criticalCount > 1 ? 'S' : ''}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>FLOCK</span>
            <span className={styles.infoValue}>{state.flockSize.toLocaleString()}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>STAGE</span>
            <span className={styles.infoValue}>{state.growthStage}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>TICK</span>
            <span className={styles.infoValue}>{state.tick}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>TIME</span>
            <span className={styles.infoValue}>{clock}</span>
          </div>
        </div>

        <button
          className={`${styles.runBtn} ${isRunning ? styles.runBtnPause : styles.runBtnPlay}`}
          onClick={onToggleRunning}
          title={isRunning ? 'Pause simulation' : 'Resume simulation'}
        >
          {isRunning ? '⏸ PAUSE' : '▶ RESUME'}
        </button>
      </div>
    </header>
  );
}
