'use client'

import React from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useState } from 'react'

export default function AboutPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div className="flex h-screen w-full bg-tera-bg text-tera-primary">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-20 text-tera-primary">
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-tera-primary md:text-6xl">
              Your AI Learning Companion
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-tera-secondary">
              Tera is your AI Learning Companion — making learning simple, personal, and powerful. Get homework help, explore new skills, master any concept, and achieve your learning goals.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-tera-primary">Our Mission</h2>
              <p className="text-lg leading-relaxed text-tera-secondary">
                Learning should feel like a conversation with a friend, not a lecture from a robot. Teaching should be supported by tools that understand the real challenges you face. Tera bridges both worlds - helping anyone learn anything while giving educators powerful tools to inspire their students.
              </p>
            </div>
            <div className="rounded-3xl border border-tera-border bg-tera-muted p-8">
              <h3 className="mb-4 text-xl font-semibold text-tera-primary">Why Tera is Different</h3>
              <ul className="space-y-4 text-tera-secondary">
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span><strong>Conversational AI:</strong> Chat naturally, like you're texting a friend.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span><strong>Adaptive Intelligence:</strong> Tera automatically adjusts to your needs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span><strong>Real-Time Web Search:</strong> Get current information, not just training data.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1">✓</span>
                  <span><strong>Smart Memory:</strong> Tera remembers your preferences for personalized interactions.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-16">
            <div className="rounded-2xl border border-tera-border bg-tera-muted p-6">
              <div className="mb-4 text-4xl">🎓</div>
              <h3 className="mb-3 text-xl font-bold text-tera-primary">For Students</h3>
              <ul className="space-y-2 text-sm text-tera-secondary">
                <li>• Get homework help that clicks</li>
                <li>• Master tough concepts simply</li>
                <li>• Ace your exams with confidence</li>
                <li>• Search the web for current info</li>
                <li>• Explore your curiosity</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-tera-border bg-tera-muted p-6">
              <div className="mb-4 text-4xl">👨‍🏫</div>
              <h3 className="mb-3 text-xl font-bold text-tera-primary">For Teachers</h3>
              <ul className="space-y-2 text-sm text-tera-secondary">
                <li>• Create lessons in seconds</li>
                <li>• Generate engaging materials</li>
                <li>• Get classroom strategies</li>
                <li>• Create interactive spreadsheets</li>
                <li>• Save hours every week</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-tera-border bg-tera-muted p-6">
              <div className="mb-4 text-4xl">💡</div>
              <h3 className="mb-3 text-xl font-bold text-tera-primary">For Lifelong Learners</h3>
              <ul className="space-y-2 text-sm text-tera-secondary">
                <li>• Pick up any new skill</li>
                <li>• Get personalized roadmaps</li>
                <li>• Access real-time web info</li>
                <li>• Understand complex topics</li>
                <li>• Never stop growing</li>
              </ul>
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-tera-border bg-tera-muted p-8">
            <h2 className="mb-6 text-3xl font-bold text-tera-primary">Powerful Web Search</h2>
            <p className="mb-6 text-lg text-tera-secondary">
              Get accurate, current information by enabling Web Search. Tera will search the web and provide citations from real sources instead of relying on outdated training data.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="text-xl">📡</span>
                <div>
                  <p className="font-semibold text-tera-primary">Real-Time Results</p>
                  <p className="text-sm text-tera-secondary/70">Access the latest news, trends, and information</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🔗</span>
                <div>
                  <p className="font-semibold text-tera-primary">Source Citations</p>
                  <p className="text-sm text-tera-secondary/70">Every answer is backed by cited sources</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">📊</span>
                <div>
                  <p className="font-semibold text-tera-primary">Comprehensive Research</p>
                  <p className="text-sm text-tera-secondary/70">Searches 10+ sources for thorough answers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-semibold text-tera-primary">Accurate Data</p>
                  <p className="text-sm text-tera-secondary/70">Current facts, statistics, and specific details</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-tera-border bg-tera-muted p-8">
            <h2 className="mb-6 text-3xl font-bold text-tera-primary">Premium Features</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-semibold text-tera-primary">Smart Spreadsheet Editor</p>
                  <p className="text-tera-secondary">Create, edit, and sync spreadsheets to Google Sheets in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-semibold text-tera-primary">Interactive Charts & Visuals</p>
                  <p className="text-tera-secondary">Generate charts, diagrams, and flowcharts for visual learning</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎤</span>
                <div>
                  <p className="font-semibold text-tera-primary">Voice Input & Output</p>
                  <p className="text-tera-secondary">Chat with Tera using your voice, get responses read aloud</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📁</span>
                <div>
                  <p className="font-semibold text-tera-primary">File Upload & Analysis</p>
                  <p className="text-tera-secondary">Upload PDFs, Word docs, and images for Tera to analyze</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="font-semibold text-tera-primary">Persistent Memory</p>
                  <p className="text-tera-secondary">Tera learns your preferences and adapts over time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔐</span>
                <div>
                  <p className="font-semibold text-tera-primary">Secure & Private</p>
                  <p className="text-tera-secondary">Enterprise-grade encryption protects your data</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-tera-border bg-tera-muted p-8">
            <h2 className="mb-6 text-3xl font-bold text-tera-primary">Available Tools</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-tera-secondary"><strong>Lesson Plan Generator:</strong> Create objective-aligned lessons with pacing and transitions</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-tera-secondary"><strong>Worksheet & Quiz Generator:</strong> Create assessments with answer keys</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-tera-secondary"><strong>Concept Explainer:</strong> Break down complex ideas simply</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-tera-secondary"><strong>Rubric Builder:</strong> Design scalable rubrics with criteria</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-tera-secondary"><strong>Parent Communication:</strong> Draft thoughtful parent emails</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-tera-secondary"><strong>Spreadsheet Editor:</strong> Create and sync interactive sheets</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-tera-secondary"><strong>Web Search:</strong> Get current information with citations</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-tera-secondary"><strong>Universal Companion:</strong> Adapt to whatever you need</p>
              </div>
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-tera-border bg-tera-muted p-8">
            <h2 className="mb-6 text-3xl font-bold text-tera-primary">How Tera Works</h2>
            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tera-primary text-tera-bg font-bold text-sm flex-shrink-0">1</span>
                <div>
                  <p className="font-semibold text-tera-primary">Chat Naturally</p>
                  <p className="text-tera-secondary">Type your question or request like you're texting a friend</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tera-primary text-tera-bg font-bold text-sm flex-shrink-0">2</span>
                <div>
                  <p className="font-semibold text-tera-primary">Enable Web Search (Optional)</p>
                  <p className="text-tera-secondary">Turn on web search for current information and real-time data</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tera-primary text-tera-bg font-bold text-sm flex-shrink-0">3</span>
                <div>
                  <p className="font-semibold text-tera-primary">Get AI Assistance</p>
                  <p className="text-tera-secondary">Tera provides helpful, personalized responses with sources</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tera-primary text-tera-bg font-bold text-sm flex-shrink-0">4</span>
                <div>
                  <p className="font-semibold text-tera-primary">Continue the Conversation</p>
                  <p className="text-tera-secondary">Ask follow-ups, refine your questions, or explore new topics</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mb-16 text-center">
            <h2 className="mb-8 text-3xl font-bold text-tera-primary">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-tera-secondary">
              Join thousands of learners using Tera — your AI Learning Companion — to unlock their potential.
            </p>
            <Link
              href="/new"
              className="inline-block rounded-full bg-tera-primary text-tera-bg px-8 py-4 text-lg font-semibold transition hover:opacity-90"
            >
              Start Learning with Tera
            </Link>
          </div>

          <div className="mt-20 border-t border-tera-border pt-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-tera-primary">Legal & Privacy</h2>
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
              <Link
                href="/privacy"
                className="rounded-full border border-tera-border bg-tera-muted px-8 py-3 text-sm font-medium text-tera-primary transition hover:border-tera-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="rounded-full border border-tera-border bg-tera-muted px-8 py-3 text-sm font-medium text-tera-primary transition hover:border-tera-primary"
              >
                Terms & Conditions
              </Link>
            </div>
            <p className="mt-8 text-center text-sm text-tera-secondary/70">
              © 2024 Tera. All rights reserved. Built with care for learners and teachers everywhere.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
