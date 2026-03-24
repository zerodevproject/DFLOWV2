// ============================================================
// SETTINGS VIEW — Profile, Parking Lot, Background projects
// ============================================================

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { User, Lightbulb, Check, RotateCcw, Trash2, Pencil } from 'lucide-react';
import { useDflowStore } from '@/store/useDflowStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';


function ProfileSection() {
    const { userProfile } = useDflowStore();
    const updateProfile = useMutation(api.users.update);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(userProfile?.name || 'Usuario');
    const [tagline, setTagline] = useState(userProfile?.tagline || 'Productor Metabólico');

    async function handleSave() {
        await updateProfile({ name: name.trim(), tagline: tagline.trim() });
        setEditing(false);
    }

    return (
        <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
                <p className="label-micro text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Mi Perfil</p>
                {!editing && (
                    <button onClick={() => { setName(userProfile.name); setTagline(userProfile.tagline); setEditing(true); }}
                        className="p-1 hover:bg-muted rounded-lg">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                )}
            </div>
            {editing ? (
                <div className="space-y-2.5">
                    <Input placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="font-bold" />
                    <Input placeholder="Ej: Músico · Desarrollador · Padre" value={tagline} onChange={(e) => setTagline(e.target.value)} className="text-sm" />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} className="flex-1">Guardar</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className="font-black text-xl">{userProfile.name}</p>
                    <p className="text-sm text-muted-foreground">{userProfile.tagline}</p>
                </div>
            )}
        </div>
    );
}

function ParkingLotSection() {
    const parkingItems = useDflowStore(useShallow((s) => s.parkingItems));
    const projects = useDflowStore(useShallow((s) => s.projects));

    const addMutation = useMutation(api.parkingLot.add);
    const resolveMutation = useMutation(api.parkingLot.markResolved);
    const deleteMutation = useMutation(api.parkingLot.remove);

    const [idea, setIdea] = useState('');

    const unresolved = parkingItems.filter((i) => !i.isResolved);

    async function handleSave(projectId?: string) {
        if (!idea.trim()) return;
        await addMutation({
            content: idea.trim(),
            projectId: projectId as Id<"projects"> | undefined
        });
        setIdea('');
    }

    const activeProjects = projects.filter((p) => p.status !== 'archived');

    return (
        <div className="space-y-3">
            <p className="label-micro text-muted-foreground flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" />Parking Lot de Ideas</p>

            {/* Input */}
            <div className="bg-white rounded-2xl border border-border p-3.5 space-y-3">
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Captura la idea sin romper el flow..."
                    className="w-full bg-transparent text-sm focus:outline-none resize-none h-16 placeholder:text-muted-foreground/50"
                />
                <div className="flex gap-2 flex-wrap border-t border-border pt-3">
                    {activeProjects.map((p) => (
                        <button key={p.id} onClick={() => handleSave(p.id)} disabled={!idea.trim()}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ borderColor: p.color + '50', backgroundColor: p.color + '12', color: p.color }}>
                            {p.emoji} {p.name}
                        </button>
                    ))}
                    <button onClick={() => handleSave()} disabled={!idea.trim()}
                        className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/50 disabled:opacity-40">
                        Sin proyecto
                    </button>
                </div>
            </div>

            {/* List */}
            {unresolved.length > 0 && (
                <div className="space-y-2">
                    {unresolved.map((item) => {
                        const project = item.projectId ? projects.find((p) => p.id === item.projectId) : null;
                        return (
                            <div key={item.id} className="bg-white rounded-xl border border-border p-3 flex gap-2.5 items-start group">
                                <button onClick={() => resolveMutation({ id: item.id as Id<"parkingLot"> })}
                                    className="mt-0.5 w-5 h-5 rounded-full border border-border shrink-0 hover:bg-green-100 hover:border-green-400 flex items-center justify-center transition-colors">
                                    <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 text-green-600 transition-opacity" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-snug">{item.content}</p>
                                    {project && (
                                        <span className="label-micro px-1.5 py-0.5 rounded-full mt-1 inline-block"
                                            style={{ backgroundColor: project.color + '18', color: project.color }}>
                                            {project.emoji} {project.name}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => deleteMutation({ id: item.id as Id<"parkingLot"> })}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {unresolved.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Sin ideas pendientes. ¡Foco total! 🎯</p>
            )}
        </div>
    );
}

function BackgroundProjectsSection() {
    const projects = useDflowStore(useShallow((s) => s.projects));
    const updateProject = useMutation(api.projects.update);
    const bg = projects.filter((p) => p.status === 'background');
    const archived = projects.filter((p) => p.status === 'archived');

    if (bg.length === 0 && archived.length === 0) return null;

    return (
        <div className="space-y-3">
            {bg.length > 0 && (
                <div className="space-y-2">
                    <p className="label-micro text-muted-foreground">En Pausa — Listos para Volver</p>
                    {bg.map((p) => (
                        <div key={p.id} className="bg-white rounded-xl border border-border p-3 flex items-center gap-3">
                            <span className="text-2xl">{p.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{p.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                            </div>
                            <button onClick={() => updateProject({ id: p.id as Id<"projects">, updates: { status: 'active' } })}
                                className="flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1.5 rounded-lg transition-colors shrink-0">
                                <RotateCcw className="w-3.5 h-3.5" /> Activar
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {archived.length > 0 && (
                <div className="space-y-2">
                    <p className="label-micro text-muted-foreground">Archivados — Cementerio</p>
                    {archived.map((p) => (
                        <div key={p.id} className="bg-white rounded-xl border border-border p-3 flex items-center gap-3 opacity-60">
                            <span className="text-2xl grayscale">{p.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate line-through text-muted-foreground">{p.name}</p>
                            </div>
                            <button onClick={() => updateProject({ id: p.id as Id<"projects">, updates: { status: 'active' } })}
                                className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg transition-colors shrink-0">
                                <RotateCcw className="w-3.5 h-3.5" /> Revivir
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function SettingsView() {
    return (
        <div className="space-y-6 animate-in pb-4">
            <div>
                <p className="label-micro text-muted-foreground mb-1">Configuración</p>
                <h1 className="heading-editorial">Ajustes</h1>
            </div>

            <ProfileSection />
            <BackgroundProjectsSection />
            <ParkingLotSection />

            <div className="text-center pt-4">
                <p className="label-micro text-muted-foreground/50">Dflow · Productividad Metabólica Dinámica</p>
            </div>
        </div>
    );
}
