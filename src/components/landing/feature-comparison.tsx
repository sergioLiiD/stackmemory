"use client";

import { Check, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import React from "react";

export function FeatureComparison() {
    const features = [
        {
            category: "Core Features",
            items: [
                { name: "Active Projects", free: "5", pro: "50", founder: "100", tooltip: "Number of simultaneous projects you can analyze." },
                { name: "Tech Stack Analysis", free: "Basic", pro: "AI-Enhanced", founder: "AI-Enhanced", tooltip: "Deep scan of your project dependencies." },
                { name: "Vulnerability Scanning", free: true, pro: true, founder: true, tooltip: "Automatic detection of security risks." },
            ]
        },
        {
            category: "Workflow & Tools",
            items: [
                { name: "Manual Import", free: true, pro: true, founder: true, tooltip: "Import projects via CLI or manual entry." },
                { name: "GitHub Auto-Sync", free: false, pro: true, founder: true, tooltip: "Automatically keep your stack updated when you push code." },
                { name: "CLI Integration", free: true, pro: true, founder: true, tooltip: "Sync, Log, and Ask from your terminal." },
                { name: "Context Bridges (MCP)", free: "Basic", pro: "AI Advisor", founder: "AI Advisor", tooltip: "Manage MCP Servers and get AI suggestions." },
                { name: "Global Vault", free: "Read-Only", pro: "Full Access", founder: "Full Access", tooltip: "Store and reuse prompts & snippets across projects." },
                { name: "Export Reports", free: "PDF Only", pro: "PDF, JSON, CSV", founder: "All Formats", tooltip: "Export your analysis for presentations or audits." },
            ]
        },
        {
            category: "AI Capabilities",
            items: [
                { name: "Multimodal Analysis", free: false, pro: true, founder: true, tooltip: "Upload screenshots and videos for visual debugging." },
                { name: "Auto-Tagging Journal", free: "Limit 5/mo", pro: "Unlimited", founder: "Unlimited", tooltip: "AI automatically categorizes your journal entries." },
            ]
        },
        {
            category: "Support & Perks",
            items: [
                { name: "Support Level", free: "Community", pro: "Priority", founder: "VIP Direct", tooltip: "Response time and channel access." },
                { name: "Early Access", free: false, pro: true, founder: true, tooltip: "Try new beta features before anyone else." },
                { name: "Founder Badge", free: false, pro: false, founder: true, tooltip: "Exclusive profile badge for early supporters." },
            ]
        }
    ];

    const renderValue = (value: string | boolean) => {
        if (typeof value === "boolean") {
            return value ? (
                <div className="flex justify-center"><Check className="w-5 h-5 text-green-500" /></div>
            ) : (
                <div className="flex justify-center"><X className="w-5 h-5 text-neutral-700" /></div>
            );
        }
        return <span className="text-sm font-medium text-neutral-300">{value}</span>;
    };

    return (
        <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Feature Comparison</h2>
                    <p className="text-neutral-400">Detailed breakdown of what's included in each plan.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 text-left w-1/3"></th>
                                <th className="p-4 text-center w-1/5">
                                    <div className="text-lg font-bold text-neutral-400 mb-1">Architect</div>
                                    <div className="text-sm text-neutral-500 font-normal">Free</div>
                                </th>
                                <th className="p-4 text-center w-1/5 bg-[#180260]/10 rounded-t-xl border-t border-x border-[#a78bfa]/20">
                                    <div className="text-lg font-bold text-[#a78bfa] mb-1">Legend</div>
                                    <div className="text-sm text-[#a78bfa]/80 font-normal">Pro</div>
                                </th>
                                <th className="p-4 text-center w-1/5">
                                    <div className="text-lg font-bold text-amber-400 mb-1">Founder</div>
                                    <div className="text-sm text-amber-500/80 font-normal">Lifetime</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {features.map((category, idx) => (
                                <React.Fragment key={idx}>
                                    <tr className="bg-white/5">
                                        <td colSpan={4} className="p-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 pl-6">
                                            {category.category}
                                        </td>
                                    </tr>
                                    {category.items.map((item, itemIdx) => (
                                        <tr key={itemIdx} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5 text-neutral-300 font-medium flex items-center gap-2">
                                                {item.name}
                                                <Tooltip content={item.tooltip} side="right">
                                                    <Info className="w-3.5 h-3.5 text-neutral-600 hover:text-neutral-400 cursor-help transition-colors" />
                                                </Tooltip>
                                            </td>
                                            <td className="p-4 text-center">{renderValue(item.free)}</td>
                                            <td className="p-4 text-center bg-[#180260]/5 border-x border-[#a78bfa]/10 group-hover:bg-[#180260]/10 transition-colors">
                                                {renderValue(item.pro)}
                                            </td>
                                            <td className="p-4 text-center">{renderValue(item.founder)}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
