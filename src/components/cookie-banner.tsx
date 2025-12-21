'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('stackmemory-cookie-consent');
        if (!consent) {
            setShow(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('stackmemory-cookie-consent', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 md:p-6 z-50 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-neutral-300 text-sm md:text-base">
                    <p>
                        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                        {' '}
                        <Link href="/cookie-policy" className="text-emerald-400 hover:underline">
                            Learn more
                        </Link>
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={accept}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-6 py-2 rounded-lg transition-colors text-sm"
                    >
                        Accept All
                    </button>
                    {/* Optional: Add Decline button logic later */}
                </div>
            </div>
        </div>
    );
}
