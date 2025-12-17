"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const code = searchParams.get("code");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-4">
            <div className="max-w-md w-full bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
                <p className="text-neutral-400 mb-6">
                    We couldn't log you in. This might be due to an expired session or a configuration issue.
                </p>

                {error && (
                    <div className="bg-red-950/30 border border-red-500/10 rounded-lg p-4 mb-6 text-left">
                        <p className="text-xs font-mono text-red-400 break-all">Error: {error}</p>
                        {code && <p className="text-xs font-mono text-neutral-500 mt-1 break-all">Code: {code}</p>}
                    </div>
                )}

                <div className="flex gap-3">
                    <Link href="/login" className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">
                        Try Login Again
                    </Link>
                    <Link href="/" className="flex-1 py-3 rounded-xl bg-[#180260] hover:bg-[#2a04a3] text-white font-medium transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <ErrorContent />
        </Suspense>
    );
}
