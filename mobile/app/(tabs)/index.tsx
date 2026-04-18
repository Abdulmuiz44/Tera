import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, EmptyState, LoadingState, Screen, SegmentedControl, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/constants/theme';
import { modeOptions, starterPrompts } from '@/features/chat/chat-data';
import { Composer } from '@/features/chat/Composer';
import { ConversationPreview } from '@/features/chat/ConversationPreview';
import { teraApi } from '@/lib/api/client';
import { useAppStore } from '@/store/app-store';

export default function HomeScreen() {
  const selectedMode = useAppStore((state) => state.selectedMode);
  const setSelectedMode = useAppStore((state) => state.setSelectedMode);
  const user = useAppStore((state) => state.session?.user);
  const conversations = useQuery({
    queryKey: ['conversations'],
    queryFn: teraApi.getConversations,
  });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="caption" style={styles.brand}>TeraAI</Text>
        <Text variant="h1">Good to see you{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.</Text>
        <Text muted>Ask, learn, research, or turn an idea into a concrete next step.</Text>
      </View>

      <SegmentedControl value={selectedMode} options={modeOptions} onChange={setSelectedMode} />

      <View style={styles.composerBlock}>
        <Composer onSubmit={() => undefined} placeholder={`Ask Tera in ${selectedMode} mode...`} />
        <Text variant="caption" muted>Conversation creation will connect to the backend in the next pass.</Text>
      </View>

      <View style={styles.section}>
        <Text variant="h3">Starter prompts</Text>
        <View style={styles.chips}>
          {starterPrompts[selectedMode].map((prompt) => (
            <Chip key={prompt} label={prompt} />
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text variant="h3">Recent conversations</Text>
        <Button label="New" variant="secondary" style={styles.newButton} />
      </View>
      {conversations.isLoading ? (
        <LoadingState label="Loading conversations..." />
      ) : conversations.data?.length ? (
        <View style={styles.list}>
          {conversations.data.slice(0, 3).map((conversation) => (
            <ConversationPreview key={conversation.id} conversation={conversation} />
          ))}
        </View>
      ) : (
        <EmptyState title="No conversations yet" body="Your recent learning threads will appear here." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  brand: {
    color: colors.accent,
  },
  composerBlock: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  section: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  chips: {
    gap: spacing.md,
  },
  sectionHeader: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  newButton: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
});
