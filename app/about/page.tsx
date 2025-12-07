import React from 'react'
import Link from 'next/link'

export default function AboutPage() {
    return (
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-20 text-white">
            <div className="mb-16 text-center">
                <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
                    Your AI Companion for <span className="text-tera-neon">Learning & Teaching</span>
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-white/60">
                    Tera feels like chatting with your smartest, most supportive friend. Whether you're learning something new or teaching others, we've got your back. 💡
                </p>
            </div>

            <div className="grid gap-12 md:grid-cols-2 mb-16">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                    <p className="text-lg leading-relaxed text-white/80">
                        Learning should feel like a conversation with a friend, not a lecture from a robot. Teaching should be supported by tools that understand the real challenges you face. Tera bridges both worlds - helping anyone learn anything while giving educators powerful tools to inspire their students.
                    </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                    <h3 className="mb-4 text-xl font-semibold text-tera-neon">Why Tera is Different</h3>
                    <ul className="space-y-4 text-white/80">
                        <li className="flex items-start gap-3">
                            <span className="mt-1 text-tera-neon">✓</span>
                            <span><strong>Conversational AI:</strong> Chat naturally, like you're texting a friend on WhatsApp.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 text-tera-neon">✓</span>
                            <span><strong>Adaptive Intelligence:</strong> Tera automatically adjusts to whether you're learning or teaching.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 text-tera-neon">✓</span>
                            <span><strong>Memory That Matters:</strong> Tera remembers your preferences and personalizes every interaction.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3 mb-16">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-tera-neon/10 to-transparent p-6 backdrop-blur-sm">
                    <div className="mb-4 text-4xl">🎓</div>
                    <h3 className="mb-3 text-xl font-bold text-white">For Students</h3>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>• Get homework help that clicks</li>
                        <li>• Master tough concepts simply</li>
                        <li>• Ace your exams with confidence</li>
                        <li>• Explore your curiosity</li>
                    </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-tera-neon/10 to-transparent p-6 backdrop-blur-sm">
                    <div className="mb-4 text-4xl">👨‍🏫</div>
                    <h3 className="mb-3 text-xl font-bold text-white">For Teachers</h3>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>• Create lessons in seconds</li>
                        <li>• Generate engaging materials</li>
                        <li>• Get classroom strategies</li>
                        <li>• Save hours every week</li>
                    </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-tera-neon/10 to-transparent p-6 backdrop-blur-sm">
                    <div className="mb-4 text-4xl">💡</div>
                    <h3 className="mb-3 text-xl font-bold text-white">For Lifelong Learners</h3>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>• Pick up any new skill</li>
                        <li>• Get personalized roadmaps</li>
                        <li>• Understand complex topics</li>
                        <li>• Never stop growing</li>
                    </ul>
                </div>
            </div>

            <div className="mt-20 border-t border-white/10 pt-12">
                <h2 className="mb-8 text-center text-3xl font-bold text-white">Legal & Privacy</h2>
                <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
                    <Link
                        href="/privacy"
                        className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-medium text-white transition hover:bg-white/10 hover:scale-105"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="/terms"
                        className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-medium text-white transition hover:bg-white/10 hover:scale-105"
                    >
                        Terms & Conditions
                    </Link>
                </div>
            </div>
        </div>
    )
}
