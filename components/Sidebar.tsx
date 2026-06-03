'use client';

import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import type { Alarm } from '@/lib/types';

export type NavView = 'overview' | 'sensors' | 'machines' | 'alarms' | 'demo';

interface SidebarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  alarms: Alarm[];
  isRunning: boolean;
  onToggleRunning: () => void;
  farmName: string;
  onReset: () => void;
}

const NAV_ITEMS: { id: NavView; icon: string; label: string }[] = [
  { id: 'overview',  icon: '🏠', label: 'Overview'  },
  { id: 'sensors',   icon: '📊', label: 'Sensors'   },
  { id: 'machines',  icon: '⚙️', label: 'Machines'  },
  { id: 'alarms',    icon: '🚨', label: 'Alarms'    },
  { id: 'demo',      icon: '🕹️', label: 'Demo'      },
];

export default function Sidebar({
  activeView,
  onNavigate,
  alarms,
  isRunning,
  onToggleRunning,
  farmName,
  onReset,
}: SidebarProps) {
  const router = useRouter();
  const activeAlarmCount = alarms.filter(a => !a.resolvedAt && !a.acknowledged).length;
  const criticalCount    = alarms.filter(a => !a.resolvedAt && a.severity === 'critical').length;

  function handleReset() {
    onReset();
    router.push('/setup');
  }

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🐔</span>
        <div className={styles.logoText}>
          <span className={styles.logoName}>PoultryTwin</span>
          <span className={styles.logoFarm}>{farmName}</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => {
          const isActive  = activeView === item.id;
          const badgeCount = item.id === 'alarms' ? activeAlarmCount : 0;
          const isCritical = item.id === 'alarms' && criticalCount > 0;

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {badgeCount > 0 && (
                <span className={`${styles.badge} ${isCritical ? styles.badgeCritical : styles.badgeWarning}`}>
                  {badgeCount}
                </span>
              )}
              {isActive && <span className={styles.activePill} />}
            </button>
          );
        })}
      </nav>

      <div className={styles.spacer} />

      {/* Bottom controls */}
      <div className={styles.bottomControls}>
        <button
          id="sim-toggle"
          className={`${styles.controlBtn} ${isRunning ? styles.controlPause : styles.controlPlay}`}
          onClick={onToggleRunning}
          title={isRunning ? 'Pause simulation' : 'Resume simulation'}
        >
          <span>{isRunning ? '⏸' : '▶'}</span>
          <span>{isRunning ? 'Pause' : 'Resume'}</span>
        </button>

        <button
          id="reconfigure-btn"
          className={styles.controlBtn}
          onClick={handleReset}
          title="Reconfigure farm"
        >
          <span>⚙️</span>
          <span>Reconfigure</span>
        </button>
      </div>
    </aside>
  );
}
