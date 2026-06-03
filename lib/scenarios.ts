import type { Scenario, ScenarioId } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'normal',
    label: 'Normal Operation',
    description: 'All systems nominal. Healthy flock conditions.',
    icon: '✅',
    severity: 'none',
  },
  {
    id: 'heat_stress',
    label: 'Heat Stress Event',
    description: 'Temperature rising — fans escalating, birds at risk.',
    icon: '🌡️',
    severity: 'warning',
  },
  {
    id: 'ventilation_failure',
    label: 'Ventilation Failure',
    description: 'Both fans offline — CO₂ and NH₃ rising rapidly.',
    icon: '💨',
    severity: 'critical',
  },
  {
    id: 'feeding_cycle',
    label: 'Feeding Cycle',
    description: 'Feeder conveyor active — scheduled auto-feed in progress.',
    icon: '🌾',
    severity: 'none',
  },
  {
    id: 'night_mode',
    label: 'Night Mode',
    description: 'Reduced lighting, lower temp setpoint, fans at minimum.',
    icon: '🌙',
    severity: 'none',
  },
  {
    id: 'power_outage',
    label: 'Power Outage',
    description: 'Main power lost — UPS backup active. All machines offline.',
    icon: '⚡',
    severity: 'critical',
  },
  {
    id: 'ammonia_spike',
    label: 'Ammonia Spike',
    description: 'NH₃ levels rising — litter issue. Emergency exhaust active.',
    icon: '☣️',
    severity: 'critical',
  },
  {
    id: 'sensor_fault',
    label: 'Sensor Fault',
    description: 'CO₂ sensor malfunction — reading frozen.',
    icon: '🔧',
    severity: 'warning',
  },
];

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS.find(s => s.id === id) ?? SCENARIOS[0];
}
