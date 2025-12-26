# Tera Mobile App - Build Quick Start

Complete mobile app structure is now ready. Follow these steps to build and run.

---

## 📦 Step 1: Install Dependencies

```bash
cd mobile
npm install

# or with yarn
yarn install

# or with pnpm
pnpm install
```

---

## 🔧 Step 2: Configure Environment

```bash
# Copy example env
cp .env.example .env.local

# Edit .env.local and add your API URL:
# EXPO_PUBLIC_API_URL=http://localhost:5000  (for local development)
# or
# EXPO_PUBLIC_API_URL=https://your-production-api.com (for production)
```

---

## 🚀 Step 3: Start Development Server

### Option A: Web Browser
```bash
npm start

# Then press 'w' in terminal
# App opens in browser at http://localhost:19000
```

### Option B: iOS Simulator (macOS only)
```bash
npm run ios
# or
npm start
# Then press 'i' in terminal
```

### Option C: Android Emulator
```bash
npm run android
# or
npm start
# Then press 'a' in terminal
```

---

## ✅ Testing the App

1. **Start the API server first:**
   ```bash
   cd ../api
   npm run dev
   ```

2. **In another terminal, start mobile app:**
   ```bash
   cd mobile
   npm start
   ```

3. **Test sign in:**
   - Use credentials from your Supabase setup
   - Or create a test user in Supabase console

4. **Test chat:**
   - Send a message
   - Verify it connects to API
   - Check response from Mistral AI

---

## 📁 Project Structure

```
mobile/
├── app/                          # Main app screens
│   ├── _layout.tsx              # Root navigation
│   ├── (auth)/                  # Auth screens
│   │   ├── _layout.tsx
│   │   ├── signin.tsx           # Sign in screen
│   │   └── signup.tsx           # Sign up screen
│   └── (app)/                   # Main app screens
│       ├── _layout.tsx          # Tab navigation
│       ├── chat.tsx             # Chat screen
│       ├── tools.tsx            # Tools directory
│       └── settings.tsx         # Settings screen
├── components/
│   └── ChatBubble.tsx           # Chat message component
├── lib/
│   ├── api.ts                   # API client
│   ├── storage.ts               # Local storage (AsyncStorage)
│   └── types.ts                 # TypeScript types
├── app.json                     # Expo configuration
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
└── .env.example                 # Environment variables
```

---

## 🔌 File Overview

### `app/(auth)/signin.tsx` - Sign In Screen
- Email/password authentication
- Stores JWT token in SecureStore
- Navigates to chat on success

### `app/(app)/chat.tsx` - Chat Screen
- Message list with FlatList
- TextInput for typing
- Sends messages to API
- Displays responses
- Saves messages locally

### `lib/api.ts` - API Client
- Handles all API calls
- Auto-attaches JWT token
- Error handling
- Wrapper around axios

### `lib/storage.ts` - Local Storage
- AsyncStorage for chat history
- Session management
- User data persistence
- Offline support ready

---

## 🐛 Troubleshooting

### "Cannot connect to API"

**Problem:** API is at localhost:5000 but mobile can't reach it

**Solution:**
```bash
# On Android emulator, use:
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000

# On iOS simulator, use:
EXPO_PUBLIC_API_URL=http://localhost:5000

# On physical device, use your computer's IP:
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000
```

### "Module not found"

**Problem:** Missing dependency

**Solution:**
```bash
npm install
npm start --clear
```

### "Port 5000 already in use"

**Problem:** API server already running on that port

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### "Blank white screen"

**Problem:** App crashed silently

**Solution:**
```bash
# Check logs
npm start
# Check console output for errors

# Clear cache
npm start --clear

# Restart metro bundler
npm start
```

---

## 🎯 Next Steps

### For Local Testing:
1. ✅ Install dependencies
2. ✅ Start API server
3. ✅ Start mobile app
4. ✅ Sign up/sign in
5. ✅ Send test messages

### For Building APK (Android):
```bash
# Requires EAS CLI
npm install -g eas-cli

# Build APK
eas build --platform android --output app.apk

# Share APK via GitHub Releases or direct download
```

### For Building IPA (iOS):
```bash
# Requires Apple Developer account ($99/year)
eas build --platform ios

# Submit via TestFlight or App Store
```

### For Production Deployment:
```bash
# Update API URL in .env.local
EXPO_PUBLIC_API_URL=https://your-production-api.com

# Build for stores
eas build --platform android
eas build --platform ios

# Submit for review
eas submit --platform android
eas submit --platform ios
```

---

## 📱 File Checklist

- [x] app/_layout.tsx - Root navigation
- [x] app/(auth)/_layout.tsx - Auth layout
- [x] app/(auth)/signin.tsx - Sign in screen
- [x] app/(auth)/signup.tsx - Sign up screen
- [x] app/(app)/_layout.tsx - Tab navigation
- [x] app/(app)/chat.tsx - Chat screen
- [x] app/(app)/tools.tsx - Tools directory
- [x] app/(app)/settings.tsx - Settings screen
- [x] components/ChatBubble.tsx - Chat bubble component
- [x] lib/api.ts - API client
- [x] lib/storage.ts - Local storage
- [x] lib/types.ts - TypeScript types
- [x] app.json - Expo configuration
- [x] tsconfig.json - TypeScript config
- [x] package.json - Dependencies
- [x] .env.example - Environment template

---

## 💡 Features Implemented

### Authentication
- ✅ Email/password sign up
- ✅ Email/password sign in
- ✅ Secure token storage
- ✅ Session management

### Chat
- ✅ Real-time messaging
- ✅ Message history
- ✅ Local message storage
- ✅ Loading states
- ✅ Error handling

### Tools
- ✅ Tools directory/list
- ✅ Tool categories
- ✅ Refresh functionality

### Settings
- ✅ User profile display
- ✅ App version info
- ✅ Sign out functionality
- ✅ Account info

---

## 🚀 Commands Reference

```bash
# Development
npm start              # Start Expo dev server
npm run ios           # Build for iOS simulator
npm run android       # Build for Android emulator
npm run web           # Run in web browser

# Building
npm run build         # Build for production

# Testing
npm test              # Run tests

# Linting
npm run lint          # Lint code
```

---

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev)
- [React Native Guide](https://reactnative.dev)
- [Expo Router](https://docs.expo.dev/routing/introduction)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Expo SecureStore](https://docs.expo.dev/modules/expo-secure-store/)

---

## ✨ What's Next

1. **Add more features:**
   - Voice input
   - File uploads
   - Image previews
   - Search functionality
   - Push notifications

2. **Optimize:**
   - Bundle size reduction
   - Performance optimization
   - Memory leak fixes
   - Battery usage optimization

3. **Deploy:**
   - Build APK for Android
   - Build IPA for iOS
   - Submit to Play Store
   - Submit to App Store
   - Set up CI/CD pipeline

You're all set! Happy coding! 🎉
