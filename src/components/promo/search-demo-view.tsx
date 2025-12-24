"use client";

import { motion } from "framer-motion";
import { Search, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function SearchDemoView({ onSearch }: { onSearch: (term: string) => void }) {
    const [text, setText] = useState("");
    const [completed, setCompleted] = useState(false);
    const QUERY = "How does authentication work?";

    useEffect(() => {
        // Type out the query
        let idx = 0;
        const interval = setInterval(() => {
            if (idx < QUERY.length) {
                setText(QUERY.substring(0, idx + 1));
                idx++;
            } else {
                clearInterval(interval);
                onSearch(QUERY); // Trigger the highlight in the background
                setTimeout(() => setCompleted(true), 1500);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-4 flex items-center gap-4"
            >
                <Search className="text-gray-400 w-6 h-6" />
                <span className="text-xl text-gray-200 font-medium">
                    {text}
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-0.5 h-6 bg-blue-500 ml-1 align-middle"
                    />
                </span>
            </motion.div>

            <AnimatePresence>
                {completed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 bg-green-500/20 border border-green-500/50 text-green-300 px-6 py-2 rounded-full flex items-center gap-2 backdrop-blur-md"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Context Found: 4 Files</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
import { AnimatePresence } from "framer-motion";
