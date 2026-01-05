# 24-Hour Limit Unlock Implementation Guide

## Overview
This implementation adds automatic 24-hour unlocking for users who hit daily file upload or chat message limits on the free plan. Instead of waiting until midnight, users now get access to their limits automatically 24 hours after first hitting the limit.

## What Changed

### 1. Database Schema (Migration)
**File:** `lib/migrations/add-24hour-limit-unlock.sql`

Added two new columns to track when users hit limits:
- `limit_hit_chat_at` - Timestamp when user hit their daily chat limit
- `limit_hit_upload_at` - Timestamp when user hit their daily file upload limit

### 2. Usage Tracking Logic
**File:** `lib/usage-tracking.ts`

#### Updated Functions:

**a) `getUserProfile()`**
- Now fetches the new `limit_hit_chat_at` and `limit_hit_upload_at` timestamps

**b) `checkAndResetUsage()`**
- Now checks 24-hour unlock times from when limits were hit
- Automatically resets counters and clears the timestamp when 24 hours have passed
- Falls back to midnight reset if no 24-hour unlock is active

**c) `canUserStartChat()`**
- Returns `unlocksAt: Date` indicating when chat access will be restored
- Automatically records when limit is hit (if not already recorded)
- Error message now says "Access unlocks in 24 hours"

**d) `canUserUploadFiles()`**
- Returns `unlocksAt: Date` indicating when upload access will be restored
- Automatically records when limit is hit (if not already recorded)
- Error message now says "Access unlocks in 24 hours"

#### New Helper Functions:

**a) `recordChatLimitHit()`**
- Records the timestamp when user first hits their chat limit

**b) `recordUploadLimitHit()`**
- Records the timestamp when user first hits their file upload limit

**c) `getTimeUntilUnlock()`**
- Calculates remaining time in milliseconds until access is restored

**d) `formatTimeUntilUnlock()`**
- Formats remaining time as human-readable string (e.g., "2h 30m remaining")

### 3. UI Components
**File:** `components/LimitModal.tsx`

#### Updates:
- New `unlocksAt?: Date` prop to display unlock countdown
- Uses `useEffect` to update countdown timer every minute
- Shows formatted countdown (e.g., "2h 30m remaining")
- Displays in orange/amber-colored info box for visibility

**File:** `components/PromptShell.tsx`

#### Updates:
- New state: `limitUnlocksAt` to track unlock time for modal
- Updated upload error handler to pass `unlocksAt` to modal
- Updated chat limit error handler to pass `unlocksAt` to modal
- Updated LimitModal rendering to pass `unlocksAt` prop
- Cleanup on modal close

## How It Works

### Scenario: User Hits Upload Limit
1. User tries to upload their 6th file on free plan (limit is 5)
2. `canUserUploadFiles()` checks limits and finds limit exceeded
3. If `limit_hit_upload_at` is not set, current timestamp is recorded
4. Unlock time calculated: current timestamp + 24 hours
5. Error returned with `unlocksAt` date
6. PromptShell catches error and shows LimitModal with countdown
7. User sees: "Access unlocks in: 23h 45m remaining"

### Scenario: 24 Hours Pass
1. User hits upload limit at 2:00 PM Tuesday
2. `limit_hit_upload_at` is set to Tuesday 2:00 PM
3. User tries again at 2:30 PM Wednesday (24.5 hours later)
4. `checkAndResetUsage()` detects 24 hours have passed
5. Resets `daily_file_uploads` to 0
6. Clears `limit_hit_upload_at` timestamp
7. User can now upload again

## Testing

### Test 1: Hit Chat Limit
```
1. Create free account
2. Send 10 messages (hit limit)
3. Verify modal shows "Access unlocks in: 24h 0m remaining"
4. Wait 1 minute
5. Verify countdown updates to "23h 59m remaining"
6. Check database: limit_hit_chat_at is set to current time
```

### Test 2: Hit Upload Limit
```
1. Create free account
2. Upload 5 files (hit limit)
3. Try uploading 6th file
4. Verify modal shows "Access unlocks in: 24h 0m remaining"
5. Check database: limit_hit_upload_at is set to current time
```

### Test 3: Verify 24-Hour Reset
```
1. Set limit_hit_upload_at to 25 hours ago in database
2. Call checkAndResetUsage()
3. Verify:
   - daily_file_uploads reset to 0
   - limit_hit_upload_at cleared (null)
4. User can now upload without hitting limit
```

### Test 4: Midnight Reset Still Works
```
1. User hits limit at 11:45 PM
2. Midnight passes
3. Verify counters reset at midnight
4. Verify 24-hour unlock doesn't interfere if midnight comes first
```

## Error Messages

### Chat Limit
**Old:** "You've reached your daily limit of 10 chats. Reset at midnight."
**New:** "You've reached your daily limit of 10 chats. Access unlocks in 24 hours."

### File Upload Limit
**Old:** "Daily upload limit reached (5). X remaining. Reset at midnight."
**New:** "Daily upload limit reached (5). Access unlocks in 24 hours."

## Migration Steps

1. **Run the migration:**
```sql
-- Execute: lib/migrations/add-24hour-limit-unlock.sql
```

2. **Deploy updated code:**
   - `lib/usage-tracking.ts` - Core logic
   - `components/LimitModal.tsx` - UI updates
   - `components/PromptShell.tsx` - Integration

3. **Test thoroughly:**
   - Hit limits and verify 24-hour countdown
   - Check database values are set correctly
   - Verify reset happens after 24 hours
   - Ensure midnight reset still works as fallback

## Backward Compatibility

- Existing users without `limit_hit_chat_at` or `limit_hit_upload_at` will have midnight reset (fallback)
- Once they hit a limit, 24-hour unlock is recorded and takes precedence
- No breaking changes to API or existing functions

## Performance Considerations

- Added 2 indexed columns for efficient queries
- `checkAndResetUsage()` now checks 2 additional date comparisons (minimal impact)
- Countdown timer updates every minute (not every second) to reduce re-renders
- Timestamps are only written to DB when limits are hit (infrequent operation)

## Database Indexes

Created indexes for efficient limit checking:
- `idx_users_limit_hit_chat_at` on `limit_hit_chat_at`
- `idx_users_limit_hit_upload_at` on `limit_hit_upload_at`

These help with queries that check if limits need to be reset.

## Future Enhancements

1. **Email Notifications:** Send email when access is about to unlock
2. **Notification Center:** Show countdown in user profile/dashboard
3. **Graceful Degradation:** Show "retry in 2h 30m" button instead of just upgrade
4. **Analytics:** Track how many users hit limits and upgrade rates
5. **Plan Changes:** Auto-unlock if user upgrades while locked
