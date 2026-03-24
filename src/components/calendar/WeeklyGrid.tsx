// ============================================================
// WEEKLY GRID — 7-column view showing a full week
// Reads timeBlocks from store, grouped by day. Zero hardcoding.
// ============================================================

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDflowStore } from '@/store/useDflowStore';
import type { TimeBlock } from '@/store/types';
import { cn } from '@/lib/utils';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface WeeklyGridProps {
    weekStart: Date; // Monday of the week
    selectedDate: string;
    onDayTap: (date: string) => void;
    onBlockTap: (block: TimeBlock) => void;
}

export function WeeklyGrid({ weekStart, selectedDate, onDayTap, onBlockTap }: WeeklyGridProps) {
    const timeBlocks = useDflowStore(useShallow((s) => s.timeBlocks));
    const projects = useDflowStore(useShallow((s) => s.projects));
    const healthLogs = useDflowStore(useShallow((s) => s.healthLogs));

    const fastingMap = useMemo(() => {
        const map: Record<string, string> = {};
        healthLogs.forEach((l) => {
            if (l.fastingState === '24h') map[l.date] = '#F59E0B';
            else if (l.fastingState === '36h') map[l.date] = '#DC2626';
        });
        return map;
    }, [healthLogs]);

    const projectMap = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);

    // Build the 7 days of the week
    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const blocksForDay = timeBlocks
                .filter((b) => b.date === dateStr)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
            return { date: dateStr, dayNum: d.getDate(), dayName: DAY_NAMES[d.getDay()], blocks: blocksForDay };
        });
    }, [weekStart, timeBlocks]);

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="grid grid-cols-7 gap-1" style={{ minHeight: 320 }}>
            {days.map(({ date, dayNum, dayName, blocks }) => {
                const isToday = date === today;
                const isSelected = date === selectedDate;
                return (
                    <div
                        key={date}
                        className={cn(
                            'flex flex-col gap-1 rounded-xl p-1.5 cursor-pointer transition-colors',
                            isSelected ? 'bg-primary/10 ring-1 ring-primary/40' : 'hover:bg-card/60',
                        )}
                        onClick={() => onDayTap(date)}
                    >
                        {/* Day header */}
                        <div className="flex flex-col items-center gap-0.5 mb-1">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">{dayName}</span>
                            <span
                                className={cn(
                                    'text-sm font-black w-7 h-7 flex items-center justify-center rounded-full',
                                    isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                                )}
                            >
                                {dayNum}
                            </span>
                            {/* Fasting dot */}
                            {fastingMap[date] && (
                                <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: fastingMap[date] }}
                                    title={fastingMap[date] === '#F59E0B' ? 'Ayuno 24h' : 'Monk Fast 36h'}
                                />
                            )}
                        </div>

                        {/* Block chips */}
                        <div className="flex flex-col gap-1 flex-1">
                            {blocks.slice(0, 4).map((block) => {
                                const project = block.projectId ? projectMap[block.projectId] : null;
                                const color = project?.color ||
                                    (block.type === 'health' ? '#10B981' :
                                        block.type === 'life' ? '#8B5CF6' :
                                            block.type === 'flow' ? '#F59E0B' : '#6B7280');
                                const isPlanned = block.status === 'planned';
                                const isMissed = block.status === 'missed';
                                return (
                                    <div
                                        key={block.id}
                                        className={cn(
                                            'rounded-md px-1.5 py-1 text-[9px] font-bold truncate cursor-pointer hover:opacity-80',
                                            isPlanned && 'opacity-60',
                                            isMissed && 'opacity-35 line-through',
                                        )}
                                        style={{
                                            backgroundColor: isMissed ? '#6B728015' : color + (isPlanned ? '18' : '30'),
                                            color: isMissed ? '#9CA3AF' : color,
                                            borderLeft: isPlanned ? `2px dashed ${color}60` : `2px solid ${color}`,
                                        }}
                                        onClick={(e) => { e.stopPropagation(); onBlockTap(block); }}
                                    >
                                        {isPlanned && '○ '}{block.status === 'completed' && '● '}{block.title}
                                    </div>
                                );
                            })}
                            {blocks.length > 4 && (
                                <div className="text-[9px] text-muted-foreground text-center">+{blocks.length - 4} más</div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
