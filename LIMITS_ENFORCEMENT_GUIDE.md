# Tera Limits Enforcement Guide

All pricing plan limits are now actively enforced. This document tracks where and how each limit is checked.

## Pricing Plan Limits (from `/pricing`)

### Free Plan
- **15 AI conversations per day** (Daily, resets at midnight)
- **5 file uploads per day** (Daily, resets at midnight)
- **5 web searches per month** (Monthly, resets every 30 days)
- **25 MB max file size**

### Pro Plan
- **Unlimited AI conversations** (Daily)
- **20 file uploads per day** (Daily, resets at midnight)
- **50 web searches per month** (Monthly, resets every 30 days)
- **500 MB max file size**

### Plus Plan
- **Unlimited AI conversations** (Daily)
- **Unlimited file uploads per day** (Daily)
- **Unlimited web searches per month** (Monthly)
- **2000 MB (2 GB) max file size**

---

## Enforcement Points

### 1. Chat Limit Enforcement ✅
**File:** `app/actions/generate.ts` (Lines 54-58)

Flow:
1. Check plan in `plan-config.ts`
2. Compare current count against limit
3. Block if limit reached
4. Increment counter after successful generation

Reset Logic: `lib/usage-tracking-server.ts` (Lines 19-26)
- Checks `chat_reset_date` daily
- Resets `daily_chats` and `daily_file_uploads` to 0

---

### 2. File Upload Limit Enforcement ✅
**Primary Check:** `app/api/attachments/route.ts` (Lines 17-25)
**Secondary Check:** `app/actions/generate.ts` (Lines 47-51)

Reset Logic: Same as chat limits (daily reset)

---

### 3. Web Search Limit Enforcement ✅
**File:** `app/api/search/web/route.ts` (Lines 24-53)
**Additional Check:** `app/actions/generate.ts` (Lines 61-66)

Reset Logic: `lib/web-search-usage.ts` (Lines 98-104)
- Monthly reset (every 30 days)

---

## Database Columns Required

```sql
daily_chats INTEGER DEFAULT 0
daily_file_uploads INTEGER DEFAULT 0
chat_reset_date TIMESTAMP WITH TIME ZONE
monthly_web_searches INTEGER DEFAULT 0
web_search_reset_date TIMESTAMP WITH TIME ZONE
subscription_plan TEXT (free|pro|plus)
```

---

## Configuration

**Primary Config:** `lib/plan-config.ts` - Source of truth for all limits
**Web Search Config:** `lib/web-search-usage.ts` - Must match plan-config.ts

---

## Testing Limits

### Chat Limits (Free: 15/day, Pro: Unlimited)
Generate 15+ chats → 16th should fail with "You've reached your daily limit of 15 chats"

### File Upload Limits (Free: 5/day, Pro: 20/day, Plus: Unlimited)
Try uploading 6+ files on free plan → Should fail with "Daily upload limit reached (5)"

### Web Search Limits (Free: 5/month, Pro: 50/month, Plus: Unlimited)
Perform 6+ searches on free plan → Should fail with "Monthly search limit reached (5/5)"

---

## Status: All Limits Enforced ✅
- Chats: Checked before generation, incremented after
- File uploads: Checked at API and action level
- Web searches: Checked in API route and action level
- Resets: Daily (chats/uploads) and monthly (searches)
