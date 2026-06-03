import type { SensorReading, SensorStatus } from './types';

// ─── Initial Sensor Definitions ───────────────────────────────────────────────

export function createInitialSensors(): Record<string, SensorReading> {
  const make = (
    id: string,
    name: string,
    value: number,
    unit: string,
    min: number,
    max: number,
    wLow: number,
    wHigh: number,
    cLow: number,
    cHigh: number
  ): SensorReading => ({
    id,
    name,
    value,
    unit,
    min,
    max,
    warningLow: wLow,
    warningHigh: wHigh,
    criticalLow: cLow,
    criticalHigh: cHigh,
    status: 'normal',
    history: Array(60).fill(value),
    isFault: false,
  });

  return {
    temperature:  make('temperature',  'Temperature',     27,   '°C',   15, 45,  22, 32,  18, 36),
    humidity:     make('humidity',     'Humidity',        65,   '%RH',   0, 100, 50, 80,  40, 90),
    co2:          make('co2',          'CO₂ Level',      1200, 'ppm',    0, 5000, 2000, 3000, 2500, 4000),
    ammonia:      make('ammonia',      'Ammonia (NH₃)',    5,   'ppm',   0, 50,   10,  25,   15,  35),
    light:        make('light',        'Light Intensity', 35,   'lux',   0, 200,   5,  80,    0, 150),
    waterflow:    make('waterflow',    'Water Flow',      75,   'L/hr',  0, 200,  20,  150,  10, 180),
  };
}

// ─── Status Calculator ────────────────────────────────────────────────────────

export function getSensorStatus(s: SensorReading): SensorStatus {
  if (s.isFault) return 'fault';
  if (s.value <= s.criticalLow || s.value >= s.criticalHigh) return 'critical';
  if (s.value <= s.warningLow  || s.value >= s.warningHigh)  return 'warning';
  return 'normal';
}

// ─── Drift Function (simulates realistic sensor noise) ────────────────────────

function drift(current: number, target: number, speed: number, noise: number): number {
  const delta = (target - current) * speed + (Math.random() - 0.5) * noise;
  return current + delta;
}

// ─── Scenario Target Values ───────────────────────────────────────────────────

type SensorTargets = Record<string, number>;

const scenarioTargets: Record<string, SensorTargets> = {
  normal: {
    temperature: 27,
    humidity: 65,
    co2: 1200,
    ammonia: 5,
    light: 35,
    waterflow: 75,
  },
  heat_stress: {
    temperature: 38,
    humidity: 78,
    co2: 1800,
    ammonia: 8,
    light: 35,
    waterflow: 75,
  },
  ventilation_failure: {
    temperature: 34,
    humidity: 85,
    co2: 3800,
    ammonia: 28,
    light: 35,
    waterflow: 75,
  },
  feeding_cycle: {
    temperature: 27,
    humidity: 65,
    co2: 1400,
    ammonia: 6,
    light: 45,
    waterflow: 90,
  },
  night_mode: {
    temperature: 24,
    humidity: 60,
    co2: 1000,
    ammonia: 4,
    light: 8,
    waterflow: 40,
  },
  power_outage: {
    temperature: 31,
    humidity: 72,
    co2: 2600,
    ammonia: 18,
    light: 0,
    waterflow: 0,
  },
  ammonia_spike: {
    temperature: 27,
    humidity: 70,
    co2: 2200,
    ammonia: 32,
    light: 35,
    waterflow: 60,
  },
  sensor_fault: {
    temperature: 27,
    humidity: 65,
    co2: 1200,
    ammonia: 5,
    light: 35,
    waterflow: 75,
  },
};

// ─── Tick Sensor Values ───────────────────────────────────────────────────────

export function tickSensors(
  sensors: Record<string, SensorReading>,
  scenario: string
): Record<string, SensorReading> {
  const targets = scenarioTargets[scenario] ?? scenarioTargets.normal;
  const updated: Record<string, SensorReading> = {};

  for (const [id, sensor] of Object.entries(sensors)) {
    const isFault = scenario === 'sensor_fault' && id === 'co2';
    const target = targets[id] ?? sensor.value;

    let newValue = isFault ? sensor.value : drift(sensor.value, target, 0.05, 0.3);
    newValue = Math.max(sensor.min, Math.min(sensor.max, newValue));

    const newHistory = [...sensor.history.slice(1), newValue];
    const newSensor: SensorReading = {
      ...sensor,
      value: isFault ? sensor.value : newValue,
      isFault,
      history: newHistory,
    };
    newSensor.status = getSensorStatus(newSensor);
    updated[id] = newSensor;
  }

  return updated;
}
