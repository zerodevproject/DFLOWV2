// ============================================================
// PARKING LOT VIEW — Quick idea capture. Dynamic from store.
// ============================================================

import { useState } from 'react';
import { Lightbulb, Check } from 'lucide-react';
import { useDflowStore } from '@/store/useDflowStore';

export function ParkingLotView() {
    const { projects, parkingItems, addParkingItem, resolveParking } = useDflowStore();
    const [idea, setIdea] = useState('');

    const activeProjects = projects.filter((p) => p.status !== 'archived');
    const unresolved = parkingItems.filter((i) => !i.isResolved);

    function handleSave(projectId?: string) {
        if (!idea.trim()) return;
        addParkingItem(idea.trim(), projectId);
        setIdea('');
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Parking Lot</h1>
                <p className="text-sm text-muted-foreground">Captura sin romper el Foco</p>
            </div>

            {/* Input area */}
            <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-4 shadow-lg">
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Escribe tu idea genial aquí... y luego vuelve al trabajo."
                    className="w-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-base placeholder:text-muted-foreground/40 h-28"
                />

                {/* Project assignment — dynamic from store */}
                <div className="border-t border-border/40 pt-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Asignar y Guardar</p>
                    <div className="flex gap-2 flex-wrap">
                        {activeProjects.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => handleSave(p.id)}
                                disabled={!idea.trim()}
                                className="px-3 py-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ borderColor: p.color + '60', backgroundColor: p.color + '15', color: p.color }}
                            >
                                {p.name}
                            </button>
                        ))}
                        <button
                            onClick={() => handleSave(undefined)}
                            disabled={!idea.trim()}
                            className="px-3 py-2 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-card/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Sin proyecto
                        </button>
                    </div>
                </div>
            </div>

            {/* Unresolved ideas */}
            <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Ideas Estacionadas ({unresolved.length})
                </h2>

                <div className="space-y-2">
                    {unresolved.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">No hay ideas pendientes. ¡Foco total! 🎯</p>
                    )}
                    {unresolved.map((item) => {
                        const project = item.projectId ? projects.find((p) => p.id === item.projectId) : null;
                        return (
                            <div key={item.id} className="p-3.5 rounded-xl border border-border/50 bg-card/30 flex gap-3 items-start group">
                                <button
                                    onClick={() => resolveParking(item.id)}
                                    className="mt-0.5 w-5 h-5 rounded-full border border-border/60 shrink-0 hover:bg-green-500/20 hover:border-green-500/60 transition-colors flex items-center justify-center"
                                >
                                    <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 text-green-400 transition-opacity" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground leading-snug">{item.content}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        {project && (
                                            <span
                                                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: project.color + '20', color: project.color }}
                                            >
                                                {project.name}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(item.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
