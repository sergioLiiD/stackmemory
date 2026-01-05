"use client";

import { useState } from "react";
import { Project, Workflow } from "@/data/mock";
import { parseN8nWorkflow } from "@/lib/n8n-parser";
import { useDashboard } from "../../dashboard-context";
import { supabase } from "@/lib/supabase";
import { Upload, FileJson, Check, AlertTriangle, Key, Trash2, Plus, ArrowRight, Sparkles, Search, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { WorkflowChat } from "./workflow-chat";

export function WorkflowsTab({ project }: { project: Project }) {
    const { updateProject } = useDashboard();
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeChatWorkflow, setActiveChatWorkflow] = useState<Workflow | null>(null);

    // Helpers to identify missing credentials
    const getMissingCredentials = (needed: string[]) => {
        const existingKeys = (project.secrets || []).map(s => s.key.toLowerCase());
        return needed.filter(n => !existingKeys.some(k => k.includes(n.toLowerCase()) || n.toLowerCase().includes(k)));
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        const file = files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);

                // Validate generic n8n structure
                if (!json.nodes || !Array.isArray(json.nodes)) {
                    alert("Invalid n8n workflow file (no 'nodes' array found).");
                    setUploading(false);
                    return;
                }

                // Parse
                const analysis = parseN8nWorkflow(json);
                const workflowName = file.name.replace('.json', '');

                const newWorkflow: Workflow = {
                    id: crypto.randomUUID(),
                    name: workflowName,
                    content: json, // Raw JSON
                    nodes_index: analysis.nodes,
                    credentials_needed: analysis.credentials,
                    created_at: new Date().toISOString()
                };

                // Save
                const updatedWorkflows = [...(project.workflows || []), newWorkflow];
                updateProject(project.id, { workflows: updatedWorkflows });

                if (supabase) {
                    const { error } = await supabase.from('workflows').insert({
                        project_id: project.id,
                        name: workflowName,
                        content: json, // Save raw content
                        nodes_index: analysis.nodes,
                        credentials_needed: analysis.credentials
                    });
                    if (error) console.error("DB Insert Error", error);
                }

            } catch (err) {
                console.error(err);
                alert("Failed to parse JSON file.");
            } finally {
                setUploading(false);
            }
        };

        reader.readAsText(file);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this workflow?")) return;

        const updated = (project.workflows || []).filter(w => w.id !== id);
        updateProject(project.id, { workflows: updated });

        if (supabase) {
            await supabase.from('workflows').delete().eq('id', id);
        }
    };


    // FILTER LOGIC
    const filteredWorkflows = (project.workflows || []).filter(w => {
        const lowerQ = searchQuery.toLowerCase();
        return w.name.toLowerCase().includes(lowerQ) ||
            w.nodes_index.some(n => n.toLowerCase().includes(lowerQ));
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#ff6d5a]/10 to-[#ff6d5a]/5 border border-[#ff6d5a]/20 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileJson className="w-5 h-5 text-[#ff6d5a]" /> n8n Workflows
                        </h3>
                        <p className="text-xs text-neutral-400 mt-2 max-w-lg">
                            Import your n8n workflow JSON files to automatically detecting required credentials and infrastructure nodes.
                        </p>
                    </div>
                    {/* Controls */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search workflows or nodes..."
                                className="w-full bg-black/20 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#ff6d5a]/50 placeholder:text-neutral-600"
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => handleFileUpload(e.target.files)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <button disabled={uploading} className="px-4 py-2 bg-[#ff6d5a] hover:bg-[#ff6d5a]/80 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-[#ff6d5a]/20 whitespace-nowrap">
                                {uploading ? (
                                    <span className="animate-spin">⏳</span>
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                Import JSON
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkflows.map((workflow) => {
                    const missingCreds = getMissingCredentials(workflow.credentials_needed);

                    return (
                        <div key={workflow.id} className="group p-5 rounded-2xl bg-neutral-900 border border-white/5 hover:border-[#ff6d5a]/30 transition-all flex flex-col h-full relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#ff6d5a]/10 text-[#ff6d5a] flex items-center justify-center">
                                        <FileJson className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-sm font-bold text-white truncate max-w-[150px]" title={workflow.name}>
                                            {workflow.name}
                                        </h4>
                                        <span className="text-[10px] text-neutral-500 block">
                                            {workflow.nodes_index.length} nodes
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(workflow.id)}
                                    className="p-1.5 rounded-full hover:bg-red-500/10 text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Node Tags */}
                            <div className="flex flex-wrap gap-1 mb-4 h-12 overflow-hidden items-start content-start">
                                {workflow.nodes_index.slice(0, 5).map(node => (
                                    <span key={node} className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/5">
                                        {node}
                                    </span>
                                ))}
                                {workflow.nodes_index.length > 5 && (
                                    <span className="text-[9px] px-1 py-0.5 text-neutral-600">+{workflow.nodes_index.length - 5}</span>
                                )}
                            </div>

                            {/* AI Summary / Chat Trigger */}
                            <div className="mb-4 bg-black/20 rounded-lg p-3 border border-white/5 min-h-[60px] cursor-pointer hover:bg-black/30 transition-colors"
                                onClick={() => setActiveChatWorkflow(workflow)}
                            >
                                {workflow.ai_description ? (
                                    <div className="flex gap-2">
                                        <Sparkles className="w-3 h-3 text-[#ff6d5a] flex-shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-neutral-300 leading-relaxed line-clamp-3">
                                            {workflow.ai_description}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <span className="flex items-center gap-2 text-[10px] font-medium text-[#ff6d5a]">
                                            <MessageSquare className="w-3 h-3" /> Chat with Workflow
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Credential Status */}
                            <div className="mt-auto pt-4 border-t border-white/5">
                                {workflow.credentials_needed.length === 0 ? (
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                                        <Check className="w-3 h-3 text-green-500" /> No credentials required
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Required Keys</span>
                                            {missingCreds.length > 0 && (
                                                <span className="text-[9px] text-[#ff6d5a] bg-[#ff6d5a]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> {missingCreds.length} Missing
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            {workflow.credentials_needed.map(cred => {
                                                const isMissing = missingCreds.includes(cred);
                                                return (
                                                    <div key={cred} className={cn("flex items-center justify-between text-[10px] px-2 py-1 rounded", isMissing ? "bg-[#ff6d5a]/5 text-[#ff6d5a]" : "bg-green-500/5 text-green-400")}>
                                                        <span className="flex items-center gap-1.5">
                                                            <Key className="w-3 h-3" /> {cred}
                                                        </span>
                                                        {isMissing && <ArrowRight className="w-3 h-3" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {(!filteredWorkflows.length) && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl text-neutral-600">
                        <FileJson className="w-8 h-8 mb-4 opacity-50" />
                        <p className="text-sm font-medium">No workflows found.</p>
                        <p className="text-xs opacity-50 max-w-xs text-center mt-2">Try importing a new JSON or adjusting your search.</p>
                    </div>
                )}
            </div>

            {/* Chat Drawer */}
            <Sheet open={!!activeChatWorkflow} onOpenChange={(open) => !open && setActiveChatWorkflow(null)}>
                <SheetContent className="w-[400px] sm:w-[540px] border-l-white/10 bg-neutral-950 p-0 text-white flex flex-col">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Workflow Assistant</SheetTitle>
                        <SheetDescription>Chat about your n8n workflow logic.</SheetDescription>
                    </SheetHeader>
                    {activeChatWorkflow && (
                        <WorkflowChat workflow={activeChatWorkflow} projectId={project.id} />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
