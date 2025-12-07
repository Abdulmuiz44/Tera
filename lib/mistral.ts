// import { Mistral } from '@mistralai/mistralai' -- Removed unused import
import type { AttachmentReference } from './attachment'
import { extractTextFromFile } from './extract-text'
import { supabaseServer } from './supabase-server'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Mistral API key missing in environment variables')
}

// const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY }) -- Removed unused client

const model = 'pixtral-large-latest'

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
  userId
}: {
  prompt: string
  tool: string
  attachments?: AttachmentReference[]
  history?: { role: 'user' | 'assistant'; content: string }[]
  userId?: string
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

  let userContent: any

  if (imageAttachments.length > 0) {
    // Vision API expects an array of content blocks
    userContent = [
      { type: 'text', text: `Tool: ${tool}. Prompt: ${enhancedPrompt}` },
      ...imageAttachments.map(img => ({
        type: 'image_url',
        image_url: {
          url: img.url
        }
      }))
    ]
  } else {
    // Simple text when no images
    userContent = `Tool: ${tool}. Prompt: ${enhancedPrompt}`
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
    const finalText = endsWithPunct ? trimmed : `${trimmed}.`

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
