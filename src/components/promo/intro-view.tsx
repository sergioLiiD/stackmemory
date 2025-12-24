"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const SLIDES = [
    "95% of new projects are abandoned every year...",
    "Because developers lose track of how their code works.",
    "StackMemory turns your codebase into knowledge."
];

export function IntroView({ onComplete }: { onComplete: () => void }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        // 4 seconds per slide
        const interval = setInterval(() => {
            setIndex((prev) => {
                if (prev === SLIDES.length - 1) {
                    clearInterval(interval);
                    setTimeout(onComplete, 4000); // Wait 4s on last slide then finish
                    return prev;
                }
                return prev + 1;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="flex items-center justify-center w-full h-full p-10 text-center">
            <AnimatePresence mode="wait">
                <motion.h1
                    key={index}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    // Updated gradient: Blue -> Purple -> Pink
                    className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight max-w-4xl"
                >
                    {SLIDES[index]}
                </motion.h1>
            </AnimatePresence>
        </div>
    );
}
