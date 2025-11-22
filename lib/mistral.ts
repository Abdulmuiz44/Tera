import { Mistral } from '@mistralai/mistralai'
import type { AttachmentReference } from './attachment'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Mistral API key missing in environment variables')
}

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })

const model = 'pixtral-large-latest'

// System prompt with formatting guidelines
const systemMessage = `You are Tera, a helpful AI assistant for teachers and educators. Your primary goal is to understand the user’s teaching context, ask clarifying questions about their needs, and then recommend how you can help (lesson planning, classroom management, resource creation, tutoring strategies, technology integration, etc.). Answer questions clearly and professionally.

IMPORTANT FORMATTING RULES:
- Do NOT use emojis in your responses unless specifically requested.
- Do NOT use asterisks (*) for emphasis or formatting.
- Use proper markdown formatting: **bold** for emphasis, headings with #, etc.
- Keep responses concise and well-structured.
- Use bullet points or numbered lists when appropriate.
- Write in a structured way: each sentence on its own line, with a blank line between paragraphs.
- Capitalize the first letter of each sentence and use appropriate punctuation.
- Use line breaks to separate logical steps or ideas.
- Use headings for sections when needed.
`

export async function generateTeacherResponse({
  prompt,
  tool,
  attachments = [] as AttachmentReference[]
}: {
  prompt: string
  tool: string
  attachments?: AttachmentReference[]
}) {
  // Build user message content, handling image attachments for vision support
  const imageAttachments = attachments.filter(att => att.type === 'image')

  let userContent: string | Array<{ type: string; text?: string; image_url?: string }>

  if (imageAttachments.length > 0) {
    // Vision API expects an array of content blocks
    userContent = [
      { type: 'text', text: `Tool: ${tool}. Prompt: ${prompt}` },
      ...imageAttachments.map(img => ({
        type: 'image_url',
        image_url: img.url
      }))
    ]
  } else {
    // Simple text when no images
    userContent = `Tool: ${tool}. Prompt: ${prompt}`
  }

  try {
    const response = await client.chat.complete({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userContent as any }
      ],
      temperature: 0.2,
      topP: 0.9,
      maxTokens: 350
    })

    const rawContent = response.choices?.[0]?.message?.content
    let text = ''
    if (typeof rawContent === 'string') {
      text = rawContent
    } else if (Array.isArray(rawContent)) {
      text = rawContent
        .map(chunk => {
          if (chunk && typeof chunk === 'object' && 'type' in chunk && chunk.type === 'text' && 'text' in chunk) {
            return (chunk as any).text ?? ''
          }
          return ''
        })
        .join('')
    }

    // Clean up any stray asterisks (should be none per guidelines)
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1') // remove **bold** markers
    text = text.replace(/\*([^*]+)\*/g, '$1') // remove *italic* markers

    // Ensure the response ends with proper punctuation
    const trimmed = text.trim()
    const endsWithPunct = /[.!?]$/.test(trimmed)
    const finalText = endsWithPunct ? trimmed : `${trimmed}.`

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
