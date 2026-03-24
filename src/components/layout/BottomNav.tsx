import { CalendarIcon, FolderKanban, Activity, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
}

const TABS = [
    { id: "calendar", icon: CalendarIcon, label: "Calendario" },
    { id: "flow", icon: Zap, label: "Flow" },
    { id: "projects", icon: FolderKanban, label: "Proyectos" },
    { id: "health", icon: Activity, label: "Salud" },
    { id: "settings", icon: Settings, label: "Ajustes" },
];

export function BottomNav({ currentTab, setCurrentTab }: BottomNavProps) {
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto
        bg-white/90 backdrop-blur-xl border-t border-border
        flex justify-around items-center h-16"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {TABS.map((tab) => {
                const isActive = currentTab === tab.id;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id)}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 transition-all",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
                        <span className={cn("label-micro", isActive ? "text-primary" : "text-muted-foreground")}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
