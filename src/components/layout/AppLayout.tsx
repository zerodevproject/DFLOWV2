import { useState, useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { CalendarView } from "@/views/CalendarView";
import { FlowView } from "@/views/FlowView";
import { ProjectsView } from "@/views/ProjectsView";
import { ProjectDetailView } from "@/views/ProjectDetailView";
import { HealthView } from "@/views/HealthView";
import { SettingsView } from "@/views/SettingsView";

export type AppView =
    | { tab: 'calendar' }
    | { tab: 'flow' }
    | { tab: 'projects' }
    | { tab: 'projects-detail'; projectId: string }
    | { tab: 'health' }
    | { tab: 'settings' };

export function AppLayout() {
    const [view, setView] = useState<AppView>({ tab: 'calendar' });
    const currentTab = view.tab === 'projects-detail' ? 'projects' : view.tab;

    function navigateTo(v: AppView) { setView(v); }
    function setTab(tab: string) {
        if (tab === 'calendar' || tab === 'flow' || tab === 'projects' || tab === 'health' || tab === 'settings') {
            setView({ tab });
        }
    }

    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto relative">
            <main className="flex-1 pb-20 px-4 pt-6 overflow-y-auto h-screen">
                {view.tab === 'calendar' && <CalendarView />}
                {view.tab === 'flow' && <FlowView />}
                {view.tab === 'projects' && (
                    <ProjectsView onSelectProject={(id) => navigateTo({ tab: 'projects-detail', projectId: id })} />
                )}
                {view.tab === 'projects-detail' && (
                    <ProjectDetailView
                        projectId={view.projectId}
                        onBack={() => navigateTo({ tab: 'projects' })}
                    />
                )}
                {view.tab === 'health' && <HealthView />}
                {view.tab === 'settings' && <SettingsView />}
            </main>
            <BottomNav currentTab={currentTab} setCurrentTab={setTab} />
        </div>
    );
}
