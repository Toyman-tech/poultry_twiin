'use client';

import styles from './MachinePanel.module.css';
import type { MachineStatus } from '@/lib/types';

interface MachinePanelProps {
  machines: Record<string, MachineStatus>;
  onToggleOverride: (id: string) => void;
}

const MACHINE_ICONS: Record<string, string> = {
  fan:      '🌀',
  exhaust:  '💨',
  heater:   '🔥',
  feeder:   '🌾',
  drinker:  '💧',
  lighting: '💡',
};

function MachineCard({ machine, onToggleOverride }: { machine: MachineStatus; onToggleOverride: (id: string) => void }) {
  const icon = MACHINE_ICONS[machine.type] ?? '⚙️';

  const stateClass =
    machine.state === 'ON'      ? styles.stateOn :
    machine.state === 'FAULT'   ? styles.stateFault :
    machine.state === 'STANDBY' ? styles.stateStandby :
    machine.state === 'MANUAL'  ? styles.stateManual :
    styles.stateOff;

  const isActive = machine.state === 'ON';
  const isFault  = machine.state === 'FAULT';

  return (
    <div className={`${styles.card} ${isFault ? styles.cardFault : isActive ? styles.cardActive : ''}`}>
      {/* Header Row */}
      <div className={styles.cardHeader}>
        <span className={`${styles.machineIcon} ${isActive ? styles.iconSpin : ''}`}>{icon}</span>
        <div className={styles.nameWrap}>
          <span className={styles.machineName}>{machine.name}</span>
          {machine.zone && <span className={styles.zoneLabel}>{machine.zone}</span>}
        </div>
        <div className={`${styles.stateBadge} ${stateClass}`}>
          {machine.state}
        </div>
      </div>

      {/* Speed bar for fans */}
      {machine.speedLevel !== undefined && (
        <div className={styles.speedWrap}>
          <span className={styles.speedLabel}>SPEED</span>
          <div className={styles.speedBar}>
            <div
              className={`${styles.speedFill} ${isFault ? styles.speedFault : ''}`}
              style={{ width: `${machine.speedLevel}%` }}
            />
          </div>
          <span className={styles.speedPct}>{machine.speedLevel}%</span>
        </div>
      )}

      {/* Runtime + Auto condition */}
      <div className={styles.infoRow}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>RUNTIME</span>
          <span className={styles.infoValue}>{machine.runtimeHours.toFixed(0)}h</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>AUTO TRIGGER</span>
          <span className={styles.infoCondition}>{machine.autoCondition}</span>
        </div>
      </div>

      {machine.lastTriggered && (
        <div className={styles.lastTriggered} suppressHydrationWarning>
          Last: {machine.lastTriggered.toLocaleTimeString()}
        </div>
      )}

      {/* Manual override button */}
      <button
        className={`${styles.overrideBtn} ${machine.manualOverride ? styles.overrideActive : ''}`}
        onClick={() => onToggleOverride(machine.id)}
        title="Toggle manual override"
      >
        {machine.manualOverride ? '🔒 MANUAL OVERRIDE' : '🔓 AUTO'}
      </button>
    </div>
  );
}

export default function MachinePanel({ machines, onToggleOverride }: MachinePanelProps) {
  const states = Object.values(machines);
  const onCount = states.filter(m => m.state === 'ON').length;
  const faultCount = states.filter(m => m.state === 'FAULT').length;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>⚙️ PLC Machine Control</span>
        <div className={styles.summary}>
          <span className={styles.summaryOn}>{onCount} ON</span>
          {faultCount > 0 && <span className={styles.summaryFault}>{faultCount} FAULT</span>}
          <span className={styles.summaryOff}>{states.length - onCount - faultCount} OFF/STANDBY</span>
        </div>
      </div>
      <div className={styles.grid}>
        {states.map(m => (
          <MachineCard key={m.id} machine={m} onToggleOverride={onToggleOverride} />
        ))}
      </div>
    </div>
  );
}
