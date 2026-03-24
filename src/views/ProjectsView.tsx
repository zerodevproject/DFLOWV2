// ============================================================
// PROJECTS VIEW v3 — Editorial cards, tap → detail
// ============================================================

import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useDflowStore, selectMonthHoursForProject } from '@/store/useDflowStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ProjectStatus } from '@/store/types';
import { cn } from '@/lib/utils';
import { useMutation } from 'convex/react';
import { api } from '@/generated_mock/api';

const PRESET_COLORS = ['#E11D48', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#65A30D'];
const PRESET_EMOJIS = ['⚡', '🔮', '🌊', '🎸', '🚀', '🎯', '🔥', '💡', '🏗️', '🎵', '⚙️', '🌱'];

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
    active: { label: 'Activo', color: '#059669' },
    background: { label: 'En Pausa', color: '#D97706' },
    archived: { label: 'Archivado', color: '#6B7280' },
    'on-hold': { label: 'En Espera', color: '#9333EA' },
    completed: { label: 'Completado', color: '#2563EB' },
};

interface ProjectsViewProps {
    onSelectProject: (id: string) => void;
}

function ProjectCard({ projectId, onSelect }: { projectId: string; onSelect: () => void }) {
    const project = useDflowStore((s) => s.projects.find((p) => p.id === projectId))!;
    const monthHours = useDflowStore(selectMonthHoursForProject(projectId));
    const TARGET = 40;
    const pct = Math.min((monthHours / TARGET) * 100, 100);

    return (
        <button
            onClick={onSelect}
            className="w-full text-left bg-white rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all active:scale-[0.99] group"
        >
            <div className="flex items-center gap-3">
                {/* Color + emoji badge */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: project.color + '18', border: `1.5px solid ${project.color}30` }}
                >
                    {project.emoji}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-base truncate">{project.name}</span>
                        <span
                            className="label-micro px-1.5 py-0.5 rounded-full shrink-0"
                            style={{
                                backgroundColor: STATUS_CONFIG[project.status].color + '18',
                                color: STATUS_CONFIG[project.status].color,
                            }}
                        >
                            {STATUS_CONFIG[project.status].label}
                        </span>
                    </div>
                    {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                    )}
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
            </div>

            {project.status === 'active' && (
                <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] text-muted-foreground">Este mes</span>
                        <span className="text-[11px] font-bold" style={{ color: project.color }}>
                            {monthHours.toFixed(1)}h / {TARGET}h
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: project.color }}
                        />
                    </div>
                </div>
            )}
        </button>
    );
}

export function ProjectsView({ onSelectProject }: ProjectsViewProps) {
    const projects = useDflowStore(useShallow((s) => s.projects));
    const addProject = useMutation(api.projects.add);
    const [addOpen, setAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmoji, setNewEmoji] = useState('⚡');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
    const [newDesc, setNewDesc] = useState('');

    const active = projects.filter((p) => p.status === 'active');
    const background = projects.filter((p) => p.status === 'background');

    function handleAdd() {
        if (!newName.trim()) return;
        addProject({ name: newName.trim(), emoji: newEmoji, color: newColor, description: newDesc.trim(), status: 'active' });
        setNewName(''); setNewEmoji('⚡'); setNewColor(PRESET_COLORS[0]); setNewDesc('');
        setAddOpen(false);
    }

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="label-micro text-muted-foreground mb-1">Sistema de Proyectos</p>
                    <h1 className="heading-editorial">Proyectos</h1>
                </div>
                <button
                    onClick={() => setAddOpen(true)}
                    className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Active */}
            {active.length > 0 && (
                <div className="space-y-2.5">
                    <p className="label-micro text-muted-foreground">Activos — {active.length}</p>
                    {active.map((p) => (
                        <ProjectCard key={p.id} projectId={p.id} onSelect={() => onSelectProject(p.id)} />
                    ))}
                </div>
            )}

            {/* Background */}
            {background.length > 0 && (
                <div className="space-y-2.5">
                    <p className="label-micro text-muted-foreground">En Pausa — {background.length}</p>
                    {background.map((p) => (
                        <ProjectCard key={p.id} projectId={p.id} onSelect={() => onSelectProject(p.id)} />
                    ))}
                </div>
            )}

            {active.length === 0 && background.length === 0 && (
                <div className="text-center py-16 space-y-2">
                    <p className="text-4xl">📂</p>
                    <p className="font-bold text-foreground">Sin proyectos activos</p>
                    <p className="text-sm text-muted-foreground">Crea tu primer proyecto para comenzar</p>
                </div>
            )}

            {/* Add dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-sm mx-auto">
                    <DialogHeader><DialogTitle className="text-lg font-black">Nuevo Proyecto</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-1">
                        {/* Emoji picker */}
                        <div>
                            <p className="label-micro text-muted-foreground mb-2">Emoji</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_EMOJIS.map((e) => (
                                    <button
                                        key={e}
                                        onClick={() => setNewEmoji(e)}
                                        className={cn('w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all', newEmoji === e ? 'bg-foreground/10 ring-2 ring-foreground/30' : 'hover:bg-muted')}
                                    >{e}</button>
                                ))}
                            </div>
                        </div>

                        <Input placeholder="Nombre del proyecto — ej: Level Zero" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus className="font-semibold" />

                        <textarea
                            placeholder="Descripción / About (opcional) — ¿Cuál es la visión de este proyecto?"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full text-sm bg-transparent border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 h-20 placeholder:text-muted-foreground/50"
                        />

                        <div>
                            <p className="label-micro text-muted-foreground mb-2">Color</p>
                            <div className="flex gap-2 flex-wrap">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setNewColor(c)}
                                        className={cn('w-8 h-8 rounded-full transition-transform', newColor === c ? 'scale-110 ring-2 ring-offset-2 ring-foreground/30' : 'hover:scale-105')}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button className="w-full font-bold" onClick={handleAdd} disabled={!newName.trim()}>
                            Crear Proyecto
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
