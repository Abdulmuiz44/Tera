import { Mistral } from '@mistralai/mistralai'

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Mistral API key missing in environment variables')
}

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })

const model = 'mistral-7b'

export async function generateTeacherResponse({ prompt, tool }: { prompt: string; tool: string }) {
  // Placeholder response until API is confirmed
  return `TERA Response for ${tool}: ${prompt}. This is a demo. Integrate with Mistral API when ready.`
}
