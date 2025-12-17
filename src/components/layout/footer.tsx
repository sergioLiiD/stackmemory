import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-black/50 backdrop-blur-xl mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-bold text-white mb-4">StackMemory</h3>
                        <p className="text-sm text-neutral-400 max-w-xs mb-4">
                            The intelligent journal for Developers. Stop forgetting your stack.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                                <Github className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                                <Twitter className="w-4 h-4" />
                            </Link>
                            <a href="mailto:hello@stackmemory.app" suppressHydrationWarning className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-neutral-400">
                            <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-neutral-400">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">GDPR</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <p className="text-xs text-neutral-500">
                            © {new Date().getFullYear()} StackMemory. All rights reserved.
                        </p>
                        <a href="https://ideapunkt.de" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-neutral-500 group-hover:text-white transition-colors">Developed by</span>
                            <Image
                                src="/logo_ideapunkt-t-w.png"
                                alt="Ideapunkt"
                                width={80}
                                height={24}
                                className="h-4 w-auto grayscale group-hover:grayscale-0 transition-all"
                            />
                        </a>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Mail className="w-3 h-3" />
                        <a href="mailto:hello@stackmemory.app" suppressHydrationWarning className="hover:text-white transition-colors">
                            hello@stackmemory.app
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
