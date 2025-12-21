export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 md:p-20">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
                    <p className="text-neutral-400">Last updated: December 21, 2025</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. What are Cookies?</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to remember your actions and preferences (such as login, language, font size, and other display preferences) over a period of time, so you don't have to keep re-entering them whenever you come back to the site or browse from one page to another.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. How We Use Cookies</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We use cookies for the following purposes:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-neutral-300">
                        <li><strong>Essential Cookies:</strong> These are necessary for the website to function (e.g., authentication).</li>
                        <li><strong>Analytics Cookies:</strong> We use these to understand how visitors interact with our website (e.g., Vercel Analytics).</li>
                        <li><strong>Performance Cookies:</strong> These help us ensure that the website performs effectively.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. Managing Cookies</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Updates to this Policy</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        We may update this Cookie Policy from time to time. We encourage you to periodically review this page for the latest information on our privacy practices.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">5. Contact Us</h2>
                    <p className="text-neutral-300 leading-relaxed">
                        If you have any questions about our use of cookies, please contact us at <a href="mailto:hello@stackmemory.app" className="text-blue-400 hover:underline">hello@stackmemory.app</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
