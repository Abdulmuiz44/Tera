import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Screen, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/constants/theme';
import { onboardingSlides } from '@/features/onboarding/onboarding-content';
import { useAppStore } from '@/store/app-store';

export default function OnboardingScreen() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  async function continueToAuth() {
    await completeOnboarding();
    router.replace('/(auth)/sign-in');
  }

  return (
    <Screen scroll>
      <View style={styles.heroMark}>
        <Text variant="caption" style={styles.markText}>TeraAI</Text>
      </View>
      <View style={styles.header}>
        <Text variant="hero">Learn clearly. Build from what you know.</Text>
        <Text muted>
          Tera is an AI learning companion for explanations, research, and turning ideas into action.
        </Text>
      </View>
      <View style={styles.slides}>
        {onboardingSlides.map((slide, index) => (
          <View key={slide.title} style={styles.slide}>
            <Text variant="caption" style={styles.step}>0{index + 1}</Text>
            <View style={styles.slideCopy}>
              <Text variant="h3">{slide.title}</Text>
              <Text muted>{slide.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Button label="Continue" onPress={continueToAuth} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroMark: {
    width: 76,
    height: 76,
    borderRadius: radii.xl,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xxl,
  },
  markText: {
    color: colors.accent,
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  slides: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  slide: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  step: {
    color: colors.accent,
    width: 28,
  },
  slideCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
