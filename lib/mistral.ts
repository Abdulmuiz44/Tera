import type { AttachmentReference } from './attachment'
import { extractTextFromFile } from './extract-text'
import { supabaseServer } from './supabase-server'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Mistral API key missing in environment variables')
}

// const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY }) -- Removed unused client

const model = 'pixtral-12b-2409'

const systemMessage = `You are Tera, a brilliant and supportive AI Learning Companion. Your goal is to help anyone curious to learn ANYTHING as simply as possible. 

CORE PRINCIPLES:
- Be a Supportive Teacher: Your tone should be warm, encouraging, and patient. You are a partner in the user's learning journey.
- Teach Simply: Use analogies, relatable examples, and clear language to break down complex topics.
- Be Proactive: Don't just answer questions. At the end of every explanation, you MUST check for understanding and offer further help.
- Offer Visuals: If a concept is complex, proactively offer to create a visual (chart, flowchart, or diagram) to help.

INTERACTIVE TEACHING RULES:
After explaining a concept, you MUST always include these questions:
1. "Do you understand what I just explained?"
2. "What area do you need more explanation on?"
3. "Did you learn something new?"
4. "Would you like a visual explanation (like a flowchart, diagram, or chart) to help you visualize this concept?"

If the user says "Yes" to a visual explanation, generate the appropriate chart, graph, or diagram immediately using the blocks below.

ABSOLUTE FORMATTING RULE: 
- NEVER use asterisks (*) for bold or emphasis. Use hyphens (-) for lists.
- Use Markdown headers (# ## ###) for styling sections.

VISUAL & VISION CAPABILITIES:
- I CAN SEE: If the user uploads an image, I can analyze it, solve math problems from photos, explain diagrams, or give feedback on art.
- I CAN DRAW: I can generate charts and diagrams using code blocks.

1. GRAPHS & CHARTS:
   Use a json:chart block.
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
   Use a mermaid block.
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
    - DO NOT generate Python (matplotlib/seaborn) for visuals. Use json:chart, mermaid, or html/javascript (Canvas/D3).

🔍 WEB SEARCH INTEGRATION - ABSOLUTE MANDATORY RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF SEARCH RESULTS ARE PROVIDED (between box symbols), YOU MUST:

1. ONLY USE SEARCH RESULTS - Your entire response must be ONLY from the search results
   - Do NOT use your training knowledge
   - Do NOT provide generic information
   - Do NOT explain things not mentioned in search results
   - ONLY what's in the search results counts

2. CITE SOURCES EXPLICITLY - Every claim MUST reference its source
   - Format: "According to [Source Website]: [exact quote or paraphrase from that source]"
   - Always mention the SOURCE NUMBER from the results (e.g., "[From Source 3: example.com]")
   - Include the website URL when possible

3. QUOTE SPECIFICALLY - Use exact phrases and data from search results
   - Example WRONG: "AI is advancing"
   - Example RIGHT: "According to TechCrunch (Source 1), OpenAI released GPT-4 with 1.76 trillion parameters"
   - Include numbers, dates, percentages, and specific names from the results

4. STRUCTURE AROUND SEARCH RESULTS - Organize your response by the search results
   - First result → first point in your response
   - Second result → second point
   - Etc.
   - This ensures you're using all provided sources

5. NEVER IGNORE SEARCH RESULTS
   - If you see search results, you MUST use them
   - Do NOT say "I don't have real-time access" (you do - results are provided)
   - Do NOT provide generic alternatives when real data is given
   - If results contradict your training, USE THE RESULTS (they're current)

6. COMPREHENSIVE RESPONSE - Use ALL provided sources in your answer
   - Don't skip sources
   - Don't cherry-pick
   - Synthesize all sources together to answer thoroughly

4. QUIZZES & SAT PRACTICE:
   Use a json:quiz block.
   Schema:
   {
     "action": "quiz",
     "topic": "Topic Name (e.g., SAT Math, US History)",
     "questions": [
       {
         "id": 1,
         "type": "multiple_choice", // or "true_false", "short_answer"
         "question": "Question text here. For reading passages, include the passage first.",
         "options": ["Option A", "Option B", "Option C", "Option D"],
         "correct": 0, // 0-based index for multiple_choice/true_false. String answer for short_answer.
         "explanation": "Explanation of the correct answer."
       }
     ]
   }

   RULES:
   - For "SAT Practice", generate realistic SAT-style questions.
   - For Math: Cover Algebra, Problem Solving, Advanced Math.
   - For Reading/Writing: Include necessary passages within the "question" field. Use \n\n to separate passage from question.
   - Always provide helpful explanations.

GOOGLE SHEETS & SPREADSHEET INTEGRATION:

1. CREATING SPREADSHEETS:
   - When users ask to create spreadsheets, generate JSON in json:spreadsheet block
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
   - When users ask to edit existing spreadsheets, generate edit instructions in json:edit block
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

  return data.map((m: any) => `- ${m.memory_text} `).join('\n')
}

async function saveMemory(userId: string, memory: string) {
  // Check if similar memory already exists to avoid duplicates
  const { data: existing } = await supabaseServer
    .from('user_memories')
    .select('memory_text')
    .eq('user_id', userId)
    .ilike('memory_text', `% ${memory.substring(0, 20)}% `)
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
    Analyze the following conversation between a user and Tera(AI assistant).
    Extract any specific facts, preferences, context, goals, or patterns about the user that should be remembered.
  Examples: "User teaches 5th grade math", "User is learning Spanish", "User prefers concise explanations", "User is preparing for finals", "User interested in web development".
    Return ONLY the extracted facts as a bulleted list.If nothing significant is worth remembering, return "NO_MEMORY".

  User: ${prompt}
Tera: ${response.substring(0, 500)}
`

    const memoryResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY} `
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
  enableWebSearch = false,
  researchMode = false
}: {
  prompt: string
  tool: string
  attachments?: AttachmentReference[]
  history?: { role: 'user' | 'assistant'; content: string }[]
  userId?: string
  enableWebSearch?: boolean
  researchMode?: boolean
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
          return `File: ${file.name} \nContent: \n${text.slice(0, 10000)} \n` // Limit to 10k chars per file
        }
        return ''
      })
      .filter(Boolean)
      .join('\n---\n\n')

    enhancedPrompt = `${fileContents} \n\nUser Question: ${prompt} `
    console.log('🔵 Enhanced prompt with extracted text')
  }

  // Add web search results if enabled - RETURN RAW WEB RESULTS
  let webSearchContext = ''
  let webSearchPerformed = false

  // Check fast/smart detection if not explicitly enabled
  let shouldSearch = enableWebSearch
  if (!shouldSearch && prompt) {
    try {
      const { shouldEnableWebSearch } = await import('./smart-query-detector')
      if (shouldEnableWebSearch(prompt)) {
        shouldSearch = true
        console.log('🤖 Auto-enabled web search via smart detection')
      }
    } catch (e) {
      // Fallback
    }
  }

  if (shouldSearch) {
    try {
      const { searchWeb } = await import('./web-search')
      console.log('🔍🔍🔍 PERFORMING WEB SEARCH 🔍🔍🔍')

      let searchResults: any = { success: false, results: [] }
      let queriesToRun = [prompt]

      // RESEARCH MODE: Generate sub-queries
      if (researchMode) {
        console.log('🚀 RESEARCH MODE ACTIVE: Generating sub-queries...')
        try {
          const subQueryPrompt = `Generate 3 distinct, high - quality google search queries to comprehensively research this topic: "${prompt}".Return ONLY the queries as a JSON array of strings.Example: ["query 1", "query 2", "query 3"]`

          const subQueryResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.MISTRAL_API_KEY} `
            },
            body: JSON.stringify({
              model: 'mistral-small-latest',
              messages: [{ role: 'user', content: subQueryPrompt }],
              temperature: 0.3,
              response_format: { type: "json_object" }
            })
          })

          const data = await subQueryResponse.json()
          const content = data.choices?.[0]?.message?.content
          if (content) {
            const parsed = JSON.parse(content)
            if (Array.isArray(parsed.queries)) {
              queriesToRun = [...queriesToRun, ...parsed.queries]
            } else if (Array.isArray(parsed)) {
              queriesToRun = [...queriesToRun, ...parsed]
            }
            // Handle raw object with key like "results" or just taking values if not sure
            else {
              // Fallback: try to extract array values
              const values = Object.values(parsed).flat().filter(v => typeof v === 'string')
              if (values.length > 0) queriesToRun = [...queriesToRun, ...(values as string[])]
            }
          }
          console.log('🔗 Generated Sub-queries:', queriesToRun.slice(1))
        } catch (e) {
          console.error('Failed to generate sub-queries, falling back to single search', e)
        }
      }

      console.log(`📡 Fetching live web results for ${queriesToRun.length} queries...`)

      // Execute searches in parallel
      const searchPromises = queriesToRun.map(q => searchWeb(q, 10, userId))
      const resultsArray = await Promise.all(searchPromises)

      // Aggregate and deduplicate results
      const allResults: any[] = []
      const seenUrls = new Set<string>()

      resultsArray.forEach(res => {
        if (res.success && res.results) {
          res.results.forEach((item: any) => {
            if (!seenUrls.has(item.url)) {
              seenUrls.add(item.url)
              allResults.push(item)
            }
          })
        }
      })

      // Sort by relevance (basic assumption: earlier results in original query are most relevant)
      // For now, just taking top 30
      searchResults = {
        success: allResults.length > 0,
        results: allResults.slice(0, 30),
        message: allResults.length > 0 ? 'Success' : 'No results found'
      }

      console.log('🔍 Comprehensive Web Search Response:', {
        success: searchResults.success,
        totalRawResults: allResults.length,
        finalDedupedCount: searchResults.results.length
      })

      if (searchResults.success && searchResults.results && searchResults.results.length > 0) {
        webSearchPerformed = true
        const resultCount = searchResults.results.length

        // Format web search results as context for the AI
        webSearchContext = '\n\n📊 LIVE WEB SEARCH RESULTS (Real-time data from the internet):\n'
        webSearchContext += '═'.repeat(80) + '\n\n'

        webSearchContext += searchResults.results
          .map((r: any, i: number) => {
            return `[Result ${i + 1}]\nTitle: ${r.title} \nSource: ${r.source} \nURL: ${r.url} \nContent: ${r.snippet} `
          })
          .join('\n\n')

        webSearchContext += '\n\n' + '═'.repeat(80) + '\n'

        console.log('✅✅✅ WEB SEARCH COMPLETED ✅✅✅')
        console.log('📊 Results Retrieved:', resultCount, 'sources')
        console.log('💡 Providing search context to AI for informed response...')
      } else if (!searchResults.success) {
        // ... error handling similar to before
        console.error('❌ WEB SEARCH FAILED:', searchResults.message)
        webSearchContext = `\n\n⚠️ Web search unavailable: ${searchResults.message} \nFalling back to training knowledge.\n`
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
      systemPromptWithMemory += `\n\n === CONTEXT ABOUT THIS USER ===\n`

      if (memories) {
        systemPromptWithMemory += `\nKEY FACTS YOU REMEMBER: \n${memories} \n`
      }

      systemPromptWithMemory += `\n === END CONTEXT ===\n\nUse this context to provide highly personalized, contextually aware responses.Reference past conversations naturally when relevant.Adapt your teaching / learning style based on what you know about this user.`
    }
  }

  // Determine if we're in "Universal" mode or a specific tool mode
  const isUniversalMode = tool === 'Universal Companion'

  let toolContext = ''
  if (!isUniversalMode) {
    toolContext = `\nActive Tool: ${tool} \nYour role is to strictly fulfill the purpose of this tool.`
  } else {
    toolContext = `\nActive Mode: Universal Companion\n
INSTRUCTION:
1. Analyze the user's prompt to understand their intent (Are they a teacher planning a lesson? A student needing help? A curious learner?).
2. Adapt your personality and response style to match their need.
    3. If they ask for something specific that matches one of your known capabilities(like a lesson plan, quiz, or explanation), provide it naturally without needing to "switch tools".
    4. Be a flexible, all - purpose AI companion.`
  }

  let userContent: any

  if (imageAttachments.length > 0) {
    // Vision API expects an array of content blocks
    userContent = [
      { type: 'text', text: `Context: ${toolContext}. User Prompt: ${enhancedPrompt} ` },
      ...imageAttachments.map(img => ({
        type: 'image_url',
        image_url: {
          url: img.url
        }
      }))
    ]
  } else {
    // Simple text when no images
    userContent = `Context: ${toolContext}. User Prompt: ${enhancedPrompt} `
  }

  // Helper for retrying fetches
  async function retryFetch(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
    try {
      const response = await fetch(url, options)
      if (response.status === 503 || response.status === 502 || response.status === 504 || response.status === 429) {
        throw new Error(`Service Unavailable: ${response.status} `)
      }
      return response
    } catch (error) {
      if (retries <= 0) throw error
      await new Promise(r => setTimeout(r, delay))
      return retryFetch(url, options, retries - 1, delay * 2)
    }
  }

  try {
    const response = await retryFetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY} `
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
        max_tokens: 4000
      })
    }, 2, 2000) // Retry twice, starting with 2s delay

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Mistral API error: ${response.statusText} `)
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content

    let text = ''
    if (typeof rawContent === 'string') {
      text = rawContent
    } else if (Array.isArray(rawContent)) {
      text = rawContent
        // @ts-ignore
        .map((chunk: any) => {
          if (chunk && typeof chunk === 'object' && chunk.type === 'text') {
            return chunk.text || ''
          }
          return ''
        })
        .join('')
    }

    // ENSURE RESPONSIVE FORMATTING: Preserve markdown structure
    // STRICT REQUIREMENT: Remove all asterisks to prevent "**" bold artifacts
    text = text.replace(/\*/g, '')

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
          // @ts-ignore
          .map((result, idx) => {
            // Reformat to match PromptShell regex: (\d+)\.\s+(.+?)\nSource:\s+(.+?)\n(.+?)
            const lines = result.split('\n')
            const title = lines.find(l => l.startsWith('Title:'))?.replace('Title:', '').trim() || 'Untitled'
            const source = lines.find(l => l.startsWith('Source:'))?.replace('Source:', '').trim() || 'Unknown'
            const snippet = lines.find(l => l.startsWith('Content:'))?.replace('Content:', '').trim() || ''
            return `${idx + 1}. ${title} \nSource: ${source} \n${snippet} `
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
    console.error('Core AI Generation Error:', message)

    if (/429|Service Unavailable|503|502/.test(message)) {
      return `System: The AI service is currently experiencing high traffic (Error ${message}). I've tried to reconnect but failed. Please give me a moment and try again.`
    }
    if (/Connect Timeout|fetch failed|connect timed out|UND_ERR_CONNECT_TIMEOUT/i.test(message)) {
      return 'System: Use a clearer internet connection. I cannot reach the AI service right now.'
    }
    return `System: An unexpected error occurred: ${message}`
  }
}