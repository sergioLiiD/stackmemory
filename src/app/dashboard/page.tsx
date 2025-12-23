"use client";

import { ProjectCard } from "@/components/dashboard/project-card";
import { Search, Filter, Terminal, Plus } from "lucide-react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CliInstructionsModal } from "@/components/dashboard/cli-instructions-modal";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function DashboardPage() {
    const { projects, openImportModal } = useDashboard();
    const [isCliModalOpen, setIsCliModalOpen] = useState(false);

    const averageHealth = projects.length > 0
        ? Math.round(projects.reduce((acc, p) => acc + (p.health || 0), 0) / projects.length)
        : 0;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-card to-card border border-white/5 px-8 py-6 mb-8 overflow-hidden shadow-soft group">
                {/* Visual Arc Decoration (CSS Only) */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-start gap-6 max-w-4xl">
                    <div className="relative group shrink-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 dark:bg-white/40 rounded-full blur-3xl -z-10 opacity-80 group-hover:opacity-100 transition-opacity" />
                        {/* Light Mode Logo */}
                        <Image
                            src="/logo_sm.png"
                            alt="StackMemory"
                            width={80}
                            height={80}
                            className="w-20 h-20 object-contain relative z-20 block dark:hidden"
                        />
                        {/* Dark Mode Logo */}
                        <Image
                            src="/logo_sm_w.png"
                            alt="StackMemory"
                            width={80}
                            height={80}
                            className="w-20 h-20 object-contain relative z-20 hidden dark:block"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-1">
                            My Portfolio
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-md">
                            Manage your stack, prompts, and architectural decisions.
                        </p>
                    </div>

                    {/* Quick Stats - Inline to save height */}
                    <div className="flex gap-4">
                        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-black/5 dark:border-white/5 min-w-[100px] shadow-sm">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Projects</div>
                            <div className="text-xl font-bold text-foreground">{projects.length}</div>
                        </div>
                        <div className="bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-black/5 dark:border-white/5 min-w-[100px] shadow-sm">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Health</div>
                            <div className={cn("text-xl font-bold",
                                averageHealth >= 80 ? "text-emerald-500" :
                                    averageHealth >= 50 ? "text-yellow-500" : "text-red-500"
                            )}>{averageHealth}%</div>
                        </div>
                    </div>
                </div>

                {/* Search Bar Floating in Hero */}
                <div className="absolute top-8 right-8 hidden xl:flex items-start gap-4 z-50">
                    <div className="relative group/search mt-1">
                        <Search className="w-4 h-4 absolute left-4 top-3.5 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Type to search..."
                            className="bg-background/50 backdrop-blur-xl border border-white/10 rounded-full pl-11 pr-6 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 w-56 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        {/* Add Project Button */}
                        <button
                            onClick={openImportModal}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#180260] hover:bg-[#2e1065] border border-white/10 text-sm font-medium text-white transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            New Project
                        </button>

                        <button
                            onClick={() => setIsCliModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-sm font-medium text-white transition-colors"
                        >
                            <Terminal className="w-4 h-4" />
                            Connect CLI
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Active Projects</h2>
                <div className="flex gap-2">
                    <button
                        onClick={openImportModal}
                        className="md:hidden p-2 rounded-xl bg-[#180260] border border-white/10 text-white hover:bg-[#2e1065] transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Project Grid or Empty State */}
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} delay={index * 0.1} />
                    ))}
                </div>
            ) : (
                <EmptyState onCreateProject={openImportModal} />
            )}

            <CliInstructionsModal
                isOpen={isCliModalOpen}
                onClose={() => setIsCliModalOpen(false)}
                projectId={projects.length > 0 ? projects[0].id : "YOUR_PROJECT_ID"}
            />
        </div>
    );
}
