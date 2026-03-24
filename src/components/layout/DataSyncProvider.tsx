import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
        if (remoteProjects !== undefined) {
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
            setProjects(mapped);
        }
    }, [remoteProjects, setProjects]);

    // Sync Cycle
    useEffect(() => {
        if (remoteCycle !== undefined) {
            setFlowCycle(remoteCycle ? {
                cycleLength: remoteCycle.cycleLength,
                startDate: remoteCycle.startDate,
                projectQueue: remoteCycle.projectQueue,
                numCyclesAhead: remoteCycle.numCyclesAhead,
                slots: remoteCycle.slots as any
            } : {
                cycleLength: 7,
                startDate: new Date().toISOString().split('T')[0],
                projectQueue: [],
                slots: [],
                numCyclesAhead: 2
            });
        }
    }, [remoteCycle, setFlowCycle]);

    // Sync User Profile
    useEffect(() => {
        if (remoteUser !== undefined) {
            updateProfile({
                name: remoteUser?.name || 'Usuario',
                tagline: remoteUser?.tagline || 'Productor Metabólico',
                avatar: remoteUser?.image
            });
        }
    }, [remoteUser, updateProfile]);

    return <>{children}</>;
}
