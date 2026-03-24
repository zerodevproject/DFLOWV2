import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/generated_mock/api";
import { useDflowStore } from "../store/useDflowStore";
import { useShallow } from "zustand/react/shallow";

export function useDflowSync() {
    const {
        projects: localProjects,
        setProjects,
        timeBlocks: localBlocks,
        setTimeBlocks,
        healthLogs: localHealth,
        setHealthLogs,
        flowCycle: localCycle,
        setFlowCycle,
        userProfile: localProfile,
        setUserProfile
    } = useDflowStore(useShallow((s: any) => ({
        projects: s.projects,
        setProjects: s.setProjects,
        timeBlocks: s.timeBlocks,
        setTimeBlocks: s.setTimeBlocks,
        healthLogs: s.healthLogs,
        setHealthLogs: s.setHealthLogs,
        flowCycle: s.flowCycle,
        setFlowCycle: s.setFlowCycle,
        userProfile: s.userProfile,
        setUserProfile: s.updateProfile, // Using updateProfile as a setter for now
    })));

    // Queries
    const remoteProjects = useQuery(api.projects.get);
    const remoteHealth = useQuery(api.healthLogs.getForDate, { date: new Date().toISOString().split('T')[0] });
    const remoteCycle = useQuery(api.flowCycles.get);
    const remoteUser = useQuery(api.users.viewer);

    // Mutations
    const addProject = useMutation(api.projects.add);
    const updateProject = useMutation(api.projects.update);
    // ... more mutations would be linked to Zustand actions

    // Initial Pull from Convex
    useEffect(() => {
        if (remoteProjects) {
            // Map Convex Project to Local Project (handling ID conversion)
            const mapped = remoteProjects.map(p => ({
                id: p._id,
                name: p.name,
                emoji: p.emoji,
                color: p.color,
                status: p.status,
                totalHours: p.totalHours,
                weekProgress: p.weekProgress,
                objective: p.objective,
                description: p.description
            }));
            // setProjects(mapped); // Implement this in store
        }
    }, [remoteProjects]);

    // Push Logic (Optimistic)
    // For now, we'll suggest using Convex directly for mutations in the components 
    // or wrap Zustand actions.
}
