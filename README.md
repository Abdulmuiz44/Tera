# TERA - AI Learning & Teaching Companion

Your brilliant, supportive AI companion for learning anything and teaching everything. Chat with Tera like you're texting a knowledgeable friend on WhatsApp - natural, warm, and genuinely excited to help.

## Who is Tera for?

**🎓 Students & Learners**
- Get homework help that actually makes sense
- Master tough concepts with simple explanations and analogies
- Prepare for exams with practice questions and study strategies
- Explore new topics and feed your curiosity

**👨‍🏫 Teachers & Educators**
- Generate lesson plans in seconds
- Create engaging worksheets and assessments
- Get fresh classroom management strategies
- Build teaching materials and resources

**💡 Lifelong Learners**
- Pick up new skills (guitar, coding, cooking, anything!)
- Get personalized learning roadmaps
- Understand complex topics in your field
- Turn curiosity into knowledge

## Core Features

**Learning Tools**
- **Concept Explainer**: Break down any topic into bite-sized, understandable chunks
- **Study Buddy**: Homework help, practice problems, and exam prep
- **Skill Builder**: Step-by-step guidance for learning new skills
- **Knowledge Explorer**: Turn curiosity into deep understanding

**Teaching Tools**
- **Lesson Plan Generator**: Comprehensive lesson plans with pacing and engagement hooks
- **Worksheet & Quiz Generator**: Formative assessments with answer keys
- **Rubric Builder**: Clear, scalable grading criteria
- **Teaching Materials Builder**: Slides, handouts, and visual aids
- **Parent Communication**: Thoughtful, professional updates

**For Everyone**
- **Interactive Chat**: Talk to Tera like a friend, get responses that feel natural
- **Memory**: Tera remembers your preferences and learning style
- **Voice Input**: Speak your questions naturally
- **File Support**: Upload images, PDFs, and documents for context

## Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, React
- **Backend**: Supabase (Auth, DB, Storage), Mistral AI (Pixtral Large)
- **UI**: Dark theme with neon accents, WhatsApp-like chat interface

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
- `components/`: Reusable UI components
- `lib/`: Supabase client, Mistral AI integration, utilities
- `styles/`: Global CSS and theming
- `actions/`: Server actions for AI interactions

## Pricing Model
- **Free**: Core features, limited usage for everyone
- **Pro**: Unlimited access, advanced features ($5/mo)
- **School**: Team access for educators ($20/mo)

## The Tera Difference
Unlike other AI chatbots that feel robotic and cold, Tera feels like chatting with your smartest, most supportive friend. Whether you're a student stuck on homework at 11pm, a teacher planning Monday's lesson on Sunday night, or someone who just wants to learn something new - Tera's got your back. 💪

