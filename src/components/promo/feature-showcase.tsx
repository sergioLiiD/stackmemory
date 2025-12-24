"use client";

import { motion } from "framer-motion";
import { BookOpen, Code2, MessageSquare } from "lucide-react";

const FEATURES = [
    { icon: BookOpen, title: "Automatic Docs", desc: "Always up to date." },
    { icon: Code2, title: "Visual Diagrams", desc: "See the big picture." },
    { icon: MessageSquare, title: "Contextual Chat", desc: "Ask your code anything." },
];

export function FeatureShowcase() {
    return (
        <div className="absolute inset-x-0 bottom-32 flex justify-center gap-6 px-4 z-40">
            {FEATURES.map((feat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 100, rotate: 10 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 50,
                        damping: 15,
                        delay: i * 0.3
                    }}
                    className="w-64 p-6 bg-gradient-to-b from-gray-800 to-black border border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-md"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                        <feat.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{feat.title}</h3>
                    <p className="text-sm text-gray-400">{feat.desc}</p>
                </motion.div>
            ))}
        </div>
    );
}
