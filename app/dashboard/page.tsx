'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useSimulation } from '@/hooks/useSimulation';
import Sidebar, { type NavView } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import FarmSchematic from '@/components/FarmSchematic';
import SensorPanel from '@/components/SensorPanel';
import MachinePanel from '@/components/MachinePanel';
import AlarmPanel from '@/components/AlarmPanel';
import DemoControls from '@/components/DemoControls';
import TrendChart from '@/components/TrendChart';

// Suppress hydration mismatch for real-time values
const Dynamic = ({ children }: { children: React.ReactNode }) => (
  <span suppressHydrationWarning>{children}</span>
);

// ── Summary cards for Overview ───────────────────────────────────────────────
function SummaryCards({ state }: { state: NonNullable<ReturnType<typeof useSimulation>['state']> }) {
  const sensors = Object.values(state.sensors);
  const critical = sensors.filter(s => s.status === 'critical').length;
  const warnings = sensors.filter(s => s.status === 'warning').length;
  const machines = Object.values(state.machines);
  const faults   = machines.filter(m => m.state === 'FAULT').length;
  const running  = machines.filter(m => m.state === 'ON').length;
  const activeAlarms = state.alarms.filter(a => !a.resolvedAt && !a.acknowledged).length;

  const cards = [
    { label: 'Sensors OK',       value: `${sensors.length - critical - warnings}/${sensors.length}`, color: '#00ff88', icon: '✅' },
    { label: 'Active Warnings',   value: warnings,    color: warnings  > 0 ? '#ffc107' : '#3a6080', icon: '⚠️' },
    { label: 'Critical Alerts',   value: critical,    color: critical  > 0 ? '#ff4444' : '#3a6080', icon: '🔴' },
    { label: 'Machines Running',  value: `${running}/${machines.length}`, color: '#00d4ff', icon: '⚙️' },
    { label: 'Machine Faults',    value: faults,      color: faults    > 0 ? '#ff4444' : '#3a6080', icon: '🔧' },
    { label: 'Unack. Alarms',     value: activeAlarms, color: activeAlarms > 0 ? '#ffc107' : '#3a6080', icon: '🚨' },
  ];

  return (
    <div className={styles.summaryGrid}>
      {cards.map(card => (
        <div key={card.label} className={styles.summaryCard}>
          <span className={styles.summaryIcon}>{card.icon}</span>
          <span className={styles.summaryValue} style={{ color: card.color }}>{card.value}</span>
          <span className={styles.summaryLabel}>{card.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<NavView>('overview');

  const {
    state,
    setScenario,
    setSpeed,
    toggleRunning,
    acknowledgeAlarm,
    acknowledgeAll,
    toggleMachineOverride,
    resetConfig,
  } = useSimulation();

  // Redirect to setup if no config
  useEffect(() => {
    const config = localStorage.getItem('pdt_config');
    if (!config) router.replace('/setup');
  }, [router]);

  // Loading state while simulation initialises
  if (!state) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingIcon}>🐔</span>
        <span className={styles.loadingText}>Initialising Digital Twin…</span>
      </div>
    );
  }

  function renderView() {
    if (!state) return null;
    switch (activeView) {
      case 'overview':
        return (
          <div className={styles.viewContent}>
            <SummaryCards state={state} />
            <FarmSchematic state={state} />
          </div>
        );
      case 'sensors':
        return (
          <div className={styles.viewContent}>
            <SensorPanel sensors={state.sensors} />
            <TrendChart sensors={state.sensors} />
          </div>
        );
      case 'machines':
        return (
          <div className={styles.viewContent}>
            <MachinePanel machines={state.machines} onToggleOverride={toggleMachineOverride} />
          </div>
        );
      case 'alarms':
        return (
          <div className={styles.viewContent}>
            <AlarmPanel
              alarms={state.alarms}
              onAcknowledge={acknowledgeAlarm}
              onAcknowledgeAll={acknowledgeAll}
            />
          </div>
        );
      case 'demo':
        return (
          <div className={styles.viewContent}>
            <DemoControls
              activeScenario={state.activeScenario}
              simulationSpeed={state.simulationSpeed}
              onSetScenario={setScenario}
              onSetSpeed={setSpeed}
            />
            {/* Show a quick sensor snapshot in demo view too */}
            <SensorPanel sensors={state.sensors} />
          </div>
        );
    }
  }

  return (
    <div className={styles.root}>
      {/* Fixed Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        alarms={state.alarms}
        isRunning={state.isRunning}
        onToggleRunning={toggleRunning}
        farmName={state.farmName}
        onReset={resetConfig}
      />

      {/* Main content area (offset by sidebar width) */}
      <div className={styles.mainWrap}>
        <TopBar activeView={activeView} state={state} />
        <main className={styles.main}>
          {renderView()}
        </main>
      </div>

      {/* Ambient glows */}
      <div className={styles.glowTL} />
      <div className={styles.glowBR} />
    </div>
  );
}
