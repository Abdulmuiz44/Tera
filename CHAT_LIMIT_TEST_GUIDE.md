# Chat Session Limit Testing Guide

## Quick Test Summary

The system now properly tracks chat sessions per day and enforces limits based on subscription plan:
- **Free Plan**: 15 chats/day
- **Pro Plan**: Unlimited
- **Plus Plan**: Unlimited

When the limit is reached, a modal popup appears with upgrade options.

## Step-by-Step Testing

### Scenario 1: Test Free Plan 15-Chat Limit

**Setup:**
1. Sign up with a new email or use an existing free account
2. Navigate to chat interface

**Test:**
1. Send your 1st message
   - Expected: Message appears, responds normally
   - Counter shows: 1/15

2. Send messages 2-14
   - Expected: All respond normally
   - Counter shows: 14/15

3. Send your 15th message
   - Expected: Message appears, responds normally
   - Counter shows: 15/15 (limit reached)

4. Send your 16th message
   - Expected: Message is sent but...
   - Error message appears: "You've reached your daily limit of 15 chats. Upgrade to Pro for unlimited access."
   - Modal popup appears showing:
     - Title: "Daily Chat Limit Reached"
     - Free: 15 conversations/day
     - Pro: Unlimited ✨
     - Plus: Unlimited ✨
   - Two buttons: "Try Again Tomorrow" and "Upgrade Plan"

5. Click "Try Again Tomorrow"
   - Modal closes
   - Can still view chat history
   - Cannot send new messages

6. Click "Upgrade Plan"
   - Redirects to /pricing page
   - Can select Pro or Plus
   - Checkout process begins

---

### Scenario 2: Test Pro Plan (Unlimited)

**Setup:**
1. Create account
2. Upgrade to Pro plan

**Test:**
1. Send message #1 → Works ✓
2. Send message #20 → Works ✓
3. Send message #50 → Works ✓
4. Send message #100 → Works ✓
5. Expected: Never hits limit, no modal, can chat indefinitely ✓

---

### Scenario 3: Test Plus Plan (Unlimited)

**Setup:**
1. Create account
2. Upgrade to Plus plan

**Test:**
1. Send any number of messages
2. Expected: Never hits limit, no modal ✓
3. Can chat indefinitely

---

### Scenario 4: Test Daily Reset

**Setup:**
1. Create free account
2. Send 15 messages (hit the limit)
3. Attempt 16th message → Error modal appears

**Test Reset:**
1. **In Production**: Wait until next UTC day (00:00 UTC)
2. **In Development**: 
   - Manually update database: `chat_reset_date` to past time
   - OR use development script to adjust time

3. Refresh page
4. Try to send message again
5. Expected: Counter resets to 0, can send new messages ✓

---

### Scenario 5: Test File Uploads (Still Works)

**Free Plan:**
1. Upload 5 files → Works
2. Upload 6th file → Error: "You've reached your daily limit of 5 file uploads"

**Pro Plan:**
1. Upload 20 files → Works  
2. Upload 21st file → Error: "You've reached your daily limit of 20 file uploads"

**Plus Plan:**
1. Upload unlimited files → Always works

---

### Scenario 6: Test Web Search (Still Works)

**Free Plan:**
1. Perform 5 web searches → Works
2. Perform 6th search → Error: Web search modal
   - Shows: 5/5 searches used

**Pro Plan:**
1. Perform 50 web searches → Works
2. Perform 51st search → Error: Web search modal

**Plus Plan:**
1. Perform 80 web searches → Works
2. Perform 81st search → Error: Web search modal

---

## Profile Page Verification

### Check Usage Stats Display

Visit `/profile` to verify:

**Old (Removed):**
- ❌ "Lesson Plans" card showing monthly count
- ❌ Reset date for lesson plans

**New (Current):**
- ✅ Only "Chat Sessions" card showing daily count
- ✅ Shows: "X / 15 today" for free users
- ✅ Shows: "Unlimited" for pro/plus users
- ✅ Progress bar showing usage percentage
- ✅ Color changes: Green (0-70%) → Yellow (70-90%) → Red (90%+)

---

## Browser Console Checks

No errors should appear in console. Check for:
1. ❌ `Uncaught ReferenceError: incrementLessonPlans is not defined`
2. ❌ `Uncaught ReferenceError: getRemainingLessonPlans is not defined`
3. ❌ `monthly_lesson_plans is undefined`
4. ✅ All API calls returning proper responses

---

## Database Verification

If you have database access, verify:

```sql
-- Check user record has proper fields
SELECT 
  id, 
  subscription_plan,
  daily_chats,
  daily_file_uploads, 
  chat_reset_date
FROM users
WHERE id = 'user-id';

-- Expected output for free user after 5 chats:
-- id: xxx, subscription_plan: 'free', daily_chats: 5, daily_file_uploads: 0, chat_reset_date: 2024-01-10

-- Reset should happen automatically when chat_reset_date is in the past
```

---

## Common Issues & Solutions

### Issue 1: Modal doesn't appear when limit is hit

**Check:**
1. Are error messages being caught? Check browser console
2. Is `setLimitModalType('chats')` being called?
3. Is LimitModal component mounted in PromptShell?

**Solution:**
```typescript
// In PromptShell, verify error handling:
} catch (error) {
  if (message.includes('limit') && message.includes('chats')) {
    setLimitModalType('chats')  // This must execute
  }
}
```

### Issue 2: Counter doesn't reset next day

**Check:**
1. Is `checkAndResetUsage()` being called?
2. Is `chat_reset_date` in the past?
3. Database update successful?

**Solution:**
```typescript
// Debug in console
const now = new Date()
const resetDate = new Date('2024-01-09')
console.log('Now:', now)
console.log('Reset date:', resetDate)
console.log('Should reset?:', now >= resetDate)
```

### Issue 3: Pro/Plus users seeing limit errors

**Check:**
1. Is `subscription_plan` correctly set to 'pro' or 'plus'?
2. Is `canStartChat()` function checking plan?

**Solution:**
```typescript
// Verify in plan-config.ts:
export function canStartChat(plan: PlanType, currentCount: number): boolean {
    const limit = PLAN_CONFIGS[plan].limits.chatsPerDay
    return limit === 'unlimited' || currentCount < limit
    // For pro/plus, limit is 'unlimited', so function returns true
}
```

---

## Success Criteria Checklist

- [ ] Free users cannot send more than 15 messages/day
- [ ] Pro users can send unlimited messages
- [ ] Plus users can send unlimited messages
- [ ] Modal appears when free user hits limit
- [ ] Modal has "Upgrade Plan" button
- [ ] Chat counter resets at midnight UTC
- [ ] Profile page shows only Chat Sessions (no Lesson Plans)
- [ ] File upload limits still work
- [ ] Web search limits still work
- [ ] No console errors about removed functions
- [ ] Chat history still loads correctly
- [ ] Web search functionality still works

---

## Notes for Developers

- **Chat increment**: Happens AFTER successful generation (prevents double-counting on error)
- **Reset check**: Happens BEFORE each generation (minimal performance impact)
- **Web search**: Still tracked separately with monthly reset (different from daily chat reset)
- **File uploads**: Still tracked daily (resets at same time as chats)

## Contact Support

If modal doesn't appear or limits aren't enforcing:
1. Check browser console for errors
2. Verify `subscription_plan` in database
3. Check `daily_chats` value in database
4. Verify `chat_reset_date` is set correctly
5. Review generateAnswer error handling in PromptShell
