import { useMutation, useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { EmptyState, LoadingState, Screen, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { Composer } from '@/features/chat/Composer';
import { MessageBubble } from '@/features/chat/MessageBubble';
import { useKeyboardInsets } from '@/hooks/useKeyboardInsets';
import { teraApi } from '@/lib/api/client';
import { useAppStore } from '@/store/app-store';
import { Message } from '@/types/domain';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const selectedMode = useAppStore((state) => state.selectedMode);
  const keyboard = useKeyboardInsets();
  const conversation = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => teraApi.getConversation(id),
    enabled: Boolean(id),
  });
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const messages = useMemo(
    () => [...(conversation.data?.messages ?? []), ...localMessages],
    [conversation.data?.messages, localMessages],
  );

  const sendMessage = useMutation({
    mutationFn: (prompt: string) => teraApi.sendMessage(id, conversation.data?.mode ?? selectedMode, prompt),
    onMutate: (prompt) => {
      const userMessage: Message = {
        id: `local_${Date.now()}`,
        conversationId: id,
        role: 'user',
        content: prompt,
        createdAt: new Date().toISOString(),
        status: 'sent',
      };
      const streamingMessage: Message = {
        id: `streaming_${Date.now()}`,
        conversationId: id,
        role: 'assistant',
        content: 'Tera is preparing a learning-focused answer...',
        createdAt: new Date().toISOString(),
        status: 'streaming',
      };
      setLocalMessages((current) => [...current, userMessage, streamingMessage]);
    },
    onSuccess: (assistantMessage) => {
      setLocalMessages((current) => [
        ...current.filter((message) => message.status !== 'streaming'),
        assistantMessage,
      ]);
    },
    onError: () => {
      setLocalMessages((current) =>
        current.map((message) =>
          message.status === 'streaming'
            ? {
                ...message,
                content: 'Tera could not answer right now. Check your connection and try again.',
                status: 'failed',
              }
            : message,
        ),
      );
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: conversation.data?.title ?? 'Conversation' }} />
      <Screen insetBottom={false}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={keyboard.behavior}
          keyboardVerticalOffset={keyboard.keyboardVerticalOffset}
        >
          <View style={styles.header}>
            <Text variant="h2" numberOfLines={2}>{conversation.data?.title ?? 'Conversation'}</Text>
            <Text variant="caption" muted>{conversation.data?.mode ?? selectedMode} mode</Text>
          </View>
          {conversation.isLoading ? (
            <LoadingState label="Loading conversation..." />
          ) : !conversation.data ? (
            <EmptyState title="Conversation not found" body="This thread may have been removed or has not synced yet." />
          ) : messages.length ? (
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.messages}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState title="Start this thread" body="Ask a question and Tera will respond here." />
          )}
          <View style={styles.composer}>
            <Composer disabled={sendMessage.isPending} onSubmit={(value) => sendMessage.mutate(value)} />
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  messages: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  composer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
});
