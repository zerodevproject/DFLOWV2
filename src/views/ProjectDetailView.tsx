// ============================================================
// PROJECT DETAIL VIEW — About, stats, status management
// ============================================================

import { useState } from 'react';
import { ArrowLeft, Pencil, Check, X, Trash2, Clock, Calendar } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useDflowStore, selectHoursForProject, selectMonthHoursForProject } from '@/store/useDflowStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProjectStatus } from '@/store/types';
import { cn } from '@/lib/utils';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const PRESET_COLORS = ['#E11D48', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#65A30D'];
const PRESET_EMOJIS = ['⚡', '🔮', '🌊', '🎸', '🚀', '🎯', '🔥', '💡', '🏗️', '🎵', '⚙️', '🌱'];

const STATUS_OPTIONS: { value: ProjectStatus; label: string; desc: string; icon: string }[] = [
    { value: 'active', label: 'Activo', desc: 'En el tablero principal', icon: '🟢' },
    { value: 'background', label: 'En Pausa', desc: 'Listo para volver pronto', icon: '🟡' },
    { value: 'archived', label: 'Archivado', desc: 'Terminado · En el cementerio', icon: '⚫' },
];

interface ProjectDetailViewProps {
    projectId: string;
    onBack: () => void;
}

export function ProjectDetailView({ projectId, onBack }: ProjectDetailViewProps) {
    const project = useDflowStore((s) => s.projects.find((p) => p.id === projectId));
    const updateProject = useMutation(api.projects.update);
    const deleteProject = useMutation(api.projects.remove);
    const recentBlocks = useDflowStore(useShallow((s) =>
        s.timeBlocks
            .filter((b) => b.projectId === projectId)
            .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
            .slice(0, 6)
    ));

    const totalHours = useDflowStore(selectHoursForProject(projectId));
    const monthHours = useDflowStore(selectMonthHoursForProject(projectId));

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState(project?.name ?? '');
    const [editingDesc, setEditingDesc] = useState(false);
    const [description, setDescription] = useState(project?.description ?? '');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-muted-foreground">Proyecto no encontrado</p>
                <Button variant="outline" onClick={onBack}>Volver</Button>
            </div>
        );
    }

    function saveName() {
        if (name.trim()) updateProject({ id: projectId as Id<"projects">, updates: { name: name.trim() } });
        setEditingName(false);
    }
    function saveDesc() {
        updateProject({ id: projectId as Id<"projects">, updates: { description: description.trim() } });
        setEditingDesc(false);
    }
    async function handleDelete() {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        await deleteProject({ id: projectId as Id<"projects"> });
        onBack();
    }

    return (
        <div className="space-y-5 animate-in">
            {/* Back */}
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-1">
                <ArrowLeft className="w-4 h-4" />
                Proyectos
            </button>

            {/* Hero header */}
            <div
                className="rounded-3xl p-5 relative overflow-hidden"
                style={{ backgroundColor: project.color + '12', border: `1.5px solid ${project.color}25` }}
            >
                {/* Emoji */}
                <button
                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowColorPicker(false); }}
                    className="text-5xl mb-3 block hover:scale-110 transition-transform"
                >
                    {project.emoji}
                </button>

                {/* Emoji picker */}
                {showEmojiPicker && (
                    <div className="absolute top-16 left-5 bg-white rounded-2xl p-3 shadow-xl border border-border z-10 flex flex-wrap gap-2 w-56">
                        {PRESET_EMOJIS.map((e) => (
                            <button key={e} onClick={() => { updateProject({ id: projectId as Id<"projects">, updates: { emoji: e } }); setShowEmojiPicker(false); }}
                                className={cn('w-9 h-9 rounded-xl text-xl flex items-center justify-center hover:bg-muted', project.emoji === e && 'bg-muted')}>
                                {e}
                            </button>
                        ))}
                    </div>
                )}

                {/* Name */}
                <div className="flex items-center gap-2">
                    {editingName ? (
                        <>
                            <Input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 font-black text-xl h-9 bg-white/80" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveName()} />
                            <button onClick={saveName} className="p-1.5 bg-white rounded-lg shadow-sm"><Check className="w-4 h-4 text-primary" /></button>
                            <button onClick={() => setEditingName(false)} className="p-1.5 bg-white rounded-lg shadow-sm"><X className="w-4 h-4 text-muted-foreground" /></button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-black tracking-tight flex-1">{project.name}</h1>
                            <button onClick={() => setEditingName(true)} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                                <Pencil className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </>
                    )}
                </div>

                {/* Color dot */}
                <button
                    onClick={() => { setShowColorPicker(!showColorPicker); setShowEmojiPicker(false); }}
                    className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                    Cambiar color
                </button>

                {showColorPicker && (
                    <div className="absolute bottom-4 left-5 bg-white rounded-2xl p-3 shadow-xl border border-border z-10 flex flex-wrap gap-2 w-56">
                        {PRESET_COLORS.map((c) => (
                            <button key={c} onClick={() => { updateProject({ id: projectId as Id<"projects">, updates: { color: c } }); setShowColorPicker(false); }}
                                className={cn('w-8 h-8 rounded-full transition-transform hover:scale-110', project.color === c && 'ring-2 ring-offset-2 ring-foreground/30')}
                                style={{ backgroundColor: c }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Total acumulado', value: `${totalHours.toFixed(1)}h`, icon: <Clock className="w-4 h-4" /> },
                    { label: 'Este mes', value: `${monthHours.toFixed(1)}h`, icon: <Calendar className="w-4 h-4" /> },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-3.5 border border-border">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">{stat.icon}<span className="label-micro">{stat.label}</span></div>
                        <p className="text-2xl font-black tracking-tight" style={{ color: project.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* About / Description */}
            <div className="bg-white rounded-2xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <p className="label-micro text-muted-foreground">About</p>
                    {!editingDesc && (
                        <button onClick={() => setEditingDesc(true)} className="p-1 hover:bg-muted rounded-lg">
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    )}
                </div>
                {editingDesc ? (
                    <div className="space-y-2">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            autoFocus
                            className="w-full text-sm bg-muted/30 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 h-28"
                            placeholder="¿Cuál es la visión de este proyecto? ¿Qué problema resuelve? ¿Cuál es el MVP?"
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={saveDesc} className="flex-1">Guardar</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingDesc(false)}>Cancelar</Button>
                        </div>
                    </div>
                ) : (
                    <p className={cn('text-sm leading-relaxed', !project.description && 'text-muted-foreground italic')}>
                        {project.description || 'Sin descripción — toca el lápiz para agregar la visión del proyecto.'}
                    </p>
                )}
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
                <p className="label-micro text-muted-foreground">Estado del Proyecto</p>
                <div className="space-y-2">
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => updateProject({ id: projectId as Id<"projects">, updates: { status: opt.value } })}
                            className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                                project.status === opt.value
                                    ? 'border-foreground/20 bg-muted/40'
                                    : 'border-transparent hover:bg-muted/30'
                            )}
                        >
                            <span className="text-lg">{opt.icon}</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold">{opt.label}</p>
                                <p className="text-xs text-muted-foreground">{opt.desc}</p>
                            </div>
                            {project.status === opt.value && <Check className="w-4 h-4 text-foreground" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent blocks */}
            {recentBlocks.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
                    <p className="label-micro text-muted-foreground">Bloques Recientes</p>
                    <div className="space-y-2">
                        {recentBlocks.map((b) => {
                            const [sh, sm] = b.startTime.split(':').map(Number);
                            const [eh, em] = b.endTime.split(':').map(Number);
                            const hrs = (eh + em / 60) - (sh + sm / 60);
                            return (
                                <div key={b.id} className="flex items-center gap-3 py-1.5">
                                    {/* Status Indicator */}
                                    <div className="flex flex-col items-center shrink-0 w-8">
                                        {b.status === 'completed' ? (
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                                                <Check className="w-3 h-3 text-emerald-600" />
                                            </div>
                                        ) : b.status === 'missed' ? (
                                            <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30">
                                                <X className="w-3 h-3 text-rose-600" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-semibold truncate", b.status === 'missed' && "text-muted-foreground line-through")}>{b.title}</p>
                                        <p className="text-xs text-muted-foreground">{b.date} · {b.startTime}–{b.endTime}</p>
                                    </div>
                                    <span className={cn("text-xs font-bold shrink-0", b.status === 'completed' ? "text-emerald-600" : "text-muted-foreground")}>
                                        {hrs.toFixed(1)}h
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Danger zone */}
            <div className="pt-2 pb-6">
                <Button
                    variant="outline"
                    className={cn('w-full border-destructive/30 text-destructive hover:bg-destructive/5', confirmDelete && 'bg-destructive text-destructive-foreground border-destructive')}
                    onClick={handleDelete}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {confirmDelete ? 'Confirmar eliminación' : 'Eliminar Proyecto'}
                </Button>
                {confirmDelete && (
                    <p className="text-xs text-center text-muted-foreground mt-2">Los bloques de tiempo del proyecto quedarán sin asignar.</p>
                )}
            </div>
        </div>
    );
}
