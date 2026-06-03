import type { MachineStatus, SensorReading, ScenarioId } from './types';

// ─── Initial Machine Definitions ──────────────────────────────────────────────

export function createInitialMachines(): Record<string, MachineStatus> {
  return {
    fan1: {
      id: 'fan1', name: 'Ventilation Fan 1', type: 'fan',
      state: 'ON', runtimeHours: 142, lastTriggered: new Date(),
      autoCondition: 'Temp > 26°C', manualOverride: false,
      speedLevel: 60, zone: 'Zone A',
    },
    fan2: {
      id: 'fan2', name: 'Ventilation Fan 2', type: 'fan',
      state: 'STANDBY', runtimeHours: 98, lastTriggered: null,
      autoCondition: 'Temp > 30°C', manualOverride: false,
      speedLevel: 0, zone: 'Zone B',
    },
    fan3: {
      id: 'fan3', name: 'Emergency Exhaust', type: 'exhaust',
      state: 'OFF', runtimeHours: 12, lastTriggered: null,
      autoCondition: 'CO₂ > 2500 or NH₃ > 20', manualOverride: false,
      speedLevel: 0, zone: 'All',
    },
    heater: {
      id: 'heater', name: 'Brooder Heater', type: 'heater',
      state: 'OFF', runtimeHours: 310, lastTriggered: null,
      autoCondition: 'Temp < 24°C', manualOverride: false,
      zone: 'Zone A',
    },
    feeder: {
      id: 'feeder', name: 'Feeder Conveyor', type: 'feeder',
      state: 'STANDBY', runtimeHours: 204, lastTriggered: null,
      autoCondition: 'Timer: every 4hrs', manualOverride: false,
      zone: 'All',
    },
    lighting: {
      id: 'lighting', name: 'Lighting System', type: 'lighting',
      state: 'ON', runtimeHours: 1820, lastTriggered: new Date(),
      autoCondition: 'Photoperiod schedule', manualOverride: false,
      speedLevel: 80, zone: 'All',
    },
  };
}

// ─── PLC Auto-control Logic ───────────────────────────────────────────────────

export function tickMachines(
  machines: Record<string, MachineStatus>,
  sensors: Record<string, SensorReading>,
  scenario: ScenarioId,
  tick: number
): Record<string, MachineStatus> {
  const temp   = sensors.temperature?.value ?? 27;
  const co2    = sensors.co2?.value ?? 1200;
  const nh3    = sensors.ammonia?.value ?? 5;
  const light  = sensors.light?.value ?? 35;

  const updated = { ...machines };

  // Power outage — everything off except standby
  if (scenario === 'power_outage') {
    for (const id of Object.keys(updated)) {
      if (!updated[id].manualOverride) {
        updated[id] = { ...updated[id], state: 'OFF', speedLevel: 0 };
      }
    }
    return updated;
  }

  // Ventilation failure — fans go to FAULT
  if (scenario === 'ventilation_failure') {
    updated.fan1 = { ...updated.fan1, state: 'FAULT', speedLevel: 0 };
    updated.fan2 = { ...updated.fan2, state: 'FAULT', speedLevel: 0 };
  } else {
    // Normal PLC fan logic
    if (!updated.fan1.manualOverride) {
      if (temp > 28) {
        const speed = Math.min(100, Math.round((temp - 26) * 15));
        updated.fan1 = { ...updated.fan1, state: 'ON', speedLevel: speed };
      } else {
        updated.fan1 = { ...updated.fan1, state: 'STANDBY', speedLevel: 0 };
      }
    }
    if (!updated.fan2.manualOverride) {
      if (temp > 32) {
        updated.fan2 = { ...updated.fan2, state: 'ON', speedLevel: 90 };
      } else {
        updated.fan2 = { ...updated.fan2, state: 'STANDBY', speedLevel: 0 };
      }
    }
  }

  // Emergency exhaust
  if (!updated.fan3.manualOverride) {
    const needsExhaust = co2 > 2500 || nh3 > 20;
    updated.fan3 = {
      ...updated.fan3,
      state: needsExhaust ? 'ON' : 'OFF',
      speedLevel: needsExhaust ? 100 : 0,
      lastTriggered: needsExhaust ? new Date() : updated.fan3.lastTriggered,
    };
  }

  // Heater
  if (!updated.heater.manualOverride) {
    if (temp < 24) {
      updated.heater = { ...updated.heater, state: 'ON', lastTriggered: new Date() };
    } else if (temp > 26) {
      updated.heater = { ...updated.heater, state: 'OFF' };
    }
  }

  // Feeder — runs for 30s every ~240 ticks (4 min at 1Hz)
  if (!updated.feeder.manualOverride) {
    const feedingCycle = scenario === 'feeding_cycle';
    const timerActive = (tick % 240) < 30 || feedingCycle;
    updated.feeder = {
      ...updated.feeder,
      state: timerActive ? 'ON' : 'STANDBY',
      lastTriggered: timerActive ? new Date() : updated.feeder.lastTriggered,
    };
  }

  // Lighting
  if (!updated.lighting.manualOverride) {
    if (scenario === 'night_mode') {
      updated.lighting = { ...updated.lighting, state: 'ON', speedLevel: 15 };
    } else if (scenario === 'power_outage') {
      updated.lighting = { ...updated.lighting, state: 'OFF', speedLevel: 0 };
    } else {
      const brightness = Math.max(20, Math.min(100, Math.round(light * 1.5)));
      updated.lighting = { ...updated.lighting, state: 'ON', speedLevel: brightness };
    }
  }

  // Accumulate runtime on active machines (per tick = per second)
  for (const id of Object.keys(updated)) {
    if (updated[id].state === 'ON') {
      updated[id] = {
        ...updated[id],
        runtimeHours: updated[id].runtimeHours + 1 / 3600,
      };
    }
  }

  return updated;
}
