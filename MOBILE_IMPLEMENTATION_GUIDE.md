# Tera Mobile App - Quick Start Implementation Guide

This guide walks you through implementing the mobile app following the React Native + Separate API approach.

## 📋 Prerequisites

```bash
# Node.js 18+
node --version

# Install Expo CLI globally
npm install -g expo-cli@latest

# Install EAS CLI for building
npm install -g eas-cli@latest
```

---

## ✅ Phase 1: API Server Setup (Done!)

Files created:
- ✅ `api/package.json` - Dependencies
- ✅ `api/tsconfig.json` - TypeScript config
- ✅ `api/src/server.ts` - Express app
- ✅ `api/src/types/index.ts` - Shared types
- ✅ `api/src/middleware/auth.ts` - JWT verification
- ✅ `api/src/services/mistral.ts` - LLM integration
- ✅ `api/src/services/supabase.ts` - Database
- ✅ `api/src/routes/auth.ts` - Auth endpoints
- ✅ `api/src/routes/chat.ts` - Chat endpoints
- ✅ `api/src/routes/tools.ts` - Tools endpoints
- ✅ `api/src/routes/search.ts` - Search endpoints

### Next: Start the API server

```bash
cd api
npm install
cp .env.example .env.local

# Add your credentials to .env.local
# Then start the server
npm run dev

# Should show:
# ✅ Tera API Server running on http://localhost:5000
```

---

## 🚀 Phase 2: React Native App Setup (Next)

### Step 1: Create Expo project

```bash
# Navigate to workspace root
cd /path/to/Tera

# Create mobile app
npx create-expo-app@latest mobile --template
cd mobile

# Install core dependencies
npx expo install expo-router expo-splash-screen expo-font
npm install @react-native-async-storage/async-storage axios expo-secure-store
npm install react-native-keyboard-aware-scroll-view react-native-gesture-handler
npm install @react-navigation/native @react-navigation/bottom-tabs

# TypeScript support
npm install --save-dev typescript @types/react-native @types/node
```

### Step 2: Initialize TypeScript

```bash
npx tsc --init
```

Update `mobile/tsconfig.json`:
```json
{
  "extends": "expo/tsconfig",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Step 3: Rename files to TypeScript

```bash
# Rename app.json to app.json (keep it)
# Rename App.js to App.tsx (if exists)
# All component files should use .tsx extension
```

### Step 4: Update app.json

Replace `mobile/app.json` with the version from the blueprint (see MOBILE_APP_BLUEPRINT.md)

### Step 5: Create directory structure

```bash
mkdir -p app/{auth,app}
mkdir -p components
mkdir -p lib
mkdir -p assets

touch app/_layout.tsx
touch app/(auth)/_layout.tsx
touch app/(app)/_layout.tsx
```

---

## 🔑 Phase 3: Implement Core Features

### 3.1: Create API Client (`lib/api.ts`)

```bash
# Copy from blueprint or run:
cat > lib/api.ts << 'EOF'
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class TeraAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
    });

    this.client.interceptors.request.use(async config => {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth
  async signIn(email: string, password: string) {
    const response = await this.client.post('/auth/signin', {
      email,
      password,
    });
    return response.data;
  }

  async googleAuth(idToken: string) {
    const response = await this.client.post('/auth/google', {
      idToken,
    });
    return response.data;
  }

  // Chat
  async sendMessage(sessionId: string, message: string, chatHistory: any[]) {
    const response = await this.client.post('/chat/messages', {
      sessionId,
      message,
      chatHistory,
    });
    return response.data;
  }

  async getChatHistory(sessionId: string) {
    const response = await this.client.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  async createSession(title: string) {
    const response = await this.client.post('/chat/sessions', { title });
    return response.data;
  }

  async listSessions() {
    const response = await this.client.get('/chat/sessions');
    return response.data;
  }
}

export const teraAPI = new TeraAPI();
EOF
```

### 3.2: Create Local Storage (`lib/storage.ts`)

```bash
npm install expo-sqlite

cat > lib/storage.ts << 'EOF'
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('tera.db');

export async function initDB() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          sessionId TEXT,
          role TEXT,
          content TEXT,
          createdAt DATETIME
        );`
      );
    }, reject, resolve);
  });
}

export async function saveMessageLocally(
  sessionId: string,
  role: string,
  content: string
) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO chat_messages VALUES (?, ?, ?, ?, ?)',
        [
          Math.random().toString(),
          sessionId,
          role,
          content,
          new Date().toISOString(),
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
}

export async function getMessagesLocally(sessionId: string) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM chat_messages WHERE sessionId = ? ORDER BY createdAt',
        [sessionId],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
}
EOF
```

### 3.3: Create Navigation (`app/_layout.tsx`)

See MOBILE_APP_BLUEPRINT.md for full code.

### 3.4: Create Auth Screen (`app/(auth)/signin.tsx`)

See MOBILE_APP_BLUEPRINT.md for full code.

### 3.5: Create Chat Screen (`app/(app)/chat.tsx`)

See MOBILE_APP_BLUEPRINT.md for full code.

---

## 🧪 Phase 4: Testing

### Run on Expo

```bash
cd mobile

# Start Expo dev server
npx expo start

# Press:
# i - iOS simulator (macOS only)
# a - Android emulator
# w - Web browser
# s - Share QR code
```

### Test API Connection

```bash
# API should be running on localhost:5000
# Expo will connect via tunnel if on same network

# In signin screen, test with:
# Email: test@example.com
# Password: test (if you created this user)
```

---

## 🏗️ Phase 5: Build for Stores

### iOS (macOS required)

```bash
eas build --platform ios

# Creates TestFlight build
# Submit to App Store from Xcode Cloud
```

### Android

```bash
# First time: create keystore
keytool -genkey -v -keystore tera-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias tera-key

# Build
eas build --platform android

# Creates Play Store release build
```

---

## 📦 Environment Variables

### API (.env.local in api/)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
MISTRAL_API_KEY=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
PORT=5000
```

### Mobile (.env in mobile/)
```
EXPO_PUBLIC_API_URL=http://localhost:5000
# For production:
# EXPO_PUBLIC_API_URL=https://api.teraai.chat
```

---

## 🐛 Debugging

### View API logs
```bash
cd api
npm run dev
```

### View mobile logs
```bash
# In Expo, press 'j' for logs
# Or use Expo DevTools
```

### Common Issues

**"Cannot find module 'axios'"**
```bash
npm install axios
```

**"API connection timeout"**
- Ensure API is running: `npm run dev` in `/api`
- Check firewall/network settings
- Use `http://10.0.2.2:5000` on Android emulator

**"Token invalid/expired"**
- Ensure Supabase JWT secret is configured
- Check token is stored correctly in SecureStore

---

## 📊 Progress Tracker

Track your progress:

- [ ] Phase 1: API server running
- [ ] Phase 2: Mobile app created
- [ ] Phase 3a: API client implemented
- [ ] Phase 3b: Storage layer working
- [ ] Phase 3c: Auth screens working
- [ ] Phase 3d: Chat screen working
- [ ] Phase 4: Can sign in and chat
- [ ] Phase 5a: iOS build ready
- [ ] Phase 5b: Android build ready
- [ ] Phase 6: Submitted to stores

---

## 🚀 Next Steps

1. **Start API server**: `cd api && npm run dev`
2. **Create mobile project**: Follow Phase 2
3. **Implement auth**: Copy code from blueprint
4. **Test locally**: Run on Expo
5. **Build and submit**: Follow Phase 5

See MOBILE_APP_BLUEPRINT.md for detailed code and architecture.
