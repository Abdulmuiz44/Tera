# Web Search Feature Implementation

**Date**: December 9, 2025  
**Status**: ✅ Complete and Ready

## Overview

Tera now has a fully functional web search feature integrated directly into the chat interface. When enabled, Tera searches the web in real-time, shows the search progress, and displays results inline with the chat response.

---

## Features

### 1. Real-Time Search Status
- **"Tera is Searching the Web..."** message appears in chat while search is happening
- Animated dots show the search is in progress
- Shows what query is being searched

### 2. Web Sources Display
- Search results displayed directly in the chat interface
- No external redirects or page navigation
- Numbered source list with:
  - Article title (clickable link)
  - Source domain
  - Snippet preview
  - Link to open in new tab

### 3. Search Limits by Plan
- **Free Plan**: 5 web searches/month
- **Pro Plan**: 50 web searches/month
- **Plus Plan**: 80 web searches/month

### 4. Status Indicators
- Badge showing "Web Search ON (X remaining)"
- Shows in attachment bar when enabled
- Upgrade prompt when limit reached

---

## How to Use

### Enable Web Search
1. Click the **⊕** (plus) button in the chat input
2. Select **🔍 Web Search**
3. Badge appears: "Web Search ON (X remaining)"
4. Type your message and send

### Disable Web Search
1. Click the **⊕** button again
2. Click **Web Search** to toggle OFF
3. Badge disappears

### View Results
Results appear automatically when:
1. Tera searches the web (see "Tera is Searching..." message)
2. AI processes the results
3. Response includes web sources at the bottom
4. Click any source title to visit the page

---

## Technical Implementation

### Components

#### 1. **WebSearchStatus.tsx** (New)
Status component showing search progress
- Shows "Tera is Searching the Web..." with animated dots
- Displays the query being searched
- Shows success message with result count
- Shows error message if search fails

**Props:**
```typescript
interface WebSearchStatusProps {
  isSearching: boolean
  query?: string
  status?: 'searching' | 'processing' | 'complete'
  resultCount?: number
  error?: string
}
```

#### 2. **PromptShell.tsx** (Enhanced)
Main chat component with web search integration

**New State:**
```typescript
const [isWebSearching, setIsWebSearching] = useState(false)
const [currentSearchQuery, setCurrentSearchQuery] = useState('')
const [webSearchStatus, setWebSearchStatus] = useState<'idle' | 'searching' | 'processing' | 'complete'>('idle')
const [webSearchResultCount, setWebSearchResultCount] = useState(0)
```

**Enhanced parseContent():**
- Extracts web sources section from response
- Parses source list
- Returns web-sources block type

**New ContentBlock Type:**
```typescript
| { type: 'web-sources', sources: Array<{ title: string; url: string; snippet: string; source: string }> }
```

#### 3. **mistral.ts** (Enhanced)
AI response generation with web search context

**Web Search Flow:**
1. Checks `enableWebSearch` parameter
2. Calls `searchWeb()` to fetch results
3. Formats results into context
4. Includes results in AI prompt
5. AI generates response using web data
6. Appends source list to response

**Source Format:**
```
--- SOURCES FROM WEB ---
Found 5 relevant results:

1. [Title]
Source: [domain.com]
[snippet text]

2. [Title]
Source: [domain.com]
[snippet text]
```

### API Endpoints

#### 1. **`/api/search/web`** (Existing)
Handles web search requests

**Request:**
```json
{
  "query": "user's search query",
  "limit": 5,
  "userId": "user-id"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "title": "Article Title",
      "url": "https://...",
      "snippet": "Preview text...",
      "source": "domain.com"
    }
  ],
  "query": "search query"
}
```

#### 2. **`/api/user/web-search-status`** (Existing)
Gets remaining searches for current month

**Response:**
```json
{
  "remaining": 45,
  "total": 50,
  "resetDate": "2024-01-09T...",
  "plan": "pro"
}
```

### Data Flow

```
User enables Web Search
    ↓
User sends message
    ↓
PromptShell: setIsWebSearching(true), setStatus('searching')
    ↓
generateAnswer() called with enableWebSearch: true
    ↓
mistral.ts: searchWeb() → /api/search/web
    ↓
Serper API: Returns search results
    ↓
Results formatted and added to AI prompt context
    ↓
AI generates response using web data
    ↓
Response includes "--- SOURCES FROM WEB ---" section
    ↓
PromptShell: setIsWebSearching(false), setStatus('complete')
    ↓
WebSearchStatus shows "Web search complete - Found X results"
    ↓
parseContent() extracts sources
    ↓
Sources rendered in message with clickable links
```

---

## UI/UX Details

### Web Search Badge
Located above chat input when enabled:
```
🔍 Web Search ON (45)
```

### Search Status Message
Appears in chat during search:
```
🔍 Searching the web...
Looking for: [query]
[animated dots]
```

### Complete Status Message
Appears after search completes:
```
✅ Web search complete
Found 5 relevant results
```

### Web Sources Section
Appears at end of response:
```
🔍 Web Sources
1. Article Title
   domain.com
   Snippet preview of the article...

2. Article Title 2
   domain2.com
   Snippet preview of the article...
```

Each source is a clickable link (opens in new tab)

---

## Configuration

### Required Environment Variables
```bash
SERPER_API_KEY=your_serper_api_key
```

Get API key from: https://serper.dev

### Optional Settings
Can be modified in:
- **lib/plan-config.ts**: Change search limits per plan
- **lib/web-search-usage.ts**: Modify usage tracking logic
- **components/WebSearchStatus.tsx**: Customize search status UI

---

## Limitations & Notes

### Current Implementation
- Searches are cached by Serper API (~24 hours)
- Maximum 5 results returned per search
- Text snippets limited to prevent token overflow
- Search limited to last 30 days by default

### API Limits
- Free Serper plan: 100 requests/month
- Upgrade for more requests: https://serper.dev/pricing

### Web Search Restrictions
- Cannot search for real-time data (stock prices, live scores)
- Results may be from Serper's cache
- No video/image-only searches

---

## Testing

### Test Web Search
1. Enable web search toggle
2. Ask Tera: "What are the latest news about AI?"
3. Should see "Tera is Searching..." message
4. Response should include web sources
5. Click a source to verify link works

### Test Limit Enforcement
1. Use Free plan
2. Perform 5 web searches
3. 6th search should show: "Monthly web search limit reached"
4. Upgrade prompt should appear

### Test Error Handling
1. Disable `SERPER_API_KEY` in .env
2. Try web search
3. Should show error message gracefully
4. Chat continues without search results

---

## Files Modified/Created

### New Files
- `components/WebSearchStatus.tsx` - Status indicator component

### Modified Files
- `components/PromptShell.tsx` - Web search UI and state management
- `lib/mistral.ts` - Web search integration with AI response
- `app/api/search/web/route.ts` - (Already existed, optimized)

### Related Files (No changes)
- `lib/web-search.ts` - Web search API client
- `lib/web-search-usage.ts` - Usage tracking
- `lib/plan-config.ts` - Plan configuration
- `app/api/user/web-search-status/route.ts` - Status endpoint

---

## Future Enhancements

### Phase 2
- [ ] Search result filtering by date
- [ ] Advanced search operators
- [ ] Search history in sidebar
- [ ] Saved search results

### Phase 3
- [ ] Video search
- [ ] Image search
- [ ] Real-time search (news, prices, weather)
- [ ] Custom search domains

### Phase 4
- [ ] Web crawling for deep research
- [ ] Citation formatting (APA, MLA, Chicago)
- [ ] Research paper integration
- [ ] Fact-checking indicators

---

## Troubleshooting

### Web Search Not Working
**Problem**: Web search button is disabled or doesn't respond

**Solutions:**
1. Check remaining searches: Click ⊕ > Web Search
2. Check plan limit: Must have searches remaining
3. Verify SERPER_API_KEY is set in .env.local
4. Check console for error messages

### Web Search Gives Error
**Problem**: "Web search failed" message appears

**Solutions:**
1. Verify SERPER_API_KEY is valid
2. Check Serper API quota: https://serper.dev/dashboard
3. Try simpler search query
4. Check internet connection

### Sources Not Displaying
**Problem**: Response appears but no web sources section

**Solutions:**
1. Check if web search was actually enabled (look for "Searching..." message)
2. Verify search returned results (not a parsing issue)
3. Check browser console for parsing errors
4. Try refreshing page

### Limit Reached Too Quickly
**Problem**: "Monthly limit reached" appears unexpectedly

**Solutions:**
1. Check current month: Limit resets monthly
2. Wait for reset date (shown in error message)
3. Upgrade to higher plan for more searches
4. Contact support if limit seems wrong

---

## Support

### Documentation
- See: `WEB_SEARCH_FEATURE.md` (this file)
- Code: `components/WebSearchStatus.tsx`
- Code: Search-related functions in `lib/`

### Getting Help
1. Check troubleshooting section above
2. Review browser console for errors
3. Check `.env.local` has SERPER_API_KEY
4. Contact support with error details

---

## Commit History

```
b9035b1 Implement web search with real-time status in chat interface
```

---

**Web Search Feature Ready!** ✅

Users can now search the web, see search progress in the chat, and view source links all within the application interface.
