"use client";

import { use, useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Project } from "@/data/mock";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProjectTabs, TabId } from "@/components/dashboard/project/project-tabs";
import { OverviewTab } from "@/components/dashboard/project/tabs/overview-tab";
import { StackTab } from "@/components/dashboard/project/tabs/stack-tab";
import { PromptVaultTab } from "@/components/dashboard/project/tabs/prompt-vault-tab";
import { JournalTab, SnippetsTab } from "@/components/dashboard/project/tabs/journal-tab";

import { ContextWeaverModal } from "@/components/dashboard/context-weaver/context-weaver-modal";
import { BrainCircuit } from "lucide-react";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const { projects } = useDashboard();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [isWeaverOpen, setIsWeaverOpen] = useState(false);

    useEffect(() => {
        const found = projects.find(p => p.id === unwrappedParams.id);
        if (found) {
            setProject(found);
        }
    }, [unwrappedParams.id, projects]);

    if (!project) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[50vh] text-neutral-500">
                <p>Project not found or loading...</p>
                <Link href="/dashboard" className="text-[#a78bfa] hover:underline mt-4">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{project.name}</h1>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400">{project.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsWeaverOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#180260] border border-[#a78bfa]/30 text-[#a78bfa] font-medium hover:bg-[#a78bfa] hover:text-[#180260] transition-all shadow-lg shadow-[#180260]/20"
                    >
                        <BrainCircuit className="w-4 h-4" />
                        Weave Context
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-white capitalize">{project.status}</span>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && <OverviewTab project={project} />}
                {activeTab === 'stack' && <StackTab project={project} />}
                {activeTab === 'prompts' && <PromptVaultTab project={project} />}
                {activeTab === 'journal' && <JournalTab project={project} />}
                {activeTab === 'snippets' && <SnippetsTab project={project} />}
            </div>

            {/* Context Weaver Modal */}
            <ContextWeaverModal
                isOpen={isWeaverOpen}
                onClose={() => setIsWeaverOpen(false)}
                project={project}
            />

        </div>
    );
}

