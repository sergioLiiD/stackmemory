"use client";

import { useAuth } from "@/components/auth/auth-context";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Key } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const { signInWithGithub } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!supabase) {
            setMessage({ type: 'error', text: 'Supabase client not initialized' });
            setLoading(false);
            return;
        }

        if (mode === 'signup') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: 'Check your email for the confirmation link!' });
                setMode('signin');
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                router.push('/dashboard');
                router.refresh(); // Refresh middleware/server state
            }
        }
        setLoading(false);
    };

    return (
        <>
            <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#180260]/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-900/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                            <Image
                                src="/logo_sm_w.png"
                                alt="StackMemory Logo"
                                width={400}
                                height={120}
                                className="h-24 w-auto object-contain relative z-10"
                                priority
                            />
                        </div>
                        <p className="text-neutral-400 text-sm">
                            {mode === 'signin' ? 'Welcome back, Architect' : 'Build your Second Brain'}
                        </p>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                        {/* Social Login */}


                        <button
                            onClick={signInWithGithub}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#24292e] text-white hover:bg-[#2f363d] transition-colors font-medium mb-6 relative hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 border border-white/10"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Continue with GitHub
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0a0a0a] px-2 text-neutral-500">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400 font-medium ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-neutral-600"
                                        placeholder="memex@stackmemory.ai"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400 font-medium ml-1">Password</label>
                                <div className="relative group">
                                    <Key className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-neutral-600"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={cn("text-xs p-3 rounded-lg text-center font-medium",
                                    message.type === 'error' ? "bg-red-500/10 text-red-400 text-left border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"
                                )}>
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#180260] text-white rounded-xl py-3 font-medium hover:bg-[#2a04a3] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#180260]/20"
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                    <>
                                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-neutral-500">
                                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(null); }}
                                    className="text-white hover:underline font-medium"
                                >
                                    {mode === 'signin' ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
                {/* Footer & Compliance */}
                <div className="md:hidden"> {/* Hide on mobile if simpler, or keep. Footer handles responsiveness. */}
                    {/* Actually, let's just render render it at the bottom. The login page is full screen fixed usually, so we might need to adjust. */}
                </div>

                <CookieConsent />

                {/* Footer positioned absolutely or relatively depending on height. 
                For this specific design which is min-h-screen flex center, the footer might look odd if we don't structure it right.
                Let's make the main container flex-col min-h-screen.
            */}
            </main>
            <Footer />
        </>
    );
}
