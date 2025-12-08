"use client";

import { Project } from "@/data/mock";
import { CheckCircle2, Copy, Eye, EyeOff, ExternalLink, Github, Globe, Key, Server, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function OverviewTab({ project }: { project: Project }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Column 1: Metadata & Secrets */}
            <div className="space-y-6">
                {/* Metadata Card */}
                <div className="p-6 rounded-2xl bg-[#121212] border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#a78bfa]" /> Metadata
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Status</label>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-white capitalize text-sm">
                                <span className={cn("w-2 h-2 rounded-full",
                                    project.status === 'active' ? 'bg-green-500' :
                                        project.status === 'legacy' ? 'bg-orange-500' :
                                            'bg-neutral-500'
                                )} />
                                {project.status}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Repository</label>
                            {project.repoUrl ? (
                                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-blue-400 hover:text-blue-300 hover:border-blue-500/30 transition-colors text-sm truncate">
                                    <Github className="w-4 h-4 text-white" />
                                    <span className="truncate">{project.repoUrl.replace('https://github.com/', '')}</span>
                                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                                </a>
                            ) : <div className="text-neutral-600 text-sm px-3 py-2">Not connected</div>}
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">Live URL</label>
                            {project.liveUrl ? (
                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-green-400 hover:text-green-300 hover:border-green-500/30 transition-colors text-sm truncate">
                                    <Globe className="w-4 h-4 text-white" />
                                    <span className="truncate">{project.liveUrl.replace('https://', '')}</span>
                                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                                </a>
                            ) : <div className="text-neutral-600 text-sm px-3 py-2">Not deploy</div>}
                        </div>
                    </div>
                </div>

                {/* Secrets Metadata */}
                <div className="p-6 rounded-2xl bg-[#121212] border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-400" /> Secrets Metadata
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full ml-auto">KEYS ONLY</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">Store keys names only, never values.</p>

                    <div className="space-y-2">
                        {project.secrets?.map((secret, i) => (
                            <div key={i} className="group flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Key className="w-3 h-3 text-neutral-500" />
                                    <code className="text-xs text-neutral-300 truncate">{secret.key}</code>
                                </div>
                                <span className="text-[10px] text-neutral-500 px-1.5 py-0.5 rounded bg-black/30 border border-white/5">{secret.environment}</span>
                            </div>
                        ))}
                        {!project.secrets?.length && (
                            <div className="text-center py-4 text-neutral-600 text-sm border border-dashed border-white/10 rounded-lg">No secrets recorded</div>
                        )}
                        <button className="w-full py-2 mt-2 rounded-lg border border-dashed border-white/10 text-neutral-500 text-xs hover:text-white hover:bg-white/5 transition-colors">+ Add Secret Key</button>
                    </div>
                </div>
            </div>

            {/* Column 2 & 3: Service Locker */}
            <div className="md:col-span-2">
                <div className="p-6 rounded-2xl bg-[#121212] border border-white/10 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-400" /> Service Locker
                        </h3>
                        <button className="text-xs bg-[#180260] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium">
                            + Add Service
                        </button>
                    </div>

                    <p className="text-sm text-neutral-400 mb-6">Track accounts and emails. Avoid the "which account did I use?" panic.</p>

                    <div className="grid gap-4">
                        {project.services?.map((service, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="w-10 h-10 rounded-lg bg-[#180260]/10 flex items-center justify-center text-[#a78bfa]">
                                    <Server className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white text-sm">{service.provider}</h4>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-400">{service.status}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400">{service.name}</p>
                                </div>

                                <div className="hidden md:block py-1 px-3 rounded-lg bg-black/20 text-neutral-300 text-xs border border-white/5">
                                    <span className="text-neutral-500 text-[10px] uppercase font-bold mr-2">Identity Used</span>
                                    {service.account}
                                </div>

                                <div className="text-sm font-mono text-neutral-500">
                                    {service.cost}
                                </div>
                            </div>
                        ))}
                        {!project.services?.length && (
                            <div className="p-12 text-center border border-dashed border-white/10 rounded-xl">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                    <Server className="w-6 h-6 text-neutral-600" />
                                </div>
                                <h4 className="text-white font-medium mb-1">No Services Linked</h4>
                                <p className="text-sm text-neutral-500">Start tracking your infrastructure accounts.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
