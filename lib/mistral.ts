import { Mistral } from '@mistralai/mistralai'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Mistral API key missing in environment variables')
}

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })

const model = 'mistral-medium-latest'

export async function generateTeacherResponse({ prompt, tool }: { prompt: string; tool: string }) {
  const systemMessage = `You are TERA, a helpful AI assistant for teachers. Answer questions clearly and include teaching-oriented rationale.`
  const userMessage = `Tool: ${tool}. Prompt: ${prompt}`

  try {
    const response = await client.chat.complete({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
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
        .map((chunk) => {
          if (chunk && 'type' in chunk && chunk.type === 'text' && 'text' in chunk) {
            return chunk.text ?? ''
          }
          return ''
        })
        .join('')
    }

    return text.trim() || `TERA couldn't build a response for ${tool}.`
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/429/.test(message)) {
      return 'TERA is currently rate limited by Mistral. Please wait a moment and try again.'
    }
    if (/Connect Timeout|fetch failed|connect timed out|UND_ERR_CONNECT_TIMEOUT/i.test(message)) {
      return 'TERA cannot reach Mistral right now due to a network timeout. Please check your connection or try again shortly.'
    }
    throw error
  }
}
