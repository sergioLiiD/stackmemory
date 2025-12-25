"use client";

import { motion } from "framer-motion";

const logos = [
    { name: "Next.js", src: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" },
    { name: "React", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" },
    { name: "Google Gemini", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/2560px-Google_Gemini_logo.svg.png" },
    { name: "Supabase", src: "https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png" },
    { name: "Vercel", src: "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png" },
];

export function TrustBar() {
    return (
        <section className="w-full py-10 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-sm text-neutral-500 mb-6 font-medium tracking-wide">
                    COMPATIBLE WITH YOUR FAVORITE STACK
                </p>
                <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 grayscale opacity-50 hover:opacity-100 transition-opacity duration-500">
                    {/* Using text placeholders if images fail, but ideally SVGs. 
               For now, simple text representations or generic icons would be safer if we don't have local assets.
               I'll use text for reliability in this specific prompt context, 
               or I can try to use simple Lucide icons or just stylized text.
           */}

                    <span className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-6 h-6 bg-white rounded-full text-black flex items-center justify-center text-[10px]">N</span> Next.js
                    </span>
                    <span className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-blue-400">⚛</span> React
                    </span>
                    <span className="text-xl font-bold text-white flex items-center gap-2">
                        Run on <span className="text-white">Vercel</span>
                    </span>
                    <span className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-green-400">⚡</span> Supabase
                    </span>
                    <span className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-blue-400">⚡</span> Google Gemini
                    </span>
                </div>
            </div>
        </section>
    );
}
