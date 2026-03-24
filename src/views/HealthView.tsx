// ============================================================
// HEALTH VIEW v3.1 — Fasting planner + history
// ============================================================

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDflowStore, selectHealthLogForDate } from '@/store/useDflowStore';
import { Activity, Dumbbell, Heart, Church, AlertTriangle, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FastingState } from '@/store/types';

const FASTING_OPTIONS: { value: FastingState; label: string; desc: string; icon: string; color: string }[] = [
    { value: 'none', label: 'Normal', desc: 'Comiendo con normalidad', icon: '🍽️', color: '#6B7280' },
    { value: '24h', label: 'Ayuno 24h', desc: 'Cena a cena · Estándar', icon: '🔥', color: '#F59E0B' },
    { value: '36h', label: 'Monk Fast 36h', desc: 'Ayuno profundo · Solo agua', icon: '🧘‍♂️', color: '#DC2626' },
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Hoy';
    if (dateStr === tomorrow) return 'Mañana';
    return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function navigateDate(dateStr: string, dir: 1 | -1): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + dir);
    return d.toISOString().split('T')[0];
}

// ── Fasting Planner ──────────────────────────────────────────

function FastingPlanner() {
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const upsertHealthLog = useDflowStore((s) => s.upsertHealthLog);
    const log = useDflowStore(selectHealthLogForDate(selectedDate));
    const fasting = log?.fastingState ?? 'none';

    function setFasting(v: FastingState) { upsertHealthLog(selectedDate, { fastingState: v }); }

    return (
        <div className="space-y-3">
            {/* Date navigation */}
            <div className="flex items-center gap-2 bg-white rounded-2xl border border-border px-3 py-2.5">
                <button onClick={() => setSelectedDate(navigateDate(selectedDate, -1))}
                    className="p-1 rounded-lg hover:bg-muted transition-colors">
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex-1 text-center">
                    <p className="font-black text-base">{formatDate(selectedDate)}</p>
                    {selectedDate !== today && (
                        <p className="text-[10px] text-muted-foreground font-mono">{selectedDate}</p>
                    )}
                </div>
                <button onClick={() => setSelectedDate(navigateDate(selectedDate, 1))}
                    className="p-1 rounded-lg hover:bg-muted transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>

            {/* Type selector */}
            <div className="space-y-2">
                {FASTING_OPTIONS.map((opt) => {
                    const isActive = fasting === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => setFasting(opt.value)}
                            className={cn(
                                'w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all',
                                isActive
                                    ? 'bg-white border-foreground/20 shadow-sm'
                                    : 'border-transparent bg-white/50 hover:bg-white hover:border-border'
                            )}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <div className="flex-1">
                                <p className={cn('text-sm font-bold', isActive ? 'text-foreground' : 'text-foreground/80')}>{opt.label}</p>
                                <p className="text-xs text-muted-foreground">{opt.desc}</p>
                            </div>
                            {isActive && (
                                <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: opt.color }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {fasting === '36h' && (
                <div className="flex gap-2.5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-sm">Monk Fast activo. Solo caminata suave — nada de ejercicio intenso ni sauna.</p>
                </div>
            )}
        </div>
    );
}

// ── Daily Habits (for today only) ────────────────────────────

function DailyHabits() {
    const today = new Date().toISOString().split('T')[0];
    const log = useDflowStore(selectHealthLogForDate(today));
    const upsertHealthLog = useDflowStore((s) => s.upsertHealthLog);

    const didExercise = log?.didExercise ?? false;
    const wifeTime = log?.wifeTime ?? false;
    const churchTime = log?.churchTime ?? false;

    function toggle(field: 'didExercise' | 'wifeTime' | 'churchTime', current: boolean) {
        upsertHealthLog(today, { [field]: !current });
    }

    return (
        <div className="bg-white rounded-2xl border border-border divide-y divide-border">
            {[
                { field: 'didExercise' as const, label: 'Ejercicio 6:00 PM', icon: <Dumbbell className="w-4 h-4" />, value: didExercise },
                { field: 'wifeTime' as const, label: 'Tiempo de calidad — Esposa', icon: <Heart className="w-4 h-4 text-rose-400" />, value: wifeTime },
                { field: 'churchTime' as const, label: 'Iglesia / Comunidad', icon: <Church className="w-4 h-4 text-blue-500" />, value: churchTime },
            ].map(({ field, label, icon, value }) => (
                <label key={field} className="flex items-center gap-3.5 px-4 py-3.5 cursor-pointer hover:bg-muted/20 transition-colors">
                    <input
                        type="checkbox"
                        className="w-[18px] h-[18px] rounded accent-primary cursor-pointer"
                        checked={value}
                        onChange={() => toggle(field, value)}
                    />
                    <span className="text-muted-foreground">{icon}</span>
                    <span className={cn('text-sm font-medium flex-1', value && 'line-through text-muted-foreground')}>{label}</span>
                </label>
            ))}
        </div>
    );
}

// ── Fasting History ──────────────────────────────────────────

const FASTING_BADGE: Record<Exclude<FastingState, 'none'>, { label: string; color: string; bg: string; icon: string }> = {
    '24h': { label: 'Ayuno 24h', color: '#D97706', bg: '#FEF3C7', icon: '🔥' },
    '36h': { label: 'Monk Fast 36h', color: '#DC2626', bg: '#FEE2E2', icon: '🧘‍♂️' },
    'broken': { label: 'Roto', color: '#6B7280', bg: '#F3F4F6', icon: '❌' },
};

function FastingHistory() {
    const logs = useDflowStore(useShallow((s) => s.healthLogs));

    const fastHistory = logs
        .filter((l) => l.fastingState !== 'none')
        .sort((a, b) => b.date.localeCompare(a.date));

    if (fastHistory.length === 0) {
        return (
            <div className="text-center py-6 space-y-1">
                <p className="text-2xl">📭</p>
                <p className="text-sm text-muted-foreground">Sin historial de ayunos aún.</p>
                <p className="text-xs text-muted-foreground">Planifica y registra tu primer ayuno arriba.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {fastHistory.map((log) => {
                const config = FASTING_BADGE[log.fastingState as keyof typeof FASTING_BADGE];
                if (!config) return null;
                return (
                    <div key={log.id} className="bg-white rounded-xl border border-border p-3 flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                            style={{ backgroundColor: config?.bg }}
                        >
                            {config?.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: config?.color }}>{config?.label}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(log.date)}</p>
                        </div>
                        {/* Habit mini badges */}
                        <div className="flex gap-1">
                            {log.didExercise && <span title="Ejercicio" className="text-xs">💪</span>}
                            {log.wifeTime && <span title="Esposa" className="text-xs">❤️</span>}
                            {log.churchTime && <span title="Iglesia" className="text-xs">🙏</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Main View ────────────────────────────────────────────────

export function HealthView() {
    return (
        <div className="space-y-6 animate-in pb-4">
            {/* Header */}
            <div>
                <p className="label-micro text-muted-foreground mb-1">El Motor del Sistema</p>
                <h1 className="heading-editorial">Salud y Vida</h1>
            </div>

            {/* Fasting Planner */}
            <div className="space-y-3">
                <p className="label-micro text-muted-foreground flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />Planificar Ayuno
                </p>
                <FastingPlanner />
            </div>

            {/* Daily habits (always today) */}
            <div className="space-y-2.5">
                <p className="label-micro text-muted-foreground flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />Checklist de Hoy
                </p>
                <DailyHabits />
            </div>

            {/* History */}
            <div className="space-y-2.5">
                <p className="label-micro text-muted-foreground flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />Historial de Ayunos
                </p>
                <FastingHistory />
            </div>
        </div>
    );
}
