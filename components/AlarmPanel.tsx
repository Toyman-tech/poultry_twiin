'use client';

import styles from './AlarmPanel.module.css';
import type { Alarm } from '@/lib/types';

interface AlarmPanelProps {
  alarms: Alarm[];
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export default function AlarmPanel({ alarms, onAcknowledge, onAcknowledgeAll }: AlarmPanelProps) {
  // Show active + recent resolved, newest first
  const displayed = [...alarms]
    .filter(a => !a.resolvedAt || (Date.now() - a.resolvedAt.getTime()) < 30000)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 30);

  const activeCount = alarms.filter(a => !a.resolvedAt && !a.acknowledged).length;
  const critCount   = alarms.filter(a => !a.resolvedAt && a.severity === 'critical').length;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>🚨 Alarm Log</span>
        <div className={styles.counts}>
          {critCount > 0 && <span className={styles.critBadge}>{critCount} CRITICAL</span>}
          {activeCount > 0 && <span className={styles.activeBadge}>{activeCount} ACTIVE</span>}
        </div>
        {activeCount > 0 && (
          <button className={styles.ackAllBtn} onClick={onAcknowledgeAll}>
            ACK ALL
          </button>
        )}
      </div>

      <div className={styles.alarmList}>
        {displayed.length === 0 ? (
          <div className={styles.noAlarms}>
            <span>✅</span>
            <span>No active alarms — all systems nominal</span>
          </div>
        ) : (
          displayed.map(alarm => (
            <AlarmRow key={alarm.id} alarm={alarm} onAck={onAcknowledge} />
          ))
        )}
      </div>
    </div>
  );
}

function AlarmRow({ alarm, onAck }: { alarm: Alarm; onAck: (id: string) => void }) {
  const isResolved = !!alarm.resolvedAt;
  const sevClass =
    alarm.severity === 'critical' ? styles.sevCritical :
    alarm.severity === 'warning'  ? styles.sevWarning  :
    styles.sevInfo;

  const sevIcon =
    alarm.severity === 'critical' ? '🔴' :
    alarm.severity === 'warning'  ? '🟡' : '🔵';

  const rowClass = [
    styles.alarmRow,
    isResolved       ? styles.alarmResolved    : '',
    alarm.acknowledged && !isResolved ? styles.alarmAcknowledged : '',
    !alarm.acknowledged && !isResolved ? styles.alarmActive : '',
  ].join(' ');

  return (
    <div className={rowClass}>
      <div className={styles.alarmLeft}>
        <span className={`${styles.sevDot} ${sevClass}`}>{sevIcon}</span>
        <div className={styles.alarmContent}>
          <div className={styles.alarmMessage}>{alarm.message}</div>
          <div className={styles.alarmRec}>💡 {alarm.recommendation}</div>
          <div className={styles.alarmMeta}>
            <span>{alarm.id}</span>
            <span>·</span>
            <span>{alarm.timestamp.toLocaleTimeString()}</span>
            {isResolved && <span className={styles.resolvedTag}>· RESOLVED {alarm.resolvedAt!.toLocaleTimeString()}</span>}
          </div>
        </div>
      </div>
      {!isResolved && !alarm.acknowledged && (
        <button className={styles.ackBtn} onClick={() => onAck(alarm.id)}>
          ACK
        </button>
      )}
      {alarm.acknowledged && !isResolved && (
        <span className={styles.ackTag}>ACKNOWLEDGED</span>
      )}
    </div>
  );
}
