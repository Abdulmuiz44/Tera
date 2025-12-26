# Tera Mobile App - React Native Implementation Blueprint

## 📋 Project Overview

Build a cross-platform mobile app (iOS/Android) using React Native + Expo, backed by a dedicated API server extracted from the Next.js backend logic.

**Timeline:** 6-8 weeks for MVP
**Target:** Google Play Store & Apple App Store

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                TERA ECOSYSTEM                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  Web (Next)  │  │ Mobile (RN)  │  │  Admin   │ │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                 │               │        │
│         └─────────────────┼───────────────┘        │
│                           │                        │
│                    ┌──────▼──────┐                 │
│                    │  Tera API   │                 │
│                    │ (Node/Nest) │                 │
│                    └──────┬──────┘                 │
│                           │                        │
│         ┌─────────────────┼──────────────────┐    │
│         │                 │                  │    │
│    ┌────▼────┐    ┌──────▼──────┐    ┌─────▼──┐ │
│    │ Supabase│    │  Mistral AI │    │Google  │ │
│    │(Auth,DB)│    │  (LLM)      │    │Sheets  │ │
│    └─────────┘    └─────────────┘    └────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
tera-monorepo/
├── web/                          # Existing Next.js (no changes needed)
│   ├── app/
│   ├── components/
│   └── ...existing files
│
├── api/                          # NEW: Dedicated API Server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts          # Authentication endpoints
│   │   │   ├── chat.ts          # Chat/messages endpoints
│   │   │   ├── tools.ts         # Tools endpoints
│   │   │   ├── search.ts        # Web search endpoints
│   │   │   └── sheets.ts        # Google Sheets endpoints
│   │   ├── services/
│   │   │   ├── mistral.ts       # LLM integration
│   │   │   ├── supabase.ts      # Database client
│   │   │   ├── sheets.ts        # Google Sheets service
│   │   │   └── search.ts        # Web search service
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT verification
│   │   │   └── errorHandler.ts
│   │   ├── types/
│   │   │   └── index.ts         # Shared TypeScript types
│   │   └── server.ts            # Express/Nest app setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── mobile/                       # NEW: React Native App
    ├── app/
    │   ├── (auth)/              # Auth screens
    │   │   ├── signin.tsx
    │   │   └── signup.tsx
    │   ├── (app)/               # App screens
    │   │   ├── chat/
    │   │   ├── tools/
    │   │   └── settings/
    │   └── _layout.tsx          # Navigation structure
    ├── components/
    │   ├── ChatBubble.tsx
    │   ├── ToolCard.tsx
    │   ├── VoiceInput.tsx
    │   └── ...mobile specific
    ├── lib/
    │   ├── api.ts               # API client (points to Tera API)
    │   ├── supabase.ts          # Direct Supabase for realtime
    │   ├── storage.ts           # Local SQLite/AsyncStorage
    │   └── types.ts             # Shared with API
    ├── app.json
    ├── expo-plugins.config.js
    ├── package.json
    └── .env.example
```

---

## 🚀 Phase 1: API Extraction (Week 1-2)

### Step 1.1: Set Up API Project

```bash
# Create API server directory
mkdir api
cd api

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv axios joi zod
npm install @mistralai/mistralai @supabase/supabase-js googleapis
npm install --save-dev typescript @types/express @types/node ts-node nodemon
```

### Step 1.2: Create API Structure

**api/src/server.ts**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',           // Web dev
    'http://localhost:8081',           // Expo dev
    process.env.WEB_URL,               // Production web
    process.env.MOBILE_APP_URL,        // Production mobile (for OAuth)
  ],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/search', require('./routes/search'));
app.use('/api/sheets', require('./routes/sheets'));

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`✅ Tera API running on http://localhost:${PORT}`);
});
```

**api/src/services/mistral.ts**
```typescript
import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateResponse(
  messages: { role: string; content: string }[],
  systemPrompt?: string
) {
  try {
    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      systemPrompt: systemPrompt || 'You are Tera, a helpful AI learning companion.',
      temperature: 0.7,
      maxTokens: 2048,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Mistral API error:', error);
    throw error;
  }
}

export async function generateWithStreaming(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void
) {
  // For streaming responses to mobile
  const stream = await client.chat.stream({
    model: 'mistral-large-latest',
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  for await (const chunk of stream) {
    if (chunk.data.choices[0].delta.content) {
      onChunk(chunk.data.choices[0].delta.content);
    }
  }
}
```

**api/src/routes/chat.ts**
```typescript
import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { generateResponse } from '../services/mistral';
import { saveChatMessage, getChatHistory } from '../services/supabase';

const router = express.Router();

// Send message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { sessionId, message, chatHistory } = req.body;
    const userId = req.user.id;

    // Generate response from Mistral
    const aiResponse = await generateResponse([
      ...chatHistory,
      { role: 'user', content: message },
    ]);

    // Save to Supabase
    await saveChatMessage(userId, sessionId, {
      role: 'user',
      content: message,
    });
    await saveChatMessage(userId, sessionId, {
      role: 'assistant',
      content: aiResponse,
    });

    res.json({
      message: aiResponse,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Get chat history
router.get('/sessions/:sessionId', authMiddleware, async (req, res) => {
  try {
    const history = await getChatHistory(req.user.id, req.params.sessionId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;
```

**api/src/middleware/auth.ts**
```typescript
import jwt from 'jsonwebtoken';

export async function authMiddleware(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify with Supabase JWT
    const secret = process.env.SUPABASE_JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Step 1.3: Extract Service Modules

Create service files by extracting logic from Next.js API routes:

- **api/src/services/supabase.ts** - Extract from `lib/supabase.ts`
- **api/src/services/sheets.ts** - Extract from `lib/google-sheets.ts`
- **api/src/services/search.ts** - Extract from `app/api/search/web/route.ts`

**api/src/types/index.ts** (Shared between API and mobile)
```typescript
export interface ChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  provider: string;
  plan: 'free' | 'pro' | 'plus';
  createdAt: Date;
}
```

### Step 1.4: Environment Setup

**api/.env.example**
```
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Mistral AI
MISTRAL_API_KEY=your_mistral_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
WEB_URL=http://localhost:3000
MOBILE_APP_URL=com.tera.app

# Search
SEARCH_API_KEY=your_search_key
```

---

## 📱 Phase 2: React Native App Setup (Week 2-3)

### Step 2.1: Initialize Expo Project

```bash
# Create mobile app
npx create-expo-app@latest mobile --template
cd mobile

# Install essential dependencies
npx expo install expo-router expo-splash-screen expo-font
npm install @react-native-async-storage/async-storage axios expo-secure-store
npm install react-native-keyboard-aware-scroll-view react-native-gesture-handler
npm install @react-navigation/native @react-navigation/bottom-tabs

# Dev dependencies
npm install --save-dev typescript @types/react-native
```

### Step 2.2: Configure Expo Project

**mobile/app.json**
```json
{
  "expo": {
    "name": "Tera",
    "slug": "tera-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.teraai.app",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Tera needs access to your microphone for voice input",
        "NSCameraRollUsageDescription": "Tera needs access to your photos for uploads"
      }
    },
    "android": {
      "package": "com.teraai.app",
      "permissions": [
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "@react-native-async-storage/async-storage"
    ]
  }
}
```

### Step 2.3: Create Navigation Structure

**mobile/app/_layout.tsx**
```typescript
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    SecureStore.getItemAsync('auth_token')
      .then(token => {
        setIsSignedIn(!!token);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Stack />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {isSignedIn ? (
        <Stack.Screen
          name="(app)"
          options={{ animationEnabled: false }}
        />
      ) : (
        <Stack.Screen
          name="(auth)"
          options={{ animationEnabled: false }}
        />
      )}
    </Stack>
  );
}
```

**mobile/app/(auth)/_layout.tsx**
```typescript
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
```

**mobile/app/(app)/_layout.tsx**
```typescript
import { BottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Stack } from 'expo-router';

const Tab = BottomTabNavigator();

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="chat" />
      <Stack.Screen name="tools" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
```

### Step 2.4: API Client Layer

**mobile/lib/api.ts**
```typescript
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

    // Add auth token to requests
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

  async signUp(email: string, name: string, password: string) {
    const response = await this.client.post('/auth/signup', {
      email,
      name,
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

  // Tools
  async getTools() {
    const response = await this.client.get('/tools');
    return response.data;
  }

  async processTool(toolId: string, input: any) {
    const response = await this.client.post(`/tools/${toolId}/process`, input);
    return response.data;
  }

  // Search
  async webSearch(query: string) {
    const response = await this.client.post('/search/web', { query });
    return response.data;
  }
}

export const teraAPI = new TeraAPI();
```

### Step 2.5: Create Auth Screens

**mobile/app/(auth)/signin.tsx**
```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { teraAPI } from '@/lib/api';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await teraAPI.signIn(email, password);
      
      // Store token securely
      await SecureStore.setItemAsync('auth_token', response.token);
      await SecureStore.setItemAsync('user_id', response.user.id);

      // Navigate to app
      router.replace('/(app)/chat');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Tera</Text>
      <Text style={styles.subtitle}>Your AI Learning Companion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  link: {
    color: '#00d4ff',
    textAlign: 'center',
    marginTop: 16,
  },
});
```

---

## 🗄️ Phase 3: Local Storage & Offline Mode (Week 3-4)

### Step 3.1: Setup SQLite for Offline Chat

```bash
npm install expo-sqlite
```

**mobile/lib/storage.ts**
```typescript
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
          createdAt DATETIME,
          synced BOOLEAN DEFAULT 0
        );`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY,
          userId TEXT,
          title TEXT,
          createdAt DATETIME,
          synced BOOLEAN DEFAULT 0
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
        'INSERT INTO chat_messages (id, sessionId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)',
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
```

---

## 🎨 Phase 4: Chat & Tools UI (Week 4-5)

**mobile/app/(app)/chat.tsx** (Main chat screen)
```typescript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { teraAPI } from '@/lib/api';
import { saveMessageLocally, getMessagesLocally } from '@/lib/storage';
import ChatBubble from '@/components/ChatBubble';

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Create new session or use existing
      const session = await teraAPI.createSession('New Chat');
      setSessionId(session.id);

      // Load local messages
      const localMessages = await getMessagesLocally(session.id);
      setMessages(localMessages);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText('');

    // Add user message locally
    await saveMessageLocally(sessionId, 'user', userMessage);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      setLoading(true);

      // Send to API
      const response = await teraAPI.sendMessage(
        sessionId,
        userMessage,
        messages
      );

      // Save assistant message locally
      await saveMessageLocally(sessionId, 'assistant', response.message);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.message },
      ]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error message to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => (
          <ChatBubble
            role={item.role}
            content={item.content}
          />
        )}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.messages}
        scrollEnabled={true}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message Tera..."
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxHeight={100}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={loading || !inputText.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  messages: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0a0a0a',
    borderTopColor: '#222',
    borderTopWidth: 1,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#00d4ff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
```

**mobile/components/ChatBubble.tsx**
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBubble({ role, content }: Props) {
  const isUser = role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    flexDirection: 'row',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#00d4ff',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#000',
    fontWeight: '500',
  },
  assistantText: {
    color: '#fff',
  },
});
```

---

## 📦 Phase 5: Build & Deployment (Week 5-8)

### Step 5.1: Build for iOS

```bash
cd mobile

# Build for Apple TestFlight
eas build --platform ios --auto-submit

# Or build locally
expo run:ios
```

**Requires:**
- Apple Developer Account ($99/year)
- Signing certificates
- Provisioning profiles

### Step 5.2: Build for Android

```bash
# Generate keystore
keytool -genkey -v -keystore tera-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias tera-key

# Build for Play Store
eas build --platform android --auto-submit

# Or build locally
expo run:android
```

**Requires:**
- Google Play Developer Account ($25 one-time)
- Signed APK with keystore

### Step 5.3: Create EAS Configuration

**mobile/eas.json**
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "simulator"
      }
    },
    "preview2": {
      "android": {
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "preview3": {
      "developmentClient": true
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABC123XY"
      },
      "android": {
        "serviceAccount": "path/to/service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## ✅ Implementation Checklist

### Phase 1: API Extraction
- [ ] Set up Express/Node API server
- [ ] Extract Mistral AI integration
- [ ] Extract Supabase client setup
- [ ] Extract chat endpoints
- [ ] Extract tools endpoints
- [ ] Extract search endpoints
- [ ] Create auth middleware
- [ ] Test API endpoints with Postman/Insomnia

### Phase 2: React Native Setup
- [ ] Initialize Expo project
- [ ] Configure routing with expo-router
- [ ] Create authentication screens
- [ ] Set up secure token storage
- [ ] Create API client layer
- [ ] Set up environment variables

### Phase 3: Offline Storage
- [ ] Initialize SQLite database
- [ ] Create message caching logic
- [ ] Implement sync mechanism
- [ ] Test offline functionality

### Phase 4: UI/UX Implementation
- [ ] Build chat screen
- [ ] Build tools directory
- [ ] Build settings screen
- [ ] Implement voice input (optional)
- [ ] Add file upload support
- [ ] Theme implementation

### Phase 5: Testing & Deployment
- [ ] Unit tests for API
- [ ] E2E tests for mobile app
- [ ] iOS TestFlight beta testing
- [ ] Android internal testing track
- [ ] App Store Connect setup
- [ ] Google Play Console setup
- [ ] Submit for review

### Phase 6: Post-Launch
- [ ] Monitor app crashes (Sentry)
- [ ] Track analytics (Amplitude/Mixpanel)
- [ ] Handle app store reviews
- [ ] Collect user feedback
- [ ] Plan update schedule

---

## 🛠️ Tools & Services

| Purpose | Tool | Link |
|---------|------|------|
| **Mobile Framework** | Expo + React Native | https://expo.dev |
| **Backend** | Node.js + Express | https://expressjs.com |
| **LLM** | Mistral AI | https://mistral.ai |
| **Database** | Supabase (PostgreSQL) | https://supabase.com |
| **Auth** | Supabase Auth | https://supabase.com/auth |
| **Mobile CI/CD** | EAS (Expo) | https://eas.dev |
| **Crash Reporting** | Sentry | https://sentry.io |
| **Analytics** | Mixpanel | https://mixpanel.com |

---

## 💰 Estimated Costs (Monthly)

| Service | Free | Usage-Based | Estimated Cost |
|---------|------|-------------|-----------------|
| Supabase | ✓ | Storage, API calls | $0-100 |
| Mistral AI | - | Per 1M tokens | $0.27-3 |
| Vercel (API) | ✓ | $20/mo Pro | $20 |
| App Store Connect | - | One-time $99 | - |
| Google Play | - | One-time $25 | - |
| **Total** | | | ~$20-123 |

---

## 📚 Key Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native API Reference](https://reactnative.dev/docs/api)
- [Express.js Guide](https://expressjs.com)
- [Mistral API Docs](https://docs.mistral.ai)
- [Supabase Guide](https://supabase.com/docs)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)

---

## 🎯 Success Metrics

Track these metrics post-launch:

- **Downloads:** 1K+ in first month
- **DAU:** 10% of downloads
- **Retention:** 40% day-7 retention
- **Rating:** 4.0+ stars on both stores
- **Crash Rate:** <0.5%
- **API Response Time:** <2s average
