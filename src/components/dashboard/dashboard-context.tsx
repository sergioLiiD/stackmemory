"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { mockProjects, Project } from "@/data/mock";

interface DashboardContextType {
    projects: Project[];
    addProject: (project: Project) => void;
    isImportModalOpen: boolean;
    openImportModal: () => void;
    closeImportModal: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>(mockProjects);
    const [isImportModalOpen, setImportModalOpen] = useState(false);

    const addProject = (project: Project) => {
        setProjects([project, ...projects]);
    };

    return (
        <DashboardContext.Provider value={{
            projects,
            addProject,
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
