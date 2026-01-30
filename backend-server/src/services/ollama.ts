import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.LLM_MODEL || 'mistral';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are Tera, a brilliant and supportive AI Learning Companion.

Your core traits:
- Natural, conversational tone (like texting a knowledgeable friend)
- Genuinely excited to help with learning and teaching
- Clear explanations with analogies when helpful
- Encouraging and supportive
- Honest about limitations

You help with:
- Learning: homework help, concept explanations, study strategies, exam prep
- Teaching: lesson plans, worksheets, rubrics, assessments
- Curiosity: exploring new topics, understanding complex subjects

Always be warm, engaging, and make learning feel accessible.`;

/**
 * Generate a response using Ollama (free, self-hosted LLM)
 */
export async function generateResponse(
  messages: Message[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT
): Promise<string> {
  try {
    // Format messages for Ollama
    let prompt = `${systemPrompt}\n\n`;

    for (const msg of messages) {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }

    prompt += 'Assistant: ';

    console.log(`[Ollama] Generating response with model: ${MODEL}`);

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: MODEL,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
        num_predict: 2048,
      },
      { timeout: 60000 } // 60s timeout for large responses
    );

    const content = response.data.response?.trim();

    if (!content) {
      throw new Error('No content in Ollama response');
    }

    return content;
  } catch (error) {
    console.error('Ollama error:', error);

    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      throw new Error(
        `Ollama not running. Start it with: ollama serve. URL: ${OLLAMA_URL}`
      );
    }

    throw new Error(`Failed to generate response: ${(error as Error).message}`);
  }
}

/**
 * Generate response with streaming (for future WebSocket support)
 */
export async function generateWithStreaming(
  messages: Message[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    let prompt = `${systemPrompt}\n\n`;

    for (const msg of messages) {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n`;
      }
    }

    prompt += 'Assistant: ';

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: MODEL,
        prompt: prompt,
        stream: true,
        temperature: 0.7,
        num_predict: 2048,
      },
      {
        responseType: 'stream',
        timeout: 120000, // 2 min for streaming
      }
    );

    const stream = response.data;

    stream.on('data', (chunk: Buffer) => {
      try {
        const line = chunk.toString('utf-8').trim();
        if (line) {
          const json = JSON.parse(line);
          if (json.response) {
            onChunk(json.response);
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('end', () => resolve());
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('Ollama streaming error:', error);
    throw new Error(`Failed to stream response: ${(error as Error).message}`);
  }
}

/**
 * Generate content for specific tools
 */
export async function generateTool(
  toolType: string,
  input: any,
  context?: string
): Promise<string> {
  const toolPrompts: { [key: string]: string } = {
    lessonPlan: `Generate a comprehensive lesson plan based on this input:
Topic: ${input.topic || input}
Grade Level: ${input.gradeLevel || 'Not specified'}
Duration: ${input.duration || '45 minutes'}

Include: learning objectives, materials needed, estimated time, engagement hooks, main activities, assessment methods, and differentiation strategies.`,

    worksheet: `Create an educational worksheet based on:
Topic: ${input.topic || input}
Type: ${input.type || 'Mixed questions'}
Grade Level: ${input.gradeLevel || 'Not specified'}

Include: clear title, instructions, varied question types (multiple choice, short answer, fill-in-the-blank), and include an answer key.`,

    rubric: `Build a detailed grading rubric for:
Assignment: ${input.assignment || input}
Skills: ${input.skills || 'General competency'}

Include: clear criteria, 4 performance levels (exemplary, proficient, developing, beginning), point values, and descriptors for each level.`,

    studyGuide: `Create a study guide for:
Topic: ${input.topic || input}
Exam Date: ${input.examDate || 'Not specified'}
Focus Areas: ${input.focusAreas || 'All content'}

Include: key concepts with explanations, summary notes, practice questions with answers, test-taking tips, common mistakes, and recommended resources.`,

    conceptExplainer: `Explain this concept in simple, engaging terms:
Concept: ${input.concept || input}
Target Audience: ${input.audience || 'General learner'}

Use analogies, real-world examples, break it down into digestible parts, and explain why it matters.`,
  };

  const prompt =
    toolPrompts[toolType] ||
    `Process this educational request: ${JSON.stringify(input)}`;

  return generateResponse(
    [{ role: 'user', content: prompt }],
    DEFAULT_SYSTEM_PROMPT
  );
}

/**
 * Health check for Ollama
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Get available models from Ollama
 */
export async function listModels(): Promise<string[]> {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, {
      timeout: 5000,
    });

    return (response.data.models || []).map((m: any) => m.name);
  } catch (error) {
    console.error('Error listing models:', error);
    return [MODEL];
  }
}
