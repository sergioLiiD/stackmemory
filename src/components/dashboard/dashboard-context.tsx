"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockProjects, Project } from "@/data/mock";
import { supabase } from "@/lib/supabase";
import { calculateProjectHealth } from "@/lib/project-health";

interface DashboardContextType {
    projects: Project[];
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => Promise<void>;
    isImportModalOpen: boolean;
    openImportModal: () => void;
    closeImportModal: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const mapDbProject = (p: any): Project => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    repoUrl: p.repository_url,
    liveUrl: p.live_url,
    deployProvider: p.deploy_provider,
    deployAccount: p.deploy_account,
    stack: p.stack || [],
    lastUpdated: p.updated_at ? new Date(p.updated_at).toLocaleString() : new Date(p.created_at).toLocaleDateString(),
    health: calculateProjectHealth({
        ...p,
        repoUrl: p.repository_url,
        liveUrl: p.live_url,
        stack: p.stack || [],
        services: p.services || []
    } as Project),
    services: p.services || [],
    secrets: p.secrets || [],
    prompts: p.prompts || [],
    journal: p.journal || [],
    snippets: p.snippets || [],
    tasks: p.tasks || [],
    design: p.design_system || { colors: [], fonts: [] },
    firebaseConfig: p.firebase_config || undefined,
    hasUpdates: p.has_updates || false,
    hasVulnerabilities: p.has_vulnerabilities || false,
    insight_report: p.insight_report || undefined,
    insight_generated_at: p.insight_generated_at || undefined,
    workflows: p.workflows || []
});

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        async function fetchProjects() {
            try {
                if (!supabase) {
                    console.log("Supabase not configured, using mock data fallback.");
                    setProjects(mockProjects);
                    setIsLoading(false);
                    return;
                }

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setProjects([]);
                    setIsLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('projects')
                    .select('*, workflows(*)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) {
                    setProjects(data.map(mapDbProject));
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProjects();

        // Realtime Subscription - More surgical than global fetch
        const channel = supabase?.channel('projects-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects' },
                async (payload) => {
                    console.log('Realtime event:', payload.eventType, payload);

                    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                        // Re-fetch only this project to get full joined data (workflows, etc)
                        const { data, error } = await supabase
                            .from('projects')
                            .select('*, workflows(*)')
                            .eq('id', payload.new.id)
                            .single();

                        if (data && !error) {
                            const updatedProject = mapDbProject(data);
                            setProjects(prev => {
                                const exists = prev.some(p => p.id === updatedProject.id);
                                if (exists) {
                                    return prev.map(p => p.id === updatedProject.id ? updatedProject : p);
                                }
                                return [updatedProject, ...prev];
                            });
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setProjects(prev => prev.filter(p => p.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase?.removeChannel(channel as any);
        };
    }, []);

    const addProject = async (project: Project) => {
        const health = calculateProjectHealth(project);
        const newProject = { ...project, id: crypto.randomUUID(), lastUpdated: 'Just now', health };
        setProjects([newProject, ...projects]);

        if (supabase) {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("No user found");

                const { error } = await supabase.from('projects').insert({
                    id: newProject.id, // Ensure consistent ID
                    user_id: user.id, // Assign ownership
                    name: project.name,
                    description: project.description,
                    repository_url: project.repoUrl,
                    live_url: project.liveUrl,
                    deploy_provider: project.deployProvider,
                    deploy_account: project.deployAccount,
                    status: project.status,
                    stack: project.stack,
                    health_score: health
                });
                if (error) console.error("Error saving project:", error);
            } catch (err) {
                console.error("Supabase insert failed", err);
            }
        }
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(p => {
            if (p.id === id) {
                const updated = { ...p, ...updates };
                // Recalculate health on update
                updated.health = calculateProjectHealth(updated);
                return updated;
            }
            return p;
        }));

        if (supabase) {
            try {
                const dbUpdates: any = {};
                // Map frontend fields to DB columns
                if (updates.name !== undefined) dbUpdates.name = updates.name;
                if (updates.description !== undefined) dbUpdates.description = updates.description;
                if (updates.repoUrl !== undefined) dbUpdates.repository_url = updates.repoUrl;
                if (updates.liveUrl !== undefined) dbUpdates.live_url = updates.liveUrl;
                if (updates.status !== undefined) dbUpdates.status = updates.status;
                if (updates.stack !== undefined) dbUpdates.stack = updates.stack;
                if (updates.hasUpdates !== undefined) dbUpdates.has_updates = updates.hasUpdates;
                if (updates.hasVulnerabilities !== undefined) dbUpdates.has_vulnerabilities = updates.hasVulnerabilities;
                if (updates.insight_report !== undefined) dbUpdates.insight_report = updates.insight_report;
                if (updates.insight_generated_at !== undefined) dbUpdates.insight_generated_at = updates.insight_generated_at;
                if (updates.snippets !== undefined) dbUpdates.snippets = updates.snippets;
                if (updates.design !== undefined) dbUpdates.design_system = updates.design;
                if (updates.secrets !== undefined) dbUpdates.secrets = updates.secrets;
                if (updates.prompts !== undefined) dbUpdates.prompts = updates.prompts;
                if (updates.journal !== undefined) dbUpdates.journal = updates.journal;
                if (updates.tasks !== undefined) dbUpdates.tasks = updates.tasks;
                if (updates.services !== undefined) dbUpdates.services = updates.services;
                if (updates.mcps !== undefined) dbUpdates.mcps = updates.mcps;
                if (updates.firebaseConfig !== undefined) dbUpdates.firebase_config = updates.firebaseConfig;
                // Workflows are handled in their own table, do not update projects table column

                if (Object.keys(dbUpdates).length > 0) {
                    const { error } = await supabase
                        .from('projects')
                        .update(dbUpdates)
                        .eq('id', id);

                    if (error) console.error("Error updating project:", error);
                }
            } catch (err) {
                console.error("Supabase update failed", err);
            }
        }
    };

    const deleteProject = async (id: string) => {
        // Optimistic update
        setProjects(prev => prev.filter(p => p.id !== id));

        if (supabase) {
            try {
                const { error } = await supabase.from('projects').delete().eq('id', id);
                if (error) console.error("Error deleting project:", error);
            } catch (err) {
                console.error("Supabase delete failed", err);
            }
        }
    };

    return (
        <DashboardContext.Provider value={{
            projects,
            addProject,
            updateProject,
            deleteProject,
            isImportModalOpen,
            openImportModal: () => setImportModalOpen(true),
            closeImportModal: () => setImportModalOpen(false)
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
