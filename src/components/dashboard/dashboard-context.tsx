"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockProjects, Project } from "@/data/mock";
import { supabase } from "@/lib/supabase";

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
                    .select('*')
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
                        lastUpdated: new Date(p.created_at).toLocaleDateString(),
                        health: p.health_score || 100,
                        services: p.services || [],
                        secrets: p.secrets || [], // Assumes secrets column exists or handled elsewhere?
                        prompts: p.prompts || [],
                        journal: p.journal || [],
                        snippets: p.snippets || [],
                        tasks: p.tasks || [],
                        firebaseConfig: p.firebase_config || undefined
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
    }, []);

    const addProject = async (project: Project) => {
        const newProject = { ...project, id: crypto.randomUUID(), lastUpdated: 'Just now' };
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
                    health_score: project.health
                });
                if (error) console.error("Error saving project:", error);
            } catch (err) {
                console.error("Supabase insert failed", err);
            }
        }
    };

    const updateProject = (id: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
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
