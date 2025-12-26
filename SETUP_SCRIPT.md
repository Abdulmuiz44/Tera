# Tera Mobile + API - Complete Setup Script

**Copy and paste each command below one at a time in your terminal.**

---

## Step 1: Setup API Server

```bash
cd api
npm install
```

Wait for completion, then create `.env.local`:

```bash
cat > .env.local << EOF
PORT=5000
NODE_ENV=development
MISTRAL_API_KEY=your_mistral_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
WEB_URL=http://localhost:3000
MOBILE_APP_URL=com.tera.app
EOF
```

**Replace the placeholders with your actual credentials:**
- Get MISTRAL_API_KEY from: https://console.mistral.ai
- Get SUPABASE credentials from: https://supabase.com (create project)
- Get GOOGLE credentials from: Google Cloud Console

Start API:
```bash
npm run dev
```

Should show: `✅ Tera API Server running on http://localhost:5000`

---

## Step 2: Setup Mobile App (In New Terminal)

```bash
cd mobile
npm install
```

Wait for completion, then create `.env.local`:

```bash
cat > .env.local << EOF
EXPO_PUBLIC_API_URL=http://localhost:5000
EOF
```

Start mobile:
```bash
npm start
```

When it asks, press `w` to run in web browser.

Browser opens at `http://localhost:19000`

---

## Step 3: Test the App

1. Click "Sign Up"
2. Enter test credentials:
   - Name: Test User
   - Email: test@example.com
   - Password: testpass123
3. Click "Create Account"
4. Go back to Sign In
5. Use same email/password to sign in
6. Type a message: "Hello Tera"
7. Press Send
8. Should get response from Mistral AI

---

## If Something Breaks

### Clear cache and restart:
```bash
npm start --clear
```

### Kill port 5000 (API port):
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Clear npm cache:
```bash
npm cache clean --force
npm install
```

---

## Getting Credentials (IMPORTANT)

### Mistral API Key:
1. Go to: https://console.mistral.ai
2. Sign up free
3. Create API key
4. Copy to `.env.local`

### Supabase Setup:
1. Go to: https://supabase.com
2. Sign up free
3. Create new project
4. Go to Project Settings → API
5. Copy `Project URL` → SUPABASE_URL
6. Copy `anon public key` → SUPABASE_ANON_KEY
7. Copy `service_role key` → SUPABASE_SERVICE_KEY
8. Go to Auth → Policies (check JWT secret) or copy from Settings

### Google OAuth (Optional, for web version):
1. Go to: https://console.cloud.google.com
2. Create new project
3. Enable "Google+ API"
4. Create OAuth credentials (Web Application)
5. Copy Client ID and Secret

---

## Next Steps After Testing

### Option A: Deploy API
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd api
railway up
```

Get your API URL from Railway dashboard, update mobile `.env.local`:
```
EXPO_PUBLIC_API_URL=https://tera-api.railway.app
```

### Option B: Build Android APK
```bash
npm install -g eas-cli
cd mobile
eas build --platform android --output app.apk
```

Download APK and share on GitHub Releases.

### Option C: Deploy Web
```bash
cd web
npm install -g vercel
vercel
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| Cannot find module `expo` | `npm install` in mobile folder |
| Cannot connect to API | Make sure API running at localhost:5000 |
| Port already in use | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| Blank white screen | `npm start --clear` |
| Module not found | `npm install` and restart |

---

## File Structure (What Was Created)

```
Tera/
├── api/
│   ├── src/
│   │   ├── server.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── services/
│   │   │   ├── mistral.ts
│   │   │   └── supabase.ts
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── chat.ts
│   │       ├── tools.ts
│   │       └── search.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── (auth)/
│   │   │   ├── signin.tsx
│   │   │   └── signup.tsx
│   │   └── (app)/
│   │       ├── chat.tsx
│   │       ├── tools.tsx
│   │       └── settings.tsx
│   ├── components/
│   │   └── ChatBubble.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── storage.ts
│   │   └── types.ts
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
└── web/
    └── (existing Next.js app)
```

---

## Quick Command Reference

```bash
# API
cd api && npm run dev          # Start API server
cd api && npm run build        # Build for production

# Mobile
cd mobile && npm start         # Start Expo
cd mobile && npm run ios       # iOS simulator
cd mobile && npm run android   # Android emulator
cd mobile && npm run web       # Web browser

# Build
eas build --platform android   # Build APK
eas build --platform ios       # Build for App Store
```

---

## Success Checklist

- [ ] API installed: `cd api && npm install`
- [ ] API .env.local created with credentials
- [ ] API running: `npm run dev`
- [ ] Mobile installed: `cd mobile && npm install`
- [ ] Mobile .env.local created
- [ ] Mobile running: `npm start`
- [ ] Signed up successfully
- [ ] Sent message and got response
- [ ] Ready to deploy/build

---

## You're All Set!

Follow the steps above and you'll have:
- ✅ Full API server (Node.js + Mistral + Supabase)
- ✅ Mobile app (React Native + Expo)
- ✅ Everything working locally
- ✅ Ready to deploy and build APK

Ask if anything fails!
