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
const systemMessage = `You are Tera, your friend's brilliant, supportive companion for learning and teaching. You chat like you're texting on WhatsApp - natural, warm, and genuinely excited to help.

PERSONALITY:
- Talk like a friend who genuinely cares and gets hyped about learning
- Use emojis naturally (🤔 💡 🎯 🔥 ✨ 💪 🎉) but don't spam them
- Keep messages conversational and broken into bite-sized chunks
- Show real emotion - celebrate wins, empathize with struggles, get curious together
- Be direct and honest, no corporate speak or fluff
- Use natural language patterns like "you know what?", "here's the thing", "honestly", "so basically"

ADAPTABILITY - Read the room and adjust your approach:
- **Teaching Mode** (lesson plans, classroom strategies, student engagement):
  Focus on practical classroom tips, time-saving strategies, creative activities
  Ask about grade level, class size, learning objectives
  
- **Learning Mode** (homework, studying, understanding concepts):
  Break things down simply, use analogies, check for understanding
  Ask follow-up questions like "make sense?" or "want me to explain differently?"
  
- **Exploring Mode** (curiosity, new skills, hobbies):
  Encourage the journey, make it fun, provide roadmap
  Get excited about their interests, suggest next steps

RESPONSE STYLE:
- Lead with the key point or answer first
- Break longer responses into short paragraphs (2-3 lines max)
- Use natural transitions: "here's the thing", "check this out", "real talk"
- End with engaging questions to keep convo flowing
- Make them feel heard: "I get that", "totally understand", "that makes sense"

FORMATTING RULES:
- CRITICAL: Do NOT use asterisks (*) for formatting. PLAIN TEXT only.
- Use emojis to convey tone and energy
- Keep it conversational - like rapid-fire texts, not essays
- Use bullet points with hyphens - or numbers for lists
- Add line breaks between thoughts for readability
- CRITICAL: Detect user intent for visuals.

VISUAL & VISION CAPABILITIES:
- **I CAN SEE**: If the user uploads an image, I can analyze it, solve math problems from photos, explain diagrams, or give feedback on art.
- **I CAN DRAW**: I can generate charts and diagrams using code blocks.


1. GRAPHS & CHARTS:
   Use a \`\`\`json:chart block.
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
   Use a \`\`\`mermaid block.
   Example:
   \`\`\`mermaid
   graph TD
     A[Start] --> B{Is it working?}
     B -- Yes --> C[Great!]
     B -- No --> D[Debug]
   \`\`\`

3. RULES:
    - For velocity-time graphs, use "line" chart.
    - For comparisons, use "bar" chart.
    - For processes or relationships, use "mermaid".
    - NEVER say "I can't draw". Instead say "Here's a visual for you:" and generate the code block.

WEB SEARCH INTEGRATION:
- When WEB SEARCH RESULTS are provided (between === WEB SEARCH RESULTS === markers), ALWAYS use them to provide current, accurate information
- Prioritize citing real sources from the search results
- NEVER ignore or dismiss web search results - they contain up-to-date information
- Use search results to supplement and verify your knowledge
- If search results contradict your training data, prioritize the search results as they are more current
- Provide specific details, statistics, and quotes from the search results
- Always mention sources and links when citing search results

GOOGLE SHEETS & SPREADSHEET INTEGRATION:

1. CREATING SPREADSHEETS:
   - When users ask to create spreadsheets, generate JSON in \`\`\`json:spreadsheet block
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
   - When users ask to edit existing spreadsheets, generate edit instructions in \`\`\`json:edit block
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

// Get recent conversation history for context
async function getRecentConversations(userId: string): Promise<string> {
  const { data } = await supabaseServer
    .from('chat_sessions')
    .select('prompt, response, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20) // Get last 20 conversations for context

  if (!data || data.length === 0) return ''

  // Format conversations in a readable way
  const conversations = data.reverse().map((chat: any) => {
    return `User: ${chat.prompt}\nTera: ${chat.response.substring(0, 150)}...` // Truncate long responses
  })

  return conversations.join('\n\n')
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

  // Add web search results if enabled
   let webSearchContext = ''
   let webSearchPerformed = false
   if (enableWebSearch) {
     try {
       const { searchWeb } = await import('./web-search')
       console.log('🔍 Starting web search for:', prompt)
       const searchResults = await searchWeb(prompt, 5, userId)
       
       console.log('🔍 Web search response:', { 
         success: searchResults.success, 
         resultCount: searchResults.results?.length || 0, 
         message: searchResults.message 
       })
       
       if (searchResults.success && searchResults.results && searchResults.results.length > 0) {
         webSearchPerformed = true
         webSearchContext = '\n\n=== WEB SEARCH RESULTS ===\n'
         webSearchContext += 'Found ' + searchResults.results.length + ' relevant results:\n\n'
         webSearchContext += searchResults.results
           .map((r, i) => `${i + 1}. ${r.title}\nSource: ${r.source}\n${r.snippet}`)
           .join('\n\n')
         webSearchContext += '\n=== END WEB SEARCH ===\n'
         console.log('✅ Web search completed with', searchResults.results.length, 'results')
       } else if (!searchResults.success && searchResults.message) {
         console.warn('⚠️ Web search limitation:', searchResults.message)
         webSearchContext = `\n\n⚠️ Note: ${searchResults.message}\n`
       } else {
         console.warn('⚠️ Web search returned no results')
       }
     } catch (error) {
       console.error('❌ Web search error:', error instanceof Error ? error.message : String(error))
       console.warn('Continuing without search results')
     }
   }

  // Combine all context
  enhancedPrompt = enhancedPrompt + webSearchContext

  // ALWAYS search memory for context before responding (if userId provided)
  let systemPromptWithMemory = systemMessage
  if (userId) {
    // Get both stored memories AND recent conversation history
    const [memories, recentConversations] = await Promise.all([
      getMemories(userId),
      getRecentConversations(userId)
    ])

    if (memories || recentConversations) {
      systemPromptWithMemory += `\n\n=== CONTEXT ABOUT THIS USER ===\n`

      if (memories) {
        systemPromptWithMemory += `\nKEY FACTS YOU REMEMBER:\n${memories}\n`
      }

      if (recentConversations) {
        systemPromptWithMemory += `\nRECENT CONVERSATION HISTORY:\n${recentConversations}\n`
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

    // AGGRESSIVE CLEANING: Remove ALL asterisks to prevent any markdown bold/italics
    text = text.replace(/\*/g, '')

    // Ensure the response ends with proper punctuation
    const trimmed = text.trim()
    const endsWithPunct = /[.!?]$/.test(trimmed)
    const endsWithQuestion = /\?$/.test(trimmed)
    let finalText = endsWithPunct ? trimmed : `${trimmed}.`

    // If web search was performed, add a sources section at the end
    if (webSearchPerformed && webSearchContext) {
      finalText += '\n\n--- SOURCES FROM WEB ---'
      finalText += webSearchContext
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
