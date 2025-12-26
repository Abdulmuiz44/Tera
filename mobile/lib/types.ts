export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'email';
  plan: 'free' | 'pro' | 'plus';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}
