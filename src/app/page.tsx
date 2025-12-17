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
    const code = searchParams.get('code');
    if (code) {
      // Redirect to the auth callback with the code
      // We use window.location to ensure we hit the server route fully
      window.location.href = `/auth/callback?code=${code}`;
    }
  }, [searchParams]);

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
