import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Chat Messages
export async function saveChatMessage(
  userId: string,
  sessionId: string,
  message: { role: 'user' | 'assistant'; content: string }
) {
  const { data, error } = await supabase.from('chat_messages').insert([
    {
      user_id: userId,
      session_id: sessionId,
      role: message.role,
      content: message.content,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('Supabase error saving message:', error);
    throw error;
  }

  return data;
}

export async function getChatHistory(userId: string, sessionId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase error fetching chat history:', error);
    throw error;
  }

  return data || [];
}

// Chat Sessions
export async function createChatSession(userId: string, title: string) {
  const { data, error } = await supabase.from('chat_sessions').insert([
    {
      user_id: userId,
      title: title || 'New Chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('Supabase error creating session:', error);
    throw error;
  }

  return data;
}

export async function listChatSessions(userId: string) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Supabase error listing sessions:', error);
    throw error;
  }

  return data || [];
}

export async function updateSessionTitle(
  sessionId: string,
  title: string
) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) {
    console.error('Supabase error updating session:', error);
    throw error;
  }

  return data;
}

// Users
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows" error
    console.error('Supabase error fetching user:', error);
    throw error;
  }

  return data;
}

export async function createOrUpdateUser(userId: string, userData: any) {
  const { data, error } = await supabase.from('users').upsert([
    {
      id: userId,
      ...userData,
      updated_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('Supabase error creating/updating user:', error);
    throw error;
  }

  return data;
}
