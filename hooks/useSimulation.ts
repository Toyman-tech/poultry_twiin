'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SimulationState, ScenarioId } from '@/lib/types';
import { createInitialSensors, tickSensors } from '@/lib/simulation';
import { createInitialMachines, tickMachines } from '@/lib/machines';
import { checkSensorAlarms, checkMachineAlarms, resolveAlarms, getScenarioAlarm } from '@/lib/alarms';

function buildInitialState(zones: number, farmName: string, flockSize: number): SimulationState {
  return {
    sensors: createInitialSensors(),
    machines: createInitialMachines(),
    alarms: [],
    activeScenario: 'normal',
    simulationSpeed: 1,
    tick: 0,
    farmName,
    flockSize,
    growthStage: 'Grower',
    isRunning: true,
    timestamp: new Date(),
    zoneCount: zones,
  };
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState | null>(null);
  const stateRef = useRef<SimulationState | null>(null);
  stateRef.current = state;

  // Load config from localStorage on mount (client-side only)
  useEffect(() => {
    let zones = 3;
    let farmName = 'AgroTech Poultry Farm';
    let flockSize = 20000;

    try {
      const raw = localStorage.getItem('pdt_config');
      if (raw) {
        const cfg = JSON.parse(raw);
        zones = cfg.zones ?? 3;
        farmName = cfg.farmName ?? farmName;
        flockSize = cfg.flockSize ?? flockSize;
      }
    } catch {}

    setState(buildInitialState(zones, farmName, flockSize));
  }, []);

  const tick = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;

      const newSensors = tickSensors(prev.sensors, prev.activeScenario);
      const newMachines = tickMachines(prev.machines, newSensors, prev.activeScenario, prev.tick);

      const sensorAlarms  = checkSensorAlarms(newSensors, prev.alarms);
      const machineAlarms = checkMachineAlarms(newMachines, prev.alarms);
      const scenarioAlarm = getScenarioAlarm(prev.activeScenario, prev.alarms);

      const incoming = [
        ...sensorAlarms,
        ...machineAlarms,
        ...(scenarioAlarm ? [scenarioAlarm] : []),
      ];

      const resolved = resolveAlarms(prev.alarms, newSensors, newMachines);
      const combined  = [...resolved, ...incoming].slice(-200);

      return {
        ...prev,
        sensors:   newSensors,
        machines:  newMachines,
        alarms:    combined,
        tick:      prev.tick + 1,
        timestamp: new Date(),
      };
    });
  }, []);

  useEffect(() => {
    if (!state?.isRunning) return;
    const intervalMs = 1000 / (state?.simulationSpeed ?? 1);
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [state?.isRunning, state?.simulationSpeed, tick]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const setScenario = useCallback((scenario: ScenarioId) => {
    setState(prev => prev ? ({
      ...prev,
      activeScenario: scenario,
      alarms: prev.alarms.map(a => ({ ...a, resolvedAt: a.resolvedAt ?? new Date() })),
    }) : prev);
  }, []);

  const setSpeed = useCallback((speed: 1 | 5 | 10) => {
    setState(prev => prev ? ({ ...prev, simulationSpeed: speed }) : prev);
  }, []);

  const toggleRunning = useCallback(() => {
    setState(prev => prev ? ({ ...prev, isRunning: !prev.isRunning }) : prev);
  }, []);

  const acknowledgeAlarm = useCallback((id: string) => {
    setState(prev => prev ? ({
      ...prev,
      alarms: prev.alarms.map(a => a.id === id ? { ...a, acknowledged: true } : a),
    }) : prev);
  }, []);

  const acknowledgeAll = useCallback(() => {
    setState(prev => prev ? ({
      ...prev,
      alarms: prev.alarms.map(a => ({ ...a, acknowledged: true })),
    }) : prev);
  }, []);

  const toggleMachineOverride = useCallback((machineId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const machine = prev.machines[machineId];
      if (!machine) return prev;
      const isOverride = !machine.manualOverride;
      return {
        ...prev,
        machines: {
          ...prev.machines,
          [machineId]: {
            ...machine,
            manualOverride: isOverride,
            state: isOverride
              ? machine.state === 'OFF' ? 'ON' : 'OFF'
              : machine.state,
          },
        },
      };
    });
  }, []);

  const resetConfig = useCallback(() => {
    localStorage.removeItem('pdt_config');
  }, []);

  return {
    state,
    setScenario,
    setSpeed,
    toggleRunning,
    acknowledgeAlarm,
    acknowledgeAll,
    toggleMachineOverride,
    resetConfig,
  };
}
