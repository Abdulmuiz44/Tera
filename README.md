# TERA - AI Assistant for Teachers

An AI assistant tailored for educators/teachers, powered by Mistral.

## Features
- **Lesson Plan Generator**: Create aligned lessons with pacing and hooks.
- **Worksheet & Quiz Generator**: Formative assessments with keys.
- **Concept Explainer**: Grade-level explanations.
- **Rubric Builder**: Scalable criteria.
- **Parent Communication**: Thoughtful updates.
- **Classroom Quick Assist**: Instant strategies.
- **Rewrite & Differentiate**: Adapt content.
- **Teaching Materials Builder**: Slides and handouts.
- **Warm-up Question Generator**: Engaging prompts.
- **Research & Reading Simplifier**: Summaries.

## Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, React
- **Backend**: Supabase (Auth, DB, Storage), Mistral API
- **UI**: Dark theme with neon accents, responsive design

## Setup
1. Clone the repo: `git clone <url>`
2. Install: `npm install`
3. Copy `.env.example` to `.env.local` and add your keys
4. Run Supabase schema: Execute `lib/supabase-schema.sql` in your Supabase SQL editor
5. Seed data: Run `lib/seed.ts` in browser console or add to dev script
6. Start: `npm run dev`

## Deployment
1. Build: `npm run build`
2. Deploy to Vercel/Netlify with env vars
3. Set up Supabase project and run migrations

## Architecture
- `app/`: Next.js routes
- `components/`: Reusable UI
- `lib/`: Supabase client, Mistral helper, seed
- `styles/`: Global CSS
- `actions/`: Server actions for AI calls

## Pricing Model
- Free: Basic tools, limited usage
- Pro: Unlimited, advanced features ($9/mo)
- School: Team access ($29/mo)

## Launch Plan
- Beta on teacher forums
- Social: X announcement, LinkedIn
- Community: Discord for feedback
- Growth: Referral program
