// ============================================================
// BLOCK MODAL v3 — Cream theme, dynamic project list
// ============================================================

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Save } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useDflowStore } from '@/store/useDflowStore';
import type { TimeBlock, BlockType } from '@/store/types';
import { cn } from '@/lib/utils';
import { useMutation } from 'convex/react';
import { api } from '@/generated_mock/api';
import type { Id } from '../../../convex/_generated/dataModel';

const BLOCK_TYPES: { value: BlockType; label: string; icon: string; color: string }[] = [
    { value: 'work', label: 'Trabajo', icon: '💻', color: '#2563EB' },
    { value: 'flow', label: 'Flow Extra', icon: '⚡', color: '#7C3AED' },
    { value: 'health', label: 'Salud', icon: '🔥', color: '#059669' },
    { value: 'life', label: 'Vida', icon: '❤️', color: '#E11D48' },
];

interface BlockModalProps {
    open: boolean;
    onClose: () => void;
    existingBlock?: TimeBlock | null;
    defaultDate?: string;
    defaultStartTime?: string;
}

export function BlockModal({ open, onClose, existingBlock, defaultDate, defaultStartTime }: BlockModalProps) {
    const upsertTimeBlock = useMutation(api.timeBlocks.upsert);
    const removeTimeBlock = useMutation(api.timeBlocks.remove);

    const projects = useDflowStore(useShallow((s) => s.projects.filter((p) => p.status === 'active')));

    const today = new Date().toISOString().split('T')[0];
    const [type, setType] = useState<BlockType>('work');
    const [title, setTitle] = useState('');
    const [projectId, setProjectId] = useState('');
    const [date, setDate] = useState(defaultDate || today);
    const [startTime, setStartTime] = useState(defaultStartTime || '09:30');
    const [endTime, setEndTime] = useState('12:00');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (existingBlock) {
            setType(existingBlock.type);
            setTitle(existingBlock.title);
            setProjectId(existingBlock.projectId || '');
            setDate(existingBlock.date);
            setStartTime(existingBlock.startTime);
            setEndTime(existingBlock.endTime);
            setNotes(existingBlock.notes || '');
        } else {
            setType('work');
            setTitle('');
            setProjectId(projects[0]?.id || '');
            setDate(defaultDate || today);
            setStartTime(defaultStartTime || '09:30');
            setEndTime('12:00');
            setNotes('');
        }
    }, [existingBlock, open, defaultDate, defaultStartTime]);

    const needsProject = type === 'work' || type === 'flow';

    async function handleSave() {
        if (!title.trim()) return;
        const data = {
            type,
            title: title.trim(),
            projectId: needsProject && projectId ? (projectId as Id<"projects">) : undefined,
            date,
            startTime,
            endTime,
            notes: notes.trim() || undefined,
            status: 'planned' as const,
        };
        if (existingBlock) {
            await upsertTimeBlock({ id: existingBlock.id as Id<"timeBlocks">, ...data });
        } else {
            await upsertTimeBlock(data);
        }
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm mx-auto bg-background">
                <DialogHeader>
                    <DialogTitle className="text-lg font-black">
                        {existingBlock ? 'Editar Bloque' : 'Nuevo Bloque'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulario para crear o editar un bloque de tiempo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    {/* Type selector */}
                    <div className="grid grid-cols-4 gap-1.5">
                        {BLOCK_TYPES.map((bt) => (
                            <button
                                key={bt.value}
                                onClick={() => setType(bt.value)}
                                className={cn(
                                    'flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[10px] font-bold transition-all',
                                    type === bt.value
                                        ? 'border-2 bg-white shadow-sm'
                                        : 'border-border/60 text-muted-foreground hover:border-border bg-white/50'
                                )}
                                style={type === bt.value ? { borderColor: bt.color, color: bt.color } : {}}
                            >
                                <span className="text-xl">{bt.icon}</span>
                                {bt.label}
                            </button>
                        ))}
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="block-title" className="label-micro text-muted-foreground">Título</Label>
                        <Input id="block-title" value={title} onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Deep Work — Módulo Auth" autoFocus className="bg-white" />
                    </div>

                    {/* Project */}
                    {needsProject && projects.length > 0 && (
                        <div className="space-y-1.5">
                            <Label className="label-micro text-muted-foreground">Proyecto</Label>
                            <div className="flex flex-wrap gap-2">
                                {projects.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setProjectId(p.id)}
                                        className={cn(
                                            'flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all',
                                            projectId === p.id ? 'border-2 bg-white shadow-sm' : 'border-border/50 hover:border-border bg-white/50'
                                        )}
                                        style={projectId === p.id ? { borderColor: p.color, color: p.color } : { color: 'hsl(var(--muted-foreground))' }}
                                    >
                                        <span className="text-sm">{p.emoji}</span>{p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date + Times */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="block-date" className="label-micro text-muted-foreground">Fecha</Label>
                            <Input id="block-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-xs bg-white" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="block-start" className="label-micro text-muted-foreground">Inicio</Label>
                            <Input id="block-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="text-xs bg-white" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="block-end" className="label-micro text-muted-foreground">Fin</Label>
                            <Input id="block-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="text-xs bg-white" />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <Label htmlFor="block-notes" className="label-micro text-muted-foreground">Nota (opcional)</Label>
                        <Input id="block-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="¿Qué harás en este bloque?" className="bg-white" />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        {existingBlock && (
                            <Button variant="outline" size="icon" className="shrink-0 hover:text-destructive hover:border-destructive/50"
                                onClick={async () => { await removeTimeBlock({ id: existingBlock.id as Id<"timeBlocks"> }); onClose(); }}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                        <Button className="flex-1 bg-foreground text-background hover:bg-foreground/90" onClick={handleSave} disabled={!title.trim()}>
                            <Save className="w-4 h-4 mr-2" />
                            {existingBlock ? 'Guardar Cambios' : 'Crear Bloque'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
