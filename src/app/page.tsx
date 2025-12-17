"use client";

import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { ProblemSection } from "@/components/landing/problem-section";
import { WorkflowSection } from "@/components/landing/workflow-section";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      if (code) {
        // Attempt client-side exchange since server-side redirects are failing
        // caused by missing cookies in the request chain.
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          // Success! Session established.
          router.replace('/dashboard');
        } else {
          // If client exchange fails, it might be because the code is invalid 
          // or already used. We can try forwarding to server callback as a last resort,
          // or just show the error.
          console.error("Client Auth Fallback Error:", error);
          window.location.href = `/auth/auth-code-error?error=${encodeURIComponent(error.message)}`;
        }
      }
    };

    handleAuth();
  }, [searchParams, router]);

  return (
    <main className="min-h-screen w-full bg-[#050505] relative overflow-hidden flex flex-col items-center">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#180260] opacity-30 blur-[120px] rounded-full pointer-events-none" />

      <Hero />
      <TrustBar />
      <ProblemSection />
      <FeatureGrid />
      <WorkflowSection />

      <Footer />
      <CookieConsent />
    </main >
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <LandingContent />
    </Suspense>
  );
}
