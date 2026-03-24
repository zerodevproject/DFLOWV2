// ============================================================
// FLOW VIEW v7 — Sequential Engine (A/B/C support)
// ============================================================

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDflowStore, selectWeekSummary } from '@/store/useDflowStore';
import { Zap, CheckCircle2, XCircle, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DaySlotType, TemplateSlot } from '@/store/types';

// ── Week Scoreboard ──────────────────────────────────────────

function WeekScoreboard() {
    const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);

    const weekStart = useMemo(() => {
        const today = new Date();
        const d = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // Selection of summary with useShallow to prevent infinite loops
    const summary = useDflowStore(useShallow(selectWeekSummary(weekStart)));
    const timeBlocks = useDflowStore(useShallow((s) => s.timeBlocks));

    const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    }), [weekStart]);

    const stat = (n: number, label: string, color: string, icon: React.ReactNode) => (
        <div className="flex-1 bg-white rounded-2xl border border-border p-3 text-center transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-center mb-1" style={{ color }}>{icon}</div>
            <p className="text-xl font-black" style={{ color }}>{n}</p>
            <p className="label-micro text-muted-foreground">{label}</p>
        </div>
    );

    const DAY_CHARS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                {stat(summary.completed, 'Hechos', '#059669', <CheckCircle2 className="w-4 h-4" />)}
                {stat(summary.planned, 'Planeados', '#2563EB', <Clock className="w-4 h-4" />)}
                {stat(summary.missed, 'Perdidos', '#DC2626', <XCircle className="w-4 h-4" />)}
            </div>
            <div className="bg-white rounded-2xl border border-border p-3.5 flex justify-between items-center shadow-sm">
                <div>
                    <p className="label-micro text-muted-foreground mb-0.5">Horas Reales esta semana</p>
                    <p className="text-2xl font-black text-emerald-600">{summary.actualHours.toFixed(1)}h</p>
                </div>
                <div className="text-right">
                    <p className="label-micro text-muted-foreground mb-0.5">Planeadas</p>
                    <p className="text-2xl font-black text-muted-foreground">{summary.plannedHours.toFixed(1)}h</p>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 bg-white/50 p-2 rounded-2xl border border-border/40">
                {days.map((date, i) => {
                    const dayBlocks = timeBlocks.filter((b) => b.date === date);
                    const done = dayBlocks.filter((b) => b.status === 'completed').length;
                    const isToday = date === todayDate;
                    return (
                        <div key={date} className={cn('rounded-xl p-1 text-center transition-all', isToday && 'ring-2 ring-primary/30 bg-primary/5')}>
                            <p className="label-micro text-muted-foreground mb-1">{DAY_CHARS[i]}</p>
                            <div className="flex flex-col gap-0.5 items-center">
                                {done > 0 ? <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" /> : <div className="h-2 w-2 rounded-full bg-border/40" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Project Sequence Swimlane ────────────────────────────────

function ProjectSwimlane() {
    const projects = useDflowStore(useShallow((s) => s.projects));
    const { flowCycle, applyTemplate } = useDflowStore();
    const queue = flowCycle.projectQueue;

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-3 min-w-max px-1">
                    {queue.map((id, idx) => {
                        const proj = projects.find((p) => p.id === id);
                        if (!proj) return null;
                        const isFirst = idx === 0;
                        return (
                            <div key={id} className="flex items-center gap-3">
                                <div className={cn('rounded-2xl px-4 py-3 min-w-[124px] text-center transition-all bg-white border', isFirst ? 'ring-2 ring-offset-2 shadow-md' : 'opacity-80 border-border/60')} style={{ borderColor: isFirst ? proj.color : 'transparent' }}>
                                    <p className="text-3xl mb-1">{proj.emoji}</p>
                                    <p className="text-[11px] font-black truncate uppercase tracking-tighter" style={{ color: proj.color }}>{proj.name}</p>
                                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 inline-block', isFirst ? 'text-white' : 'text-muted-foreground')} style={isFirst ? { backgroundColor: proj.color } : {}}>
                                        {isFirst ? 'ACTUAL' : `Nº ${idx + 1}`}
                                    </span>
                                </div>
                                {idx < queue.length - 1 && <ArrowRight className="w-5 h-5 text-muted-foreground/30 animate-pulse" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <Button className="w-full font-black bg-foreground text-background h-12 rounded-2xl shadow-lg hover:scale-[1.01] transition-transform" onClick={() => applyTemplate()}>
                <RefreshCw className="w-5 h-5 mr-2" />
                AUTO-POBLAR MES — SIGUIENTE SECUENCIA (21D)
            </Button>
        </div>
    );
}

// ── Flow Cycle Editor ─────────────────────────────────────

function TemplateEditor() {
    const projects = useDflowStore(useShallow((s) => s.projects));
    const { flowCycle, updateCycleSlots } = useDflowStore();
    const slots = flowCycle.slots;
    const queue = flowCycle.projectQueue;

    const grouped = useMemo(() => {
        const g: Record<number, TemplateSlot[]> = {};
        Array.from({ length: flowCycle.cycleLength }).forEach((_, i) => { g[i] = []; });
        slots.forEach((s) => { if (g[s.dayIndex] !== undefined) g[s.dayIndex].push(s); });
        return g;
    }, [slots, flowCycle.cycleLength]);

    function toggleDay(dayIndex: number, slotType: DaySlotType, options?: { projectIndex?: number; healthAction?: ('fast24' | 'monk36' | 'exercise')[] }) {
        const existing = slots.find((s) =>
            s.dayIndex === dayIndex &&
            s.slotType === slotType &&
            (slotType !== 'work' || s.projectIndex === options?.projectIndex) &&
            (slotType !== 'health' || (s.healthAction?.includes(options?.healthAction?.[0] as any)))
        );

        if (existing) {
            updateCycleSlots(slots.filter((s) => s.id !== existing.id));
        } else {
            const projectId = options?.projectIndex !== undefined ? queue[options.projectIndex] : undefined;
            const project = projectId ? projects.find(p => p.id === projectId) : null;

            const newSlot: TemplateSlot = {
                id: `ts-${Math.random().toString(36).slice(2, 8)}`,
                dayIndex,
                slotType,
                projectIndex: options?.projectIndex,
                healthAction: options?.healthAction,
                title: project ? project.name : (slotType === 'buffer' ? 'Buffer / Admin' : slotType === 'health' ? 'Metabolic' : 'Deep Work'),
                startTime: options?.healthAction ? '18:00' : '09:30',
                endTime: options?.healthAction ? '19:30' : '13:00',
            };
            updateCycleSlots([...slots, newSlot]);
        }
    }

    const rows = useMemo(() => {
        const r = [];
        queue.slice(0, 3).forEach((id, idx) => {
            const p = projects.find(proj => proj.id === id);
            r.push({ id: `work-${idx}`, label: p ? p.emoji + ' ' + p.name : `Proyecto ${idx + 1}`, color: p ? p.color : '#6B7280', slotType: 'work' as DaySlotType, projectIndex: idx });
        });
        r.push({ id: 'buffer', label: 'Buffer', color: '#D97706', slotType: 'buffer' as DaySlotType, projectIndex: undefined });
        r.push({ id: 'fast24', label: 'Ayuno 24h', color: '#B45309', slotType: 'health' as DaySlotType, healthAction: ['fast24'] as const });
        r.push({ id: 'monk36', label: 'Monk 36h', color: '#7C3AED', slotType: 'health' as DaySlotType, healthAction: ['monk36'] as const });
        return r;
    }, [queue, projects]);

    return (
        <div className="space-y-4">
            <p className="text-xs text-muted-foreground font-medium">Define el ritmo de tu secuencia de {flowCycle.cycleLength} días.</p>
            <div className="overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
                <div className="min-w-max space-y-2">
                    <div className="flex gap-1.5 mb-1 ml-[74px]">
                        {Array.from({ length: flowCycle.cycleLength }).map((_, i) => (
                            <div key={i} className="w-10 text-center font-black text-[7px] text-muted-foreground uppercase tracking-widest leading-none">
                                {i % 7 === 0 ? <span className="text-primary font-black">W{Math.floor(i / 7) + 1}</span> : `D${i + 1}`}
                            </div>
                        ))}
                    </div>
                    {rows.map((row) => (
                        <div key={row.id} className="flex gap-1.5 items-center">
                            <div className="w-[66px] text-[8px] font-black text-right pr-2 uppercase tracking-tighter leading-tight" style={{ color: row.color }}>{row.label}</div>
                            {Array.from({ length: flowCycle.cycleLength }).map((_, i) => {
                                const isActive = grouped[i]?.some((s) =>
                                    s.slotType === row.slotType &&
                                    (row.slotType !== 'work' || s.projectIndex === row.projectIndex) &&
                                    (row.slotType !== 'health' || (s.healthAction?.includes(row.healthAction![0] as any)))
                                );
                                return (
                                    <button
                                        key={i}
                                        onClick={() => toggleDay(i, row.slotType, { projectIndex: row.projectIndex, healthAction: row.healthAction as any })}
                                        className={cn('w-10 h-10 rounded-xl transition-all flex items-center justify-center text-xs shadow-sm', isActive ? 'scale-105' : 'bg-white border border-dashed border-border/60 hover:border-primary/30')}
                                        style={isActive ? { backgroundColor: row.color, color: 'white' } : {}}
                                    >
                                        {isActive ? <CheckCircle2 className="w-4 h-4" /> : null}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border border-dashed border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight">Duración de la Secuencia</span>
                <div className="flex gap-2">
                    {[7, 10, 21].map(len => (
                        <button key={len} onClick={() => useDflowStore.getState().updateCycleSettings({ cycleLength: len })} className={cn("px-2 py-1 rounded-lg text-xs font-black", flowCycle.cycleLength === len ? "bg-foreground text-background" : "bg-white border border-border text-muted-foreground")}>
                            {len}D
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main View ────────────────────────────────────────────────

export function FlowView() {
    return (
        <div className="space-y-6 animate-in pb-4">
            <div>
                <p className="label-micro text-muted-foreground mb-1 uppercase tracking-widest font-black text-primary">El Motor</p>
                <h1 className="text-4xl font-black tracking-tighter">Flow</h1>
            </div>
            <div className="space-y-3">
                <p className="label-micro text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-tight"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Esta Semana — Reality Check</p>
                <WeekScoreboard />
            </div>
            <div className="space-y-3">
                <p className="label-micro text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-tight"><Zap className="w-4 h-4 text-amber-500" />Secuencia de Proyectos (A/B/C)</p>
                <ProjectSwimlane />
            </div>
            <div className="bg-white rounded-[2rem] border-2 border-border p-6 shadow-xl space-y-4">
                <p className="label-micro text-muted-foreground font-black uppercase tracking-widest border-b border-border pb-2">Rítmo de la Secuencia (21 Días)</p>
                <TemplateEditor />
            </div>
        </div>
    );
}
