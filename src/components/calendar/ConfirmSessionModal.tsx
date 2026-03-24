// ============================================================
// CONFIRM SESSION MODAL
// Appears when tapping a 'planned' block that is today or past.
// User declares: did this happen? how many actual hours?
// ============================================================

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useDflowStore } from '@/store/useDflowStore';
import type { TimeBlock, Project } from '@/store/types';

interface ConfirmSessionModalProps {
    open: boolean;
    onClose: () => void;
    block: TimeBlock;
    project?: Project;
}

function blockPlannedHours(b: TimeBlock): number {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    return Math.max(0, (eh + em / 60) - (sh + sm / 60));
}

export function ConfirmSessionModal({ open, onClose, block, project }: ConfirmSessionModalProps) {
    const { confirmBlock, missBlock } = useDflowStore();
    const planned = blockPlannedHours(block);
    const [actualHours, setActualHours] = useState(planned.toFixed(1));

    function handleComplete() {
        const hrs = parseFloat(actualHours) || planned;
        confirmBlock(block.id, hrs);
        onClose();
    }

    function handleMiss() {
        missBlock(block.id);
        onClose();
    }

    const color = project?.color ?? '#6B7280';

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm mx-auto bg-background">
                <DialogHeader>
                    <DialogTitle className="text-base font-black">¿Qué pasó aquí?</DialogTitle>
                    <DialogDescription className="sr-only">
                        Confirmación del estado de un bloque de tiempo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    {/* Block identity */}
                    <div
                        className="rounded-2xl p-3.5 flex items-center gap-3"
                        style={{ backgroundColor: color + '12', borderLeft: `3px solid ${color}` }}
                    >
                        {project && <span className="text-2xl">{project.emoji}</span>}
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{block.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {block.date} · {block.startTime}–{block.endTime} · {planned.toFixed(1)}h planeadas
                            </p>
                        </div>
                    </div>

                    {/* Actual hours input */}
                    <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                        <p className="label-micro text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />Horas reales trabajadas
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActualHours((h) => Math.max(0, parseFloat(h) - 0.5).toFixed(1))}
                                className="w-9 h-9 rounded-xl border border-border bg-white font-bold text-lg flex items-center justify-center hover:bg-muted transition-colors"
                            >−</button>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="24"
                                value={actualHours}
                                onChange={(e) => setActualHours(e.target.value)}
                                className="flex-1 text-center text-2xl font-black bg-transparent focus:outline-none"
                            />
                            <button
                                onClick={() => setActualHours((h) => (parseFloat(h) + 0.5).toFixed(1))}
                                className="w-9 h-9 rounded-xl border border-border bg-white font-bold text-lg flex items-center justify-center hover:bg-muted transition-colors"
                            >+</button>
                            <span className="text-sm font-bold text-muted-foreground">hrs</span>
                        </div>
                        {Math.abs(parseFloat(actualHours) - planned) > 0.1 && (
                            <p className="text-[11px] text-center text-muted-foreground">
                                {parseFloat(actualHours) < planned ? `${(planned - parseFloat(actualHours)).toFixed(1)}h menos de lo planeado` : `${(parseFloat(actualHours) - planned).toFixed(1)}h más de lo planeado — 🔥`}
                            </p>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            onClick={handleComplete}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Completado
                        </Button>
                        <Button
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
                            onClick={handleMiss}
                        >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Lo perdí
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
