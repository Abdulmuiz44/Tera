import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';
import { Message } from '@/types/domain';
import { Text } from '@/components/ui';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.userRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={isUser && styles.userText}>{message.content}</Text>
        {message.status === 'streaming' ? (
          <Text variant="caption" muted>Thinking</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: radii.sm,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderBottomLeftRadius: radii.sm,
  },
  userText: {
    color: colors.black,
    fontWeight: '600',
  },
});
