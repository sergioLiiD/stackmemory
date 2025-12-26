import { TourWizard } from "@/components/onboarding/tour-wizard";
import { Sparkles } from "lucide-react";

// ... existing imports

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // ... existing hooks
    const [showTour, setShowTour] = useState(false);

    // ... existing useEffect

    // ... existing if (!project) check

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex-1 mr-8">
                    {/* ... Title Logic (unchanged) ... */}
                    {!isEditing ? (
                        <>
                            <div className="flex items-center gap-3 mb-2 group">
                                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">{project.name}</h1>
                                {/* ... Edit Button ... */}
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-full hover:bg-white/5 text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-3">{project.description}</p>
                        </>
                    ) : (
                        /* ... Edit Form (unchanged) ... */
                        <div className="space-y-3 mb-4 max-w-xl">
                            <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-2xl font-bold text-white focus:outline-none focus:border-[#a78bfa] transition-colors"
                                placeholder="Project Name"
                                autoFocus
                            />
                            <textarea
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-2 text-base text-white focus:outline-none focus:border-[#a78bfa] transition-colors resize-none h-24"
                                placeholder="Project Description"
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        updateProject(project.id, { name: editName, description: editDesc });
                                        setIsEditing(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#180260] hover:bg-[#2e1065] text-white text-sm font-medium rounded-lg transition-colors border border-white/10"
                                >
                                    <Check className="w-4 h-4" /> Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditName(project.name);
                                        setEditDesc(project.description);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 text-neutral-400 hover:text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <XIcon className="w-4 h-4" /> Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Project ID:</span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(project.id);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                            title="Click to copy"
                        >
                            <code className="text-xs font-mono text-[#a78bfa]">{project.id}</code>
                            <Copy className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTour(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-pink-500/20"
                    >
                        <Sparkles className="w-4 h-4" />
                        Start Tour
                    </button>

                    <button
                        onClick={() => setActiveTab('prompts')}
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
                {activeTab === 'assistant' && <AssistantTab project={project} />}
                {activeTab === 'guide' && <GuideTab />}
            </div>

            {/* ONBOARDING WIZARD */}
            {showTour && (
                <TourWizard projectId={project.id} onClose={() => setShowTour(false)} />
            )}

        </div>
    );
}

