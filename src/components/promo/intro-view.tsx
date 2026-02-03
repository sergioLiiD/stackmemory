"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const SLIDES = [
    "95% of projects rot because context is lost.",
    "StackMemory + Gemini 2.0 restores that context.",
    "Welcome to the era of Vibe Coding."
];

export function IntroView({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        // Just show the intro text for 3 seconds, then complete
        const timeout = setTimeout(onComplete, 3000);
        return () => clearTimeout(timeout);
    }, [onComplete]);

    return (
        <div className="flex items-center justify-center w-full h-full p-10 text-center">
            <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
                transition={{ duration: 1 }}
                className="text-5xl md:text-8xl font-bold bg-gradient-to-r from-white via-gray-400 to-gray-600 bg-clip-text text-transparent"
            >
                Context is Lost.
            </motion.h1>
        </div>
    );
}
