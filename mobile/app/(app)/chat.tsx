import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { teraAPI } from '@/lib/api';
import { saveMessage, getMessages, saveSession } from '@/lib/storage';
import ChatBubble from '@/components/ChatBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [initialized, setInitialized] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (!initialized) {
        initializeChat();
      }
    }, [initialized])
  );

  const initializeChat = async () => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');

      if (!userId) {
        console.error('No user ID found');
        return;
      }

      // Create new session
      const session = await teraAPI.createSession('New Chat');

      if (session.success && session.data) {
        const newSessionId = session.data[0]?.id || Math.random().toString();
        setSessionId(newSessionId);

        // Save session locally
        await saveSession({
          id: newSessionId,
          title: 'New Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        setMessages([]);
        setInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setInitialized(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !sessionId) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Create message object
    const messageId = Math.random().toString();
    const userMsg: Message = {
      id: messageId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    // Add to UI immediately
    setMessages(prev => [...prev, userMsg]);

    // Save to local storage
    await saveMessage(sessionId, userMsg);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      setLoading(true);

      // Send to API
      const response = await teraAPI.sendMessage(
        sessionId,
        userMessage,
        messages.map(m => ({
          role: m.role,
          content: m.content,
        }))
      );

      if (response.success && response.data?.message) {
        const assistantMsg: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: response.data.message,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, assistantMsg]);

        // Save to local storage
        await saveMessage(sessionId, assistantMsg);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        // Show error message
        const errorMsg: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: 'Sorry, I could not process your message. Please try again.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      const errorMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
      >
        {messages.length === 0 && !initialized ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00d4ff" />
            <Text style={styles.loadingText}>Starting chat...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySubtitle}>
              Ask me anything about learning or teaching
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => (
              <ChatBubble role={item.role} content={item.content} />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messages}
            scrollEnabled={true}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message Tera..."
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={100}
            editable={!loading && initialized}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (loading || !inputText.trim() || !initialized) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={loading || !inputText.trim() || !initialized}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  messages: {
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderTopColor: '#222',
    borderTopWidth: 1,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#00d4ff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 18,
  },
});
