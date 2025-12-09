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
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Book className="w-5 h-5 text-white" /> Journal
                </h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs bg-[#180260] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium"
                >
                    + New Entry
                </button>
            </div>

            <JournalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEntry}
            />

            <div className="border-l border-white/10 ml-4 space-y-12">
                {project.journal?.map((entry) => (
                    <div key={entry.id} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#180260] border border-[#a78bfa] shadow shadow-[#a78bfa]/50" />

                        <div className="bg-[#121212] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-white">{entry.title}</h4>
                                <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-[#a78bfa] font-mono border border-white/5">
                                    {entry.date}
                                </span>
                            </div>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{entry.content}</p>
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
                <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-[#121212]">
                    <PenLine className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
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
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#a78bfa]" /> Code Vault
                </h3>
                <button className="text-xs bg-[#180260] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium">
                    + Add Snippet
                </button>
            </div>

            <SnippetList snippets={project.snippets} />
        </div>
    )
}
