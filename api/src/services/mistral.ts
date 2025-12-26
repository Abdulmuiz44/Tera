import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('MISTRAL_API_KEY not configured');
}

const client = new Mistral({
  apiKey: apiKey,
});

const DEFAULT_SYSTEM_PROMPT = `You are Tera, a brilliant, supportive AI learning and teaching companion. 

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
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      systemPrompt: systemPrompt,
      temperature: 0.7,
      maxTokens: 2048,
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Mistral response');
    }

    return content;
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
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      systemPrompt: systemPrompt,
      temperature: 0.7,
      maxTokens: 2048,
    });

    for await (const chunk of stream) {
      const content = chunk.data.choices?.[0]?.delta?.content;
      if (content) {
        onChunk(content);
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
