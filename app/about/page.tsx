import React from 'react'
import Link from 'next/link'

export default function AboutPage() {
    return (
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-20 text-white">
            <div className="mb-16 text-center">
                <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
                    Empowering Teachers with <span className="text-tera-neon">AI</span>
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-white/60">
                    Tera is your intelligent teaching assistant, designed to save you time and spark your creativity.
                </p>
            </div>

            <div className="grid gap-12 md:grid-cols-2">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-white">Our Mission</h2>
                    <p className="text-lg leading-relaxed text-white/80">
                        Teaching is one of the most important jobs in the world, but it's also one of the most demanding. Our mission is to give teachers their time back. By automating the routine tasks of lesson planning, grading, and resource creation, we help you focus on what matters most: your students.
                    </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                    <h3 className="mb-4 text-xl font-semibold text-tera-neon">Why Tera?</h3>
                    <ul className="space-y-4 text-white/80">
                        <li className="flex items-start gap-3">
                            <span className="mt-1 text-tera-neon">✓</span>
                            <span><strong>Instant Lesson Plans:</strong> Generate comprehensive lesson plans in seconds, tailored to your curriculum.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 text-tera-neon">✓</span>
                            <span><strong>Creative Activities:</strong> Get fresh ideas for classroom activities and engagement strategies.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 text-tera-neon">✓</span>
                            <span><strong>Smart Quizzes:</strong> Create quizzes and assessments automatically from your notes or topics.</span>
                        </li>
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
