# Tera Mobile App - Zero Cost Deployment Guide

Complete guide to building and launching Tera mobile app **with $0 spent** on services or app stores.

---

## 🎯 Free Tech Stack

| Component | Tool | Cost | Why |
|-----------|------|------|-----|
| **Mobile Framework** | React Native + Expo | Free | Open source |
| **LLM** | Ollama (self-hosted) | Free | Run locally, no API calls |
| **Database** | SQLite (local) + PostgreSQL free | Free | SQLite on phone, Postgres free tier |
| **Auth** | Supabase free tier | Free | Generous free tier |
| **Hosting** | Railway/Render free | Free | Free tier for API |
| **Distribution** | F-Droid / Sideload / Web | Free | No app store fees |
| **Reverse Proxy** | Cloudflare | Free | Free tier + tunneling |
| **TOTAL** | | **$0** | |

---

## 📱 Architecture (Zero Cost)

```
┌─────────────────────────────────────┐
│      Tera Mobile App (RN)           │
│  ┌─────────────────────────────────┐│
│  │ SQLite (Offline Chat Storage)   ││
│  │ Expo (Dev & Testing)            ││
│  └─────────────────────────────────┘│
└────────────┬────────────────────────┘
             │ HTTP
             ▼
┌──────────────────────────────────────┐
│   Tera API (Node.js) - Free Tier     │
│   Railway.app or Render.com          │
└────────┬─────────────────────────────┘
         │
    ┌────┼────┬─────────────┐
    │    │    │             │
    ▼    ▼    ▼             ▼
┌────────┐ ┌──────────┐ ┌──────────┐
│Ollama  │ │SQLite/PG │ │Cloudflare│
│(Local) │ │(Free DB) │ │ Tunnel   │
└────────┘ └──────────┘ └──────────┘
```

---

## ✅ Phase 1: Free LLM Setup (Ollama)

### Option A: Run Ollama Locally (Best for Development)

```bash
# 1. Download Ollama
# https://ollama.ai

# 2. Install
# Follow installation guide for your OS (Mac/Linux/Windows)

# 3. Start Ollama service
ollama serve

# 4. In another terminal, pull a free model
ollama pull mistral  # 4.1GB, very good
# OR
ollama pull neural-chat  # Smaller, faster

# 5. Test it
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "mistral", "prompt": "hello", "stream": false}'
```

**Models to use (all free):**
- `mistral` - Best quality (4.1GB)
- `neural-chat` - Fast & small (4.1GB)
- `llama2` - Solid all-arounder (3.8GB)
- `orca-mini` - Ultra lightweight (1.3GB)

### Option B: Use Hugging Face Inference API (Free)

If you can't run Ollama locally:

```bash
# Get free API key from https://huggingface.co/settings/tokens
# No credit card required

# Then use free inference API:
curl https://api-inference.huggingface.co/models/mistralai/Mistral-7B \
  -X POST \
  -H "Authorization: Bearer YOUR_HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Hello!"}'
```

---

## 🔧 Phase 2: Update API to Use Free LLM

Replace Mistral API with Ollama in your API.

### Update `api/src/services/llm.ts`

**DELETE:** `api/src/services/mistral.ts`

**CREATE:** `api/src/services/ollama.ts`

```typescript
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.LLM_MODEL || 'mistral';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateResponse(
  messages: Message[],
  systemPrompt: string = 'You are Tera, a helpful AI learning companion.'
): Promise<string> {
  try {
    // Format messages for Ollama
    let prompt = systemPrompt + '\n\n';
    
    for (const msg of messages) {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }
    
    prompt += 'Assistant: ';

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL,
      prompt: prompt,
      stream: false,
      temperature: 0.7,
    });

    return response.data.response || 'I could not generate a response.';
  } catch (error) {
    console.error('Ollama error:', error);
    throw new Error(`Failed to generate response: ${(error as Error).message}`);
  }
}

export async function generateTool(
  toolType: string,
  input: any,
  context?: string
): Promise<string> {
  const toolPrompts: { [key: string]: string } = {
    lessonPlan: `Generate a lesson plan: ${JSON.stringify(input)}`,
    worksheet: `Create a worksheet: ${JSON.stringify(input)}`,
    rubric: `Build a rubric: ${JSON.stringify(input)}`,
    studyGuide: `Create a study guide: ${JSON.stringify(input)}`,
    conceptExplainer: `Explain this concept: ${JSON.stringify(input)}`,
  };

  const prompt = toolPrompts[toolType] || `Process: ${JSON.stringify(input)}`;

  return generateResponse(
    [{ role: 'user', content: prompt }],
    'You are a helpful educational assistant.'
  );
}
```

### Update `api/src/server.ts`

Replace Mistral import:

```typescript
// OLD:
// import { generateResponse } from './services/mistral.js';

// NEW:
import { generateResponse } from './services/ollama.js';
```

### Update imports in `api/src/routes/chat.ts`

```typescript
// OLD:
// import { generateResponse, Message } from '../services/mistral.js';

// NEW:
import { generateResponse, Message } from '../services/ollama.js';
```

---

## 🗄️ Phase 3: Free Database Setup

### Option A: SQLite Only (Simplest)

Mobile only, no backend storage:

```bash
# Mobile already has SQLite
# All chat history stored locally on device
# No cloud sync needed
```

**Pros:** Zero setup, no backend needed
**Cons:** Data lost if app uninstalled

### Option B: PostgreSQL Free Tier (Recommended)

Use Render.com free database:

```bash
# 1. Sign up at https://render.com (free)

# 2. Create PostgreSQL database
# - Dashboard → New → PostgreSQL
# - Free tier (512MB)
# - Note the connection string

# 3. Add to API .env:
DATABASE_URL=postgres://user:pass@host:5432/db

# 4. Create tables
psql $DATABASE_URL < schema.sql
```

**schema.sql:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  role VARCHAR(10),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_messages_session ON chat_messages(session_id);
```

---

## 🚀 Phase 4: Free API Hosting

### Option A: Railway.app (Easiest)

```bash
# 1. Sign up at https://railway.app (free)
# 2. Connect GitHub repo
# 3. Auto-deploys from main branch
# 4. Free tier: 512MB RAM, plenty for MVP
# 5. Get API URL automatically

# Deploy:
git push origin main
# Railway auto-deploys

# Your API lives at: https://tera-api.railway.app
```

### Option B: Render.com

```bash
# 1. Sign up at https://render.com (free)
# 2. New → Web Service
# 3. Connect GitHub
# 4. Build command: npm run build
# 5. Start command: npm start
# 6. Free tier sleeps after 15 min of inactivity (cold starts ~30s)

# Your API: https://tera-api.onrender.com
```

### Option C: Heroku (Ended Free Tier)

Don't use - they killed free tier in 2022.

### Option D: Self-Hosted (Advanced)

Use old computer/Raspberry Pi at home with Cloudflare tunnel:

```bash
# 1. Install Cloudflare tunnel
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

# 2. Run your API
npm run dev  # on localhost:5000

# 3. Expose via Cloudflare
cloudflare tunnel --url localhost:5000

# Your API: https://tera-abc123.trycloudflare.com
```

---

## 📦 Phase 5: Free Distribution (No App Store)

### Option A: F-Droid (Best for Android)

F-Droid is a free, open-source app store. **Zero cost.**

```bash
# 1. Build APK
cd mobile
eas build --platform android --output app.apk

# 2. Submit to F-Droid
# https://f-droid.org/docs/Submitting_to_F-Droid/
# They review in 1-2 weeks, then it's free to distribute

# Your app appears in F-Droid app (millions of users)
```

### Option B: GitHub Releases (Android)

```bash
# 1. Build APK
eas build --platform android

# 2. Upload to GitHub Releases
# https://github.com/Abdulmuiz44/Tera/releases
# Users download APK directly

# Share link: https://github.com/Abdulmuiz44/Tera/releases/latest
```

### Option C: Web Version (Everyone)

Skip native app, use web-only:

```bash
# Deploy web to Vercel (free)
cd web
vercel deploy

# Your app: https://tera.vercel.app
# Works on all devices, no app store needed
```

### Option D: Sideload (For Friends/Testing)

```bash
# 1. Build APK
cd mobile
eas build --platform android --output app.apk

# 2. Transfer APK to phone via email/USB

# 3. On Android: Settings → Developer Mode → Install from Unknown Sources

# 4. User taps APK → installs

# Share via Google Drive, Dropbox, email
```

### Option E: iOS (Limited Free Options)

Free iOS distribution is hard without paying $99.

**Workarounds:**
1. **TestFlight (Free beta)** - limited to 100 testers
   ```bash
   eas build --platform ios
   # Share TestFlight link with 100 people
   ```

2. **Web-only for iOS** - use Safari, no app needed

3. **Enterprise distribution** - needs company account

**Recommendation:** Focus on Android (F-Droid), web version for iOS users.

---

## 🔌 Phase 6: Connect Everything (Free)

### Update Mobile API URL

**mobile/.env:**
```
# Development (local Ollama + local API):
EXPO_PUBLIC_API_URL=http://localhost:5000

# Production (Railway/Render):
EXPO_PUBLIC_API_URL=https://tera-api.railway.app
# OR
EXPO_PUBLIC_API_URL=https://tera-api.onrender.com
```

### Update API Config

**api/.env.local:**
```
# LLM
OLLAMA_URL=http://localhost:11434
LLM_MODEL=mistral
# OR for Hugging Face:
# HF_API_TOKEN=your_token_here
# HF_MODEL=mistralai/Mistral-7B

# Database (if using Render)
DATABASE_URL=postgres://user:pass@host/db

# Server
PORT=5000
NODE_ENV=production

# Supabase (auth only - free tier)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_key
SUPABASE_JWT_SECRET=your_secret
```

---

## 💾 Offline-First Architecture (Recommended)

Since you're broke, build offline-first to minimize server costs:

```typescript
// mobile/lib/api.ts - Updated

export class TeraAPI {
  async sendMessage(sessionId: string, message: string) {
    // 1. Save locally first (always works)
    await saveMessageLocally(sessionId, 'user', message);

    // 2. Try to send to server (if online)
    try {
      const response = await this.client.post('/chat/messages', {
        sessionId,
        message,
      });
      
      // Update locally with server response
      await saveMessageLocally(sessionId, 'assistant', response.data.message);
      return response.data;
    } catch (error) {
      // If offline, run LLM locally (using Ollama on device)
      const localResponse = await runLocalLLM(message);
      await saveMessageLocally(sessionId, 'assistant', localResponse);
      return { message: localResponse };
    }
  }
}
```

---

## 📋 Complete Free Setup Checklist

- [ ] Install Ollama locally
- [ ] Pull mistral model: `ollama pull mistral`
- [ ] Test Ollama: `curl http://localhost:11434/api/health`
- [ ] Update API to use Ollama (replace mistral.ts)
- [ ] Create PostgreSQL at Render (free tier)
- [ ] Deploy API to Railway/Render (auto from GitHub)
- [ ] Create mobile app with Expo
- [ ] Update API URLs in mobile .env
- [ ] Test locally: Expo dev + local API
- [ ] Build APK: `eas build --platform android`
- [ ] Publish to F-Droid or GitHub Releases
- [ ] (Optional) Deploy web to Vercel
- [ ] Share links to users (no app store)

---

## 🎯 Minimal Viable Setup

If you want **absolute minimum:**

```
1. Ollama (local) ← LLM
2. SQLite (mobile) ← Database
3. No backend
4. Expo web + APK
5. Share APK via GitHub Releases
```

**Cost:** $0  
**Setup time:** 2 hours  
**Works offline:** Yes  

---

## 📊 Costs Comparison

| Approach | Cost | Effort | Scale |
|----------|------|--------|-------|
| **Minimal (Ollama + SQLite)** | $0 | 4 hrs | 1 person |
| **Basic (Ollama + Railway + F-Droid)** | $0 | 1 day | 100 users |
| **Full (Ollama + Render DB + Railway)** | $0 | 2 days | 1K users |
| **Commercial (Mistral + Supabase Pro)** | $100+/mo | 1 day | 100K+ users |

---

## 🚀 Getting Started (RIGHT NOW)

```bash
# 1. Install Ollama
# Download from https://ollama.ai

# 2. Pull model
ollama pull mistral

# 3. Start Ollama
ollama serve

# 4. Update API files (replace mistral.ts)
# Follow Phase 2 above

# 5. Test
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "mistral", "prompt": "What is 2+2?", "stream": false}'

# 6. Deploy later
# When ready: git push → Railway auto-deploys
```

---

## ⚠️ Limitations of Free Setup

1. **Ollama responses slower** than commercial API (1-5s vs 0.5-1s)
2. **Smaller models** mean less capable LLM
3. **Self-hosted API sleeps** on Render/Railway (cold start ~30s)
4. **No app store presence** (F-Droid only, manual distribution)
5. **Limited to free tier limits** (but usually fine for MVP)

**Workarounds:**
- Keep Ollama running on your own computer if possible
- Use smaller, faster models (neural-chat, orca-mini)
- Cache responses to reduce API calls
- Optimize prompts to be shorter

---

## 📚 Free Resources

- [Ollama Documentation](https://ollama.ai)
- [Railway Deployment Guide](https://railway.app/docs)
- [F-Droid Developer Guide](https://f-droid.org/docs/)
- [React Native Free Hosting](https://expo.dev)
- [Supabase Free Tier](https://supabase.com/pricing)

---

## 💪 You Got This

With this guide, you can:
- ✅ Build Tera mobile app
- ✅ Deploy API for free
- ✅ Distribute to users
- ✅ Run completely offline
- ✅ Spend $0 total

**Total time to launch:** 1-2 weeks  
**Total cost:** $0  

Start with Ollama today. You're already bootstrapping hard—no shame in going all-in on free infrastructure.
