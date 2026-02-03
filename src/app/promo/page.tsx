"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TerminalView } from "@/components/promo/terminal-view";
import { NetworkView } from "@/components/promo/network-view";
import { IntroView } from "@/components/promo/intro-view";
import { SearchDemoView } from "@/components/promo/search-demo-view";
import { FeatureShowcase } from "@/components/promo/feature-showcase";
import { AnimationPhase } from "@/components/promo/types";

export default function PromoPage() {
    const [phase, setPhase] = useState<AnimationPhase>("INTRO");

    // Sequential State Machine Logic
    // Adjusted for 30s Voiceover Script
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        console.log(`Phase changed to: ${phase}`);

        switch (phase) {
            case "TERMINAL":
                // "We build. We deploy... and then we forget." (~4s)
                timeout = setTimeout(() => setPhase("CHAOS"), 4000);
                break;
            case "CHAOS":
                // "Context disappears... Documentation gets lost." (~3s)
                timeout = setTimeout(() => setPhase("VECTORS"), 3000);
                break;
            case "VECTORS":
                // Drawing connections... (~2s)
                timeout = setTimeout(() => setPhase("ORDER"), 2000);
                break;
            case "ORDER":
                // "But what if your code could remember itself?" (~4s)
                // Grid holds steady.
                timeout = setTimeout(() => setPhase("SEARCH_DEMO"), 4000);
                break;
            case "SEARCH_DEMO":
                // "Meet StackMemory... connects every file..." (~7s)
                // Typing animation happens here.
                timeout = setTimeout(() => setPhase("FINISHED"), 7000);
                break;
            case "FEATURES":
                // SKIP FEATURES -> Go straight to logo for the "Let me show you" transition
                timeout = setTimeout(() => setPhase("FINISHED"), 100);
                break;
            case "FINISHED":
                // "...and gives you a permanent Second Brain."
                break;
        }

        return () => clearTimeout(timeout);
    }, [phase]);

    const handleIntroComplete = () => {
        setPhase("TERMINAL");
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-black text-white overflow-hidden relative font-sans">

            {/* INTRO PHASE */}
            <AnimatePresence>
                {phase === "INTRO" && (
                    <motion.div
                        className="absolute inset-0 z-50 bg-black flex items-center justify-center"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <IntroView onComplete={handleIntroComplete} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CORE ANIMATION PHASES */}
            <AnimatePresence mode="wait">
                {phase === "TERMINAL" && (
                    <motion.div
                        key="terminal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <TerminalView />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(phase !== "INTRO" && phase !== "TERMINAL") && (
                    <motion.div
                        key="network"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <NetworkView phase={phase} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OVERLAY: SEARCH DEMO */}
            <AnimatePresence>
                {phase === "SEARCH_DEMO" && (
                    <motion.div
                        key="search"
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-x-0 top-32 z-30 flex justify-center"
                    >
                        <SearchDemoView onSearch={() => { }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OVERLAY: FEATURES */}
            <AnimatePresence>
                {phase === "FEATURES" && (
                    <FeatureShowcase />
                )}
            </AnimatePresence>

            {/* FINISHED / LOGO */}
            <AnimatePresence>
                {phase === "FINISHED" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-3xl"
                    >
                        <h1 className="text-6xl md:text-9xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            StackMemory
                        </h1>
                        <p className="text-gray-400 mt-6 text-2xl tracking-widest uppercase">The second brain for your code</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]" />
            </div>
        </main>
    );
}
