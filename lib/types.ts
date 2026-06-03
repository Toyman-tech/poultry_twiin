// ─── Sensor Types ────────────────────────────────────────────────────────────

export type SensorStatus = 'normal' | 'warning' | 'critical' | 'fault';

export interface SensorReading {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  warningLow: number;
  warningHigh: number;
  criticalLow: number;
  criticalHigh: number;
  status: SensorStatus;
  history: number[]; // last 60 readings
  isFault: boolean;
}

// ─── Machine Types ────────────────────────────────────────────────────────────

export type MachineState = 'ON' | 'OFF' | 'STANDBY' | 'FAULT' | 'MANUAL';

export interface MachineStatus {
  id: string;
  name: string;
  type: 'fan' | 'heater' | 'feeder' | 'drinker' | 'lighting' | 'exhaust';
  state: MachineState;
  runtimeHours: number;
  lastTriggered: Date | null;
  autoCondition: string;
  manualOverride: boolean;
  speedLevel?: number; // 0–100 for fans
  zone?: string;
}

// ─── Alarm Types ─────────────────────────────────────────────────────────────

export type AlarmSeverity = 'info' | 'warning' | 'critical';

export interface Alarm {
  id: string;
  timestamp: Date;
  severity: AlarmSeverity;
  source: string; // sensor or machine id
  message: string;
  acknowledged: boolean;
  resolvedAt?: Date;
  recommendation: string;
}

// ─── Scenario Types ───────────────────────────────────────────────────────────

export type ScenarioId =
  | 'normal'
  | 'heat_stress'
  | 'ventilation_failure'
  | 'feeding_cycle'
  | 'night_mode'
  | 'power_outage'
  | 'ammonia_spike'
  | 'sensor_fault';

export interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  icon: string;
  severity: 'none' | 'warning' | 'critical';
}

// ─── Simulation State ─────────────────────────────────────────────────────────

export interface SimulationState {
  sensors: Record<string, SensorReading>;
  machines: Record<string, MachineStatus>;
  alarms: Alarm[];
  activeScenario: ScenarioId;
  simulationSpeed: 1 | 5 | 10;
  tick: number;
  farmName: string;
  flockSize: number;
  growthStage: 'Chick' | 'Grower' | 'Finisher';
  isRunning: boolean;
  timestamp: Date;
  zoneCount: 1 | 2 | 3;
}

// ─── Zone Types ───────────────────────────────────────────────────────────────

export interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  temperatureSensorId: string;
}
