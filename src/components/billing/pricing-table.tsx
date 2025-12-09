import { Check, Zap, Shield, Globe, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingProps {
    currentTier?: 'free' | 'pro';
    onUpgrade?: () => void;
}

export function PricingTable({ currentTier = 'free', onUpgrade }: PricingProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-medium text-neutral-400 mb-2">Architect (Free)</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold text-white">$0</span>
                        <span className="text-sm text-neutral-500">/forever</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-neutral-300">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Up to 3 Projects</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-neutral-300">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Manual Deployment Import</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-neutral-300">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Basic AI Querying (Per Project)</span>
                        </li>
                    </ul>

                    {currentTier === 'free' ? (
                        <div className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-center text-sm font-medium text-neutral-500">
                            Current Plan
                        </div>
                    ) : (
                        <div className="w-full py-3 rounded-xl bg-transparent text-center text-sm font-medium text-neutral-600">
                            Downgrade not available
                        </div>
                    )}
                </div>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-3xl border border-[#a78bfa]/30 bg-gradient-to-b from-[#180260]/20 to-[#0a0a0a] relative overflow-hidden group hover:border-[#a78bfa]/50 transition-colors">
                <div className="absolute inset-0 bg-[#a78bfa]/5 group-hover:bg-[#a78bfa]/10 transition-colors" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-[#a78bfa]">Legend (Pro)</h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#a78bfa] text-[#1e1b4b] text-[10px] font-bold uppercase tracking-wider">
                            Recommended
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold text-white">$9</span>
                        <span className="text-sm text-neutral-500">/month</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm text-white font-medium">
                            <Globe className="w-4 h-4 text-[#a78bfa]" />
                            <span>Unlimited Projects</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white font-medium">
                            <Github className="w-4 h-4 text-[#a78bfa]" />
                            <span>Auto-Sync with GitHub</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white font-medium">
                            <Zap className="w-4 h-4 text-[#a78bfa]" />
                            <span>Cross-Project Semantic Search</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white font-medium">
                            <Shield className="w-4 h-4 text-[#a78bfa]" />
                            <span>Priority Support</span>
                        </li>
                    </ul>

                    {currentTier === 'pro' ? (
                        <div className="w-full py-3 rounded-xl bg-[#a78bfa]/20 border border-[#a78bfa]/30 text-center text-sm font-medium text-[#a78bfa]">
                            Active Plan
                        </div>
                    ) : (
                        <button
                            onClick={onUpgrade}
                            className="w-full py-3 rounded-xl bg-[#a78bfa] text-[#1e1b4b] hover:bg-[#c4b5fd] transition-colors font-bold shadow-lg shadow-[#a78bfa]/20"
                        >
                            Upgrade to Pro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
