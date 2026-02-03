"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const COMMAND = "> npx stackmemory analyze .";
const LOGS = [
    "Initializing scanner...",
    "Loading tokenizer...",
    "Found 142 files in /src",
    "Parsing dependencies...",
    "Detected Next.js 15 app router",
    "Detected Supabase client",
    "Indexing vector embeddings...",
    "Calculating semantic relationships...",
    "Generating dependency graph...",
    "Analysis complete."
];

export function TerminalView() {
    const [text, setText] = useState("");
    const [showLogs, setShowLogs] = useState(false);
    const [logLines, setLogLines] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Typing effect
        let currentText = "";
        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex < COMMAND.length) {
                currentText += COMMAND[currentIndex];
                setText(currentText);
                currentIndex++;
            } else {
                clearInterval(interval);
                setTimeout(() => setShowLogs(true), 100); // Faster delay
            }
        }, 30); // Faster typing (was 50)

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showLogs) {
            let logIndex = 0;
            const logInterval = setInterval(() => {
                if (logIndex < LOGS.length) {
                    setLogLines((prev) => [...prev, LOGS[logIndex]]);
                    logIndex++;
                    // Auto scroll
                    if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    }
                } else {
                    clearInterval(logInterval);
                }
            }, 100); // Much faster logs (was 300) to fit in 4s phase
            return () => clearInterval(logInterval);
        }
    }, [showLogs]);

    return (
        <div className="w-full max-w-3xl p-6 rounded-lg bg-black/80 border border-gray-800 font-mono shadow-2xl backdrop-blur-sm">
            <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            <div className="text-xl text-green-400 mb-2 min-h-[1.5em]">
                {text}
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2.5 h-5 bg-green-400 ml-1 translate-y-1"
                />
            </div>

            <div
                ref={scrollRef}
                className="h-64 overflow-hidden text-gray-400 space-y-1 text-sm md:text-base"
            >
                {logLines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-blue-500">info</span>
                        <span>{line}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
