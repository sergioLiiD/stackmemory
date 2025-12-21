export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 md:p-20">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-neutral-400">Last updated: December 21, 2025</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. Introduction</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Welcome to StackMemory ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                        If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at <a href="mailto:hello@stackmemory.app" className="text-blue-400 hover:underline">hello@stackmemory.app</a>.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. Information We Collect</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application, or otherwise when you contact us.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-neutral-300">
                        <li>User Account Information (Email, Name)</li>
                        <li>Project Metadata (Repository URLs, Tech Stack)</li>
                        <li>Usage Data (Interaction with features)</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We use personal information collected via our application for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Share of Information</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                    </p>
                </section>

                <section id="gdpr" className="space-y-4">
                    <h2 className="text-2xl font-bold">5. GDPR Data Protection Rights</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-neutral-300">
                        <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
                        <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
                        <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
                        <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                        <li><strong>The right to object to processing</strong> – You have the right to object to our processing of your personal data, under certain conditions.</li>
                        <li><strong>The right to data portability</strong> – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">6. Contact Us</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        If you have questions or comments about this policy, you may email us at <a href="mailto:hello@stackmemory.app" className="text-blue-400 hover:underline">hello@stackmemory.app</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
