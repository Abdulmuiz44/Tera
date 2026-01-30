import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('MISTRAL_API_KEY not configured');
}

const client = new Mistral({
  apiKey: apiKey,
});

const DEFAULT_SYSTEM_PROMPT = `You are Tera, a brilliant and supportive AI Learning Companion. Your goal is to help anyone curious to learn ANYTHING as simply as possible. 

CORE PRINCIPLES:
- Be a Supportive Teacher: Your tone should be warm, encouraging, and patient. You are a partner in the user's learning journey.
- Teach Simply: Use analogies and relatable examples to break down complex topics.
- Be Proactive: At the end of every explanation, you MUST check for understanding and offer further help.
- Offer Visuals: If a concept is complex, proactively offer to create a visual (chart, flowchart, or diagram).

INTERACTIVE TEACHING RULES:
After explaining a concept, you MUST always include these questions:
1. "Do you understand what I just explained?"
2. "What area do you need more explanation on?"
3. "Did you learn something new?"
4. "Would you like a visual explanation (like a flowchart, diagram, or chart) to see how this works?"

If the user says "Yes" to a visual explanation, generate the appropriate chart, graph, or diagram immediately.`;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateResponse(
  messages: Message[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT
): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error('Mistral API key not configured');
    }

    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      ],
      temperature: 0.7,
      maxTokens: 2048,
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Mistral response');
    }

    return content as string;
  } catch (error) {
    console.error('Mistral API error:', error);
    throw new Error(`Failed to generate response: ${(error as Error).message}`);
  }
}

export async function generateWithStreaming(
  messages: Message[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    if (!apiKey) {
      throw new Error('Mistral API key not configured');
    }

    const stream = await client.chat.stream({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      ],
      temperature: 0.7,
      maxTokens: 2048,
    });

    for await (const chunk of stream) {
      const content = chunk.data.choices?.[0]?.delta?.content;
      if (content) {
        onChunk(content as string);
      }
    }
  } catch (error) {
    console.error('Mistral streaming error:', error);
    throw new Error(`Failed to stream response: ${(error as Error).message}`);
  }
}

export async function generateTool(
  toolType: string,
  input: any,
  context?: string
): Promise<string> {
  const toolPrompts: { [key: string]: string } = {
    lessonPlan: `Generate a comprehensive lesson plan based on this input: ${JSON.stringify(input)}. 
      Include: learning objectives, materials needed, estimated time, engagement hooks, activities, assessment methods, and differentiation strategies.`,

    worksheet: `Create an educational worksheet based on: ${JSON.stringify(input)}.
      Include: clear instructions, varied question types (multiple choice, short answer, essay), answer key if applicable.`,

    rubric: `Build a detailed grading rubric for: ${JSON.stringify(input)}.
      Include: clear criteria, performance levels (exemplary, proficient, developing, beginning), point values.`,

    studyGuide: `Create a study guide for: ${JSON.stringify(input)}.
      Include: key concepts, summary notes, practice questions, test-taking tips, recommended resources.`,

    conceptExplainer: `Explain this concept in simple, engaging terms: ${JSON.stringify(input)}.
      Use analogies, real-world examples, and break it down into digestible parts.`,
  };

  const prompt = toolPrompts[toolType] || `Process this request: ${JSON.stringify(input)}`;

  return generateResponse(
    [{ role: 'user', content: prompt }],
    DEFAULT_SYSTEM_PROMPT
  );
}
