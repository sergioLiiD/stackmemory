"use client";

import { useAuth } from "@/components/auth/auth-context";
import Script from "next/script";

import { Footer } from "@/components/layout/footer";
// import { CookieConsent } from "@/components/layout/cookie-consent";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { ProblemSection } from "@/components/landing/problem-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FeatureComparison } from "@/components/landing/feature-comparison";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";


function LandingContent() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Simple auto-redirect: If Supabase client detects session (e.g. from auto-PKCE),
  // just send them to dashboard. No manual code exchange.
  useEffect(() => {
    // 1. Check updated context
    if (!isLoading && user) {
      router.push('/dashboard');
    }

    // 2. Explicitly check session on mount (catches stale context cases)
    const checkSession = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [user, isLoading, router]);

  // Pass through layout...
  return (
    <main className="min-h-screen w-full bg-[#050505] relative overflow-hidden flex flex-col items-center">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#180260] opacity-30 blur-[120px] rounded-full pointer-events-none" />

      {/* Lemon Squeezy Overlay Script */}
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="lazyOnload" />

      <Hero />
      <TrustBar />
      <ProblemSection />
      <FeatureGrid />
      <WorkflowSection />
      <PricingSection />
      <FeatureComparison />

      <Footer />
      {/* <CookieConsent /> */}
      {/* JSON-LD Structured Data for LLMs and SEO */}
      <Script
        id="json-ld-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "StackMemory",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web, macOS (CLI)",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "The intelligent coding assistant dashboard for developers. Manage projects, track tech stacks, and use Multimodal AI for debugging.",
            "featureList": [
              "Vibe Coder AI (Multimodal Debugging)",
              "Model Context Protocol (MCP) Bridge Management",
              "Automatic Tech Stack Detection",
              "Vulnerability Scanning",
              "Project Insight Reports",
              "Vibe Onboard Documentation Generator"
            ],
            "screenshot": "https://stackmemory.app/screenshot.png", // Placeholder
            "softwareHelp": "https://stackmemory.app/dashboard/guide",
            "author": {
              "@type": "Organization",
              "name": "StackMemory Team"
            }
          })
        }}
      />
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
