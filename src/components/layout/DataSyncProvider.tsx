import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/generated_mock/api";
import { useDflowStore } from "../../store/useDflowStore";

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
    const setProjects = useDflowStore((s) => s.setProjects);
    const setFlowCycle = useDflowStore((s) => s.setFlowCycle);
    const updateProfile = useDflowStore((s) => s.updateProfile);

    // Queries
    const remoteProjects = useQuery(api.projects.get);
    const remoteCycle = useQuery(api.flowCycles.get);
    const remoteUser = useQuery(api.users.viewer);

    // Sync Projects
    useEffect(() => {
        if (remoteProjects) {
            const mapped = remoteProjects.map((p: any) => ({
                id: p._id,
                name: p.name,
                emoji: p.emoji,
                color: p.color,
                status: p.status as any,
                totalHours: p.totalHours,
                weekProgress: p.weekProgress,
                objective: p.objective,
                description: p.description
            }));
            if (mapped.length > 0) setProjects(mapped);
        }
    }, [remoteProjects, setProjects]);

    // Sync Cycle
    useEffect(() => {
        if (remoteCycle) {
            setFlowCycle({
                cycleLength: remoteCycle.cycleLength,
                startDate: remoteCycle.startDate,
                projectQueue: remoteCycle.projectQueue,
                numCyclesAhead: remoteCycle.numCyclesAhead,
                slots: remoteCycle.slots as any
            });
        }
    }, [remoteCycle, setFlowCycle]);

    // Sync User Profile
    useEffect(() => {
        if (remoteUser) {
            updateProfile({
                name: remoteUser.name || 'Usuario',
                tagline: remoteUser.tagline || 'Productor Metabólico',
                avatar: remoteUser.image
            });
        }
    }, [remoteUser, updateProfile]);

    return <>{children}</>;
}
