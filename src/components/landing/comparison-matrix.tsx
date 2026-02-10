"use client";

import { Check, X, Minus } from "lucide-react";
import { Fragment } from "react";

export function ComparisonMatrix() {
    const features = [
        {
            category: "Core Features",
            items: [
                { name: "Active Projects", free: "1 Project", pro: "Unlimited" },
                { name: "Vibe Coder (Chat)", free: "20 / month", pro: "500 / month" },
                { name: "Chat History", free: "7 days", pro: "Unlimited" },
            ]
        },
        {
            category: "Intelligence",
            items: [
                { name: "AI Model", free: "Gemini 3.0 Flash", pro: "Gemini 3.0 Pro + Flash" },
                { name: "Context Window", free: "Standard", pro: "1 Million Tokens" },
                { name: "Project Insight (Deep Dive)", free: "1 / month", pro: "50 / month" },
                { name: "Vibe Onboard (Guides)", free: "Included (shares limit)", pro: "Unlimited" },
            ]
        },
        {
            category: "Multimodal",
            items: [
                { name: "Image Analysis", free: <X className="w-4 h-4 text-neutral-300 mx-auto" />, pro: <Check className="w-4 h-4 text-green-500 mx-auto" /> },
                { name: "Video Debugging (Screencast)", free: <X className="w-4 h-4 text-neutral-300 mx-auto" />, pro: <Check className="w-4 h-4 text-green-500 mx-auto" /> },
            ]
        },
        {
            category: "Support",
            items: [
                { name: "Type", free: "Community", pro: "Priority Email" },
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto mt-24 px-4">
            <h3 className="text-2xl font-bold text-center mb-12 text-neutral-900 dark:text-white">Feature Comparison</h3>

            <div className="rounded-3xl border border-neutral-200 dark:border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-neutral-100/50 dark:bg-white/5 border-b border-neutral-200 dark:border-white/10">
                            <th className="py-4 px-6 text-left font-medium text-neutral-500">Feature</th>
                            <th className="py-4 px-6 text-center font-bold text-neutral-900 dark:text-white w-1/4">Hacker (Free)</th>
                            <th className="py-4 px-6 text-center font-bold text-purple-600 dark:text-purple-400 w-1/4">Pro / Founder</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-white/5 bg-white dark:bg-[#0a0a0a]">
                        {features.map((section, sIdx) => (
                            <Fragment key={section.category}>
                                <tr className="bg-neutral-50/50 dark:bg-white/[0.02]">
                                    <td colSpan={3} className="py-2 px-6 text-xs font-bold uppercase tracking-wider text-neutral-400">
                                        {section.category}
                                    </td>
                                </tr>
                                {section.items.map((item, iIdx) => (
                                    <tr key={`${sIdx}-${iIdx}`} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-6 font-medium text-neutral-700 dark:text-neutral-300">
                                            {item.name}
                                        </td>
                                        <td className="py-4 px-6 text-center text-neutral-600 dark:text-neutral-400">
                                            {item.free}
                                        </td>
                                        <td className="py-4 px-6 text-center font-semibold text-neutral-900 dark:text-white">
                                            {item.pro}
                                        </td>
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
