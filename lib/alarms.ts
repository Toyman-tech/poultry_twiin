import type { Alarm, AlarmSeverity, SensorReading, MachineStatus } from './types';

let alarmCounter = 0;

function makeAlarm(
  severity: AlarmSeverity,
  source: string,
  message: string,
  recommendation: string
): Alarm {
  return {
    id: `ALM-${String(++alarmCounter).padStart(4, '0')}`,
    timestamp: new Date(),
    severity,
    source,
    message,
    acknowledged: false,
    recommendation,
  };
}

// ─── Sensor Alarm Rules ───────────────────────────────────────────────────────

export function checkSensorAlarms(
  sensors: Record<string, SensorReading>,
  existingAlarms: Alarm[]
): Alarm[] {
  const newAlarms: Alarm[] = [];

  const activeMessages = new Set(existingAlarms.filter(a => !a.resolvedAt).map(a => a.message));

  const rules: Array<{
    sensorId: string;
    condition: (s: SensorReading) => boolean;
    severity: AlarmSeverity;
    message: (s: SensorReading) => string;
    recommendation: string;
  }> = [
    {
      sensorId: 'temperature',
      condition: s => s.status === 'critical' && s.value > s.criticalHigh,
      severity: 'critical',
      message: s => `CRITICAL: Temperature ${s.value.toFixed(1)}°C exceeds safe limit (${s.criticalHigh}°C)`,
      recommendation: 'Activate all ventilation fans immediately. Check heater for runaway condition.',
    },
    {
      sensorId: 'temperature',
      condition: s => s.status === 'warning' && s.value > s.warningHigh,
      severity: 'warning',
      message: s => `WARNING: High temperature detected — ${s.value.toFixed(1)}°C`,
      recommendation: 'Increase fan speed. Monitor closely.',
    },
    {
      sensorId: 'co2',
      condition: s => s.status === 'critical',
      severity: 'critical',
      message: s => `CRITICAL: CO₂ at ${s.value.toFixed(0)} ppm — dangerous level`,
      recommendation: 'Activate emergency exhaust fan. Open ventilation manually if possible.',
    },
    {
      sensorId: 'co2',
      condition: s => s.status === 'warning',
      severity: 'warning',
      message: s => `WARNING: Elevated CO₂ — ${s.value.toFixed(0)} ppm`,
      recommendation: 'Increase ventilation rate.',
    },
    {
      sensorId: 'ammonia',
      condition: s => s.status === 'critical',
      severity: 'critical',
      message: s => `CRITICAL: Ammonia ${s.value.toFixed(1)} ppm — health hazard`,
      recommendation: 'Activate emergency exhaust. Inspect litter management. Reduce stocking density.',
    },
    {
      sensorId: 'ammonia',
      condition: s => s.status === 'warning',
      severity: 'warning',
      message: s => `WARNING: Ammonia rising — ${s.value.toFixed(1)} ppm`,
      recommendation: 'Increase ventilation. Check litter moisture.',
    },
    {
      sensorId: 'waterflow',
      condition: s => s.value < s.warningLow,
      severity: 'critical',
      message: s => `CRITICAL: Water flow critically low — ${s.value.toFixed(0)} L/hr`,
      recommendation: 'Check water supply line and drinker nipples. Risk of dehydration.',
    },
    {
      sensorId: 'co2',
      condition: s => s.isFault,
      severity: 'warning',
      message: () => 'SENSOR FAULT: CO₂ sensor not responding',
      recommendation: 'Check sensor connection. Switch to manual monitoring.',
    },
    {
      sensorId: 'humidity',
      condition: s => s.status === 'critical' && s.value > s.criticalHigh,
      severity: 'warning',
      message: s => `WARNING: Very high humidity — ${s.value.toFixed(0)}%RH. Risk of respiratory disease.`,
      recommendation: 'Increase ventilation to reduce moisture levels.',
    },
  ];

  for (const rule of rules) {
    const sensor = sensors[rule.sensorId];
    if (!sensor) continue;
    if (!rule.condition(sensor)) continue;
    const msg = rule.message(sensor);
    if (!activeMessages.has(msg)) {
      newAlarms.push(makeAlarm(rule.severity, rule.sensorId, msg, rule.recommendation));
      activeMessages.add(msg);
    }
  }

  return newAlarms;
}

// ─── Machine Alarm Rules ──────────────────────────────────────────────────────

export function checkMachineAlarms(
  machines: Record<string, MachineStatus>,
  existingAlarms: Alarm[]
): Alarm[] {
  const newAlarms: Alarm[] = [];
  const activeMessages = new Set(existingAlarms.filter(a => !a.resolvedAt).map(a => a.message));

  for (const machine of Object.values(machines)) {
    if (machine.state === 'FAULT') {
      const msg = `MACHINE FAULT: ${machine.name} has failed`;
      if (!activeMessages.has(msg)) {
        newAlarms.push(makeAlarm('critical', machine.id, msg, `Inspect ${machine.name} motor and control circuit. Switch to backup if available.`));
        activeMessages.add(msg);
      }
    }
  }

  return newAlarms;
}

// ─── Resolve Cleared Alarms ───────────────────────────────────────────────────

export function resolveAlarms(
  alarms: Alarm[],
  sensors: Record<string, SensorReading>,
  machines: Record<string, MachineStatus>
): Alarm[] {
  return alarms.map(alarm => {
    if (alarm.resolvedAt) return alarm;

    const sensor = sensors[alarm.source];
    const machine = machines[alarm.source];

    let shouldResolve = false;

    if (sensor) {
      shouldResolve = sensor.status === 'normal' && !sensor.isFault;
    } else if (machine) {
      shouldResolve = machine.state !== 'FAULT';
    }

    if (shouldResolve) {
      return { ...alarm, resolvedAt: new Date() };
    }

    return alarm;
  });
}

// ─── Scenario Info Alarms ─────────────────────────────────────────────────────

const scenarioAlarmMessages: Partial<Record<string, { severity: AlarmSeverity; message: string; recommendation: string }>> = {
  power_outage: {
    severity: 'critical',
    message: 'CRITICAL: Power supply failure — UPS mode active',
    recommendation: 'Check main breaker and generator. Restore power within 30 minutes.',
  },
  ventilation_failure: {
    severity: 'critical',
    message: 'CRITICAL: Ventilation system failure — both fans offline',
    recommendation: 'Manually open windows. Contact maintenance immediately.',
  },
};

export function getScenarioAlarm(scenario: string, existingAlarms: Alarm[]): Alarm | null {
  const def = scenarioAlarmMessages[scenario];
  if (!def) return null;
  const alreadyExists = existingAlarms.some(a => a.message === def.message && !a.resolvedAt);
  if (alreadyExists) return null;
  return makeAlarm(def.severity, 'system', def.message, def.recommendation);
}
