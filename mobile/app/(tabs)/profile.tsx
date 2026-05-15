import { Switch, StyleSheet, View } from 'react-native';
import { Button, Divider, ListRow, Screen, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuthActions } from '@/features/auth/useAuthActions';
import { useAppStore } from '@/store/app-store';

export default function ProfileScreen() {
  const { signOut } = useAuthActions();
  const session = useAppStore((state) => state.session);
  const preferences = useAppStore((state) => state.preferences);
  const setPreferences = useAppStore((state) => state.setPreferences);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="h1">Profile</Text>
        <Text muted>Manage your Tera account and app preferences.</Text>
      </View>

      <View style={styles.userPanel}>
        <View style={styles.avatar}>
          <Text variant="h2" style={styles.avatarText}>
            {session?.user.name?.[0] ?? 'T'}
          </Text>
        </View>
        <View style={styles.userCopy}>
          <Text variant="h3">{session?.user.name ?? 'Tera Learner'}</Text>
          <Text muted>{session?.user.email ?? 'learner@tera.ai'}</Text>
          <Text variant="caption" style={styles.plan}>{session?.user.plan ?? 'free'} plan</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceCopy}>
            <Text variant="h3">Concise answers</Text>
            <Text muted>Prefer shorter responses by default.</Text>
          </View>
          <Switch
            value={preferences.conciseAnswers}
            onValueChange={(value) => setPreferences({ conciseAnswers: value })}
            thumbColor={preferences.conciseAnswers ? colors.accent : colors.textMuted}
          />
        </View>
        <Divider />
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceCopy}>
            <Text variant="h3">Notifications</Text>
            <Text muted>Prepared for study reminders and updates.</Text>
          </View>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={(value) => setPreferences({ notificationsEnabled: value })}
            thumbColor={preferences.notificationsEnabled ? colors.accent : colors.textMuted}
          />
        </View>
      </View>

      <View style={styles.list}>
        <ListRow title="Billing" subtitle="Subscription foundation placeholder" />
        <ListRow title="Help" subtitle="Support, safety, and account assistance" />
        <ListRow title="Privacy" subtitle="Data controls will live here" />
      </View>

      <Button label="Sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  userPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accent,
  },
  userCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  plan: {
    color: colors.accent,
  },
  section: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  preferenceCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  list: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
});
