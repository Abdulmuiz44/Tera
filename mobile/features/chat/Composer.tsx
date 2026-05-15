import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, layout, radii, spacing } from '@/constants/theme';
import { Text } from '@/components/ui';

interface ComposerProps {
  placeholder?: string;
  disabled?: boolean;
  onSubmit: (value: string) => void;
}

export function Composer({
  placeholder = 'Ask Tera anything...',
  disabled,
  onSubmit,
}: ComposerProps) {
  const [value, setValue] = useState('');

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue('');
    onSubmit(trimmed);
  }

  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={setValue}
        editable={!disabled}
        multiline
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        style={styles.input}
      />
      <Pressable
        onPress={submit}
        disabled={!value.trim() || disabled}
        style={({ pressed }) => [
          styles.send,
          pressed && styles.pressed,
          (!value.trim() || disabled) && styles.disabled,
        ]}
      >
        <Text style={styles.sendText}>Go</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: layout.minTouchTarget,
    maxHeight: 116,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },
  send: {
    minWidth: 52,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  sendText: {
    color: colors.black,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.45,
  },
});
