// ===================================
// DFLOW TYPES v8
// ===================================

export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived' | 'background';
export type BlockStatus = 'planned' | 'completed' | 'missed';
export type FastingState = 'none' | '24h' | '36h' | 'broken';
export type BlockType = 'work' | 'flow' | 'health' | 'life';

export interface UserProfile {
    name: string;
    tagline: string;
    avatar?: string;
}

export interface Project {
    id: string;
    name: string;
    emoji: string;
    color: string;
    status: ProjectStatus;
    totalHours: number;
    weekProgress: number;
    objective?: string;
    description?: string;
}

export interface TimeBlock {
    id: string;
    type: BlockType;
    projectId?: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    status: BlockStatus;
    actualHours?: number;
    notes?: string;
}

export interface HealthLog {
    id: string;
    date: string;
    fastingState: FastingState;
    didExercise: boolean;
    wifeTime: boolean;
    churchTime: boolean;
    notes?: string;
}

export type DaySlotType = 'work' | 'buffer' | 'rest' | 'health';

export interface TemplateSlot {
    id: string;
    dayIndex: number;
    slotType: DaySlotType;
    projectIndex?: number;
    title: string;
    startTime: string;
    endTime: string;
    healthAction?: ('fast24' | 'monk36' | 'exercise')[];
}

export interface FlowCycle {
    cycleLength: number;
    startDate: string;
    projectQueue: string[];
    slots: TemplateSlot[];
    numCyclesAhead: number;
}

export interface ParkingItem {
    id: string;
    content: string;
    projectId?: string;
    createdAt: number;
    isResolved: boolean;
}
