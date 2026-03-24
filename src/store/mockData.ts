// ===================================
// DFLOW INITIAL STATE v7 — CLEAN SLATE
// ===================================

import type { UserProfile, Project, TimeBlock, HealthLog, FlowCycle, ParkingItem } from './types';

export const initialProjects: Project[] = [];

export const initialUserProfile: UserProfile = {
    name: 'Usuario',
    tagline: 'Foco Extremo & Salud Metabólica',
    avatar: undefined
};

export const initialFlowCycle: FlowCycle = {
    cycleLength: 7,
    startDate: new Date().toISOString().split('T')[0],
    projectQueue: [],
    slots: [],
    numCyclesAhead: 2
};

export const initialTimeBlocks: TimeBlock[] = [];
export const initialHealthLogs: HealthLog[] = [];
export const initialParkingItems: ParkingItem[] = [];

