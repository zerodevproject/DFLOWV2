// ===================================
// DFLOW INITIAL STATE v7 — SUPER SEED (21 DAYS)
// ===================================

import type { UserProfile, Project, TimeBlock, HealthLog, FlowCycle, ParkingItem, TemplateSlot, DaySlotType } from './types';

export const initialProjects: Project[] = [
    {
        id: 'p1',
        name: 'Level Zero',
        emoji: '⚡',
        color: '#E11D48',
        status: 'active',
        totalHours: 42,
        weekProgress: 12,
        objective: 'Lanzamiento Mainnet Q3',
        description: 'Infraestructura core de validación descentralizada.'
    },
    {
        id: 'p2',
        name: 'Oracle Alfa',
        emoji: '🔮',
        color: '#2563EB',
        status: 'active',
        totalHours: 28,
        weekProgress: 8,
        objective: 'Integración Feed Real-time',
        description: 'Oráculos de baja latencia para DeFi.'
    },
    {
        id: 'p3',
        name: 'Dflow App',
        emoji: '🌊',
        color: '#0D9488',
        status: 'active',
        totalHours: 15,
        weekProgress: 5,
        objective: 'MVP Refactor Complete',
        description: 'Sistema de productividad para multipotenciales.'
    },
];

type HealthAction = 'fast24' | 'monk36' | 'exercise';

// Helper to create slots quickly
const s = (day: number, start: string, end: string, type: DaySlotType, pi?: number, health?: HealthAction[]): TemplateSlot => ({
    id: `ts-${day}-${start}`,
    dayIndex: day,
    slotType: type,
    projectIndex: pi,
    title: type === 'work' ? (pi === 0 ? 'Level Zero' : pi === 1 ? 'Oracle Alfa' : 'Dflow App') : 'Buffer / Admin',
    startTime: start,
    endTime: end,
    healthAction: health
});

const generate21Days = () => {
    const slots: TemplateSlot[] = [];

    // WEEK 1: Proyectos A (0) & B (1)
    [0, 1].forEach(d => {
        slots.push(s(d, '09:30', '12:00', 'work', 0));
        slots.push(s(d, '14:00', '17:00', 'work', 0));
        if (d === 1) slots.push(s(d, '18:00', '19:30', 'buffer', undefined, ['fast24', 'exercise']));
    });
    slots.push(s(2, '10:00', '13:00', 'buffer'));
    [3, 4].forEach(d => {
        slots.push(s(d, '09:30', '12:00', 'work', 1));
        slots.push(s(d, '14:00', '17:00', 'work', 1));
        if (d === 4) slots.push(s(d, '18:00', '19:30', 'buffer', undefined, ['fast24', 'exercise']));
    });

    // WEEK 2: Proyectos C (2) & A (0)
    [7, 8].forEach(d => {
        slots.push(s(d, '09:30', '12:00', 'work', 2));
        slots.push(s(d, '14:00', '17:00', 'work', 2));
    });
    slots.push(s(9, '10:00', '12:00', 'buffer', undefined, ['monk36']));
    [10, 11].forEach(d => {
        slots.push(s(d, '09:30', '12:00', 'work', 0));
        slots.push(s(d, '14:00', '17:00', 'work', 0));
    });

    // WEEK 3: Proyectos B (1) & C (2)
    [14, 15].forEach(d => {
        slots.push(s(d, '09:30', '12:00', 'work', 1));
        slots.push(s(d, '14:00', '17:00', 'work', 1));
        if (d === 15) slots.push(s(d, '18:00', '19:30', 'buffer', undefined, ['fast24', 'exercise']));
    });
    slots.push(s(16, '10:00', '13:00', 'buffer'));
    [17, 18].forEach(d => {
        slots.push(s(d, '09:30', '12:00', 'work', 2));
        slots.push(s(d, '14:00', '17:00', 'work', 2));
        if (d === 18) slots.push(s(d, '18:00', '19:30', 'buffer', undefined, ['fast24', 'exercise']));
    });

    return slots;
};

export const initialUserProfile: UserProfile = {
    name: 'Juan',
    tagline: 'Foco Extremo & Salud Metabólica',
    avatar: 'https://github.com/shadcn.png'
};

const slots = generate21Days();

export const initialFlowCycle: FlowCycle = {
    cycleLength: 21,
    startDate: '2026-03-23',
    projectQueue: ['p1', 'p2', 'p3'],
    slots: slots,
    numCyclesAhead: 3
};

// PRE-POPULATE BLOCKS (Seeding the user's month)
const generateInitialContent = () => {
    const timeBlocks: TimeBlock[] = [];
    const healthLogs: HealthLog[] = [];
    const anchor = new Date('2026-03-23T00:00:00');

    for (let i = 0; i < 42; i++) { // 6 weeks
        const d = new Date(anchor);
        d.setDate(anchor.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        const cycleDay = i % 21;

        const daySlots = slots.filter(s => s.dayIndex === cycleDay);
        daySlots.forEach(slot => {
            if (slot.slotType === 'work' || slot.slotType === 'buffer') {
                const pi = slot.projectIndex;
                const proj = pi !== undefined ? initialProjects[pi] : null;
                timeBlocks.push({
                    id: `tmpl-${ds}-${slot.startTime}`,
                    type: slot.slotType === 'work' ? 'work' : 'flow',
                    projectId: proj?.id,
                    date: ds,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    title: (proj ? proj.emoji + ' ' : '') + slot.title,
                    status: 'planned'
                });
            }
            if (slot.healthAction && slot.healthAction.length > 0) {
                healthLogs.push({
                    id: `hl-${ds}`,
                    date: ds,
                    fastingState: slot.healthAction.includes('monk36') ? '36h' : slot.healthAction.includes('fast24') ? '24h' : 'none',
                    didExercise: slot.healthAction.includes('exercise'),
                    wifeTime: false, churchTime: false,
                    notes: slot.healthAction.includes('monk36') ? '🧘 Monk Fast 36h' : slot.healthAction.includes('fast24') ? '🔥 Ayuno 24h' : ''
                });
            }
        });
    }
    return { timeBlocks, healthLogs };
};

const seed = generateInitialContent();

export const initialTimeBlocks: TimeBlock[] = seed.timeBlocks;
export const initialHealthLogs: HealthLog[] = seed.healthLogs;
export const initialParkingItems: ParkingItem[] = [];
