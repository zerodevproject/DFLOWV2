import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Zap, Target, ArrowRight } from "lucide-react";

export function CompassView() {
    const [isFlowOpen, setIsFlowOpen] = useState(false);

    // Mock data (This will come from Convex)
    const today = new Date().toLocaleDateString("es-ES", { weekday: "long" });
    const dayName = today.charAt(0).toUpperCase() + today.slice(1);
    const metabolicState = "🔥 Ayuno 24h (Cena a Cena) Activo";
    const metabolicColor = "text-orange-500";
    const focusProject = "Proyecto A";
    const focusProjectColor = "bg-red-500/10 text-red-500 border-red-500/20";

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight">Hoy es {dayName}</h1>
                <p className="text-muted-foreground font-medium">Semana 1 del Ciclo</p>
            </div>

            <Card className={`border-2 ${focusProjectColor} shadow-lg shadow-red-500/5`}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        FOCO DE HOY
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{focusProject}</div>
                    <p className="text-xs mt-1 opacity-80">Estado: En Progreso</p>
                </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Flame className="w-4 h-4" />
                        ESTADO METABÓLICO
                    </div>
                    <div className={`text-sm font-bold ${metabolicColor}`}>
                        {metabolicState}
                    </div>
                </CardContent>
            </Card>

            {/* Floating Action Button for Flow */}
            <div className="fixed bottom-24 right-4 z-40">
                <Dialog open={isFlowOpen} onOpenChange={setIsFlowOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" className="h-16 w-16 rounded-full shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Zap className="w-8 h-8" fill="currentColor" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" fill="currentColor" />
                                Entrar en Flow
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <p className="text-sm text-muted-foreground">
                                ¿A qué proyecto le vas a dedicar este bloque de energía extra?
                            </p>

                            <div className="space-y-2">
                                <Label>Proyecto a inyectar</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline" className="border-red-500/30 hover:bg-red-500/10 hover:text-red-500">Proy A</Button>
                                    <Button variant="outline" className="border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500">Proy B</Button>
                                    <Button variant="outline" className="border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-500">Proy C</Button>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label htmlFor="duration">Horas estimadas (Retroactivo)</Label>
                                <Input id="duration" type="number" placeholder="Ej: 2.5" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Nota (Opcional)</Label>
                                <Input id="notes" placeholder="Ej: Refactorización de BD" />
                            </div>

                            <Button className="w-full mt-4" onClick={() => setIsFlowOpen(false)}>
                                Registrar Flow <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
