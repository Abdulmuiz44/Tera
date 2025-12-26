import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@tera_sessions';
const MESSAGES_PREFIX = '@tera_messages_';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

// ============ SESSIONS ============

export async function saveSession(session: Session): Promise<void> {
  try {
    const sessions = await getSessions();
    const existing = sessions.findIndex(s => s.id === session.id);

    if (existing >= 0) {
      sessions[existing] = session;
    } else {
      sessions.push(session);
    }

    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

export async function getSessions(): Promise<Session[]> {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessions = await getSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));

    // Also delete messages
    await AsyncStorage.removeItem(MESSAGES_PREFIX + sessionId);
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

// ============ MESSAGES ============

export async function saveMessage(
  sessionId: string,
  message: Message
): Promise<void> {
  try {
    const messages = await getMessages(sessionId);
    messages.push(message);
    await AsyncStorage.setItem(
      MESSAGES_PREFIX + sessionId,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

export async function getMessages(sessionId: string): Promise<Message[]> {
  try {
    const data = await AsyncStorage.getItem(MESSAGES_PREFIX + sessionId);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

export async function clearMessages(sessionId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(MESSAGES_PREFIX + sessionId);
  } catch (error) {
    console.error('Error clearing messages:', error);
  }
}

// ============ USER ============

export async function saveUser(userId: string, userData: any): Promise<void> {
  try {
    await AsyncStorage.setItem('@tera_user', JSON.stringify({ userId, ...userData }));
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

export async function getUser(): Promise<any> {
  try {
    const data = await AsyncStorage.getItem('@tera_user');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem('@tera_user');
  } catch (error) {
    console.error('Error clearing user:', error);
  }
}

// ============ GENERAL ============

export async function clearAllData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const teraKeys = keys.filter(key => key.startsWith('@tera_'));
    await AsyncStorage.multiRemove(teraKeys);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}
