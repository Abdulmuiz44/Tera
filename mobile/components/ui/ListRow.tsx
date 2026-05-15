import { Pressable, StyleSheet, View } from 'react-native';
import { colors, layout, radii, spacing } from '@/constants/theme';
import { Text } from './Text';

interface ListRowProps {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
}

export function ListRow({ title, subtitle, meta, onPress }: ListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <Text variant="h3" numberOfLines={1}>{title}</Text>
        {subtitle ? <Text muted numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {meta ? <Text variant="caption" muted>{meta}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.minTouchTarget,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
});
