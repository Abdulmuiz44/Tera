// Shared types between API and mobile app

export interface ChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'email';
  plan: 'free' | 'pro' | 'plus';
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthToken {
  token: string;
  user: User;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  chatHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface SendMessageResponse {
  message: string;
  timestamp: Date;
}
