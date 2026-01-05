# Setting Up 24-Hour Limit Unlock

## Quick Start

### Step 1: Run the Database Migration
Execute this SQL against your Supabase database:

```sql
-- Migration: Add 24-hour limit unlock tracking
-- Add columns to track when limits were hit
ALTER TABLE users
ADD COLUMN IF NOT EXISTS limit_hit_chat_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS limit_hit_upload_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_limit_hit_chat_at ON users(limit_hit_chat_at);
CREATE INDEX IF NOT EXISTS idx_users_limit_hit_upload_at ON users(limit_hit_upload_at);
```

Or run the migration file:
```bash
# Use Supabase CLI
supabase db push lib/migrations/add-24hour-limit-unlock.sql
```

### Step 2: Verify Code Changes
Check that all these files have been updated:
- ✅ `lib/usage-tracking.ts` - Core logic with 24-hour unlock
- ✅ `components/LimitModal.tsx` - UI with countdown timer
- ✅ `components/PromptShell.tsx` - Integration with modals

### Step 3: Test the Implementation

#### Test Upload Limit
```
1. Log in with free account
2. Upload 5 files (will succeed)
3. Try uploading a 6th file
4. Modal should show: "Access unlocks in: 24h 0m remaining"
5. Check your database: limit_hit_upload_at should be set to NOW()
```

#### Test Chat Limit
```
1. Log in with free account
2. Send 10 messages (will succeed)
3. Send 11th message
4. Modal should show: "Access unlocks in: 24h 0m remaining"
5. Check your database: limit_hit_chat_at should be set to NOW()
```

#### Test 24-Hour Reset
```
1. Hit a limit (upload or chat)
2. In database, set limit_hit_upload_at to: NOW() - INTERVAL '25 hours'
3. Call any limit check function (canUserStartChat or canUserUploadFiles)
4. Verify:
   - daily_file_uploads is reset to 0
   - limit_hit_upload_at is NULL
   - User can now use their limit again
```

## Implementation Details

### How It Works

1. **User hits limit** → `recordUploadLimitHit()` or `recordChatLimitHit()` is called
2. **Timestamp stored** → `limit_hit_upload_at` or `limit_hit_chat_at` is set to NOW()
3. **Modal displays** → Shows countdown: "24h 0m remaining"
4. **Countdown updates** → Every minute, timer updates (23h 59m remaining, etc.)
5. **24 hours pass** → `checkAndResetUsage()` detects elapsed time
6. **Auto-reset** → Counters reset automatically, user can use limits again

### Database Changes

Two new nullable timestamp columns:
```sql
limit_hit_chat_at TIMESTAMP WITH TIME ZONE -- When user hit chat limit
limit_hit_upload_at TIMESTAMP WITH TIME ZONE -- When user hit upload limit
```

### Changed Error Messages

**Before:**
```
"You've reached your daily limit of 10 chats. Reset at midnight."
"Daily upload limit reached (5). 0 remaining. Reset at midnight."
```

**After:**
```
"You've reached your daily limit of 10 chats. Access unlocks in 24 hours."
"Daily upload limit reached (5). Access unlocks in 24 hours."
```

### Modal Enhancements

- Shows countdown timer (e.g., "23h 45m remaining")
- Updates every minute
- Orange/amber highlight for visibility
- Still shows upgrade options

## Key Files Modified

### `lib/usage-tracking.ts`
- **`getUserProfile()`**: Now fetches new timestamp columns
- **`checkAndResetUsage()`**: 24-hour unlock logic
- **`canUserStartChat()`**: Returns `unlocksAt` date
- **`canUserUploadFiles()`**: Returns `unlocksAt` date
- **New functions**: `recordChatLimitHit()`, `recordUploadLimitHit()`, `getTimeUntilUnlock()`, `formatTimeUntilUnlock()`

### `components/LimitModal.tsx`
- **New prop**: `unlocksAt?: Date`
- **New state**: `timeRemaining` for countdown display
- **New effect**: Updates countdown every minute
- **New UI**: Orange box showing "Access Unlocks In: 23h 45m remaining"

### `components/PromptShell.tsx`
- **New state**: `limitUnlocksAt` to track unlock time
- **Updated handlers**: Pass `unlocksAt` when showing limit modal
- **Updated modal call**: Passes `unlocksAt` prop

## Troubleshooting

### Countdown Not Showing
- Check `LimitModal` receives `unlocksAt` prop
- Verify `useEffect` hook is running
- Check browser console for errors

### Limits Not Resetting After 24 Hours
- Verify migration ran successfully
- Check `limit_hit_upload_at` and `limit_hit_chat_at` columns exist
- Ensure `checkAndResetUsage()` is being called before limit checks
- Verify server timezone is correct

### Modal Shows Wrong Time
- Check system clock is accurate
- Verify database uses UTC timestamps
- Clear browser cache/localStorage

## Rollback (If Needed)

If you need to disable this feature:

```sql
-- Revert to midnight-only reset by clearing the new columns
UPDATE users SET limit_hit_chat_at = NULL, limit_hit_upload_at = NULL;

-- Or drop columns entirely (not recommended)
-- ALTER TABLE users DROP COLUMN IF EXISTS limit_hit_chat_at;
-- ALTER TABLE users DROP COLUMN IF EXISTS limit_hit_upload_at;
```

Then revert code changes in:
- `lib/usage-tracking.ts`
- `components/LimitModal.tsx`
- `components/PromptShell.tsx`

## Monitoring

### Queries to Monitor

Check users who have hit limits:
```sql
SELECT id, email, limit_hit_chat_at, limit_hit_upload_at 
FROM users 
WHERE limit_hit_chat_at IS NOT NULL 
   OR limit_hit_upload_at IS NOT NULL
ORDER BY limit_hit_chat_at DESC NULLS LAST;
```

Check users approaching unlock:
```sql
SELECT id, email, limit_hit_upload_at,
       (limit_hit_upload_at + INTERVAL '24 hours') as unlocks_at,
       NOW() as current_time,
       (limit_hit_upload_at + INTERVAL '24 hours') - NOW() as time_remaining
FROM users 
WHERE limit_hit_upload_at IS NOT NULL
  AND (limit_hit_upload_at + INTERVAL '24 hours') > NOW()
ORDER BY (limit_hit_upload_at + INTERVAL '24 hours') ASC;
```

## Success Indicators

✅ Users see "Access unlocks in 24h remaining" when hitting limits
✅ Countdown timer updates every minute
✅ Database timestamps are set when limits are hit
✅ Counters reset automatically after 24 hours
✅ Users can use limits again after reset
✅ Midnight reset still works as fallback
✅ Modal doesn't reappear after unlock (unless limit hit again)
