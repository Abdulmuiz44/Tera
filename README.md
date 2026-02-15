# 🧠 Tera — Your AI Learning Companion for Anyone

> **Learn anything. Master everything. Powered by AI.**

Tera is a free, AI-powered learning companion designed for **anyone** — students, teachers, professionals, hobbyists, and curious minds. Built with conversational AI at its core, Tera makes learning simple, personal, and powerful.

🌐 **Live:** [teraai.chat](https://teraai.chat)

---

## ✨ Features

### 🎓 For Students
- Get homework help that actually clicks
- Master tough concepts with simple explanations
- Ace exams with confidence using interactive quizzes
- Search the web for current information
- Explore your curiosity

### 👨‍🏫 For Teachers
- Create lessons in seconds
- Generate engaging materials & worksheets
- Get classroom strategies & rubrics
- Create interactive spreadsheets
- Save hours every week

### 💡 For Everyone
- Pick up any new skill
- Get personalized learning roadmaps
- Access real-time web information
- Upskill for your career
- Never stop growing

---

## 🚀 Key Capabilities

| Feature | Free | Pro ($5/mo) | Plus ($15/mo) |
|---|---|---|---|
| AI Conversations | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| File Uploads (per day) | 3 (10MB) | 25 (500MB) | Unlimited (2GB) |
| Web Searches (monthly) | 5 | 100 | Unlimited |
| Deep Research Mode | — | ✅ | ✅ |
| Export to PDF/Word | — | ✅ | ✅ |
| Advanced Analytics | — | — | ✅ |
| Team Collaboration | — | — | ✅ |
| API Access | — | — | ✅ |

---

## 📖 Grokipedia Integration

Tera integrates [Grokipedia](https://grokipedia.com) — an open-source AI-powered encyclopedia with **362,000+ pages** — as its primary knowledge base and citation source.

### How It Works
- **Knowledge Base:** Grokipedia serves as Tera's canonical reference layer for all educational topics
- **Inline Citations:** Every educational concept, term, person, event, or topic in Tera's responses links directly to Grokipedia via `grokipedia.com/search?q=Term+Name`
- **Hyper-Aggressive Linking:** Tera generates **20-30+ Grokipedia backlinks per response** (50-100+ for longer explanations)
- **10,000+ Backlink Target:** Across all conversations, Tera aims to generate 10,000+ unique Grokipedia backlinks
- **Distinctive Styling:** Grokipedia links render with a 📖 icon and violet color to distinguish them from regular links
- **Footer Citation:** Every educational response ends with a Grokipedia source attribution

### Link Format
```
[Term](https://grokipedia.com/search?q=Term+Name)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **AI Model** | Mistral AI (Pixtral 12B) |
| **Database** | [Supabase](https://supabase.com) (PostgreSQL) |
| **Auth** | NextAuth.js (Google OAuth) |
| **Payments** | Lemon Squeezy |
| **Hosting** | Vercel |
| **Mobile** | React Native (Expo) |
| **Charts** | Recharts |
| **Diagrams** | Mermaid.js |
| **Markdown** | react-markdown |

---

## 📁 Project Structure

```
Tera/
├── app/                    # Next.js App Router pages
│   ├── about/              # About page
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes (billing, auth, agent)
│   ├── auth/               # Authentication pages
│   ├── help/               # Help center
│   ├── history/            # Chat history
│   ├── new/                # New chat & chat by ID
│   ├── notes/              # Notes feature
│   ├── plus/               # Premium features
│   ├── pricing/            # Pricing page
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of service
│   └── tools/              # AI tools page
├── components/             # React components
│   ├── visuals/            # Chart, Mermaid, Spreadsheet renderers
│   ├── AppLayout.tsx       # Main app layout
│   ├── MarkdownRenderer.tsx # Markdown rendering with Grokipedia link styling
│   ├── PromptShell.tsx     # Main chat interface
│   ├── Sidebar.tsx         # Navigation sidebar
│   └── ...
├── lib/                    # Core logic & utilities
│   ├── mistral.ts          # AI model integration & system prompt
│   ├── supabase.ts         # Database client
│   ├── auth.ts             # Authentication config
│   ├── quiz.ts             # Quiz generation
│   ├── tools-data.ts       # Tool definitions
│   └── ...
├── mobile/                 # React Native mobile app (Expo)
│   ├── app/                # Expo Router pages
│   └── ...
├── backend-server/         # Backend API server
│   └── src/
│       └── services/       # Mistral & Ollama services
├── styles/                 # Global CSS
└── public/                 # Static assets & images
```

---

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project
- Mistral AI API key

### Environment Variables
```env
MISTRAL_API_KEY=your_mistral_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Installation
```bash
# Clone the repo
git clone https://github.com/Abdulmuiz44/Tera.git
cd Tera

# Install dependencies
npm install

# Run development server
npm run dev
```

### Mobile App
```bash
cd mobile
npm install
npx expo start
```

---

## 🎨 Design System

Tera uses a custom design system with CSS variables for theming:

| Token | Purpose |
|---|---|
| `tera-bg` | Background color |
| `tera-primary` | Primary text color |
| `tera-secondary` | Secondary text color |
| `tera-panel` | Panel/card backgrounds |
| `tera-border` | Border colors |
| `tera-neon` | Accent/highlight color |
| `tera-muted` | Muted backgrounds |

Supports **dark mode** and **light mode** via `ThemeProvider`.

---

## 📊 AI Tools

Tera includes specialized tools for different use cases:

- **Lesson Plan Generator** — Create objective-aligned lessons
- **Worksheet & Quiz Generator** — Assessments with answer keys
- **Concept Explainer** — Break down complex ideas
- **Rubric Builder** — Scalable rubrics with criteria
- **Parent Communication** — Draft thoughtful emails
- **Spreadsheet Editor** — Interactive data sheets
- **Web Search** — Real-time info with citations
- **SAT Practice** — Free SAT prep within the chat
- **Universal Companion** — Adapt to any learning need

---

## 🔒 Security & Privacy

- Enterprise-grade encryption
- GDPR & CCPA compliant
- No selling of user data
- Secure Google OAuth authentication
- Data stored in Supabase with row-level security

---

## 📬 Contact

- **Email:** Teraaiguide@gmail.com
- **Website:** [teraai.chat](https://teraai.chat)

---

## 📄 License

© 2024 Tera. All rights reserved. Built with care for curious minds everywhere.
