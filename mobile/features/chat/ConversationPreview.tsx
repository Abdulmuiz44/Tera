import { router } from 'expo-router';
import { ListRow } from '@/components/ui';
import { Conversation } from '@/types/domain';
import { formatRelativeTime } from './chat-data';

interface ConversationPreviewProps {
  conversation: Conversation;
}

export function ConversationPreview({ conversation }: ConversationPreviewProps) {
  return (
    <ListRow
      title={conversation.title}
      subtitle={conversation.summary}
      meta={formatRelativeTime(conversation.updatedAt)}
      onPress={() => router.push(`/conversation/${conversation.id}`)}
    />
  );
}
