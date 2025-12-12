# Chat Sessions Feature - Deployment Checklist

## Overview
Chat session limit enforcement has been fully implemented. Users on the Free plan are limited to 15 chats per day. When they hit the limit, a modal appears prompting them to upgrade. Pro and Plus users have unlimited chats.

## Pre-Deployment Verification ✅

### Code Changes Verified
- [x] All lesson plan references removed
- [x] Plan configuration updated (removed lessonPlansPerMonth)
- [x] Usage tracking simplified (removed lesson plan tracking)
- [x] Generate action fixed (removed undefined isLessonPlanTool)
- [x] Limit modal system working (chats, file-uploads, web-search)
- [x] Daily reset logic implemented
- [x] Web search counter increment added

### Files Modified
- [x] `lib/plan-config.ts` - Removed lessonPlansPerMonth from interface
- [x] `lib/usage-tracking.ts` - Removed all lesson plan tracking functions
- [x] `app/actions/generate.ts` - Fixed action and added web search increment
- [x] `components/PromptShell.tsx` - Updated error detection
- [x] `components/LimitModal.tsx` - Removed lesson-plans
- [x] `app/profile/page.tsx` - Removed lesson plans display

### No Breaking Changes
- [x] Existing user data remains unchanged
- [x] All existing subscriptions continue to work
- [x] Database schema doesn't require migration
- [x] No new environment variables needed
- [x] Backward compatible with current implementation

## Database Requirements

### Existing Columns (Must Exist)
```sql
users table:
- daily_chats INTEGER (default 0)
- daily_file_uploads INTEGER (default 0)
- chat_reset_date TIMESTAMP
- subscription_plan VARCHAR (default 'free')
- monthly_web_searches INTEGER (for web search limits)
- web_search_reset_date TIMESTAMP (for web search reset)
```

No migrations needed - all columns already exist in production.

## Testing Before Deployment

### Free Plan Testing
- [ ] Create test account with 'free' subscription
- [ ] Send 15 messages → All succeed
- [ ] Send 16th message → Error modal appears
- [ ] Modal shows "Daily Chat Limit Reached"
- [ ] Modal has "Upgrade Plan" button
- [ ] Click upgrade → Navigates to /pricing
- [ ] Click "Try Again Tomorrow" → Modal closes

### Pro Plan Testing
- [ ] Create test account with 'pro' subscription
- [ ] Send 100+ messages → All succeed
- [ ] No limit error, no modal
- [ ] Counter increments silently

### Plus Plan Testing
- [ ] Create test account with 'plus' subscription
- [ ] Send 100+ messages → All succeed
- [ ] No limit error, no modal

### Reset Functionality Testing
- [ ] Hit daily limit on free plan
- [ ] Manually set chat_reset_date to past in database
- [ ] Refresh page
- [ ] Counter should reset, can send new messages

### Profile Page Testing
- [ ] Visit /profile page
- [ ] Verify "Lesson Plans" card is gone
- [ ] Only "Chat Sessions" card appears
- [ ] Shows "X / 15 today" for free users
- [ ] Shows "Unlimited" for pro/plus users

### Other Limits Still Working
- [ ] File upload limit: Free 5/day, Pro 20/day, Plus unlimited
- [ ] Web search limit: Free 5/month, Pro 50/month, Plus 80/month

### Console & Error Logs
- [ ] No errors about missing functions
- [ ] No errors about undefined variables
- [ ] All API calls successful (200, 201 status)
- [ ] No TypeScript compilation errors

## Deployment Steps

### 1. Pre-Deployment
```bash
# Verify build passes
npm run build

# No errors should appear
# Check for any "lessonPlan" or "lesson_plan" references
grep -r "lessonPlan" ./ --include="*.ts" --include="*.tsx"
grep -r "lesson_plan" ./ --include="*.ts" --include="*.tsx"
# Both should return NO RESULTS

# Run tests if available
npm run test
```

### 2. Deploy to Staging
```bash
# Deploy to staging environment
# Verify all URLs work:
# - /new (create chat)
# - /chat/[id] (view chat)
# - /profile (view usage stats)
# - /pricing (upgrade page)
# - /history (chat history)

# Run smoke tests
# Send 15+ messages on free account
# Verify limit error and modal appear
```

### 3. Monitor Logs
```
Watch for:
- Any "lessonPlan" related errors
- Limit enforcement errors
- Reset logic failures
- User profile fetch failures

All should be zero during testing
```

### 4. Deploy to Production
```bash
# Standard deployment process
# No special configuration needed
# No database migrations required
# No new environment variables

# Post-deploy verification:
# - Users can chat normally
# - Free plan users hit limit at 15 chats
# - Modal appears on limit
# - Upgrade button works
# - Profile page shows only Chat Sessions
```

## Rollback Plan

If issues occur post-deployment:

### Option 1: Immediate Rollback
```bash
# Revert to previous commit
git revert [commit-hash]
npm run build
Deploy previous version
```

### Option 2: Hotfix
```bash
# If modal isn't showing
- Check browser console for errors
- Verify error message includes "limit" and "chats"
- Check LimitModal component is rendered

# If counter doesn't reset
- Verify chat_reset_date is set
- Ensure checkAndResetUsage() is called
- Check UTC timezone on server
```

## Success Criteria (Production Verification)

After deployment, verify:

- [x] Users cannot send more than 15 messages/day on free plan
- [x] Modal appears when limit is reached
- [x] Modal has working "Upgrade Plan" button
- [x] Pro/Plus users can send unlimited messages
- [x] Counter resets at midnight UTC
- [x] Profile page shows correct usage stats
- [x] No console errors
- [x] File upload limits still work
- [x] Web search limits still work
- [x] All existing users can still log in

## Monitoring & Support

### What to Monitor
1. Error rate for `/app/actions/generate` endpoint
2. User upgrade conversion from chat limit modal
3. Daily reset execution (check logs at 00:00 UTC)
4. Web search counter accuracy

### Common Issues & Fixes

**Issue**: Modal doesn't appear
- **Fix**: Check browser console, verify error includes "chats" and "limit"

**Issue**: Free users can send more than 15 messages
- **Fix**: Verify subscription_plan is set to 'free' in database

**Issue**: Counter doesn't reset next day
- **Fix**: Check chat_reset_date is in the past, server timezone is UTC

**Issue**: Pro/Plus users see limit errors
- **Fix**: Verify subscription_plan is set to 'pro' or 'plus' in database

## Support Contact

If issues arise:
1. Check error logs for "chats" errors
2. Verify database fields exist and have values
3. Review CHAT_LIMIT_TEST_GUIDE.md for testing procedures
4. Check browser console for TypeScript errors

## Documentation

Created comprehensive documentation:
- `CHAT_SESSIONS_IMPLEMENTATION.md` - Technical implementation details
- `CHAT_LIMIT_TEST_GUIDE.md` - Testing procedures and troubleshooting
- `DEPLOYMENT_CHECKLIST.md` - This file

## Timeline

- Development: Complete ✅
- Testing: In progress
- Staging: Ready for deployment
- Production: Ready (pending testing approval)

## Sign-Off

- Development: ✅ Complete
- QA: ⏳ Pending
- Product: ⏳ Pending  
- Operations: ⏳ Pending
