// ============================================================
// MONTHLY OVERVIEW — Month grid showing activity per day
// Dots colored by project. Hours computed from timeBlocks.
// ============================================================

import { useMemo } from 'react';
import { useDflowStore } from '@/store/useDflowStore';
import { cn } from '@/lib/utils';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_NAMES_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

interface MonthlyOverviewProps {
    year: number;
    month: number; // 0-based
    selectedDate: string;
    onDayTap: (date: string) => void;
}

export function MonthlyOverview({ year, month, selectedDate, onDayTap }: MonthlyOverviewProps) {
    const timeBlocks = useDflowStore((s) => s.timeBlocks);
    const projects = useDflowStore((s) => s.projects);
    const healthLogs = useDflowStore((s) => s.healthLogs);

    const fastingMap = useMemo(() => {
        const map: Record<string, string> = {};
        healthLogs.forEach((l) => {
            if (l.fastingState === '24h') map[l.date] = '#F59E0B';
            else if (l.fastingState === '36h') map[l.date] = '#DC2626';
        });
        return map;
    }, [healthLogs]);

    const projectMap = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);

    const today = new Date().toISOString().split('T')[0];

    // Build a map: date -> unique project colors with activity
    const activityMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        timeBlocks.forEach((b) => {
            if (!map[b.date]) map[b.date] = [];
            const color = b.projectId
                ? (projectMap[b.projectId]?.color || '#6B7280')
                : b.type === 'health' ? '#10B981'
                    : b.type === 'life' ? '#8B5CF6'
                        : '#F59E0B';
            if (!map[b.date].includes(color)) map[b.date].push(color);
        });
        return map;
    }, [timeBlocks, projectMap]);

    // Build calendar grid
    const { calendarDays, firstWeekday } = useMemo(() => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return {
            calendarDays: Array.from({ length: daysInMonth }, (_, i) => i + 1),
            firstWeekday: firstDay,
        };
    }, [year, month]);

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-black text-center">{MONTH_NAMES[month]} {year}</h2>

            <div className="grid grid-cols-7 gap-1 text-center">
                {DAY_NAMES_SHORT.map((d) => (
                    <div key={d} className="text-[10px] font-bold text-muted-foreground py-1">{d}</div>
                ))}

                {/* Empty cells before month start */}
                {Array.from({ length: firstWeekday }, (_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {calendarDays.map((day) => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate;
                    const dots = activityMap[dateStr] || [];
                    const fastColor = fastingMap[dateStr];

                    return (
                        <button
                            key={day}
                            onClick={() => onDayTap(dateStr)}
                            className={cn(
                                'relative flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-colors',
                                isSelected ? 'bg-primary/20 ring-1 ring-primary/50' : 'hover:bg-card/60',
                            )}
                        >
                            <span className={cn(
                                'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full',
                                isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                            )}>
                                {day}
                            </span>
                            <div className="flex gap-0.5 flex-wrap justify-center max-w-[24px]">
                                {/* Fasting dot (special, always first if present) */}
                                {fastColor && (
                                    <div
                                        className="w-1.5 h-1.5 rounded-full ring-1 ring-white"
                                        style={{ backgroundColor: fastColor }}
                                    />
                                )}
                                {dots.slice(0, fastColor ? 2 : 3).map((color, ci) => (
                                    <div
                                        key={ci}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
