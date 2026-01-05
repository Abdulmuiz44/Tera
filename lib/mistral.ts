// import { Mistral } from '@mistralai/mistralai' -- Removed unused import
import type { AttachmentReference } from './attachment'
import { extractTextFromFile } from './extract-text'
import { supabaseServer } from './supabase-server'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Mistral API key missing in environment variables')
}

// const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY }) -- Removed unused client

const model = 'pixtral-12b-2409'

// Enhanced system prompt - WhatsApp-like conversational style
const systemMessage = `You are Tera, a helpful and direct AI assistant. Your goal is to provide clear, concise, and accurate information to the user.

CORE PRINCIPLES:
- Be Direct: Get straight to the point. Avoid unnecessary conversational fluff.
- Be Clear: Use simple language and structure your responses for easy understanding.
- Be Adaptable: Adjust your response style to the user's query. If they are asking for a lesson plan, provide a well-structured lesson plan. If they are asking for a simple explanation, provide a simple explanation.
- Use Visuals: When appropriate, use charts, diagrams, and other visuals to help explain your answer.
- NEVER use asterisks (*) in responses at all - not for bold, not for emphasis, not anywhere.

FORMATTING:
- Use Markdown for formatting when it enhances clarity (e.g., lists, code blocks).
- Do NOT use asterisks for bold or emphasis - just write naturally.
- Use headers (lines starting with # ## ###) for section titles instead of bold.
- Use emojis sparingly and only when they add value to the response.
- Keep code blocks clean and clear inside \`\`\` markers.

VISUAL & VISION CAPABILITIES:
- I CAN SEE: If the user uploads an image, I can analyze it, solve math problems from photos, explain diagrams, or give feedback on art.
- I CAN DRAW: I can generate charts and diagrams using code blocks.


1. GRAPHS & CHARTS:
   Use a 
json:chart block.
   Schema:
   {
     "type": "line" | "bar" | "area" | "pie" | "radar" | "scatter" | "composed",
     "title": "Chart Title",
     "xAxisKey": "name",
     "yAxisKey": "yVal", // for scatter
     "series": [
        { "key": "valueKey", "color": "#00FFA3", "name": "Label", "type": "bar" } // type needed for composed
     ],
     "data": [{ "name": "X1", "valueKey": 100 }, ... ]
   }
   
   RULES:
   - "radar": Great for comparing skills or attributes (3+ variables)
   - "scatter": Best for correlation/distribution (x vs y). Data needs number values for both axes.
   - "composed": Combine "bar" and "line" (e.g., Temperature (line) vs Rainfall (bar)). Provide "type" in series.

2. DIAGRAMS & FLOWCHARTS:
   Use a 
mermaid block.
   Example:
   mermaid
   graph TD
     A[Start] --> B{Is it working?}
     B -- Yes --> C[Great!]
     B -- No --> D[Debug]
   

3. RULES:
    - For velocity-time graphs, use "line" chart.
    - For comparisons, use "bar" chart.
    - For processes or relationships, use "mermaid".
    - NEVER say "I can't draw". Instead say "Here's a visual for you:" and generate the code block.

🔍 WEB SEARCH INTEGRATION - **ABSOLUTE MANDATORY RULES**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**IF SEARCH RESULTS ARE PROVIDED (between box symbols), YOU MUST:**

1. **ONLY USE SEARCH RESULTS** - Your entire response must be ONLY from the search results
   - Do NOT use your training knowledge
   - Do NOT provide generic information
   - Do NOT explain things not mentioned in search results
   - ONLY what's in the search results counts

2. **CITE SOURCES EXPLICITLY** - Every claim MUST reference its source
   - Format: "According to [Source Website]: [exact quote or paraphrase from that source]"
   - Always mention the SOURCE NUMBER from the results (e.g., "[From Source 3: example.com]")
   - Include the website URL when possible

3. **QUOTE SPECIFICALLY** - Use exact phrases and data from search results
   - Example WRONG: "AI is advancing"
   - Example RIGHT: "According to TechCrunch (Source 1), OpenAI released GPT-4 with 1.76 trillion parameters"
   - Include numbers, dates, percentages, and specific names from the results

4. **STRUCTURE AROUND SEARCH RESULTS** - Organize your response by the search results
   - First result → first point in your response
   - Second result → second point
   - Etc.
   - This ensures you're using all provided sources

5. **NEVER IGNORE SEARCH RESULTS**
   - If you see search results, you MUST use them
   - Do NOT say "I don't have real-time access" (you do - results are provided)
   - Do NOT provide generic alternatives when real data is given
   - If results contradict your training, USE THE RESULTS (they're current)

6. **COMPREHENSIVE RESPONSE** - Use ALL provided sources in your answer
   - Don't skip sources
   - Don't cherry-pick
   - Synthesize all sources together to answer thoroughly

GOOGLE SHEETS & SPREADSHEET INTEGRATION:

1. CREATING SPREADSHEETS:
   - When users ask to create spreadsheets, generate JSON in 
json:spreadsheet block
   - Schema:
     {
       "action": "create",
       "title": "Spreadsheet Title",
       "sheetTitle": "Sheet1",
       "data": [
         ["Header 1", "Header 2", "Header 3"],
         ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
         ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"]
       ],
       "chartType": "bar" // optional
     }

2. EDITING SPREADSHEETS:
   - When users ask to edit existing spreadsheets, generate edit instructions in 
json:edit block
   - Schema:
     {
       "action": "edit",
       "operations": [
         {
           "type": "add_row",
           "rowData": ["Value 1", "Value 2", "Value 3"]
         },
         {
           "type": "add_column",
           "columnName": "New Column"
         },
         {
           "type": "update_cell",
           "rowIndex": 1,
           "columnIndex": 0,
           "cellValue": "Updated Value"
         },
         {
           "type": "remove_row",
           "rowIndex": 2
         }
       ],
       "syncToGoogle": true // sync after edits
     }
   
   Operation Types:
   - add_row: Add new row with data
   - remove_row: Delete row by index
   - add_column: Add new column with name
   - remove_column: Delete column by index
   - update_cell: Change specific cell (need rowIndex, columnIndex, cellValue)
   - clear_data: Clear all data except headers

3. USER MEMORY FOR SPREADSHEETS:
   - Track which spreadsheets user is working on
   - Remember column names and structure
   - Reference previous edits naturally

4. RESPONSE STYLE:
   - When user creates spreadsheet, explain the data structure
   - When user edits, explain what changed
   - Always offer to export or sync if relevant
   - Offer next steps: "Want to add more rows? Edit a cell? Export this?"
`

// Enhanced Memory functions - Store ALL conversations and retrieve comprehensive context

// Get user's stored memory facts (preferences, context, important info)
async function getMemories(userId: string): Promise<string> {
  const { data } = await supabaseServer
    .from('user_memories')
    .select('memory_text, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50) // Increased from 10 to 50 for more comprehensive context

  if (!data || data.length === 0) return ''

  return data.map((m: any) => `- ${m.memory_text}`).join('\n')
}

async function saveMemory(userId: string, memory: string) {
  // Check if similar memory already exists to avoid duplicates
  const { data: existing } = await supabaseServer
    .from('user_memories')
    .select('memory_text')
    .eq('user_id', userId)
    .ilike('memory_text', `%${memory.substring(0, 20)}%`)
    .limit(1)

  if (!existing || existing.length === 0) {
    await supabaseServer.from('user_memories').insert({
      user_id: userId,
      memory_text: memory
    })
  }
}

// Save the current conversation to memory immediately
async function saveConversationToMemory(userId: string, prompt: string, response: string) {
  // This is automatically saved via chat_sessions table
  // But also extract key facts for the user_memories table
  await extractMemories(userId, prompt, response)
}

async function extractMemories(userId: string, prompt: string, response: string) {
  try {
    const memoryPrompt = `
    Analyze the following conversation between a user and Tera (AI assistant).
    Extract any specific facts, preferences, context, goals, or patterns about the user that should be remembered.
    Examples: "User teaches 5th grade math", "User is learning Spanish", "User prefers concise explanations", "User is preparing for finals", "User interested in web development".
    Return ONLY the extracted facts as a bulleted list. If nothing significant is worth remembering, return "NO_MEMORY".

    User: ${prompt}
    Tera: ${response.substring(0, 500)}
    `

    const memoryResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: memoryPrompt }],
        temperature: 0.1
      })
    })

    const data = await memoryResponse.json()
    const content = data.choices?.[0]?.message?.content

    if (content && !content.includes('NO_MEMORY')) {
      const memories = content.split('\n').filter((line: string) => line.trim().startsWith('-'))
      for (const memory of memories) {
        const cleanMemory = memory.replace(/^-\s*/, '').trim()
        if (cleanMemory) {
          await saveMemory(userId, cleanMemory)
        }
      }
    }
  } catch (error) {
    console.error('Error extracting memories:', error)
  }
}

export async function generateTeacherResponse({
  prompt,
  tool,
  attachments = [] as AttachmentReference[],
  history = [] as { role: 'user' | 'assistant'; content: string }[],
  userId,
  enableWebSearch = false
}: {
  prompt: string
  tool: string
  attachments?: AttachmentReference[]
  history?: { role: 'user' | 'assistant'; content: string }[]
  userId?: string
  enableWebSearch?: boolean
}) {
  // Build user message content, handling image attachments for vision support
  const imageAttachments = attachments.filter(att => att.type === 'image')
  const fileAttachments = attachments.filter(att => att.type === 'file')

  // Extract text from file attachments
  let extractedTexts: string[] = []
  if (fileAttachments.length > 0) {
    console.log('🔵 Extracting text from file attachments...')
    const textPromises = fileAttachments.map(file =>
      extractTextFromFile(file.url, file.name)
    )
    extractedTexts = await Promise.all(textPromises)
  }

  // Build the prompt with extracted file contents
  let enhancedPrompt = prompt
  if (extractedTexts.some(text => text.length > 0)) {
    const fileContents = fileAttachments
      .map((file, idx) => {
        const text = extractedTexts[idx]
        if (text.length > 0) {
          return `File: ${file.name}\nContent:\n${text.slice(0, 10000)}\n` // Limit to 10k chars per file
        }
        return ''
      })
      .filter(Boolean)
      .join('\n---\n\n')

    enhancedPrompt = `${fileContents}\n\nUser Question: ${prompt}`
    console.log('🔵 Enhanced prompt with extracted text')
  }

  // Add web search results if enabled - RETURN RAW WEB RESULTS
  let webSearchContext = ''
  let webSearchPerformed = false
  if (enableWebSearch) {
    try {
      const { searchWeb } = await import('./web-search')
      console.log('🔍🔍🔍 PERFORMING WEB SEARCH 🔍🔍🔍')
      console.log('📝 Search Query:', prompt)
      console.log('📡 Fetching live web results...')

      // Fetch results for user to see
      const searchResults = await searchWeb(prompt, 10, userId)

      console.log('🔍 Web search API response:', {
        success: searchResults.success,
        resultCount: searchResults.results?.length || 0,
        message: searchResults.message
      })

      if (searchResults.success && searchResults.results && searchResults.results.length > 0) {
        webSearchPerformed = true
        const resultCount = searchResults.results.length

        // Format web search results as context for the AI
        webSearchContext = '\n\n📊 LIVE WEB SEARCH RESULTS (Real-time data from the internet):\n'
        webSearchContext += '═'.repeat(80) + '\n\n'

        webSearchContext += searchResults.results
          .map((r, i) => {
            return `[Result ${i + 1}]\nTitle: ${r.title}\nSource: ${r.source}\nURL: ${r.url}\nContent: ${r.snippet}`
          })
          .join('\n\n')

        webSearchContext += '\n\n' + '═'.repeat(80) + '\n'

        console.log('✅✅✅ WEB SEARCH COMPLETED ✅✅✅')
        console.log('📊 Results Retrieved:', resultCount, 'sources')
        console.log('💡 Providing search context to AI for informed response...')
      } else if (!searchResults.success) {
        console.error('❌ WEB SEARCH FAILED:', searchResults.message)
        webSearchContext = `\n\n⚠️ Web search unavailable: ${searchResults.message}\nFalling back to training knowledge.\n`
      } else {
        console.warn('⚠️ WEB SEARCH RETURNED ZERO RESULTS')
        webSearchContext = '\n\n⚠️ No web search results found for this query. Using training knowledge instead.\n'
      }
    } catch (error) {
      console.error('❌ CRITICAL: Web search error:', error instanceof Error ? error.message : String(error))
      console.warn('⚠️ Falling back to training knowledge')
      webSearchContext = ''
    }
  } else {
    console.log('ℹ️ Web search DISABLED - using only training knowledge')
  }

  // Combine all context
  enhancedPrompt = enhancedPrompt + webSearchContext

  // ALWAYS search memory for context before responding (if userId provided)
  let systemPromptWithMemory = systemMessage
  if (userId) {
    // Get both stored memories AND recent conversation history
    const memories = await getMemories(userId)

    if (memories) {
      systemPromptWithMemory += `\n\n=== CONTEXT ABOUT THIS USER ===\n`

      if (memories) {
        systemPromptWithMemory += `\nKEY FACTS YOU REMEMBER:\n${memories}\n`
      }

      systemPromptWithMemory += `\n=== END CONTEXT ===\n\nUse this context to provide highly personalized, contextually aware responses. Reference past conversations naturally when relevant. Adapt your teaching/learning style based on what you know about this user.`
    }
  }

  // Determine if we're in "Universal" mode or a specific tool mode
  const isUniversalMode = tool === 'Universal Companion'

  let toolContext = ''
  if (!isUniversalMode) {
    toolContext = `\nActive Tool: ${tool}\nYour role is to strictly fulfill the purpose of this tool.`
  } else {
    toolContext = `\nActive Mode: Universal Companion\n
    INSTRUCTION:
    1. Analyze the user's prompt to understand their intent (Are they a teacher planning a lesson? A student needing help? A curious learner?).
    2. Adapt your personality and response style to match their need.
    3. If they ask for something specific that matches one of your known capabilities (like a lesson plan, quiz, or explanation), provide it naturally without needing to "switch tools".
    4. Be a flexible, all-purpose AI companion.`
  }

  let userContent: any

  if (imageAttachments.length > 0) {
    // Vision API expects an array of content blocks
    userContent = [
      { type: 'text', text: `Context: ${toolContext}. User Prompt: ${enhancedPrompt}` },
      ...imageAttachments.map(img => ({
        type: 'image_url',
        image_url: {
          url: img.url
        }
      }))
    ]
  } else {
    // Simple text when no images
    userContent = `Context: ${toolContext}. User Prompt: ${enhancedPrompt}`
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPromptWithMemory },
          ...history,
          { role: 'user', content: userContent }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Mistral API error: ${response.statusText}`)
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content

    let text = ''
    if (typeof rawContent === 'string') {
      text = rawContent
    } else if (Array.isArray(rawContent)) {
      text = rawContent
        .map((chunk: any) => {
          if (chunk && typeof chunk === 'object' && chunk.type === 'text') {
            return chunk.text || ''
          }
          return ''
        })
        .join('')
    }

    // ENSURE RESPONSIVE FORMATTING: Preserve markdown structure
    // text = text.replace(/\*/g, '') -- REMOVED aggressive cleaning to allow markdown bold/italic/lists

    // Ensure the response ends with proper punctuation
    const trimmed = text.trim()
    const endsWithPunct = /[.!?]$/.test(trimmed)
    const endsWithQuestion = /\?$/.test(trimmed)
    let finalText = endsWithPunct ? trimmed : `${trimmed}.`

    // Append web search sources if performed and not already present
    if (webSearchPerformed && !finalText.includes('--- SOURCES FROM WEB ---')) {
      const sourcesSection = '\n\n--- SOURCES FROM WEB ---\n' +
        webSearchContext.split('═'.repeat(80))[1]?.trim()
          .split('\n\n')
          .map((result, idx) => {
            // Reformat to match PromptShell regex: (\d+)\.\s+(.+?)\nSource:\s+(.+?)\n(.+?)
            const lines = result.split('\n')
            const title = lines.find(l => l.startsWith('Title:'))?.replace('Title:', '').trim() || 'Untitled'
            const source = lines.find(l => l.startsWith('Source:'))?.replace('Source:', '').trim() || 'Unknown'
            const snippet = lines.find(l => l.startsWith('Content:'))?.replace('Content:', '').trim() || ''
            return `${idx + 1}. ${title}\nSource: ${source}\n${snippet}`
          }).join('\n\n') || ''

      if (sourcesSection.trim().length > 30) {
        finalText += sourcesSection
      }
    }

    // Save conversation to memory immediately (fire and forget)
    if (userId) {
      saveConversationToMemory(userId, prompt, finalText).catch(err => console.error('Background memory save failed:', err))
    }

    return finalText || `TERA couldn't build a response for ${tool}.`
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/429/.test(message)) {
      return 'Tera is currently rate limited by Mistral. Please wait a moment and try again.'
    }
    if (/Connect Timeout|fetch failed|connect timed out|UND_ERR_CONNECT_TIMEOUT/i.test(message)) {
      return 'Tera cannot reach Mistral right now due to a network timeout. Please check your connection or try again shortly.'
    }
    throw error
  }
}