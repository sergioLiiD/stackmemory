"use client";

import { motion } from "framer-motion";
import { Project } from "@/data/mock";
import { ArrowUpRight, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { HealthBar } from "./project/health-bar";

const statusConfig = {
    active: { color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2, label: "Active" },
    legacy: { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: AlertTriangle, label: "Legacy" },
    archived: { color: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20", icon: CheckCircle2, label: "Archived" },
    planning: { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Activity, label: "Planning" },
};

export function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
    const config = statusConfig[project.status];
    const Icon = config.icon;

    return (
        <Link href={`/dashboard/projects/${project.id}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay, duration: 0.3 }}
                className="group relative p-6 rounded-[2rem] bg-card/60 backdrop-blur-md shadow-soft border border-border/50 hover:border-primary/50 transition-all cursor-pointer h-full hover:bg-card/80 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
            >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-foreground" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mb-6 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${config.color}`}>
                        <Icon className="w-3 h-3" /> {config.label}
                    </span>

                    {/* Health Bar Mini */}
                    <HealthBar project={project} />
                </div>

                {/* Stack Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                    {project.stack.slice(0, 3).map((tech) => (
                        <span key={tech.name} className="text-xs text-neutral-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                            {tech.name}
                        </span>
                    ))}
                    {project.stack.length > 3 && (
                        <span className="text-xs text-neutral-500 px-1 py-1">+ {project.stack.length - 3}</span>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>Updated {project.lastUpdated}</span>
                    <span>ID: {project.id}</span>
                </div>
            </motion.div>
        </Link>
    );
}
