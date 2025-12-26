# Upgrade Modal Implementation

## Changes Made

### Updated: components/LimitModal.tsx

#### 1. Dark Mode Support
- **Light Mode (default)**: Black text on white background
- **Dark Mode**: White text on black background
- All content text properly contrasted for visibility in both modes
- Used Tailwind dark: prefix for conditional styling

#### 2. Forced Upgrade Flow
- Removed "Try Again Tomorrow" button
- Removed close (X) button
- Removed ability to click outside to close
- Only option: "Upgrade to Pro/Plus" button (full width)
- Users must click upgrade to proceed

#### 3. Modal Display Behavior
- Modal appears **immediately** when user hits their limit on:
  - Daily chat limit (10 chats/day for free plan)
  - Daily file upload limit (5 uploads/day for free plan)
  - Monthly web search limit (5 searches/month for free plan)

- Triggered in PromptShell.tsx:
  - Line 303: File upload limit check
  - Line 443-449: Chat/web search limit checks

## Styling Details

### Dark Mode Classes Applied
- **Container**: `dark:bg-black dark:border-tera-neon`
- **Text**: `dark:text-white`, `dark:text-white/80`, `dark:text-white/70`, `dark:text-white/60`
- **Backgrounds**: `dark:bg-white/10`, `dark:bg-tera-neon/10`
- **Borders**: `dark:border-white/20`, `dark:border-tera-neon/30`

### Light Mode Classes (Default)
- **Container**: `bg-white border-tera-neon`
- **Text**: `text-black`, `text-black/70`, `text-black/60`
- **Backgrounds**: `bg-black/5`, `bg-tera-neon/10`
- **Borders**: `border-black/10`, `border-tera-neon/30`

## User Experience Flow

1. User hits limit (chats, uploads, or web search)
2. Modal appears with dark/light mode appropriate styling
3. Modal shows:
   - Clear limit reached message
   - Current plan info
   - Plan comparison table
   - Only upgrade button
4. User must click "Upgrade to Pro/Plus" to proceed to pricing page
5. No escape routes (no close button, no background click to dismiss)

## Files Modified
- `components/LimitModal.tsx` - Complete styling and behavior update
