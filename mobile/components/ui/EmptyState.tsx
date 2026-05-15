import { StyleSheet, View } from 'react-native';
import { spacing } from '@/constants/theme';
import { Text } from './Text';

interface EmptyStateProps {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="h3">{title}</Text>
      <Text muted style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  body: {
    textAlign: 'center',
  },
});
