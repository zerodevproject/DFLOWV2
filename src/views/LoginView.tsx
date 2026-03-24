import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, Lock, Mail, ArrowRight } from "lucide-react";

export function LoginView() {
    const { signIn } = useAuthActions();
    const [step, setStep] = useState<"signIn" | "signUp">("signIn");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(e.currentTarget);
        try {
            await signIn("password", formData);
        } catch (err) {
            console.error(err);
            setError("Email o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in duration-700">
            <div className="w-full max-w-[420px] space-y-10">

                {/* Editorial Branding */}
                <div className="space-y-4 text-center sm:text-left">
                    <div className="flex items-center gap-3 justify-center sm:justify-start">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Terminal className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic">Dflow</span>
                    </div>
                    <div className="space-y-1">
                        <h1 className="heading-editorial text-4xl sm:text-5xl leading-[1.1]">
                            Tu Ritmo. <br />
                            <span className="text-muted-foreground/40 italic">Elevado.</span>
                        </h1>
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-[320px]">
                            El sistema de productividad metabólica para mentes secuenciales.
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-[32px] border border-border p-8 shadow-xl shadow-black/[0.02] space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="label-micro px-1">Correo Electrónico</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="hola@dflow.com"
                                    required
                                    className="pl-11 h-14 rounded-2xl bg-muted/30 border-transparent focus:bg-white focus:border-primary/20 transition-all text-base"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="label-micro px-1">Contraseña</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="pl-11 h-14 rounded-2xl bg-muted/30 border-transparent focus:bg-white focus:border-primary/20 transition-all text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-destructive text-xs font-bold px-1 animate-in slide-in-from-top-1">{error}</p>}

                    <input name="flow" type="hidden" value={step} />

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl text-lg font-black tracking-tight group relative overflow-hidden active:scale-[0.98] transition-all"
                    >
                        {loading ? "Cargando..." : (
                            <span className="flex items-center justify-center gap-2">
                                {step === 'signIn' ? "Entrar al Sistema" : "Crear Mi Cuenta"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground pt-2">
                        {step === 'signIn' ? "¿Nuevo en Dflow? " : "¿Ya tienes cuenta? "}
                        <button
                            type="button"
                            onClick={() => setStep(step === 'signIn' ? 'signUp' : 'signIn')}
                            className="text-primary font-bold hover:underline"
                        >
                            {step === 'signIn' ? "Empieza aquí" : "Inicia Sesión"}
                        </button>
                    </p>
                </form>

                <p className="text-center label-micro text-muted-foreground/30 uppercase tracking-[0.2em] pt-8">
                    Diseñado para el Flujo Continuo
                </p>
            </div>
        </div>
    );
}
