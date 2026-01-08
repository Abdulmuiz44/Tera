# Plus Plan Features - Setup Guide

## What's Implemented

✅ **Analytics Dashboard** - Usage insights and metrics
✅ **Team Collaboration** - Invite and manage team members  
✅ **API Keys** - Generate keys for programmatic access
✅ **Custom AI Training** - Fine-tune models with custom data
✅ **Permission System** - Auto-redirect non-Plus users

## Setup Instructions

### Step 1: Run Database Migration

Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste the content from: `migrations/setup_plus_features.sql`

Click **Run**

This creates:
- `team_members` table
- `api_keys` table
- `training_jobs` table
- `usage_logs` table
- `support_tickets` table
- RLS policies for all tables

### Step 2: Test the Features

1. Create/use a test account with `subscription_plan: 'plus'`
2. Visit `/plus/analytics` → Should load Analytics Dashboard
3. Visit `/plus/team` → Should load Team Collaboration
4. Visit `/plus/api-keys` → Should load API Keys Manager
5. Visit `/plus/training` → Should load Training Interface

If you see "Redirecting..." message, the user plan is not Plus.

### Step 3: Update User Plan to Plus

In Supabase, run:

```sql
UPDATE users 
SET subscription_plan = 'plus' 
WHERE email = 'your-test-email@example.com';
```

## Feature Details

### Analytics Dashboard (`/plus/analytics`)

Shows:
- Total chats and file uploads
- Most used tool
- Average response time
- Chats by tool (with progress bars)
- Daily activity (last 7 days)
- Usage summary

**Data from:** `chat_sessions`, `file_uploads` tables

### Team Collaboration (`/plus/team`)

Features:
- Invite team members by email
- View all team members
- See join dates and roles
- Remove members (except owner)
- Role types: owner, collaborator

**Database:** `team_members` table

**TODO:** Email invitations (not yet implemented)

### API Keys (`/plus/api-keys`)

Features:
- Generate new API keys
- View all keys (masked for security)
- See creation and last-used dates
- Revoke keys instantly

**Database:** `api_keys` table (stores hashed keys)

**Key Format:** `tera_` + 64 random hex characters

### Custom Training (`/plus/training`)

Features:
- Create training jobs with custom data
- Configure epochs (1-10)
- Monitor training progress
- View job status (pending, training, completed, failed)
- Show daily progress updates

**Database:** `training_jobs` table

**TODO:** Background training worker (not yet implemented)

## Integration Points

### 1. Link to Plus Features from Settings/Billing

```typescript
{user?.subscriptionPlan === 'plus' && (
  <a href="/plus/analytics">View Analytics</a>
)}
```

### 2. Show Upgrade Prompt for Free Users

```typescript
// In app/plus/layout.tsx - Already implemented
// Automatically redirects to /upgrade?reason=plus-only
```

### 3. Track Usage with Analytics

When users perform actions, log them:

```typescript
// This will populate the analytics dashboard
const { error } = await supabaseServer
  .from('usage_logs')
  .insert({
    user_id: userId,
    event_type: 'chat',
    tool_name: toolName,
    metadata: { custom: 'data' }
  })
```

## API Endpoints

All endpoints check for Plus plan before responding.

### Analytics
- `GET /api/plus/analytics?userId={userId}`
  - Returns: usage stats, daily activity, tool breakdown

### Team
- `GET /api/plus/team?userId={userId}` - List members
- `POST /api/plus/team` - Invite member
- `DELETE /api/plus/team?memberId={memberId}` - Remove member

### API Keys
- `GET /api/plus/api-keys?userId={userId}` - List keys
- `POST /api/plus/api-keys` - Generate key
- `DELETE /api/plus/api-keys?keyId={keyId}` - Revoke key

### Training
- `GET /api/plus/training?userId={userId}` - List jobs
- `POST /api/plus/training` - Start training job

## Security Considerations

✅ All endpoints verify Plus plan subscription
✅ RLS policies protect team and API key data
✅ API keys are hashed before storage
✅ Full key shown only once (on generation)
✅ Each user can only see their own data

## What Still Needs Building

1. **Email Notifications**
   - Send invite emails to team members
   - Send training completion emails

2. **Training Pipeline**
   - Background worker to process training jobs
   - Model storage and versioning
   - Training progress updates

3. **Priority Support**
   - Support tickets interface
   - Integration with support system
   - SLA tracking

4. **Advanced Features**
   - API rate limiting
   - Usage quotas per team member
   - Custom model deployment
   - Model performance analytics

## Testing Checklist

- [ ] Run migration in Supabase
- [ ] Create test Plus user
- [ ] Test analytics data loading
- [ ] Test team member invite
- [ ] Test API key generation
- [ ] Test training job creation
- [ ] Verify non-Plus users are redirected
- [ ] Check RLS policies work correctly

## Files Created

**Pages:**
- `app/plus/layout.tsx` - Plus layout with auth check
- `app/plus/analytics/page.tsx` - Analytics dashboard
- `app/plus/team/page.tsx` - Team management
- `app/plus/api-keys/page.tsx` - API keys manager
- `app/plus/training/page.tsx` - Training interface

**API Routes:**
- `app/api/plus/analytics/route.ts`
- `app/api/plus/team/route.ts`
- `app/api/plus/api-keys/route.ts`
- `app/api/plus/training/route.ts`

**Database:**
- `migrations/setup_plus_features.sql`

## Next Steps

1. Deploy to production
2. Test with Plus users
3. Implement email notifications
4. Build training pipeline
5. Add support tickets system
6. Monitor usage and performance
