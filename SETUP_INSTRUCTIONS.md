# Tera - Setup Instructions

## Database Setup

### Create user_settings Table

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to the **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `migrations/create_user_settings_table.sql`
5. Click **Run** button

This will:
- Create the `user_settings` table
- Add proper indexes
- Set up Row Level Security (RLS) policies
- Ensure only users can access their own settings

### Verify the Setup

1. Go to **Table Editor** in Supabase
2. You should see `user_settings` table in the list
3. Click on it to view the structure
4. Verify these columns exist:
   - `id` (BIGSERIAL)
   - `user_id` (UUID)
   - `notifications_enabled` (BOOLEAN)
   - `dark_mode` (BOOLEAN)
   - `email_notifications` (BOOLEAN)
   - `marketing_emails` (BOOLEAN)
   - `data_retention_days` (INTEGER)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

## Settings API Routes

The application includes an API route for managing user settings:

- **GET /api/settings** - Fetch user settings
- **POST /api/settings** - Create/Update user settings

Both routes require the `x-user-id` header with the user's UUID.

## Environment Variables

Make sure your `.env.local` file includes:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Features

### Settings Page (/settings)

Users can manage:
- **Preferences**: Notifications, emails, dark mode
- **Privacy & Data**: Data retention policy, privacy links
- **Account**: Account info, logout, delete account

All changes auto-save in real-time!

### Universal Visual Renderer

Users can generate ANY visual in chat:
- HTML/Canvas/SVG visualizations
- Interactive dashboards
- 3D graphics with Three.js
- Data visualizations with D3.js, Plotly
- Animated graphics with Anime.js

### Chat Features

- File uploads (images, documents)
- Web search integration
- Voice input (speech-to-text)
- Message editing
- Chat history

## Troubleshooting

### Settings not saving?

1. Check browser console for errors (F12)
2. Verify `user_settings` table exists in Supabase
3. Check RLS policies are enabled
4. Ensure user is authenticated

### Table creation fails?

1. Make sure you're on the correct Supabase project
2. Check that `auth.users` table exists (Supabase default)
3. Try running the migration query line by line
4. Check Supabase status page for any issues

### API returning 401?

- Ensure the request includes `x-user-id` header
- The header must match the authenticated user's UUID
- Check that RLS policies allow user access

---

**For issues or questions**, check the Supabase documentation: https://supabase.com/docs
