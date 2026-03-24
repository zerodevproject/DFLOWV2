// ============================================================
// DAILY TIMELINE v5 — ConfirmSession + Quick Fasting picker
// ============================================================

import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDflowStore, selectHealthLogForDate } from '@/store/useDflowStore';
import { TimeBlockCard } from './TimeBlockCard';
import { FastingStrip } from './FastingStrip';
import { ConfirmSessionModal } from './ConfirmSessionModal';
import { CurrentTimeLine, TIMELINE_START_HOUR, TIMELINE_END_HOUR, TOTAL_HOURS } from './CurrentTimeLine';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeBlock, Project, FastingState } from '@/store/types';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

const HOUR_LABELS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
    const h = TIMELINE_START_HOUR + i;
    return `${h.toString().padStart(2, '0')}:00`;
});

function timeToDecimal(time: string) {
    const [h, m] = time.split(':').map(Number);
    return h + m / 60;
}

// Fix 4: Quick Fasting picker — 2 clicks from the calendar
const FASTING_OPTS: { v: FastingState; label: string; emoji: string; color: string }[] = [
    { v: 'none', label: 'Normal', emoji: '🍽️', color: '#6B7280' },
    { v: '24h', label: '24h', emoji: '🔥', color: '#F59E0B' },
    { v: '36h', label: 'Monk', emoji: '🧘‍♂️', color: '#DC2626' },
];

function QuickFasting({ date }: { date: string }) {
    const [open, setOpen] = useState(false);
    const healthLog = useDflowStore(selectHealthLogForDate(date));
    const upsertMutation = useMutation(api.healthLogs.upsert);
    const fasting = healthLog?.fastingState ?? 'none';

    async function setFasting(v: FastingState) {
        await upsertMutation({
            date,
            fastingState: v as any,
            didExercise: healthLog?.didExercise ?? false,
            wifeTime: healthLog?.wifeTime ?? false,
            churchTime: healthLog?.churchTime ?? false,
            notes: healthLog?.notes
        });
        setOpen(false);
    }

    const activeFasting = FASTING_OPTS.find((o) => o.v === fasting) || FASTING_OPTS[0];
    const isFasting = fasting !== 'none';

    return (
        <div className="flex items-center gap-2 mb-2">
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                    isFasting
                        ? 'shadow-sm'
                        : 'bg-white/60 border border-dashed border-border text-muted-foreground hover:border-foreground/30'
                )}
                style={isFasting ? { backgroundColor: activeFasting.color + '18', color: activeFasting.color, border: `1.5px solid ${activeFasting.color}40` } : {}}
            >
                <Flame className="w-3.5 h-3.5" />
                {isFasting ? `${activeFasting.emoji} ${activeFasting.label}` : 'Ayuno'}
            </button>
            {open && (
                <div className="flex gap-1.5 animate-in">
                    {FASTING_OPTS.map((opt) => (
                        <button
                            key={opt.v}
                            onClick={() => setFasting(opt.v)}
                            className={cn(
                                'px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                                fasting === opt.v ? 'text-white shadow-sm' : 'bg-white border border-border hover:border-foreground/30'
                            )}
                            style={fasting === opt.v ? { backgroundColor: opt.color } : {}}
                        >
                            {opt.emoji} {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface DailyTimelineProps {
    date: string;
    onBlockTap: (block: TimeBlock) => void;
    onSlotTap: (time: string) => void;
}

export function DailyTimeline({ date, onBlockTap, onSlotTap }: DailyTimelineProps) {
    const blocks = useDflowStore(useShallow((s) =>
        s.timeBlocks.filter((b) => b.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime))
    ));
    const projects = useDflowStore(useShallow((s) => s.projects));
    const removeMutation = useMutation(api.timeBlocks.remove);
    const deleteTimeBlock = (id: string) => removeMutation({ id: id as Id<"timeBlocks"> });
    const healthLog = useDflowStore(selectHealthLogForDate(date));
    const fastingState = healthLog?.fastingState ?? 'none';

    const [confirmBlock, setConfirmBlock] = useState<{ block: TimeBlock; project?: Project } | null>(null);

    const projectMap = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    const isPastOrToday = date <= today;

    // Position each block as a percentage of total timeline height
    const positionedBlocks = useMemo(() => blocks.map((b) => {
        const start = timeToDecimal(b.startTime);
        const end = timeToDecimal(b.endTime);
        const clampedStart = Math.max(start, TIMELINE_START_HOUR);
        const clampedEnd = Math.min(end, TIMELINE_END_HOUR);
        return {
            block: b,
            topPct: ((clampedStart - TIMELINE_START_HOUR) / TOTAL_HOURS) * 100,
            heightPct: ((clampedEnd - clampedStart) / TOTAL_HOURS) * 100,
        };
    }) as Array<{ block: typeof blocks[number]; topPct: number; heightPct: number }>, [blocks]);

    const SLOT_HEIGHT_PX = 72;
    const TOTAL_HEIGHT = TOTAL_HOURS * SLOT_HEIGHT_PX;

    function handleBlockTap(block: TimeBlock) {
        // If planned and from today or past → open confirm modal
        if (block.status === 'planned' && isPastOrToday) {
            const project = block.projectId ? projectMap[block.projectId] : undefined;
            setConfirmBlock({ block, project });
        } else {
            onBlockTap(block);
        }
    }

    return (
        <>
            {/* Quick Fasting picker — Fix 4 */}
            <QuickFasting date={date} />

            <div className="flex gap-1.5">
                {/* Hour labels column */}
                <div className="flex flex-col shrink-0 w-12" style={{ height: `${TOTAL_HEIGHT}px` }}>
                    {HOUR_LABELS.map((label) => (
                        <div
                            key={label}
                            className="text-[10px] text-muted-foreground/60 font-mono text-right pr-1 shrink-0"
                            style={{ height: `${SLOT_HEIGHT_PX}px`, marginTop: label === HOUR_LABELS[0] ? '-6px' : undefined }}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {/* Fasting strip column */}
                <div className="relative shrink-0 w-1.5" style={{ height: `${TOTAL_HEIGHT}px` }}>
                    <FastingStrip fastingState={fastingState} totalHeight={TOTAL_HEIGHT} />
                </div>

                {/* Timeline body */}
                <div className="flex-1 relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
                    {/* Hour grid lines */}
                    {HOUR_LABELS.map((label, i) => (
                        <div
                            key={label}
                            className="absolute left-0 right-0 border-t border-border/30 cursor-pointer hover:bg-primary/5 transition-colors"
                            style={{ top: `${(i / TOTAL_HOURS) * 100}%`, height: `${SLOT_HEIGHT_PX}px` }}
                            onClick={() => onSlotTap(`${TIMELINE_START_HOUR + i}:00`)}
                        />
                    ))}

                    {/* Half-hour dividers */}
                    {HOUR_LABELS.map((_, i) => (
                        <div
                            key={`half-${i}`}
                            className="absolute left-0 right-0 border-t border-border/10"
                            style={{ top: `${((i + 0.5) / TOTAL_HOURS) * 100}%` }}
                        />
                    ))}

                    {/* Time blocks */}
                    {positionedBlocks.map(({ block, topPct, heightPct }) => (
                        <TimeBlockCard
                            key={block.id}
                            block={block}
                            project={block.projectId ? projectMap[block.projectId] : undefined}
                            topPct={topPct}
                            heightPct={heightPct}
                            onTap={handleBlockTap}
                            onDelete={deleteTimeBlock}
                        />
                    ))}

                    {/* Current time line */}
                    {isToday && <CurrentTimeLine />}
                </div>
            </div>

            {/* Confirm Session Modal */}
            {confirmBlock && (
                <ConfirmSessionModal
                    open={!!confirmBlock}
                    onClose={() => setConfirmBlock(null)}
                    block={confirmBlock.block}
                    project={confirmBlock.project}
                />
            )}
        </>
    );
}
