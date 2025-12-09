"use client";

import { useAuth } from "@/components/auth/auth-context";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Key } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const { signInWithGoogle, signInWithGithub } = useAuth();
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
        <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#180260]/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-900/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent mb-2">
                        StacKMemory
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        {mode === 'signin' ? 'Welcome back, Architect' : 'Build your Second Brain'}
                    </p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    {/* Social Login */}
                    <button
                        onClick={signInWithGoogle}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors font-medium mb-6 relative hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

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
        </div>
    );
}
