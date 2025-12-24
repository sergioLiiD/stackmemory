"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileCode2, Database, Globe, Smartphone, Server, Cpu, Layers, Braces } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimationPhase } from "@/components/promo/types";

// Define our "Nodes" (representing files/tech)
const NODES = [
    { id: 1, icon: FileCode2, label: "page.tsx", color: "text-blue-400" },
    { id: 2, icon: Database, label: "schema.sql", color: "text-green-400" },
    { id: 3, icon: Globe, label: "api/route.ts", color: "text-purple-400" },
    { id: 4, icon: Braces, label: "utils.ts", color: "text-yellow-400" },
    { id: 5, icon: Server, label: "middleware.ts", color: "text-red-400" },
    { id: 6, icon: Layers, label: "layout.tsx", color: "text-cyan-400" },
    { id: 7, icon: Cpu, label: "hooks.ts", color: "text-orange-400" },
    { id: 8, icon: Smartphone, label: "responsive.css", color: "text-pink-400" },
];

const SEARCH_RELEVANT_IDS = [2, 3, 5]; // schema, api, middleware (Auth related)

// Precompute random positions for "CHAOS" phase
// and structured positions for "ORDER" phase
const BOX_WIDTH = 120;
const BOX_HEIGHT = 120;
const GAP = 20;

export function NetworkView({ phase }: { phase: AnimationPhase }) {
    const [dimensions, setDimensions] = useState({ w: 1000, h: 800 });
    const [isClient, setIsClient] = useState(false);
    const [highlightMode, setHighlightMode] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setDimensions({ w: window.innerWidth, h: window.innerHeight });
    }, []);

    useEffect(() => {
        if (phase === "SEARCH_DEMO") {
            setTimeout(() => setHighlightMode(true), 2500); // Sync with search typing
        }
    }, [phase]);

    if (!isClient) return null;

    // Center of screen
    const cx = dimensions.w / 2;
    const cy = dimensions.h / 2;

    // Vectors: We only draw them in VECTORS phase, fade out in ORDER
    const showVectors = phase === "VECTORS" || phase === "ORDER";

    // Calculate grid positions for ORDER phase
    // 4 columns, 2 rows centered
    const gridStartX = cx - ((4 * BOX_WIDTH + 3 * GAP) / 2) + BOX_WIDTH / 2;
    const gridStartY = cy - ((2 * BOX_HEIGHT + 1 * GAP) / 2) + BOX_HEIGHT / 2;

    return (
        <div className="relative w-full h-full">
            {/* SVG Layer for Vectors */}
            {showVectors && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <AnimatePresence>
                        {phase === "VECTORS" && (
                            <>
                                {/* Generate some random connections between nodes */}
                                {[...Array(12)].map((_, i) => {
                                    const startNode = NODES[i % NODES.length];
                                    const endNode = NODES[(i + 3) % NODES.length];
                                    const chaosX1 = cx + Math.sin(startNode.id * 123) * 300;
                                    const chaosY1 = cy + Math.cos(startNode.id * 123) * 300;
                                    const chaosX2 = cx + Math.sin(endNode.id * 123) * 300;
                                    const chaosY2 = cy + Math.cos(endNode.id * 123) * 300;

                                    return (
                                        <motion.line
                                            key={i}
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.3 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1.5, delay: i * 0.1 }}
                                            x1={chaosX1}
                                            y1={chaosY1}
                                            x2={chaosX2}
                                            y2={chaosY2}
                                            stroke="url(#gradient)"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                            </>
                        )}
                    </AnimatePresence>
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#60A5FA" />
                            <stop offset="100%" stopColor="#A78BFA" />
                        </linearGradient>
                    </defs>
                </svg>
            )}

            {/* Nodes Layer */}
            {NODES.map((node, i) => {
                // Position Logic
                let x = 0;
                let y = 0;
                let scale = 1;

                if (phase === "CHAOS" || phase === "VECTORS") {
                    // Random distribution around circle
                    const angle = (i / NODES.length) * Math.PI * 2;
                    const radius = 250 + Math.random() * 50; // Jitter
                    x = cx + Math.cos(angle) * radius - BOX_WIDTH / 2;
                    y = cy + Math.sin(angle) * radius - BOX_HEIGHT / 2;
                } else if (phase === "ORDER" || phase === "SEARCH_DEMO" || phase === "FEATURES" || phase === "FINISHED") {
                    // Grid Position
                    const row = Math.floor(i / 4);
                    const col = i % 4;
                    x = gridStartX + col * (BOX_WIDTH + GAP) - BOX_WIDTH / 2;
                    y = gridStartY + row * (BOX_HEIGHT + GAP) - BOX_HEIGHT / 2;
                    scale = 1;
                }

                // Search Highlight Logic
                const isDimmed = highlightMode && !SEARCH_RELEVANT_IDS.includes(node.id);
                const isHighlighted = highlightMode && SEARCH_RELEVANT_IDS.includes(node.id);

                return (
                    <motion.div
                        key={node.id}
                        layout // Magic framer motion prop for smooth position interpolation
                        initial={{ opacity: 0, scale: 0, x: cx, y: cy }}
                        animate={{
                            opacity: isDimmed ? 0.2 : 1,
                            scale: isHighlighted ? 1.1 : scale,
                            x,
                            y,
                            filter: isDimmed ? "grayscale(100%)" : "grayscale(0%)"
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 40,
                            damping: 15,
                            delay: i * 0.05
                        }}
                        className={`absolute flex flex-col items-center justify-center p-4 rounded-xl backdrop-blur-md shadow-xl z-20 transition-colors duration-500
                ${isHighlighted ? "bg-blue-900/40 border-blue-500/50" : "bg-gray-900/80 border-gray-800"}
            `}
                        style={{
                            width: BOX_WIDTH,
                            height: BOX_HEIGHT,
                        }}
                    >
                        <div className={`mb-3 p-3 rounded-full bg-gray-800/50 ${node.color}`}>
                            <node.icon size={28} />
                        </div>
                        <div className="text-xs font-mono text-gray-400">{node.label}</div>

                        {/* Simulation of "scanning" effect in vector phase */}
                        {phase === "VECTORS" && (
                            <motion.div
                                className="absolute inset-0 border-2 border-blue-500/30 rounded-xl"
                                animate={{ opacity: [0, 1, 0], scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                            />
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
