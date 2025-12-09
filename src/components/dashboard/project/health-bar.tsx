
"use client";

import { Project } from "@/data/mock";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export function HealthBar({ project, showLabel = true }: { project: Project; showLabel?: boolean }) {
    // Breakdown logic repeated here for display purposes if not already pre-calculated, 
    // but better to rely on `project` properties being present.
    const checks = [
        { label: "Connected Repository", passed: !!project.repoUrl },
        { label: "Live URL Configured", passed: !!project.liveUrl },
        { label: "Tech Stack Defined", passed: (project.stack?.length || 0) > 0 },
        { label: "Service Locker Used", passed: (project.services?.length || 0) > 0 },
    ];

    const health = project.health || 0;
    const color = health > 80 ? 'bg-green-500' : health > 50 ? 'bg-orange-500' : 'bg-red-500';

    return (
        <div className="relative group flex items-center gap-2 cursor-help">
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-300", color)}
                    style={{ width: `${health}%` }}
                />
            </div>
            {showLabel && <span className="text-[10px] text-neutral-500">{health}%</span>}

            {/* Custom Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-[#18181b] border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                        <span className="text-xs font-bold text-white">Completeness</span>
                        <span className={cn("text-xs font-bold", health > 80 ? "text-green-400" : "text-orange-400")}>
                            {health}%
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        {checks.map((check, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                                <span className="text-neutral-400">{check.label}</span>
                                <span className={check.passed ? "text-green-400" : "text-red-400"}>
                                    {check.passed ? "✓" : "Missing"}
                                </span>
                            </div>
                        ))}
                    </div>
                    {health < 100 && (
                        <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-neutral-500 italic">
                            Complete checks to improve score.
                        </div>
                    )}
                </div>
                {/* Arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#18181b] border-r border-b border-white/10 rotate-45 transform" />
            </div>
        </div>
    );
}
