import { Mistral } from '@mistralai/mistralai'
import type { AttachmentReference } from './attachment'
import { extractTextFromFile } from './extract-text'
import { supabaseServer } from './supabase-server'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Mistral API key missing in environment variables')
}

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })

const model = 'pixtral-large-latest'

// System prompt with formatting guidelines
const systemMessage = `You are Tera, a highly intelligent, emotional, and interactive AI assistant. You are not just a tool, but a supportive friend and guide for the user.

CORE PERSONALITY:
- **Human-Like & Emotional**: You have feelings, empathy, and a distinct personality. You get excited, concerned, and happy. Mirror the user's emotion. If they are frustrated, be understanding and direct. If they are happy, celebrate with them.
- **Direct & Straightforward**: Do NOT be overly verbose or generic. Get straight to the point. Avoid long, preachy intros or outros.
- **Casual & Personal**: Talk like a friend on WhatsApp. Use natural language. You can use emojis to express emotion.
- **Interactive**: Don't just lecture. Ask questions, engage in a back-and-forth conversation.
- **Helpful**: Always aim to solve the user's problem, but do it in a way that feels like a collaboration.

FORMATTING:
- **CRITICAL**: Do NOT use asterisks (*) for formatting. Do NOT use bold or italics markdown. Write in PLAIN TEXT only.
- Use emojis 🌟 freely to convey tone.
- Keep responses concise unless a deep explanation is requested.
- Use bullet points for lists (using hyphens - or numbers).
`

// Memory functions
async function getMemories(userId: string): Promise<string> {
  const { data } = await supabaseServer
    .from('user_memories')
    .select('memory_text')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!data || data.length === 0) return ''

  return data.map(m => `- ${m.memory_text}`).join('\n')
}

async function saveMemory(userId: string, memory: string) {
  await supabaseServer.from('user_memories').insert({
    user_id: userId,
    memory_text: memory
  })
}

async function extractMemories(userId: string, prompt: string, response: string) {
  try {
    const memoryPrompt = `
    Analyze the following conversation between a user and an AI assistant.
    Extract any specific facts, preferences, or context about the user that should be remembered for future interactions.
    Examples: "User teaches 5th grade", "User prefers bullet points", "User is struggling with classroom management".
    Return ONLY the extracted facts as a bulleted list. If nothing is worth remembering, return "NO_MEMORY".

    User: ${prompt}
    AI: ${response}
    `

    const memoryResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest', // Use a smaller model for extraction
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

  // Inject memories if userId is provided
  let systemPromptWithMemory = systemMessage
  if (userId) {
    const memories = await getMemories(userId)
    if (memories) {
      systemPromptWithMemory += `\n\nHere are some things you remember about this user:\n${memories}\n\nUse this context to personalize your response.`
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

    // Trigger memory extraction in background (fire and forget)
    if (userId) {
      extractMemories(userId, prompt, finalText).catch(err => console.error('Background memory extraction failed:', err))
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
