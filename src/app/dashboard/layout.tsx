"use client";

import { FloatingDock } from "@/components/dashboard/floating-dock";
import { ImportModal } from "@/components/dashboard/import/import-modal";
import { DashboardProvider, useDashboard } from "@/components/dashboard/dashboard-context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { isImportModalOpen, closeImportModal, addProject } = useDashboard();

    return (
        <div className="min-h-screen bg-background flex flex-col transition-colors duration-300 font-sans">
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pb-32">
                {children}
            </main>

            <FloatingDock />

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={closeImportModal}
                onSave={addProject}
            />
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </DashboardProvider>
    );
}
