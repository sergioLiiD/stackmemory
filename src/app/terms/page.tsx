export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 md:p-20">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-neutral-400">Last updated: February 11, 2026</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and StackMemory ("we," "us," or "our"), concerning your access to and use of the StackMemory application.
                        By accessing the Service, you agree that you have read, understood, and agreed to be bound by all of these Terms of Service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. Intellectual Property Rights</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Unless otherwise indicated, the Site and the Service are our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. User Representations</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Prohibited Activities</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">5. Modifications and Interruptions</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">6. Usage Limits and Plans</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Your use of the Service is subject to the usage limits and quotas associated with your selected plan (e.g., Free, Pro). These limits include, but are not limited to, the number of active projects, AI chat messages, and project insights generation per billing cycle.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-neutral-300">
                        <li><strong>Free Plan:</strong> Limited access to AI features (e.g., 20 messages/month).</li>
                        <li><strong>Pro Plan:</strong> Higher limits and access to advanced models (e.g., Gemini 3.0 Pro).</li>
                        <li><strong>Annual Plan (Founder):</strong> Same benefits as Pro Plan, billed annually (Special Offer).</li>
                    </ul>
                    <p className="text-neutral-300 leading-relaxed">
                        We reserve the right to enforce these limits and may restrict access to certain features if you exceed your plan's quota.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">7. Contact Us</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at <a href="mailto:hello@stackmemory.app" className="text-blue-400 hover:underline">hello@stackmemory.app</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
