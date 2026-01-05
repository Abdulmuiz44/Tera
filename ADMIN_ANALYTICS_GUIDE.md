# Admin Analytics & Notification Center Guide

## Overview

This guide covers the new admin dashboard, user-facing notification center, and automatic unlock-on-upgrade features.

## Features Implemented

### 1. User Profile Notification Center
**Location:** `app/profile/page.tsx`

Users can now see their limit unlock countdown directly in their profile dashboard:

#### Chat Limit Countdown
- Shows when user has hit their daily chat limit
- Displays remaining time (e.g., "23h 45m")
- Updates every minute
- Orange highlight for visibility

#### File Upload Limit Countdown
- Shows when user has hit their upload limit
- Displays remaining time until unlock
- Updates every minute
- Shows usage progress bar

**Implementation Details:**
```tsx
// Uses `limitHitChatAt` and `limitHitUploadAt` timestamps
// Calculates unlock time: timestamp + 24 hours
// Updates every 60 seconds via useEffect interval
```

### 2. Admin Dashboard (`/admin`)
**Location:** `app/admin/page.tsx`

Secure analytics dashboard accessible only to admin users.

#### Access Control
- Only email: `abdulmuizproject@gmail.com` can access
- Other users see: "Access Denied" message
- Automatic redirect to login if not authenticated

#### Dashboard Features

**Summary Stats (6 widgets):**
- Total Users
- Chat Limit Hits (total)
- Upload Limit Hits (total)
- Currently Locked Out Users
- Upgrade Rate (%)
- Upgraded After Limit (count)

**Subscription Breakdown:**
- Visual breakdown of Free/Pro/Plus users
- Percentage distribution
- User counts per plan

**Quick Stats Card:**
- Total Limit Hits
- Conversion Rate
- Free Plan Users
- Pro/Plus Users

**Tabbed Views:**

1. **Recent Activity (Last 7 Days)**
   - Shows users who hit limits recently
   - Displays email, subscription plan
   - Shows when chat/upload limits were hit
   - Scrollable list (max 50 items)

2. **Locked Out Users**
   - Currently locked users (within 24-hour window)
   - Shows unlock time for both chat and upload
   - Helps identify users who might churn

3. **Upgraded Users**
   - Users who upgraded to Pro/Plus
   - Shows if they had hit a limit before upgrading
   - Tracks conversion from limit hit to upgrade
   - Shows account creation date

#### Database Queries
All data fetches from Supabase via `/api/admin/analytics`:

```sql
-- Total users
SELECT COUNT(*) FROM users

-- Users who hit chat limit
SELECT COUNT(*) FROM users WHERE limit_hit_chat_at IS NOT NULL

-- Users who hit upload limit
SELECT COUNT(*) FROM users WHERE limit_hit_upload_at IS NOT NULL

-- Subscription breakdown
SELECT subscription_plan, COUNT(*) FROM users GROUP BY subscription_plan

-- Users upgraded after hitting limit
SELECT * FROM users 
WHERE subscription_plan IN ('pro', 'plus')
  AND (limit_hit_chat_at IS NOT NULL OR limit_hit_upload_at IS NOT NULL)

-- Currently locked out (within 24 hours)
SELECT * FROM users 
WHERE (limit_hit_chat_at > NOW() - INTERVAL '24 hours'
   OR limit_hit_upload_at > NOW() - INTERVAL '24 hours')

-- Recent limit hits (last 7 days)
SELECT * FROM users 
WHERE limit_hit_chat_at > NOW() - INTERVAL '7 days'
   OR limit_hit_upload_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC LIMIT 50
```

### 3. Auto-Unlock on Upgrade
**Location:** `lib/usage-tracking.ts` - `updateSubscriptionPlan()`

When user upgrades from Free to Pro/Plus:
- `limit_hit_chat_at` is set to NULL
- `limit_hit_upload_at` is set to NULL
- `daily_chats` reset to 0
- `daily_file_uploads` reset to 0
- User regains immediate access to features

**Why?**
- Pro and Plus users have no daily limits
- Upgrading should immediately unlock all features
- Improves customer experience

**Implementation:**
```typescript
export async function updateSubscriptionPlan(userId: string, plan: PlanType) {
  const updates = { subscription_plan: plan }
  
  if (plan !== 'free') {
    // Auto-unlock on upgrade
    updates.limit_hit_chat_at = null
    updates.limit_hit_upload_at = null
    updates.daily_chats = 0
    updates.daily_file_uploads = 0
  }
  
  // Update Supabase...
}
```

## Admin Access Control

### How It Works
1. User navigates to `/admin`
2. System checks if user is authenticated
3. If not authenticated, redirect to `/login`
4. If authenticated, check email against admin list
5. If email is in admin list (`lib/admin.ts`), show dashboard
6. Otherwise, show "Access Denied" message

### Adding New Admin Users
Edit `lib/admin.ts`:
```typescript
const ADMIN_EMAILS = [
  'abdulmuizproject@gmail.com',
  // Add more emails here
  'newemail@example.com'
]
```

### Admin Utility Functions
**File:** `lib/admin.ts`

```typescript
isAdminUser(email: string | undefined): boolean
// Check if email is in admin list

checkAdminAccess(email: string | undefined): { allowed: boolean; message?: string }
// Comprehensive access check
```

## API Endpoints

### `/api/admin/analytics` (POST)

**Request:**
```json
{
  "userId": "user-id-here"
}
```

**Response:**
```json
{
  "summary": {
    "totalUsers": 150,
    "chatLimitHits": 45,
    "uploadLimitHits": 32,
    "lockedOutUsers": 8,
    "upgradeRate": 22.5,
    "upgradedAfterLimit": 10
  },
  "subscriptionBreakdown": {
    "free": 120,
    "pro": 20,
    "plus": 10,
    "school": 0
  },
  "lockedOutUsers": [...],
  "recentLimitHits": [...],
  "upgradeConversions": [...]
}
```

## User Profile Notification Display

### Chat Limit Section
```
💬 Chat Sessions
  15 / 10 today
  [===========] 150% (red)
  0 remaining
  
  ⚠️ You're approaching your daily limit. Upgrade to Pro
  (or if limit hit:)
  🔒 Chat limit reached. Access unlocks in: 23h 45m
```

### File Upload Section
```
📁 File Uploads
  5 / 5 today
  [===========] 100% (red)
  0 remaining
  
  🔒 Upload limit reached. Access unlocks in: 23h 45m
```

## Testing the Features

### Test 1: Verify Notification Center
```
1. Open user profile
2. If user has limit_hit_chat_at set: should show countdown
3. If user has limit_hit_upload_at set: should show countdown
4. Wait 1 minute, verify countdown updates
5. Verify orange highlight for visibility
```

### Test 2: Admin Dashboard Access
```
1. Log in as non-admin user
2. Visit /admin
3. Should see "Access Denied" message
4. Log in as abdulmuizproject@gmail.com
5. Visit /admin
6. Should see dashboard with analytics
7. Verify all stats load correctly
```

### Test 3: Upgrade Auto-Unlock
```
1. Create free account and hit upload limit
2. Verify limit_hit_upload_at is set in database
3. Upgrade user to Pro plan
4. Refresh profile page
5. Verify limit_hit_upload_at is NULL
6. Verify user can upload again immediately
7. Verify daily_file_uploads is reset to 0
```

### Test 4: Analytics Accuracy
```
1. In /admin, view Recent Activity tab
2. Verify users shown are those who hit limits in last 7 days
3. Check upgrade rate calculation:
   - Users upgraded / Total limit hits * 100
4. Verify locked out count matches users with timestamps < 24h ago
5. Verify subscription breakdown sums to total users
```

## Performance Considerations

### Database Indexes
Queries use existing indexes:
- `idx_users_limit_hit_chat_at`
- `idx_users_limit_hit_upload_at`

### Caching Strategy
- Admin dashboard fetches on demand (Refresh button)
- No automatic polling to reduce load
- User profile uses local state (no caching needed)

### Query Optimization
All queries limit results:
- Recent hits: max 50 items
- Locked out: max 20 items shown
- Conversion data: all (should be small set)

## Troubleshooting

### Admin Dashboard Shows No Data
1. Verify user email is in ADMIN_EMAILS list
2. Check user is authenticated
3. Verify `/api/admin/analytics` endpoint responds
4. Check Supabase connection
5. Look for errors in browser console

### Countdown Not Updating in Profile
1. Verify `limit_hit_chat_at` or `limit_hit_upload_at` is set in DB
2. Check if useEffect hook is running (check console)
3. Verify interval is being set (should be every 60 seconds)
4. Clear browser cache and reload

### Wrong Upgrade Rate
1. Verify all users have `subscription_plan` set
2. Check `limit_hit_chat_at` and `limit_hit_upload_at` are populated
3. Run manual query to count:
   - Total users with limits hit
   - Users upgraded to pro/plus
4. Verify calculation: (upgraded / total) * 100

### Access Denied for Admin
1. Verify user email exactly matches ADMIN_EMAILS
2. Check email is lowercase in database
3. Verify user is authenticated (can access other pages)
4. Try logging out and logging back in

## Future Enhancements

1. **Export Analytics**
   - CSV/JSON export of dashboard data
   - Historical analytics tracking

2. **Custom Date Ranges**
   - Filter by date range
   - Compare periods

3. **User Search**
   - Search users by email
   - View individual user details

4. **Notifications**
   - Email when user upgrade after hitting limit
   - Alert when many users are locked out

5. **Role-Based Admin**
   - Multiple admin levels
   - Granular permissions

## File Structure

```
lib/
  ├─ admin.ts (new)
  ├─ usage-tracking.ts (updated)
  └─ plan-config.ts

app/
  ├─ admin/
  │  └─ page.tsx (new)
  ├─ profile/
  │  └─ page.tsx (updated)
  └─ api/
     └─ admin/
        └─ analytics/
           └─ route.ts (new)
```

## Summary

This implementation provides:
✅ User-facing notification center with countdown timers
✅ Secure admin dashboard (email-gated access)
✅ Comprehensive analytics on limit hits and upgrades
✅ Automatic unlock when users upgrade
✅ All data sourced from Supabase
✅ Clean, modern UI matching Tera design
✅ Real-time countdown updates
