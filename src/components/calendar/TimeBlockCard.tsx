// ============================================================
// TIME BLOCK CARD v4 — Planned (ghost) / Completed (solid) / Missed (faded)
// ============================================================

import { Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeBlock, Project } from '@/store/types';

const TYPE_COLORS: Record<string, string> = {
    health: '#059669',
    life: '#E11D48',
    flow: '#7C3AED',
};

interface TimeBlockCardProps {
    block: TimeBlock;
    project?: Project;
    topPct: number;
    heightPct: number;
    onTap: (block: TimeBlock) => void;
    onDelete: (id: string) => void;
}

export function TimeBlockCard({ block, project, topPct, heightPct, onTap, onDelete }: TimeBlockCardProps) {
    const color = project?.color || TYPE_COLORS[block.type] || '#6B7280';
    const minHeight = Math.max(heightPct, 3);
    const status = block.status ?? 'completed'; // default legacy blocks to completed

    const isPlanned = status === 'planned';
    const isCompleted = status === 'completed';
    const isMissed = status === 'missed';

    return (
        <div
            className={cn(
                'absolute left-0 right-0 rounded-xl cursor-pointer group select-none overflow-hidden transition-opacity',
                isPlanned && 'opacity-70',
                isMissed && 'opacity-35',
            )}
            style={{
                top: `${topPct}%`,
                height: `${minHeight}%`,
                // Ghost: dashed border, very light fill
                // Solid: left border + translucent fill
                // Missed: same as ghost but grayscale
                backgroundColor: isMissed ? '#6B728014' : color + (isPlanned ? '0D' : '18'),
                border: isPlanned
                    ? `1.5px dashed ${color}60`
                    : isMissed
                        ? `1.5px dashed #6B728040`
                        : `none`,
                borderLeft: isPlanned ? undefined : isMissed ? undefined : `3px solid ${color}`,
            }}
            onClick={() => onTap(block)}
        >
            <div className="px-2.5 py-1.5 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                        <p
                            className={cn('text-xs font-bold truncate', isMissed && 'line-through')}
                            style={{ color: isMissed ? '#9CA3AF' : color }}
                        >
                            {isPlanned && <span className="opacity-60 mr-1">○</span>}
                            {isCompleted && <span className="mr-0.5">●</span>}
                            {block.title}
                        </p>
                        {project && (
                            <p className="text-[10px] truncate font-medium" style={{ color: isMissed ? '#9CA3AF' : color + 'BB' }}>
                                {!isMissed && `${project.emoji} `}{project.name}
                            </p>
                        )}
                    </div>
                    {/* Completed badge */}
                    {isCompleted && (
                        <CheckCircle2 className="w-3 h-3 shrink-0 opacity-60 text-emerald-600" />
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-0.5 text-destructive/60 hover:text-destructive"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
                {heightPct > 6 && (
                    <p className="text-[10px] font-mono" style={{ color: isMissed ? '#9CA3AF' : color + '99' }}>
                        {block.startTime} – {block.endTime}
                        {isCompleted && block.actualHours !== undefined && (
                            <span className="ml-1 text-emerald-600 font-bold">✓ {block.actualHours}h</span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
}
