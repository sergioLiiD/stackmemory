"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "declined");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[60] max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-white/5 border border-white/5 shrink-0">
                        <Cookie className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-white mb-2">Cookie Preferences</h3>
                        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                            We use cookies to ensure you get the best experience on our StackMemory.
                            Read our <Link href="/privacy" className="text-white hover:underline">Privacy Policy</Link>.
                        </p>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleAccept}
                                className="w-full py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors"
                            >
                                Accept All
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDecline}
                                    className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 transition-colors"
                                >
                                    Necessary Only
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 transition-colors"
                                >
                                    Customize
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
