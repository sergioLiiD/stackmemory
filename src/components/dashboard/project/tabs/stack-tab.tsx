"use client";

import { Project } from "@/data/mock";
import { Box, Layers } from "lucide-react";

export function StackTab({ project }: { project: Project }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#a78bfa]" /> Technology Stack
                </h3>
                <button className="text-xs bg-[#180260] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a04a3] transition-colors shadow-lg shadow-[#180260]/20 font-medium">
                    + Add Tech
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.stack.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#121212] border border-white/10 hover:border-white/20 transition-all group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white">
                                <Box className="w-5 h-5" />
                            </div>
                            {item.version && (
                                <span className="px-2 py-1 rounded bg-white/5 text-[10px] text-neutral-400 font-mono">
                                    v{item.version}
                                </span>
                            )}
                        </div>
                        <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#a78bfa] transition-colors">{item.name}</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">{item.type}</span>
                        </div>
                    </div>
                ))}
            </div>

            {!project.stack.length && (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-xl mt-4">
                    <Layers className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                    <p className="text-neutral-500">No technology stack defined.</p>
                </div>
            )}
        </div>
    );
}
