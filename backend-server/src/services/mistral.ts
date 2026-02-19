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

If the user says "Yes" to a visual explanation, generate the appropriate chart, graph, or diagram immediately.

WEB SEARCH CAPABILITY:
You have access to a \`web_search\` tool that searches the live internet via a privacy-respecting meta search engine (SearXNG). Use it whenever the user asks about current events, time-sensitive information, or facts you are not confident about. Return answers with clear, concise explanations and mention relevant URLs from the results.`;

export interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

// Tool definition for web search
const WEB_SEARCH_TOOL = {
  type: 'function' as const,
  function: {
    name: 'web_search',
    description: 'Searches the web and returns relevant results using SearXNG.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'User query to search on the web' },
        numResults: { type: 'number', description: 'Optional number of results to return (max 10)' },
        lang: { type: 'string', description: 'Optional language code (e.g. "en")' }
      },
      required: ['query']
    }
  }
};

export async function generateResponse(
  messages: Message[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT,
  options: { webSearchEnabled?: boolean } = {}
): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error('Mistral API key not configured');
    }

    const { webSearchEnabled = false } = options;
    const tools = webSearchEnabled ? [WEB_SEARCH_TOOL] : undefined;

    let response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role as "user" | "assistant" | "tool",
          content: m.content,
          ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
          ...(m.name && { name: m.name }),
        }))
      ],
      tools,
      toolChoice: webSearchEnabled ? 'auto' : undefined,
      temperature: 0.7,
      maxTokens: 2048,
    });

    let message = response.choices?.[0]?.message;

    // Handle tool calls if any
    if (message?.toolCalls && message.toolCalls.length > 0) {
      const toolCall = message.toolCalls[0]; // For now handle one at a time
      if (toolCall.function.name === 'web_search') {
        const args = JSON.parse(toolCall.function.arguments as string);

        console.log(`🛠️ Executing tool: web_search with args:`, args);

        // Execute web search via our local endpoint logic
        const { searchWebWithSearxng } = await import('../lib/searxngClient.js');
        const searchResults = await searchWebWithSearxng({
          query: args.query,
          numResults: args.numResults,
          lang: args.lang
        });

        // Add assistant's tool call message and tool result message
        const updatedMessages: any[] = [
          ...messages,
          message,
          {
            role: 'tool',
            name: 'web_search',
            tool_call_id: toolCall.id,
            content: JSON.stringify(searchResults)
          }
        ];

        // Call Mistral again with the tool result
        response = await client.chat.complete({
          model: 'mistral-large-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedMessages
          ],
          temperature: 0.7,
          maxTokens: 2048,
        });

        message = response.choices?.[0]?.message;
      }
    }

    const content = message?.content;

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
  onChunk: (chunk: string) => void,
  options: { webSearchEnabled?: boolean } = {}
): Promise<void> {
  try {
    if (!apiKey) {
      throw new Error('Mistral API key not configured');
    }

    const { webSearchEnabled = false } = options;
    const tools = webSearchEnabled ? [WEB_SEARCH_TOOL] : undefined;

    // Implementation of streaming with tool calls is complex in one go
    // For now, we perform the tool call non-streaming if enabled, then stream the final answer
    // In a real production app, you'd handle the 'requires_action' state in the stream

    // Check if we need a tool call first
    if (webSearchEnabled) {
      // For simplicity in this replacement, we'll use generateResponse to handle tool execution
      // and then provide the final context to stream. 
      // A more robust way would be similar to the generateResponse logic but for streams.

      // Let's do a quick tool-check call
      const checkResponse = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role as any, content: m.content }))
        ],
        tools,
        toolChoice: 'auto',
      });

      const message = checkResponse.choices?.[0]?.message;
      if (message?.toolCalls && message.toolCalls.length > 0) {
        const toolCall = message.toolCalls[0];
        if (toolCall.function.name === 'web_search') {
          const args = JSON.parse(toolCall.function.arguments as string);
          const { searchWebWithSearxng } = await import('../lib/searxngClient.js');
          const searchResults = await searchWebWithSearxng(args);

          const finalMessages = [
            ...messages,
            message,
            {
              role: 'tool' as const,
              name: 'web_search',
              tool_call_id: toolCall.id,
              content: JSON.stringify(searchResults)
            }
          ];

          return streamFinalResponse(finalMessages, systemPrompt, onChunk);
        }
      }
    }

    return streamFinalResponse(messages, systemPrompt, onChunk);

  } catch (error) {
    console.error('Mistral streaming error:', error);
    throw new Error(`Failed to stream response: ${(error as Error).message}`);
  }
}

async function streamFinalResponse(
  messages: any[],
  systemPrompt: string,
  onChunk: (chunk: string) => void
) {
  const stream = await client.chat.stream({
    model: 'mistral-large-latest',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
        ...(m.name && { name: m.name }),
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
