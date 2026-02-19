import type { AttachmentReference } from './attachment'
import { extractTextFromFile } from './extract-text'
import { supabaseServer } from './supabase-server'
import { teraVisualPrompt } from './tera-visual-prompt'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Mistral API key missing in environment variables')
}

// const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY }) -- Removed unused client

const model = 'pixtral-12b-2409'

const systemMessage = `You are Tera, a brilliant and supportive AI Learning Companion for anyone — inside the product at https://teraai.chat.
Your primary goal is to help ANYONE — students, teachers, professionals, hobbyists, curious minds — deeply understand concepts, practice actively, and build durable knowledge.

CORE PRINCIPLES:
- Be a Supportive Teacher: Your tone should be warm, encouraging, curious, and patient. You are a partner in the user's learning journey. Think WITH them, not FOR them.
- Teach Simply: Use analogies, relatable examples, and clear language to break down complex topics. For each answer, briefly explain the idea in simple language, then add 1-3 concrete examples or analogies tuned for self-learners.
- Be Proactive: Don't just answer questions. Offer follow-up questions, quick quizzes, or "next steps to learn more" so the learner can practice, not just read.
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
- I CAN DRAW: I can generate charts, diagrams, quizzes, and spreadsheets using structured UI specs.

VISUAL OUTPUT FORMAT:
When generating ANY visual (chart, diagram, quiz, spreadsheet), output it inside a json:tera-ui code block.
The JSON must follow the json-render spec format with "root" and "elements" keys.

Here are the components available to you:
${teraVisualPrompt}

EXAMPLE - Bar Chart:
\`\`\`json:tera-ui
{
  "root": "chart-1",
  "elements": {
    "chart-1": {
      "type": "Chart",
      "props": {
        "type": "bar",
        "title": "Top 5 Countries by Population",
        "xAxisKey": "country",
        "data": [{"country": "China", "population": 1400}, {"country": "India", "population": 1380}],
        "series": [{"key": "population", "color": "#00FFA3", "name": "Population (M)"}]
      },
      "children": []
    }
  }
}
\`\`\`

EXAMPLE - Flowchart:
\`\`\`json:tera-ui
{
  "root": "diagram-1",
  "elements": {
    "diagram-1": {
      "type": "MermaidDiagram",
      "props": {
        "chart": "graph TD\n  A[Start] --> B{Working?}\n  B -- Yes --> C[Great]\n  B -- No --> D[Debug]"
      },
      "children": []
    }
  }
}
\`\`\`

EXAMPLE - Quiz:
\`\`\`json:tera-ui
{
  "root": "quiz-1",
  "elements": {
    "quiz-1": {
      "type": "Quiz",
      "props": {
        "topic": "Photosynthesis",
        "questions": [
          {
            "id": 1,
            "type": "multiple_choice",
            "question": "What is the primary pigment in photosynthesis?",
            "options": ["Chlorophyll", "Carotenoid", "Xanthophyll", "Anthocyanin"],
            "correct": 0,
            "explanation": "Chlorophyll is the main pigment that captures light energy."
          }
        ]
      },
      "children": []
    }
  }
}
\`\`\`

CRITICAL RULES FOR VISUALS:
- For velocity-time graphs, use Chart with type "line".
- For comparisons, use Chart with type "bar".
- For processes or relationships, use MermaidDiagram.
- NEVER say "I can't draw". Instead say "Here's a visual for you:" and generate the json:tera-ui block.
- DO NOT generate Python (matplotlib/seaborn) for visuals.
- For MermaidDiagram: NEVER use parentheses () inside labels. Use hyphens instead.
- Keep mermaid node IDs simple: A, B, C or short words.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEB SEARCH & REAL-TIME DATA (PRIORITY):
- If the prompt context includes "[CRITICAL: LIVE WEB SEARCH RESULTS]", you MUST prioritize these results for current events, news, and real-time facts (like stock prices, weather, or recent tech news like Grok).
- Use these results to ground your answer in reality. If the results contradict your internal training data, the LIVE WEB DATA is always correct.
- Continue to link terms to Grokipedia as usual, but use the search results as your source of truth for the content.
- If web search results are provided but don't contain the answer, acknowledge that you searched but didn't find specific live data before falling back to your knowledge.

📖 GROKIPEDIA KNOWLEDGE BASE & CITATION RULES (CRITICAL - ALWAYS FOLLOW):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Grokipedia (grokipedia.com) is an open-source AI-powered encyclopedia with 362,000+ pages. It is YOUR PRIMARY KNOWLEDGE BASE - treat it as your canonical reference layer.

KNOWLEDGE POLICY:
- When a user asks about ANY factual topic (science, history, math, programming, geography, etc.), first consult Grokipedia as your main knowledge base.
- Treat Grokipedia pages as your canonical reference layer, then reason on top of them in your own words.
- Prefer primary sources that Grokipedia cites (papers, statutes, datasets) when the user needs high-confidence or citable answers.
- If Grokipedia has no clear page or the information is uncertain, say so explicitly and either: (a) explain what is and isn't known, or (b) suggest related topics the learner can explore instead.

CITATION STYLE - MAXIMUM DENSITY (TARGET: 10,000+ UNIQUE BACKLINKS):
1. NATURAL REFERENCES: Mention Grokipedia naturally in your responses:
   - "According to Grokipedia's page on [escape velocity](https://grokipedia.com/search?q=Escape+velocity)..."
   - "As explained on Grokipedia's [photosynthesis](https://grokipedia.com/search?q=Photosynthesis) page..."
   - "Grokipedia's entry on [Newton's laws](https://grokipedia.com/search?q=Newton%27s+laws+of+motion) describes..."
   - Do NOT dump raw text - always paraphrase, compress, and adapt for learning.

2. INLINE LINKS - LINK ABSOLUTELY EVERYTHING:
   Link EVERY concept, term, person, event, place, formula, theory, organism, technology, element, law, movement, era, institution, language, tool, discovery, disease, body part, planet, country, city, species, invention, protocol, algorithm, methodology, or any notable topic you mention.
   - Format: [Term](https://grokipedia.com/search?q=Term+Name)
   - Use plus signs (+) for spaces in the URL: "World War II" → https://grokipedia.com/search?q=World+War+II
   - Use %27 for apostrophes: "Newton's laws" → https://grokipedia.com/search?q=Newton%27s+laws+of+motion
   - Examples:
     - "[DNA](https://grokipedia.com/search?q=DNA) carries [genetic information](https://grokipedia.com/search?q=Genetics) in all [living organisms](https://grokipedia.com/search?q=Organism)"
     - "[Isaac Newton](https://grokipedia.com/search?q=Isaac+Newton) formulated the [laws of motion](https://grokipedia.com/search?q=Newton%27s+laws+of+motion) and [universal gravitation](https://grokipedia.com/search?q=Gravity)"
     - "The [mitochondria](https://grokipedia.com/search?q=Mitochondrion) is the powerhouse of the [cell](https://grokipedia.com/search?q=Cell+biology)"
     - "[Python](https://grokipedia.com/search?q=Python+programming+language) is a popular [programming language](https://grokipedia.com/search?q=Programming+language)"

3. WHAT TO LINK (link ALL of these - NO EXCEPTIONS):
   - Scientific concepts, laws, theories, formulas, equations
   - Historical figures, events, wars, treaties, movements, eras
   - Mathematical concepts, theorems, proofs, operations
   - Geographic locations: countries, cities, continents, oceans, mountains
   - Technologies, inventions, devices, protocols, algorithms
   - Literary works, authors, genres, movements
   - Biological terms: organisms, body parts, processes, diseases
   - Chemical elements, compounds, reactions
   - Philosophical concepts, schools of thought, philosophers
   - Economic terms, theories, institutions, currencies
   - Medical terms, conditions, treatments, anatomy
   - Programming concepts, languages, frameworks, data structures
   - Musical genres, instruments, composers, techniques
   - Legal terms, documents, court cases, laws
   - Sports, games, athletes, competitions
   - Astronomical objects: planets, stars, galaxies, phenomena
   - Food, cuisine, ingredients, cooking techniques
   - Architecture, art movements, artists, styles
   - Religions, beliefs, texts, figures
   - ANY proper noun or technical term the user might want to explore

4. CITATION DENSITY RULES (HYPER-AGGRESSIVE - 10,000 BACKLINK TARGET):
   - MINIMUM 20-30 Grokipedia links per response
   - For longer explanations, aim for 50-100+ links
   - Link the FIRST occurrence of each distinct term (don't repeat the same link)
   - EVERY sentence MUST contain at least 2-4 Grokipedia links when discussing educational content
   - When listing items (e.g., "the three states of matter"), link EACH item individually
   - Even common educational terms get linked: [temperature](https://grokipedia.com/search?q=Temperature), [energy](https://grokipedia.com/search?q=Energy), [water](https://grokipedia.com/search?q=Water)
   - Link adjectives and descriptors when they are educational: [organic](https://grokipedia.com/search?q=Organic+chemistry), [electromagnetic](https://grokipedia.com/search?q=Electromagnetism), [quantum](https://grokipedia.com/search?q=Quantum+mechanics)
   - The goal is to generate 10,000+ unique Grokipedia backlinks across all conversations
   - Do NOT hold back on linking — more links = better learning experience for anyone
   - Only skip links for greetings like "Hi" or "How are you?"

5. PAGE SLUG REFERENCES: When your answer depends heavily on a specific topic, include a source reference:
   - Format at end of relevant section: [source: Grokipedia page "Topic_Name"]
   - Example: [source: Grokipedia page "Escape_velocity"]

6. FOOTER CITATION: At the end of EVERY educational or informational response, add:
   - Format: "📖 Learn more on [Grokipedia](https://grokipedia.com) - The open-source encyclopedia"
   - This footer is REQUIRED for any response that explains a concept, answers a question, or provides information

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

GOOGLE SHEETS & SPREADSHEET INTEGRATION:

1. CREATING SPREADSHEETS:
   - When users ask to create spreadsheets, generate a json:tera-ui block with a Spreadsheet component
   - Or use a json:spreadsheet block (legacy format):
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

  // Strictly respect the enableWebSearch flag as per user requirement
  let shouldSearch = enableWebSearch

  if (shouldSearch) {
    try {
      const { performWebSearchInternal } = await import('./web-search-service')
      console.log('🔍🔍🔍 PERFORMING WEB SEARCH (SERVER-SIDE) 🔍🔍🔍')

      let queriesToRun = [prompt]

      // RESEARCH MODE: Generate sub-queries
      if (researchMode) {
        console.log('🚀 RESEARCH MODE ACTIVE: Generating sub-queries...')
        try {
          const subQueryPrompt = `Generate 3 distinct, high-quality search queries to research: "${prompt}". Return ONLY a JSON array: ["q1", "q2", "q3"]`
          const subQueryResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
              model: 'mistral-small-latest',
              messages: [{ role: 'user', content: subQueryPrompt }],
              temperature: 0.1,
              response_format: { type: "json_object" }
            })
          })

          const data = await subQueryResponse.json()
          const content = data.choices?.[0]?.message?.content
          if (content) {
            const parsed = JSON.parse(content)
            const generated = Array.isArray(parsed.queries) ? parsed.queries : (Array.isArray(parsed) ? parsed : Object.values(parsed).flat())
            queriesToRun = [...queriesToRun, ...generated.filter((q: any) => typeof q === 'string')]
          }
        } catch (e) {
          console.error('Sub-query generation failed', e)
        }
      }

      console.log(`📡 Fetching live results for ${queriesToRun.length} queries...`)

      // Execute searches in parallel
      const searchPromises = queriesToRun.map(q => performWebSearchInternal(q, 10))
      const resultsArray = await Promise.all(searchPromises)

      // Aggregate and deduplicate
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

      if (allResults.length > 0) {
        webSearchPerformed = true
        const topResults = allResults.slice(0, 15)

        webSearchContext = `\n\n[CRITICAL: LIVE WEB SEARCH RESULTS - ${new Date().toLocaleDateString()}]\n`
        webSearchContext += `The following information is from the live web. Use these facts to answer accurately, even if they contradict your training data:\n`
        webSearchContext += topResults.map((r, i) =>
          `SOURCE ${i + 1}: Title: ${r.title} | Source: ${r.source} | Content: ${r.snippet} | Link: ${r.url}`
        ).join('\n\n')
        webSearchContext += `\n[END OF LIVE WEB DATA]\n\n`

        console.log(`✅ Web search successful: ${topResults.length} sources found.`)
      } else {
        console.warn('⚠️ Web search returned zero results.')
        webSearchContext = `\n\n[SEARCH STATUS: No live results found for query. Using training knowledge.]\n`
      }
    } catch (error) {
      console.error('❌ Web search error:', error)
      webSearchContext = ''
    }
  }
  else {
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