import type { Metadata } from "next";
import { Quicksand, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-context";
import { SubscriptionProvider } from "@/components/billing/subscription-context";
import { CookieBanner } from "@/components/cookie-banner";

import { PostHogProvider } from "@/components/analytics/posthog-provider";

const quicksand = Quicksand({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STACKMEMORY | The Developer's Second Brain",
  description: "Stop forgetting your stack. The intelligent journal for your coding projects. Features Multimodal AI Vibe Coder, n8n Workflow Brain, MCP Context Bridges, and CLI Guardian.",
  keywords: [
    "developer tools",
    "coding journal",
    "tech stack manager",
    "mcp server manager",
    "model context protocol",
    "context bridges",
    "multimodal ai",
    "gemini 2.0",
    "vibe coding",
    "vibecoders",
    "n8n workflows",
    "n8n ai explainer",
    "workflow visualization",
    "credential management",
    "cli developer tool",
    "env var drift",
    "software architecture",
    "documentation generator",
    "coding assistant pricing",
    "free developer tools"
  ],
  authors: [{ name: "StackMemory Team" }],
  openGraph: {
    title: "STACKMEMORY | The Developer's Second Brain",
    description: "Your Stack's Memory. Features Multimodal AI, n8n Integration, and automatic documentation.",
    url: "https://stackmemory.app",
    siteName: "StackMemory",
    images: [
      {
        url: "https://stackmemory.app/og-image.png", // Assuming we will have one, or generic
        width: 1200,
        height: 630,
        alt: "StackMemory Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STACKMEMORY | The Developer's Second Brain",
    description: "Manage your stack, chat with your code, and bridge your context with MCP.",
    // images: ["https://stackmemory.app/twitter-image.png"],
  },
  metadataBase: new URL('https://stackmemory.app'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${quicksand.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <CookieBanner />
              </ThemeProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
