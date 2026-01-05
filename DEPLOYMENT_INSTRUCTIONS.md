# Deployment Instructions

## Pre-Deployment Checklist

- [ ] All code changes committed
- [ ] No uncommitted changes
- [ ] Tests passing locally
- [ ] Team notified of changes
- [ ] Admin email configured correctly

## Step 1: Run Database Migration

### Option A: Supabase Dashboard (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to "SQL Editor"
4. Click "New Query"
5. Copy and paste contents of `lib/migrations/add-24hour-limit-unlock.sql`
6. Click "Run"
7. Verify success (should see "0 rows" or no error)

### Option B: Supabase CLI
```bash
supabase db push lib/migrations/add-24hour-limit-unlock.sql
```

### Verify Migration
```sql
-- Check columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('limit_hit_chat_at', 'limit_hit_upload_at');

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename = 'users' 
AND indexname LIKE 'idx_users_limit%';
```

Expected output:
```
limit_hit_chat_at        ✅
limit_hit_upload_at      ✅
idx_users_limit_hit_chat_at      ✅
idx_users_limit_hit_upload_at    ✅
```

## Step 2: Deploy Code to Production

### Via Git (Recommended)
```bash
# Commit changes
git add .
git commit -m "feat: 24-hour unlocks, admin analytics dashboard, auto-unlock on upgrade"

# Push to main
git push origin main

# Deploy (depends on your CI/CD setup)
# Example with Vercel:
vercel deploy --prod

# Example with GitHub Actions:
# (automatic on push to main if configured)
```

### Manual Deployment
1. Build project locally: `npm run build` or `yarn build`
2. Ensure no build errors
3. Deploy build artifacts to hosting provider
4. Verify deployment in staging first

## Step 3: Configuration

### Set Admin Email
Edit `lib/admin.ts`:
```typescript
const ADMIN_EMAILS = [
  'abdulmuizproject@gmail.com',
  // Add more emails as needed
]
```

Then redeploy.

### Alternative: Environment Variables (Advanced)
If you prefer to avoid code commits for admin emails:

1. Add to `.env.local`:
```
NEXT_PUBLIC_ADMIN_EMAILS=abdulmuizproject@gmail.com,admin2@example.com
```

2. Update `lib/admin.ts`:
```typescript
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)
```

3. Redeploy with environment variables set

## Step 4: Verify Deployment

### Check Database
```bash
# Connect to production database
psql postgresql://user:pass@host:port/database

# Verify migration
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name='users' 
  AND column_name='limit_hit_chat_at'
) as migration_applied;
-- Expected: true ✅
```

### Check API Endpoint
```bash
# Test analytics endpoint (requires auth)
curl -X POST https://your-domain.com/api/admin/analytics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"userId":"test-user-id"}'

# Expected: JSON with analytics data
```

### Check Admin Dashboard
1. Log in as admin user
2. Visit `https://your-domain.com/admin`
3. Verify dashboard loads
4. Verify data displays

### Check Profile Page
1. Log in as any user
2. Visit profile page
3. Verify "File Uploads" section displays
4. Hit an upload limit (upload 6th file)
5. Verify countdown shows in profile and modal

## Step 5: Post-Deployment Tests

### Test 1: 24-Hour Unlock
```
1. Create test account
2. Hit upload limit (upload 5 files)
3. Verify limit_hit_upload_at is set
4. Check profile: countdown shows "24h 0m"
5. Return in 1 minute: countdown updates to "23h 59m"
✅ Pass if countdown accurate
```

### Test 2: Admin Access
```
1. Log in as non-admin user
2. Visit /admin
3. Should see "Access Denied"
4. Log in as abdulmuizproject@gmail.com
5. Visit /admin
6. Should see dashboard with data
✅ Pass if access control working
```

### Test 3: Analytics Data
```
1. As admin, visit /admin
2. Click "Refresh" button
3. Verify data loads
4. Check summary stats match Supabase
5. Click each tab (Recent, Locked, Conversions)
6. Verify data displays
✅ Pass if all tabs work
```

### Test 4: Upgrade Auto-Unlock
```
1. Hit upload limit on free account
2. Verify limit_hit_upload_at is set
3. Upgrade to Pro
4. Verify limit_hit_upload_at becomes NULL
5. Try uploading: should succeed
✅ Pass if auto-unlock works
```

## Monitoring

### Key Metrics to Track
- Error rate on `/api/admin/analytics`
- Profile page load time (notification feature)
- Database query performance
- Admin dashboard usage

### Logs to Monitor
```bash
# Watch for limit unlock errors
tail -f /var/log/app/error.log | grep "limit_hit"

# Monitor API calls
tail -f /var/log/app/api.log | grep "analytics"

# Check database performance
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%limit_hit%'
ORDER BY total_time DESC;
```

## Rollback Plan

### If Critical Issues
```bash
# Revert migration (in Supabase SQL Editor)
-- WARNING: This will delete the columns and associated data
ALTER TABLE users 
DROP COLUMN IF EXISTS limit_hit_chat_at,
DROP COLUMN IF EXISTS limit_hit_upload_at;

# Revert code
git revert <commit-hash>
git push origin main

# Redeploy
vercel deploy --prod
```

### If Minor Issues
```bash
# Keep migration, revert code
git revert <commit-hash>
git push origin main

# Redeploy (migration stays in place for future)
vercel deploy --prod
```

## Performance Impact

### Expected Impact
- Database query time: +5-10ms (minimal, uses indexes)
- API response time: +50-100ms (new endpoint)
- Page load: +20-30ms (profile page, new section)
- Overall system: <1% impact

### Optimization Tips
- Profile loads notification data on-demand (already optimized)
- Admin dashboard fetches on-demand (not real-time)
- Database queries use indexes (already created)
- No background jobs or polling

## Troubleshooting Deployment

### Migration Failed
**Error:** "Column already exists"
**Solution:** Migration is idempotent. Run again or check if already applied.

**Error:** "Permission denied"
**Solution:** Ensure database user has ALTER TABLE permission

### Admin Dashboard 404
**Error:** Page returns 404
**Solution:** 
1. Verify `app/admin/page.tsx` deployed
2. Check build output includes admin route
3. Clear deployment cache and redeploy

### Analytics Data Empty
**Error:** Dashboard shows no users/data
**Solution:**
1. Verify migration ran successfully
2. Check Supabase connection string
3. Verify API endpoint returns data
4. Check browser console for errors

### Countdown Not Showing
**Error:** Profile doesn't show limit countdown
**Solution:**
1. Verify user has limit_hit_* timestamp in DB
2. Check browser console for JS errors
3. Verify profile page deployed
4. Clear browser cache

## Post-Deployment Communication

### User Notification
Send announcement:
```
Subject: Exciting Update - Faster Limit Recovery

We've improved your experience! 

✨ What's new:
- Hit a daily limit? Get access back in 24 hours (not midnight)
- See countdown in your profile
- Upgrade to Pro/Plus for instant unlock
- Real-time countdown updates

Visit your profile to see your limit status.
```

### Internal Notification
```
✅ Deployment Complete

Features deployed:
- 24-hour auto unlock system
- User notification center
- Admin analytics dashboard  
- Auto-unlock on upgrade

Monitor: /admin (metrics)
Questions: #tech-support
```

## Maintenance

### Regular Checks
- Weekly: Review admin dashboard for trends
- Monthly: Check database index performance
- Quarterly: Review upgrade rate from limits

### Updates
- Keep admin email list updated
- Monitor for issues
- Plan for future enhancements

## Support

### Common User Issues
- "Why am I locked out?" → Hit daily limit, waits for 24h
- "When can I use features again?" → See countdown in profile
- "Can I get access immediately?" → Yes, upgrade to Pro/Plus

### Admin Questions
- "Where's the admin dashboard?" → /admin (email must be in list)
- "Can I add more admins?" → Yes, edit lib/admin.ts
- "Where's the data from?" → All from Supabase

## Success Criteria

✅ Migration applied successfully
✅ Code deployed without errors
✅ Admin dashboard accessible
✅ 24-hour unlock working
✅ Profile notifications showing
✅ Auto-unlock on upgrade working
✅ No increase in error rates
✅ Performance impact < 1%

---

**Deployment Owner:** [Your Name]
**Date Deployed:** [Date]
**Tested By:** [Tester Name]
**Approved By:** [Manager Name]
