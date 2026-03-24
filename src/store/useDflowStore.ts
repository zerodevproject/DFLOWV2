// ============================================================
// DFLOW ZUSTAND STORE v7
// 21-Day Super Template Engine + Metabolic Auto-Generation
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type {
    Project, TimeBlock, HealthLog, ParkingItem,
    FlowCycle, TemplateSlot, UserProfile,
} from './types';
import {
    initialProjects, initialTimeBlocks, initialHealthLogs,
    initialParkingItems, initialFlowCycle, initialUserProfile,
} from './mockData';

interface DflowState {
    projects: Project[];
    timeBlocks: TimeBlock[];
    healthLogs: HealthLog[];
    parkingItems: ParkingItem[];
    flowCycle: FlowCycle;
    userProfile: UserProfile;

    // Profile Actions
    updateProfile: (updates: Partial<UserProfile>) => void;

    // Project CRUD
    addProject: (project: Omit<Project, 'id'>) => void;
    updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
    deleteProject: (id: string) => void;

    // Project sequence queue
    reorderQueue: (newQueue: string[]) => void;

    // TimeBlock CRUD
    addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
    updateTimeBlock: (id: string, updates: Partial<Omit<TimeBlock, 'id'>>) => void;
    deleteTimeBlock: (id: string) => void;

    // Accountability
    confirmBlock: (id: string, actualHours: number) => void;
    missBlock: (id: string) => void;

    // Template engine (Cycle)
    updateCycleSlots: (slots: TemplateSlot[]) => void;
    updateCycleSettings: (updates: Partial<Pick<FlowCycle, 'cycleLength' | 'startDate' | 'numCyclesAhead'>>) => void;
    applyTemplate: (fromDate?: string) => void;

    // HealthLog upsert
    upsertHealthLog: (date: string, updates: Partial<Omit<HealthLog, 'id' | 'date'>>) => void;

    // ParkingItem CRUD
    addParkingItem: (content: string, projectId?: string) => void;
    resolveParking: (id: string) => void;
    deleteParkingItem: (id: string) => void;
    // Setters for Sync
    setProjects: (projects: Project[]) => void;
    setTimeBlocks: (blocks: TimeBlock[]) => void;
    setHealthLogs: (logs: HealthLog[]) => void;
    setFlowCycle: (cycle: FlowCycle) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function blockHours(startTime: string, endTime: string): number {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh + em / 60) - (sh + sm / 60);
}

// ── Super Template Generator ─────────────────────────────────

function generateTemplateContents(cycle: FlowCycle, projects: Project[], baseDate: Date) {
    const blocks: TimeBlock[] = [];
    const health: Partial<HealthLog>[] = [];
    const anchorDate = new Date(cycle.startDate + 'T00:00:00');

    const diffMs = baseDate.getTime() - anchorDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let currentCycleIdx = Math.floor(diffDays / cycle.cycleLength);
    if (currentCycleIdx < 0) currentCycleIdx = 0;

    for (let c = 0; c < cycle.numCyclesAhead; c++) {
        const cycleIdx = currentCycleIdx + c;
        for (const slot of cycle.slots) {
            const targetDate = new Date(anchorDate);
            targetDate.setDate(targetDate.getDate() + (cycleIdx * cycle.cycleLength) + slot.dayIndex);

            if (targetDate < baseDate) continue;
            const dateStr = targetDate.toISOString().split('T')[0];

            if (slot.slotType === 'work' || slot.slotType === 'buffer') {
                let projectId: string | undefined;
                if (slot.projectIndex !== undefined) {
                    projectId = cycle.projectQueue[slot.projectIndex];
                }
                const project = projects.find((p) => p.id === projectId);
                const titlePrefix = project ? `${project.emoji} ` : '';

                blocks.push({
                    id: `tmpl-${dateStr}-${slot.startTime}`,
                    type: slot.slotType === 'work' ? 'work' : 'flow', // Mapping slotType to BlockType
                    projectId,
                    title: titlePrefix + slot.title,
                    date: dateStr,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    status: 'planned',
                });
            }

            if (slot.healthAction && slot.healthAction.length > 0) {
                health.push({
                    date: dateStr,
                    fastingState: slot.healthAction.includes('monk36') ? '36h' : slot.healthAction.includes('fast24') ? '24h' : 'none',
                    didExercise: slot.healthAction.includes('exercise'),
                    notes: slot.healthAction.includes('monk36') ? '🧘 Monk Fast 36h' : slot.healthAction.includes('fast24') ? '🔥 Ayuno 24h' : '',
                });
            }
        }
    }
    return { blocks, health };
}

export const useDflowStore = create<DflowState>()(
    persist(
        (set, get) => ({
            projects: initialProjects,
            timeBlocks: initialTimeBlocks,
            healthLogs: initialHealthLogs,
            parkingItems: initialParkingItems,
            flowCycle: initialFlowCycle,
            userProfile: initialUserProfile,

            updateProfile: (updates) => set((s) => ({
                userProfile: { ...s.userProfile, ...updates },
            })),

            addProject: (project) => set((s) => ({
                projects: [...s.projects, { ...project, id: `proj-${uid()}` }],
            })),
            updateProject: (id, updates) => set((s) => ({
                projects: s.projects.map((p) => p.id === id ? { ...p, ...updates } : p),
            })),
            deleteProject: (id) => set((s) => ({
                projects: s.projects.filter((p) => p.id !== id),
                timeBlocks: s.timeBlocks.map((b) => b.projectId === id ? { ...b, projectId: undefined } : b),
            })),

            reorderQueue: (newQueue) => set((s) => ({
                flowCycle: { ...s.flowCycle, projectQueue: newQueue },
            })),

            addTimeBlock: (block) => set((s) => ({
                timeBlocks: [...s.timeBlocks, { ...block, id: `tb-${uid()}` }],
            })),
            updateTimeBlock: (id, updates) => set((s) => ({
                timeBlocks: s.timeBlocks.map((b) => b.id === id ? { ...b, ...updates } : b),
            })),
            deleteTimeBlock: (id) => set((s) => ({
                timeBlocks: s.timeBlocks.filter((b) => b.id !== id),
            })),

            confirmBlock: (id, actualHours) => set((s) => ({
                timeBlocks: s.timeBlocks.map((b) =>
                    b.id === id ? { ...b, status: 'completed', actualHours } : b
                ),
            })),
            missBlock: (id) => set((s) => ({
                timeBlocks: s.timeBlocks.map((b) => b.id === id ? { ...b, status: 'missed' } : b),
            })),

            updateCycleSlots: (slots) => set((s) => ({
                flowCycle: { ...s.flowCycle, slots },
            })),
            updateCycleSettings: (updates) => set((s) => ({
                flowCycle: { ...s.flowCycle, ...updates },
            })),

            applyTemplate: (fromDate) => {
                const s = get();
                const from = fromDate ? new Date(fromDate + 'T00:00:00') : new Date();
                const today = new Date().toISOString().split('T')[0];

                const { blocks: newBlocks, health: newHealth } = generateTemplateContents(s.flowCycle, s.projects, from);

                const keptBlocks = s.timeBlocks.filter((b) => {
                    if (!b.id.startsWith('tmpl-')) return true;
                    if (b.date < today || b.status !== 'planned') return true;
                    return false;
                });

                const occupiedIdx = new Set(keptBlocks.map(b => `${b.date}|${b.startTime}`));
                const filteredNew = newBlocks.filter(b => !occupiedIdx.has(`${b.date}|${b.startTime}`));

                const mergedHealth = [...s.healthLogs];
                newHealth.forEach(nh => {
                    const existing = mergedHealth.find(h => h.date === nh.date);
                    if (!existing) {
                        mergedHealth.push({
                            id: `hl-${uid()}`,
                            date: nh.date!,
                            fastingState: nh.fastingState!,
                            didExercise: nh.didExercise!,
                            wifeTime: false,
                            churchTime: false,
                            notes: nh.notes
                        });
                    }
                });

                set({
                    timeBlocks: [...keptBlocks, ...filteredNew],
                    healthLogs: mergedHealth
                });
            },

            upsertHealthLog: (date, updates) => set((s) => {
                const existing = s.healthLogs.find((h) => h.date === date);
                if (existing) {
                    return { healthLogs: s.healthLogs.map((h) => h.date === date ? { ...h, ...updates } : h) };
                }
                return {
                    healthLogs: [...s.healthLogs, {
                        id: `hl-${uid()}`,
                        date,
                        fastingState: 'none',
                        didExercise: false,
                        wifeTime: false,
                        churchTime: false,
                        ...updates,
                    }],
                };
            }),

            addParkingItem: (content, projectId) => set((s) => ({
                parkingItems: [{ id: `pi-${uid()}`, content, projectId, createdAt: Date.now(), isResolved: false }, ...s.parkingItems],
            })),
            resolveParking: (id) => set((s) => ({
                parkingItems: s.parkingItems.map((p) => p.id === id ? { ...p, isResolved: true } : p),
            })),
            deleteParkingItem: (id) => set((s) => ({
                parkingItems: s.parkingItems.filter((p) => p.id !== id),
            })),

            setProjects: (projects: Project[]) => set({ projects }),
            setTimeBlocks: (timeBlocks: TimeBlock[]) => set({ timeBlocks }),
            setHealthLogs: (healthLogs: HealthLog[]) => set({ healthLogs }),
            setFlowCycle: (flowCycle: FlowCycle) => set({ flowCycle }),
        }),
        {
            name: 'dflow-storage',
            version: 8,
            migrate: (persistedState: any, version: number) => {
                if (version < 8) {
                    // Version 8 adds Convex sync setters. Local state is compatible.
                    return persistedState as DflowState;
                }
                return persistedState as DflowState;
            },
        }
    )
);

// Selectors
export const selectHealthLogForDate = (date: string) => (s: DflowState) =>
    s.healthLogs.find((h) => h.date === date) ?? null;

export const selectHoursForProject = (projectId: string) => (s: DflowState) =>
    s.timeBlocks
        .filter((b) => b.projectId === projectId && b.status === 'completed')
        .reduce((sum, b) => (b.actualHours ?? blockHours(b.startTime, b.endTime)) + sum, 0);

export const selectMonthHoursForProject = (projectId: string) => (s: DflowState) => {
    const now = new Date();
    return s.timeBlocks
        .filter((b) => {
            if (b.projectId !== projectId || b.status !== 'completed') return false;
            const d = new Date(b.date + 'T00:00:00');
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, b) => (b.actualHours ?? blockHours(b.startTime, b.endTime)) + sum, 0);
};

export const selectWeekSummary = (weekStart: Date) => (s: DflowState) => {
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });
    const weekBlocks = s.timeBlocks.filter((b) => days.includes(b.date));
    const planned = weekBlocks.filter((b) => b.status === 'planned').length;
    const completed = weekBlocks.filter((b) => b.status === 'completed').length;
    const missed = weekBlocks.filter((b) => b.status === 'missed').length;

    const plannedHours = weekBlocks
        .filter((b) => b.status !== 'missed')
        .reduce((sum, b) => sum + blockHours(b.startTime, b.endTime), 0);
    const actualHours = weekBlocks
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + (b.actualHours ?? blockHours(b.startTime, b.endTime)), 0);

    return { planned, completed, missed, plannedHours, actualHours };
};

export { useShallow };
