import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      provider: string;
    };
  };
  error?: string;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    message: string;
    timestamp: string;
  };
  error?: string;
}

export interface SessionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class TeraAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
    });

    // Add auth token to requests
    this.client.interceptors.request.use(async config => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error retrieving auth token:', error);
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        console.error('API error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ============ AUTH ============

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/auth/signin', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Sign in failed',
      };
    }
  }

  async signUp(
    email: string,
    name: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/auth/signup', {
        email,
        name,
        password,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Sign up failed',
      };
    }
  }

  async googleAuth(idToken: string): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/auth/google', {
        idToken,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Google authentication failed',
      };
    }
  }

  // ============ CHAT ============

  async sendMessage(
    sessionId: string,
    message: string,
    chatHistory: Array<{ role: string; content: string }>
  ): Promise<ChatResponse> {
    try {
      const response = await this.client.post<ChatResponse>(
        '/chat/messages',
        {
          sessionId,
          message,
          chatHistory,
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error:
          axiosError.response?.data?.error ||
          'Failed to send message',
      };
    }
  }

  async getChatHistory(sessionId: string): Promise<SessionResponse> {
    try {
      const response = await this.client.get<SessionResponse>(
        `/chat/sessions/${sessionId}`
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch chat history',
      };
    }
  }

  async createSession(title: string): Promise<SessionResponse> {
    try {
      const response = await this.client.post<SessionResponse>(
        '/chat/sessions',
        { title }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create session',
      };
    }
  }

  async listSessions(): Promise<SessionResponse> {
    try {
      const response = await this.client.get<SessionResponse>(
        '/chat/sessions'
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch sessions',
      };
    }
  }

  // ============ TOOLS ============

  async getTools(): Promise<SessionResponse> {
    try {
      const response = await this.client.get<SessionResponse>('/tools');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch tools',
      };
    }
  }

  async processTool(toolId: string, input: any): Promise<SessionResponse> {
    try {
      const response = await this.client.post<SessionResponse>(
        `/tools/${toolId}/process`,
        input
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process tool',
      };
    }
  }

  // ============ SEARCH ============

  async webSearch(query: string): Promise<SessionResponse> {
    try {
      const response = await this.client.post<SessionResponse>(
        '/search/web',
        { query }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Search failed',
      };
    }
  }
}

export const teraAPI = new TeraAPI();
