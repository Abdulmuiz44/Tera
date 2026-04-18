import { Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';
import { Text } from './Text';

interface ChipProps {
  label: string;
  onPress?: () => void;
}

export function Chip({ label, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text variant="bodySmall" style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
});
