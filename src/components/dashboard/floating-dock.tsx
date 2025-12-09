import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Layers, Settings, PlusCircle, LogOut, GripVertical, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ThemeToggle } from "../theme-toggle";
import { useDashboard } from "./dashboard-context";
import { ContextWeaverModal } from "./context-weaver/context-weaver-modal";
import { Project } from "@/data/mock";

const navItems = [
    { icon: LayoutGrid, label: "Overview", href: "/dashboard" },
    { icon: Layers, label: "Vault", href: "/dashboard/vault" },
];

export function FloatingDock() {
    const pathname = usePathname();
    const { openImportModal, projects } = useDashboard();

    // Logic to detect active project
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [isWeaverOpen, setIsWeaverOpen] = useState(false);

    useEffect(() => {
        // Simple regex to check if we are in a project route: /dashboard/projects/[id]
        const match = pathname?.match(/\/dashboard\/projects\/([^\/]+)/);
        if (match && match[1]) {
            const projectId = match[1];
            const found = projects.find(p => p.id === projectId);
            setActiveProject(found || null);
        } else {
            setActiveProject(null);
        }
    }, [pathname, projects]);


    return (
        <div className="fixed bottom-8 left-1/2 z-50 pointer-events-none">
            <motion.div
                initial={{ y: 100, opacity: 0, x: "-50%" }}
                animate={{ y: 0, opacity: 1, x: "-50%" }}
                drag
                dragMomentum={false}
                style={{ x: "-50%" }}
                className="flex items-center gap-2 p-2 pl-3 rounded-full bg-card/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 pointer-events-auto cursor-grab active:cursor-grabbing"
            >
                {/* Drag Handle */}
                <div className="text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                </div>

                {/* Navigation Links */}
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-glow"
                                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                            )}
                            title={item.label}
                        >
                            <item.icon className="w-5 h-5" />
                            {isActive && (
                                <motion.span
                                    layoutId="dock-active"
                                    className="absolute inset-0 rounded-full bg-white/5"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                <div className="w-px h-8 bg-white/10 mx-1" />

                {/* Context Weaver Button - Only visible if active project */}
                {activeProject && (
                    <button
                        onClick={() => setIsWeaverOpen(true)}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#180260]/80 text-[#A78BFA] border border-[#A78BFA]/30 hover:bg-[#A78BFA] hover:text-[#180260] transition-all group relative"
                        title={`Weave Context: ${activeProject.name}`}
                    >
                        <BrainCircuit className="w-5 h-5" />
                        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-[#A78BFA] text-[#180260] font-bold text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            Weave Context
                        </span>
                    </button>
                )}

                {/* New Project Action */}
                <button
                    onClick={openImportModal}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all group relative"
                    title="New Project"
                >
                    <PlusCircle className="w-6 h-6" />
                    <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                        New Project
                    </span>
                </button>

                <div className="w-px h-8 bg-white/10 mx-1" />

                {/* Logout Button */}
                <button
                    onClick={async () => {
                        const { createClient } = await import("@/lib/supabase/client");
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        window.location.href = "/login";
                    }}
                    className="flex items-center justify-center w-12 h-12 rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all group relative"
                    title="Log Out"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                        Log Out
                    </span>
                </button>

                <div className="w-px h-8 bg-white/10 mx-1" />

                {/* Theme Toggle */}
                <div className="flex items-center justify-center w-12 h-12">
                    <ThemeToggle className="rounded-full w-10 h-10 border-0 bg-transparent hover:bg-white/10" />
                </div>
            </motion.div>

            {/* Render Modal Globally if active */}
            {activeProject && (
                <ContextWeaverModal
                    isOpen={isWeaverOpen}
                    onClose={() => setIsWeaverOpen(false)}
                    project={activeProject}
                />
            )}
        </div>
    );
}
