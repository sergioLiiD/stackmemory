"use client";

import { BentoCard, BentoHeader } from "@/components/ui/bento-card";
import { ArrowRight, Box, Code2, Database, History, Terminal, Scan, BrainCircuit, MessageSquareText, Briefcase, MonitorPlay, Layers } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#050505] relative overflow-hidden flex flex-col items-center">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#180260] opacity-30 blur-[120px] rounded-full pointer-events-none" />

      {/* --- HERO & BENTO GRID --- */}
      <section className="max-w-6xl w-full p-4 flex flex-col items-center pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 w-full md:h-[800px]">

          {/* BIG HERO CARD */}
          <BentoCard className="md:col-span-2 md:row-span-2 flex flex-col justify-between group overflow-visible" delay={0.1}>
            <div className="z-10">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/80 mb-6 border border-white/5"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                v1.0 Early Access
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-4">
                Stack<span className="text-[#8b5cf6]">Memory</span>
              </h1>
              <p className="text-lg text-neutral-400 max-w-sm">
                The intelligent journal for Developers, Agencies, and Live Coders. Stop forgetting your stack.
              </p>
            </div>

            <div className="mt-8 flex gap-4 z-10">
              <Link href="/dashboard" className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition-transform flex items-center gap-2">
                Start Memory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Abstract Grid Background inside card */}
            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
              <Box className="w-64 h-64 text-white" strokeWidth={0.5} />
            </div>
          </BentoCard>

          {/* MAGIC IMPORT CARD */}
          <BentoCard className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-[#180260]/40 to-transparent border-[#180260]/50" delay={0.2}>
            <div className="flex items-start justify-between">
              <BentoHeader title="Magic Import" subtitle="Paste your package.json, we do the rest." />
              <Terminal className="w-6 h-6 text-[#a78bfa]" />
            </div>

            <div className="mt-4 p-3 rounded-lg bg-black/40 font-mono text-xs text-green-400 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
              <p>{`{`}</p>
              <p className="pl-4">{`"name": "super-app",`}</p>
              <p className="pl-4">{`"dependencies": {`}</p>
              <p className="pl-8">{`"next": "^14.0.0",`}</p>
              <p className="pl-8">{`"react": "^18.2.0"`}</p>
              <p className="pl-4">{`}`}</p>
              <p>{`}`}</p>

              <div className="absolute top-2 right-2 px-2 py-1 bg-[#180260] rounded text-[10px] text-white animate-pulse">
                Auto-Scanning...
              </div>
            </div>
          </BentoCard>

          {/* DECISION RECORDS */}
          <BentoCard className="md:col-span-1 md:row-span-2" delay={0.3}>
            <div className="h-full flex flex-col">
              <div className="mb-auto">
                <History className="w-8 h-8 text-orange-400 mb-4" />
                <BentoHeader title="Decision Records" />
                <p className="text-sm text-neutral-500 mt-2">
                  Document the "Why" behind your code.
                </p>
              </div>

              <div className="space-y-3 mt-6">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="h-2 w-12 bg-white/20 rounded mb-2" />
                    <div className="h-1.5 w-full bg-white/10 rounded" />
                    <div className="h-1.5 w-2/3 bg-white/10 rounded mt-1" />
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* SERVICE LEDGER */}
          <BentoCard className="md:col-span-1 md:row-span-2" delay={0.4}>
            <div className="h-full flex flex-col">
              <Database className="w-8 h-8 text-blue-400 mb-4" />
              <BentoHeader title="Service Ledger" />
              <p className="text-sm text-neutral-500 mt-2">
                Track AWS, Vercel, and DB accounts per project.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['AWS', 'Vercel', 'Mongo', 'Supabase'].map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded-md bg-white/10 text-xs text-white/70 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* CODE SNIPPETS */}
          <BentoCard className="md:col-span-2 md:row-span-1 flex items-center justify-between" delay={0.5}>
            <div className="flex flex-col justify-center">
              <BentoHeader title="Contextual Snippets" subtitle="Save the golden nuggets of your code." />
            </div>
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#180260] to-purple-900 blur-2xl absolute right-10" />
            <Code2 className="w-16 h-16 text-white/10 relative z-10" />
          </BentoCard>

        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="w-full max-w-6xl p-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Zero Friction Workflow</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">We know you hate documentation. So we made it automatic.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Terminal,
              title: "1. Auto-Sync CLI",
              desc: "Don't copy-paste. Run 'npm install stackmemory' and our invisible CLI watcher updates your Vault whenever you install a new package.",
              color: "text-blue-400",
              badge: "New"
            },
            {
              icon: BrainCircuit,
              title: "2. Context Weaver",
              desc: "One click to compile your Stack + Rules + Active Prompts into a single payload for ChatGPT or Claude.",
              color: "text-purple-400"
            },
            {
              icon: MessageSquareText,
              title: "3. Active Recall",
              desc: "Ask specifically: 'Where is the production DB key?' and get the answer instantly from your secure Vault.",
              color: "text-green-400"
            },
          ].map((step, i) => (
            <motion.div
              whileHover={{ y: -5 }}
              key={i}
              className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-colors"
            >
              {step.badge && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[#180260] text-[#a78bfa] text-[10px] font-bold uppercase tracking-wider border border-[#a78bfa]/20">
                  {step.badge}
                </div>
              )}
              <div className={`p-4 rounded-2xl bg-white/5 mb-6 ${step.color} group-hover:scale-110 transition-transform`}>
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- WHO IS THIS FOR SECTION --- */}
      <section className="w-full max-w-6xl p-4 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Who is StackMemory for?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BentoCard className="bg-[#180260]/10 border-[#180260]/30" delay={0.2}>
            <Briefcase className="w-10 h-10 text-white mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">The Multi-Project Pro</h3>
            <p className="text-neutral-400 text-sm">
              Managing 15+ client projects? Never forget which one uses Next.js 12 vs 14, or where the Vercel deploy hook is.
            </p>
          </BentoCard>

          <BentoCard className="bg-white/5" delay={0.3}>
            <MonitorPlay className="w-10 h-10 text-white mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">The Live Coder</h3>
            <p className="text-neutral-400 text-sm">
              Show your viewers your "Current Stack" with a public widget, without accidentally revealing your .env secrets.
            </p>
          </BentoCard>

          <BentoCard className="bg-white/5" delay={0.4}>
            <Layers className="w-10 h-10 text-white mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">The Agency Owner</h3>
            <p className="text-neutral-400 text-sm">
              Handing off a legacy project? Generate an instant "Resurrection Manual" for the next developer.
            </p>
          </BentoCard>
        </div>
      </section>

    </main>
  );
}
