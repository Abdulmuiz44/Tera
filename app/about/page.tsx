'use client'

import React from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useState } from 'react'

export default function AboutPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-20 text-black dark:text-white">
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-black dark:text-white md:text-6xl">
              Your AI Companion for Learning & Teaching
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-700 dark:text-gray-300">
              Tera feels like chatting with your smartest, most supportive friend. Whether you're learning something new or teaching others, we've got your back.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-black dark:text-white">Our Mission</h2>
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                Learning should feel like a conversation with a friend, not a lecture from a robot. Teaching should be supported by tools that understand the real challenges you face. Tera bridges both worlds - helping anyone learn anything while giving educators powerful tools to inspire their students.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8">
              <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Why Tera is Different</h3>
              <ul className="space-y-4 text-gray-700 dark:text-gray-300">
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
            <div className="rounded-2xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
              <div className="mb-4 text-4xl">🎓</div>
              <h3 className="mb-3 text-xl font-bold text-black dark:text-white">For Students</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Get homework help that clicks</li>
                <li>• Master tough concepts simply</li>
                <li>• Ace your exams with confidence</li>
                <li>• Search the web for current info</li>
                <li>• Explore your curiosity</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
              <div className="mb-4 text-4xl">👨‍🏫</div>
              <h3 className="mb-3 text-xl font-bold text-black dark:text-white">For Teachers</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Create lessons in seconds</li>
                <li>• Generate engaging materials</li>
                <li>• Get classroom strategies</li>
                <li>• Create interactive spreadsheets</li>
                <li>• Save hours every week</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
              <div className="mb-4 text-4xl">💡</div>
              <h3 className="mb-3 text-xl font-bold text-black dark:text-white">For Lifelong Learners</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Pick up any new skill</li>
                <li>• Get personalized roadmaps</li>
                <li>• Access real-time web info</li>
                <li>• Understand complex topics</li>
                <li>• Never stop growing</li>
              </ul>
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8">
            <h2 className="mb-6 text-3xl font-bold text-black dark:text-white">Powerful Web Search</h2>
            <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
              Get accurate, current information by enabling Web Search. Tera will search the web and provide citations from real sources instead of relying on outdated training data.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="text-xl">📡</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Real-Time Results</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Access the latest news, trends, and information</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🔗</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Source Citations</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Every answer is backed by cited sources</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">📊</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Comprehensive Research</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Searches 10+ sources for thorough answers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Accurate Data</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current facts, statistics, and specific details</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8">
            <h2 className="mb-6 text-3xl font-bold text-black dark:text-white">Premium Features</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Smart Spreadsheet Editor</p>
                  <p className="text-gray-700 dark:text-gray-300">Create, edit, and sync spreadsheets to Google Sheets in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Interactive Charts & Visuals</p>
                  <p className="text-gray-700 dark:text-gray-300">Generate charts, diagrams, and flowcharts for visual learning</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎤</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Voice Input & Output</p>
                  <p className="text-gray-700 dark:text-gray-300">Chat with Tera using your voice, get responses read aloud</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📁</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">File Upload & Analysis</p>
                  <p className="text-gray-700 dark:text-gray-300">Upload PDFs, Word docs, and images for Tera to analyze</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Persistent Memory</p>
                  <p className="text-gray-700 dark:text-gray-300">Tera learns your preferences and adapts over time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔐</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Secure & Private</p>
                  <p className="text-gray-700 dark:text-gray-300">Enterprise-grade encryption protects your data</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8">
            <h2 className="mb-6 text-3xl font-bold text-black dark:text-white">Available Tools</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-gray-700 dark:text-gray-300"><strong>Lesson Plan Generator:</strong> Create objective-aligned lessons with pacing and transitions</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-gray-700 dark:text-gray-300"><strong>Worksheet & Quiz Generator:</strong> Create assessments with answer keys</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-gray-700 dark:text-gray-300"><strong>Concept Explainer:</strong> Break down complex ideas simply</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-gray-700 dark:text-gray-300"><strong>Rubric Builder:</strong> Design scalable rubrics with criteria</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-gray-700 dark:text-gray-300"><strong>Parent Communication:</strong> Draft thoughtful parent emails</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-gray-700 dark:text-gray-300"><strong>Spreadsheet Editor:</strong> Create and sync interactive sheets</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-gray-700 dark:text-gray-300"><strong>Web Search:</strong> Get current information with citations</p>
              </div>
              <div className="flex items-start gap-3">
                <span>→</span>
                <p className="text-gray-700 dark:text-gray-300"><strong>Universal Companion:</strong> Adapt to whatever you need</p>
              </div>
            </div>
          </div>

          <div className="mb-16 rounded-3xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8">
            <h2 className="mb-6 text-3xl font-bold text-black dark:text-white">How Tera Works</h2>
            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-sm flex-shrink-0">1</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Chat Naturally</p>
                  <p className="text-gray-700 dark:text-gray-300">Type your question or request like you're texting a friend</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-sm flex-shrink-0">2</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Enable Web Search (Optional)</p>
                  <p className="text-gray-700 dark:text-gray-300">Turn on web search for current information and real-time data</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-sm flex-shrink-0">3</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Get AI Assistance</p>
                  <p className="text-gray-700 dark:text-gray-300">Tera provides helpful, personalized responses with sources</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-sm flex-shrink-0">4</span>
                <div>
                  <p className="font-semibold text-black dark:text-white">Continue the Conversation</p>
                  <p className="text-gray-700 dark:text-gray-300">Ask follow-ups, refine your questions, or explore new topics</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mb-16 text-center">
            <h2 className="mb-8 text-3xl font-bold text-black dark:text-white">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-gray-700 dark:text-gray-300">
              Join thousands of learners and educators using Tera to unlock their potential.
            </p>
            <Link
              href="/new"
              className="inline-block rounded-full bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-lg font-semibold transition hover:opacity-90"
            >
              Start Learning with Tera
            </Link>
          </div>

          <div className="mt-20 border-t border-gray-300 dark:border-gray-800 pt-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-black dark:text-white">Legal & Privacy</h2>
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
              <Link
                href="/privacy"
                className="rounded-full border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-8 py-3 text-sm font-medium text-black dark:text-white transition hover:border-black dark:hover:border-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="rounded-full border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-8 py-3 text-sm font-medium text-black dark:text-white transition hover:border-black dark:hover:border-white"
              >
                Terms & Conditions
              </Link>
            </div>
            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              © 2024 Tera. All rights reserved. Built with care for learners and teachers everywhere.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
