'use client';

import { useState, useEffect } from 'react';
import styles from './TopBar.module.css';
import type { SimulationState } from '@/lib/types';
import type { NavView } from './Sidebar';

const VIEW_TITLES: Record<NavView, { title: string; desc: string }> = {
  overview:  { title: '🏠 Farm Overview',    desc: 'Live schematic & key metrics'        },
  sensors:   { title: '📊 Sensor Readings',  desc: 'Live telemetry · 6 sensors · 1Hz'   },
  machines:  { title: '⚙️ PLC Machines',     desc: 'Automated control & manual overrides'},
  alarms:    { title: '🚨 Alarm Log',        desc: 'Fault detection & alarm management'  },
  demo:      { title: '🕹️ Demo Controls',    desc: 'Scenario injection for live demos'   },
};

interface TopBarProps {
  activeView: NavView;
  state: SimulationState;
}

export default function TopBar({ activeView, state }: TopBarProps) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const { title, desc } = VIEW_TITLES[activeView];

  const activeAlarms  = state.alarms.filter(a => !a.resolvedAt && !a.acknowledged);
  const criticalCount = activeAlarms.filter(a => a.severity === 'critical').length;

  const sysStatus  = criticalCount > 0 ? 'CRITICAL' : activeAlarms.length > 0 ? 'WARNING' : 'NOMINAL';
  const statusCls  = criticalCount > 0 ? styles.critical : activeAlarms.length > 0 ? styles.warning : styles.nominal;

  return (
    <div className={styles.topBar}>
      {/* Page title */}
      <div className={styles.titleBlock}>
        <h2 className={styles.viewTitle}>{title}</h2>
        <span className={styles.viewDesc}>{desc}</span>
      </div>

      {/* Status & clock */}
      <div className={styles.right}>
        <div className={`${styles.statusChip} ${statusCls}`}>
          <span className={styles.statusDot} />
          {sysStatus}
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>ZONES</span>
            <span className={styles.metaValue}>{state.zoneCount}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>BIRDS</span>
            <span className={styles.metaValue}>{state.flockSize.toLocaleString()}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>STAGE</span>
            <span className={styles.metaValue}>{state.growthStage}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>SPEED</span>
            <span className={styles.metaValue}>{state.simulationSpeed}×</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>TIME</span>
            <span className={styles.metaValue} suppressHydrationWarning>{clock}</span>
          </div>
        </div>

        {!state.isRunning && (
          <div className={styles.pausedChip}>⏸ PAUSED</div>
        )}
      </div>
    </div>
  );
}
