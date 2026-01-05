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

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch (unchanged)
    useEffect(() => {
        async function fetchProjects() {
            try {
                if (!supabase) {
                    console.log("Supabase not configured, using mock data fallback.");
                    setProjects(mockProjects);
                    setIsLoading(false);
                    return;
                }

                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    console.log("No user logged in, skipping fetch");
                    setProjects([]);
                    setIsLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('projects')
                    .select('*, workflows(*)')
                    .eq('user_id', user.id) // Scope to user
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    const mappedProjects: Project[] = data.map((p: any) => ({
                        // ... rest of mapping
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
                        secrets: p.secrets || [], // Assumes secrets column exists or handled elsewhere?
                        prompts: p.prompts || [],
                        journal: p.journal || [],
                        snippets: p.snippets || [],
                        tasks: p.tasks || [],
                        firebaseConfig: p.firebase_config || undefined,
                        hasUpdates: p.has_updates || false,
                        hasVulnerabilities: p.has_vulnerabilities || false,
                        insight_report: p.insight_report || undefined,
                        insight_generated_at: p.insight_generated_at || undefined,
                        workflows: p.workflows || []
                    }));
                    setProjects(mappedProjects);
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProjects();

        // Realtime Subscription
        const channel = supabase?.channel('projects-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchProjects(); // Re-fetch on any change
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
                // Map frontend fields to DB columns
                const dbUpdates: any = {};
                if (updates.name) dbUpdates.name = updates.name;
                if (updates.description) dbUpdates.description = updates.description;
                if (updates.repoUrl) dbUpdates.repository_url = updates.repoUrl;
                if (updates.liveUrl) dbUpdates.live_url = updates.liveUrl;
                if (updates.status) dbUpdates.status = updates.status;
                if (updates.stack) dbUpdates.stack = updates.stack;
                if (updates.hasUpdates !== undefined) dbUpdates.has_updates = updates.hasUpdates;
                if (updates.hasVulnerabilities !== undefined) dbUpdates.has_vulnerabilities = updates.hasVulnerabilities;
                if (updates.insight_report) dbUpdates.insight_report = updates.insight_report;
                if (updates.insight_generated_at) dbUpdates.insight_generated_at = updates.insight_generated_at;
                if (updates.snippets) dbUpdates.snippets = updates.snippets;
                if (updates.snippets) dbUpdates.snippets = updates.snippets;
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
