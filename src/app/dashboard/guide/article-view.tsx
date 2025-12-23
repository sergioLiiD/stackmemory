"use client";

import { X, CheckCircle2, Lightbulb, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

export interface GuideArticle {
    id: string;
    title: string;
    description: string; // Short description for card
    icon: any;
    badge: 'FREE' | 'PRO';
    color: string;
    bg: string;
    btnColor: string;

    // Rich Content
    longDescription: string;
    benefits: string[];
    tips: string[];
    actionLink?: string;
    actionLabel?: string;
}

interface ArticleViewProps {
    article: GuideArticle;
    onClose: () => void;
}

export function GuideArticleView({ article, onClose }: ArticleViewProps) {
    const Icon = article.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                layoutId={`card-${article.id}`}
                className="relative w-full max-w-4xl max-h-full bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-black/5 dark:bg-white/10 text-neutral-500 hover:text-black dark:hover:text-white transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Panel: Header & Hero */}
                <div className={cn("w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden", article.bg)}>
                    <div className="relative z-10">
                        <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-8 bg-white/20 backdrop-blur-md shadow-lg", article.color)}>
                            <Icon className="w-8 h-8" />
                        </div>

                        <div className="mb-6">
                            <span className={cn(
                                "inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider mb-4 bg-white/20 backdrop-blur-sm",
                                article.badge === 'PRO' ? "text-violet-900 dark:text-violet-100" : "text-emerald-900 dark:text-emerald-100"
                            )}>
                                {article.badge} FEATURE
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white leading-tight">
                                {article.title}
                            </h2>
                        </div>

                        <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300 opacity-90 leading-relaxed">
                            {article.longDescription}
                        </p>
                    </div>

                    {/* Decorative Blob */}
                    <div className={cn("absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-40 pointer-events-none", article.btnColor)} />
                </div>

                {/* Right Panel: Details */}
                <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto bg-white dark:bg-[#0a0a0a]">
                    <div className="space-y-10">
                        {/* Benefits Section */}
                        <section>
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Why use it?</h3>
                            <ul className="space-y-4">
                                {article.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className={cn("w-5 h-5 shrink-0 mt-0.5", article.color)} />
                                        <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Pro Tips Section */}
                        {article.tips.length > 0 && (
                            <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                                    <Lightbulb className="w-5 h-5" />
                                    <h3 className="font-bold text-sm uppercase tracking-wide">Pro Tips</h3>
                                </div>
                                <ul className="space-y-3">
                                    {article.tips.map((tip, idx) => (
                                        <li key={idx} className="text-sm text-amber-900 dark:text-amber-100/80 leading-relaxed flex gap-2">
                                            <span className="opacity-50">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* CTA */}
                        {article.actionLink && (
                            <div className="pt-4">
                                <Link
                                    href={article.actionLink}
                                    className={cn(
                                        "inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold transition-transform hover:scale-105 shadow-lg shadow-black/5",
                                        article.btnColor
                                    )}
                                >
                                    {article.actionLabel || "Try it now"}
                                    <ExternalLink className="w-4 h-4 opacity-80" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
