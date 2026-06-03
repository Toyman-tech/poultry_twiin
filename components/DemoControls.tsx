'use client';

import styles from './DemoControls.module.css';
import type { ScenarioId } from '@/lib/types';
import { SCENARIOS } from '@/lib/scenarios';

interface DemoControlsProps {
  activeScenario: ScenarioId;
  simulationSpeed: 1 | 5 | 10;
  onSetScenario: (id: ScenarioId) => void;
  onSetSpeed: (speed: 1 | 5 | 10) => void;
}

export default function DemoControls({
  activeScenario,
  simulationSpeed,
  onSetScenario,
  onSetSpeed,
}: DemoControlsProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>🕹️ Demo Controls</span>
        <span className={styles.panelSub}>Hackathon scenario injector</span>
      </div>

      <div className={styles.scenarioGrid}>
        {SCENARIOS.map(scenario => {
          const isActive = scenario.id === activeScenario;
          const sevClass =
            scenario.severity === 'critical' ? styles.scenarioCritical :
            scenario.severity === 'warning'  ? styles.scenarioWarning  :
            styles.scenarioNone;

          return (
            <button
              key={scenario.id}
              className={`${styles.scenarioBtn} ${sevClass} ${isActive ? styles.scenarioActive : ''}`}
              onClick={() => onSetScenario(scenario.id)}
              title={scenario.description}
            >
              <span className={styles.scenarioIcon}>{scenario.icon}</span>
              <div className={styles.scenarioText}>
                <span className={styles.scenarioLabel}>{scenario.label}</span>
                <span className={styles.scenarioDesc}>{scenario.description}</span>
              </div>
              {isActive && <span className={styles.activePip} />}
            </button>
          );
        })}
      </div>

      <div className={styles.speedRow}>
        <span className={styles.speedLabel}>⏱ SIM SPEED</span>
        {([1, 5, 10] as const).map(speed => (
          <button
            key={speed}
            className={`${styles.speedBtn} ${simulationSpeed === speed ? styles.speedActive : ''}`}
            onClick={() => onSetSpeed(speed)}
          >
            {speed}×
          </button>
        ))}
      </div>
    </div>
  );
}
