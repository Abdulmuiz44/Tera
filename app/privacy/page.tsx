import React from 'react'

export default function PrivacyPage() {
    return (
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-20 text-tera-primary bg-tera-bg min-h-screen">
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-tera-neon">Privacy Policy</h1>
            <div className="prose max-w-none space-y-8 text-tera-secondary">
                <p className="text-lg leading-relaxed">
                    At Tera, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our AI-powered teaching assistant services.
                </p>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold text-tera-primary">1. Information We Collect</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Account Information:</strong> When you sign up, we collect your email address to create and manage your account.</li>
                        <li><strong>Usage Data:</strong> We collect information about how you interact with Tera, including the prompts you enter, the tools you use, and the content you generate.</li>
                        <li><strong>Uploaded Content:</strong> Any files or images you upload for analysis or lesson generation are processed securely.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold text-tera-primary">2. How We Use Your Information</h2>
                    <p>We use the collected information to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide, maintain, and improve our services.</li>
                        <li>Personalize your experience and the content Tera generates for you.</li>
                        <li>Communicate with you about updates, security alerts, and support.</li>
                        <li>Analyze usage patterns to enhance our AI models and features.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold text-tera-primary">3. Data Security</h2>
                    <p>
                        We implement robust security measures to protect your data from unauthorized access, alteration, or disclosure. We use industry-standard encryption and secure storage solutions provided by Supabase.
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold text-tera-primary">4. Third-Party Services</h2>
                    <p>
                        We may use third-party AI models (like Mistral AI) to process your prompts. These providers are bound by strict confidentiality agreements and are not permitted to use your data for their own purposes outside of providing the service.
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 text-2xl font-semibold text-tera-primary">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at teraaiguide@gmail.com.
                    </p>
                </section>

                <p className="text-sm text-white/50 mt-12">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    )
}
