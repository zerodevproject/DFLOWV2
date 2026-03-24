// ============================================================
// CALENDAR VIEW v5 — "Hoy Toca" banner + Metabolic Markers
// ============================================================

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { DailyTimeline } from '@/components/calendar/DailyTimeline';
import { WeeklyGrid } from '@/components/calendar/WeeklyGrid';
import { MonthlyOverview } from '@/components/calendar/MonthlyOverview';
import { BlockModal } from '@/components/calendar/BlockModal';
import { ConfirmSessionModal } from '@/components/calendar/ConfirmSessionModal';
import { useDflowStore } from '@/store/useDflowStore';
import type { TimeBlock, Project } from '@/store/types';
import { cn } from '@/lib/utils';

type CalendarMode = 'day' | 'week' | 'month';

const MODES: { value: CalendarMode; label: string }[] = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
];

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTH_NAMES_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return d;
}

interface DayInfo {
    label: string | null;
    color: string;
    primaryProject: Project | null;
    secondaryProject: Project | null;
    healthLabel: string | null;
}

function HoyTocaBanner({ date }: { date: string }) {
    const projects = useDflowStore(useShallow((s) => s.projects));
    const cycle = useDflowStore(useShallow((s) => s.flowCycle));

    const dayInfo = useMemo((): DayInfo | null => {
        const anchor = new Date(cycle.startDate + 'T00:00:00');
        const target = new Date(date + 'T00:00:00');
        const diffMs = target.getTime() - anchor.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let cycleDay = diffDays % cycle.cycleLength;
        if (cycleDay < 0) cycleDay += cycle.cycleLength;

        const slotsForDay = cycle.slots.filter((s) => s.dayIndex === cycleDay && s.slotType !== 'rest');
        if (slotsForDay.length === 0) return null;

        const workSlots = slotsForDay.filter(s => s.slotType === 'work');

        const firstWorkSlot = workSlots[0];
        const secondaryWorkSlot = workSlots.find(s => s.projectIndex !== firstWorkSlot?.projectIndex);

        const primaryProject = (firstWorkSlot && typeof firstWorkSlot.projectIndex === 'number')
            ? projects.find((p) => p.id === cycle.projectQueue[firstWorkSlot.projectIndex as number]) ?? null : null;

        const secondaryProject = (secondaryWorkSlot && typeof secondaryWorkSlot.projectIndex === 'number')
            ? projects.find((p) => p.id === cycle.projectQueue[secondaryWorkSlot.projectIndex as number]) ?? null : null;

        // Health Action detection
        const healthSlot = slotsForDay.find(s => s.healthAction && s.healthAction.length > 0);
        const healthLabel = healthSlot?.healthAction?.includes('monk36')
            ? '🧘 Monk Fast 36h'
            : healthSlot?.healthAction?.includes('fast24')
                ? '🔥 Ayuno 24h'
                : null;

        const mainProject = primaryProject || secondaryProject;
        const label = primaryProject
            ? `${primaryProject.emoji} ${primaryProject.name}`
            : secondaryProject
                ? `${secondaryProject.emoji} ${secondaryProject.name}`
                : 'Buffer / Transición';

        return { label, color: mainProject?.color ?? (healthLabel ? '#D97706' : '#6B7280'), primaryProject, secondaryProject, healthLabel };
    }, [date, cycle, projects]);

    if (!dayInfo || (!dayInfo.label && !dayInfo.healthLabel)) return null;
    const { label, color, primaryProject, secondaryProject, healthLabel } = dayInfo;

    return (
        <div className="space-y-2">
            {healthLabel && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <span className="text-xs font-black text-amber-700 uppercase tracking-widest">{healthLabel}</span>
                </div>
            )}
            <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-sm"
                style={{ backgroundColor: color + '12', borderLeft: `4px solid ${color}` }}
            >
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: color + 'CC' }}>Hoy toca</p>
                    <p className="text-sm font-black truncate" style={{ color }}>{label}</p>
                </div>
                {primaryProject && secondaryProject && (
                    <div className="px-2 py-0.5 rounded-lg bg-white/60 border border-border/40 text-[9px] font-bold text-muted-foreground shrink-0 uppercase tracking-tighter">
                        + {secondaryProject.emoji} {secondaryProject.name}
                    </div>
                )}
            </div>
        </div>
    );
}

export function CalendarView() {
    const [mode, setMode] = useState<CalendarMode>('day');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
    const [defaultSlotTime, setDefaultSlotTime] = useState<string | undefined>();
    const [confirmBlock, setConfirmBlock] = useState<{ block: TimeBlock; project?: Project } | null>(null);
    const projects = useDflowStore(useShallow((s) => s.projects));

    const selectedDateObj = useMemo(() => new Date(selectedDate + 'T00:00:00'), [selectedDate]);

    function navigate(dir: 1 | -1) {
        const d = new Date(selectedDate + 'T00:00:00');
        if (mode === 'day') d.setDate(d.getDate() + dir);
        else if (mode === 'week') d.setDate(d.getDate() + dir * 7);
        else d.setMonth(d.getMonth() + dir);
        setSelectedDate(d.toISOString().split('T')[0]);
    }

    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;

    const headerLabel = useMemo(() => {
        if (mode === 'day') {
            return `${DAY_NAMES[selectedDateObj.getDay()]}, ${selectedDateObj.getDate()} ${MONTH_NAMES[selectedDateObj.getMonth()]}`;
        }
        if (mode === 'week') {
            const ws = getWeekStart(selectedDateObj);
            const we = new Date(ws); we.setDate(we.getDate() + 6);
            return `${ws.getDate()} ${MONTH_NAMES[ws.getMonth()]} — ${we.getDate()} ${MONTH_NAMES[we.getMonth()]}`;
        }
        return `${MONTH_NAMES_LONG[selectedDateObj.getMonth()]} ${selectedDateObj.getFullYear()}`;
    }, [mode, selectedDate, selectedDateObj]);

    function handleBlockTap(block: TimeBlock) {
        if (block.status === 'planned' && block.date <= today) {
            const project = block.projectId ? projects.find((p) => p.id === block.projectId) : undefined;
            setConfirmBlock({ block, project });
        } else {
            setEditingBlock(block);
            setModalOpen(true);
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-3 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        {isToday && mode === 'day' && (
                            <p className="label-micro text-primary mb-0.5">Hoy</p>
                        )}
                        <h1 className="text-2xl font-black tracking-tight leading-none">{headerLabel}</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        {!isToday && (
                            <button onClick={() => setSelectedDate(today)} className="text-xs font-bold text-primary px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors mr-1">Hoy</button>
                        )}
                        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
                {mode === 'day' && <HoyTocaBanner date={selectedDate} />}
                <div className="flex bg-white rounded-xl p-1 gap-1 border border-border shadow-sm">
                    {MODES.map((m) => (
                        <button key={m.value} onClick={() => setMode(m.value)} className={cn('flex-1 py-1.5 text-sm font-bold rounded-lg transition-all', mode === m.value ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{m.label}</button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
                {mode === 'day' && <DailyTimeline date={selectedDate} onBlockTap={(b) => { setEditingBlock(b); setModalOpen(true); }} onSlotTap={(t) => { setEditingBlock(null); setDefaultSlotTime(t); setModalOpen(true); }} />}
                {mode === 'week' && <WeeklyGrid weekStart={getWeekStart(selectedDateObj)} selectedDate={selectedDate} onDayTap={(d) => { setSelectedDate(d); setMode('day'); }} onBlockTap={handleBlockTap} />}
                {mode === 'month' && <MonthlyOverview year={selectedDateObj.getFullYear()} month={selectedDateObj.getMonth()} selectedDate={selectedDate} onDayTap={(d) => { setSelectedDate(d); setMode('day'); }} />}
            </div>
            <button onClick={() => { setEditingBlock(null); setDefaultSlotTime(undefined); setModalOpen(true); }} className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-foreground text-background shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"><Plus className="w-7 h-7" strokeWidth={2.5} /></button>
            <BlockModal open={modalOpen} onClose={() => setModalOpen(false)} existingBlock={editingBlock} defaultDate={selectedDate} defaultStartTime={defaultSlotTime} />
            {confirmBlock && <ConfirmSessionModal open={!!confirmBlock} onClose={() => setConfirmBlock(null)} block={confirmBlock.block} project={confirmBlock.project} />}
        </div>
    );
}
