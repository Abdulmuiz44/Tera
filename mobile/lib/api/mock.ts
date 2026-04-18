import { AuthSession, Conversation, SavedItem, TeraMode, User } from '@/types/domain';

const now = new Date();

export const mockUser: User = {
  id: 'user_tera_foundation',
  name: 'Tera Learner',
  email: 'learner@tera.ai',
  plan: 'free',
};

export const mockConversations: Conversation[] = [
  {
    id: 'conv_learning_systems',
    title: 'Understanding spaced repetition',
    mode: 'learn',
    summary: 'A clear breakdown of active recall, intervals, and review design.',
    updatedAt: new Date(now.getTime() - 1000 * 60 * 18).toISOString(),
    isSaved: true,
    messages: [
      {
        id: 'msg_1',
        conversationId: 'conv_learning_systems',
        role: 'user',
        content: 'Explain spaced repetition like I am building a study plan.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
        status: 'sent',
      },
      {
        id: 'msg_2',
        conversationId: 'conv_learning_systems',
        role: 'assistant',
        content: 'Spaced repetition works by reviewing an idea right before you are likely to forget it. For a study plan, treat each concept as a card: learn it once, test yourself soon, then widen the review interval when recall is strong.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 18).toISOString(),
        status: 'sent',
      },
    ],
  },
  {
    id: 'conv_research_brief',
    title: 'Research plan for climate adaptation',
    mode: 'research',
    summary: 'Questions, source types, and a structure for a focused brief.',
    updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    isSaved: false,
    messages: [
      {
        id: 'msg_3',
        conversationId: 'conv_research_brief',
        role: 'user',
        content: 'Help me research climate adaptation for coastal cities.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
        status: 'sent',
      },
    ],
  },
  {
    id: 'conv_build_learning_app',
    title: 'Build a quiz flow for biology',
    mode: 'build',
    summary: 'A practical outline for turning notes into a quiz experience.',
    updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    isSaved: true,
    messages: [
      {
        id: 'msg_4',
        conversationId: 'conv_build_learning_app',
        role: 'assistant',
        content: 'Start with learning goals, extract question candidates, then generate feedback for each wrong answer so the quiz teaches rather than only scores.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
        status: 'sent',
      },
    ],
  },
];

export const mockSavedItems: SavedItem[] = mockConversations
  .filter((conversation) => conversation.isSaved)
  .map((conversation) => ({
    id: `saved_${conversation.id}`,
    conversationId: conversation.id,
    title: conversation.title,
    excerpt: conversation.summary,
    mode: conversation.mode,
    savedAt: conversation.updatedAt,
  }));

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function modeAnswer(mode: TeraMode, prompt: string) {
  const opening = {
    learn: 'Here is the simplest useful model:',
    research: 'Here is a research-ready way to frame it:',
    build: 'Here is a practical build path:',
  }[mode];

  return `${opening} ${prompt.trim()} can be broken into the core idea, the evidence or constraints, and the next action. In the real backend, this response will come from TeraAI with streaming, citations, and memory-aware context.`;
}

export const mockApi = {
  async signIn(email: string): Promise<AuthSession> {
    return delay({
      token: 'mock_tera_mobile_token',
      user: {
        ...mockUser,
        email,
      },
    });
  },
  async signUp(name: string, email: string): Promise<AuthSession> {
    return delay({
      token: 'mock_tera_mobile_token',
      user: {
        ...mockUser,
        name,
        email,
      },
    });
  },
  async requestPasswordReset(): Promise<{ ok: true }> {
    return delay({ ok: true });
  },
  async getConversations(): Promise<Conversation[]> {
    return delay(mockConversations);
  },
  async getConversation(id: string): Promise<Conversation | null> {
    return delay(mockConversations.find((conversation) => conversation.id === id) ?? null);
  },
  async getSavedItems(): Promise<SavedItem[]> {
    return delay(mockSavedItems);
  },
  async sendMessage(conversationId: string, mode: TeraMode, prompt: string) {
    return delay({
      id: `msg_${Date.now()}`,
      conversationId,
      role: 'assistant' as const,
      content: modeAnswer(mode, prompt),
      createdAt: new Date().toISOString(),
      status: 'sent' as const,
    }, 520);
  },
};
