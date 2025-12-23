"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, className, side = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const getPosition = () => {
        switch (side) {
            case 'top': return { bottom: '100%', left: '50%', x: '-50%', y: -8, originY: 1 };
            case 'bottom': return { top: '100%', left: '50%', x: '-50%', y: 8, originY: 0 };
            case 'left': return { right: '100%', top: '50%', y: '-50%', x: -8, originX: 1 };
            case 'right': return { left: '100%', top: '50%', y: '-50%', x: 8, originX: 0 };
            default: return { bottom: '100%', left: '50%', x: '-50%', y: -8 };
        }
    };

    const pos = getPosition();

    return (
        <div
            className="relative inline-block z-50"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: pos.x, y: 0 }}
                        animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y as number }}
                        exit={{ opacity: 0, scale: 0.9, x: pos.x, y: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "absolute z-[100] px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl whitespace-nowrap pointer-events-none",
                            className
                        )}
                        style={{
                            ...pos,
                            x: undefined, // Handled by motion
                            y: undefined, // Handled by motion
                        }}
                    >
                        <div className="relative z-10">{content}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
