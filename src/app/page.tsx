"use client";

import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { ProblemSection } from "@/components/landing/problem-section";
import { WorkflowSection } from "@/components/landing/workflow-section";

export default function Home() {
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
