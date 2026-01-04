import { useState } from "react";
import { Project, JournalEntry } from "@/data/mock";
import { Book, Calendar, PenLine, Code2, FileCode } from "lucide-react";
import { JournalModal } from "./journal-modal";
import { useDashboard } from "../../dashboard-context";
import { supabase } from "@/lib/supabase";

export function JournalTab({ project }: { project: Project }) {
    const { updateProject } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveEntry = async (entry: JournalEntry) => {
        const newJournal = [entry, ...(project.journal || [])];

        // Optimistic update
        updateProject(project.id, { journal: newJournal });

        // DB update
        if (supabase) {
            const { error } = await supabase
                .from('projects')
                .update({ journal: newJournal })
                .eq('id', project.id);

            if (error) console.error("Error saving journal:", error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Book className="w-5 h-5 text-indigo-600 dark:text-white" /> Journal
                </h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs bg-[#180260] text-white px-4 py-2 rounded-full hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium"
                >
                    + New Entry
                </button>
            </div>

            <JournalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEntry}
                projectId={project.id}
            />

            <div className="border-l border-neutral-200 dark:border-white/10 ml-4 space-y-12">
                {project.journal?.map((entry) => (
                    <div key={entry.id} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-[#180260] border border-indigo-400 dark:border-[#a78bfa] shadow shadow-indigo-500/50 dark:shadow-[#a78bfa]/50" />

                        <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 rounded-3xl p-6 hover:border-neutral-300 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-none">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-neutral-900 dark:text-white">{entry.title}</h4>
                                <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/5 text-[10px] text-indigo-600 dark:text-[#a78bfa] font-mono border border-neutral-200 dark:border-white/5">
                                    {entry.date}
                                </span>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{entry.content}</p>
                            <div className="flex gap-2">
                                {entry.tags?.map(tag => (
                                    <span key={tag} className="text-[10px] text-neutral-500">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!project.journal?.length && (
                <div className="p-12 text-center border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#121212]">
                    <PenLine className="w-8 h-8 text-neutral-400 dark:text-neutral-700 mx-auto mb-3" />
                    <p className="text-neutral-500">No journal entries yet. Log a thought!</p>
                </div>
            )}
        </div>
    );
}

import { SnippetList } from "../../vault/snippet-list";

export function SnippetsTab({ project }: { project: Project }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-600 dark:text-[#a78bfa]" /> Code Vault
                </h3>
                <button className="text-xs bg-[#180260] text-white px-4 py-2 rounded-full hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium">
                    + Add Snippet
                </button>
            </div>

            <SnippetList snippets={project.snippets} />
        </div>
    )
}
