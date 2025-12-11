# TERA - AI Learning & Teaching Companion

Your brilliant, supportive AI companion for learning anything and teaching everything. Chat with Tera like you're texting a knowledgeable friend - natural, warm, and genuinely excited to help.

## Who is Tera for?

**🎓 Students & Learners**
- Get homework help that actually makes sense
- Master tough concepts with simple explanations and analogies
- Prepare for exams with practice questions and study strategies
- Explore new topics with real-time web search for current information
- Feed your curiosity with conversational AI

**👨‍🏫 Teachers & Educators**
- Generate lesson plans in seconds
- Create engaging worksheets and assessments
- Get fresh classroom management strategies
- Build interactive spreadsheets that sync to Google Sheets
- Create parent communication templates

**💡 Lifelong Learners**
- Pick up new skills (guitar, coding, cooking, anything!)
- Get personalized learning roadmaps
- Understand complex topics in your field
- Turn curiosity into knowledge with web search

## Core Features

**Learning Tools**
- **Concept Explainer**: Break down any topic into bite-sized, understandable chunks
- **Study Buddy**: Homework help, practice problems, and exam prep
- **Web Search**: Get current information with source citations
- **Knowledge Explorer**: Turn curiosity into deep understanding with real-time data

**Teaching Tools**
- **Lesson Plan Generator**: Comprehensive lesson plans with pacing and engagement hooks
- **Worksheet & Quiz Generator**: Formative assessments with answer keys
- **Rubric Builder**: Clear, scalable grading criteria
- **Spreadsheet Editor**: Create and sync interactive sheets to Google Sheets
- **Parent Communication**: Thoughtful, professional email templates

**For Everyone**
- **Interactive Chat**: Talk to Tera like a friend, get responses that feel natural
- **Memory**: Tera remembers your preferences and learning style
- **Voice Input**: Speak your questions naturally (with voice output support)
- **File Support**: Upload images, PDFs, and documents for context
- **Web Search**: Enable real-time web search for current information with citations

## Authentication

Tera uses Google OAuth for secure authentication:
- **Sign In**: Navigate to `/auth/signin` or click "Log In" button
- **Sign Up**: Navigate to `/auth/signup` or click "Sign Up" button
- Simple email validation with Google OAuth integration
- Secure session management via Supabase
- One-click authentication with your Google account

**Environment Setup:**
```
NEXT_PUBLIC_APP_URL=https://teraai.chat
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, React
- **Backend**: Supabase (Auth, DB, Storage), Mistral AI (Pixtral Large)
- **Authentication**: Supabase Auth with Google OAuth
- **UI**: Dark theme with neon accents, WhatsApp-like chat interface

## Setup

1. Clone the repo: `git clone <url>`
2. Install: `pnpm install` (or npm/yarn)
3. Copy `.env.example` to `.env.local` and add your keys:
   - Supabase credentials
   - Google OAuth credentials
   - API keys for integrations
4. Set up Google OAuth:
   - Create OAuth credentials in Google Cloud Console
   - Add `https://teraai.chat/auth/callback` to authorized redirect URIs (production)
   - Add `http://localhost:3000/auth/callback` for local development
5. Start development server: `pnpm run dev`
6. Visit `http://localhost:3000` and navigate to `/auth/signin` to sign in

## File Structure

```
app/
├── auth/                    # Authentication pages
│   ├── signin/page.tsx     # Sign in page with Google OAuth
│   ├── signup/page.tsx     # Sign up page with Google OAuth
│   ├── callback/           # OAuth callback handler
│   └── callback-page/      # Callback redirect page
├── api/                     # API routes
│   ├── auth/google/        # Google OAuth integration
│   ├── sheets/             # Google Sheets integration
│   ├── search/web/         # Web search API
│   └── checkout/           # Payment processing
└── [tool]/page.tsx         # Tool pages

components/
├── MainShell.tsx           # Main app container
├── PromptShell.tsx         # Chat interface
├── Sidebar.tsx             # Navigation sidebar
└── [ToolCard].tsx          # Tool components

lib/
├── supabase.ts             # Supabase client config
├── tools-data.ts           # Tool definitions
├── google-sheets.ts        # Google Sheets integration
└── [utilities].ts          # Helper functions
```

## Key Routes

- `/` - Landing page
- `/about` - About Tera
- `/auth/signin` - Sign in with Google
- `/auth/signup` - Sign up with Google
- `/new` - New chat (authenticated)
- `/tools` - Available tools directory
- `/pricing` - Pricing page
- `/privacy` - Privacy policy
- `/terms` - Terms and conditions

## Deployment

1. Build: `pnpm run build`
2. Deploy to Vercel with environment variables:
   - All `.env.local` variables
   - Set `NEXT_PUBLIC_APP_URL` to your production domain
3. Update Google OAuth redirect URI to production domain
4. Ensure Supabase project is set up in production

## Pricing Model
- **Free**: Core features with limited usage
- **Pro**: Unlimited access, advanced features ($5/mo)
- **Plus**: Team access for educators ($20/mo)

## The Tera Difference
Unlike other AI chatbots that feel robotic and cold, Tera feels like chatting with your smartest, most supportive friend. Whether you're a student stuck on homework at 11pm, a teacher planning Monday's lesson on Sunday night, or someone who just wants to learn something new - Tera's got your back. 💪

---

**Built with ❤️ for learners and teachers everywhere**
