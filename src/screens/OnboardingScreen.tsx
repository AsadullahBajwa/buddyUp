import { StyleSheet, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { AppLogo } from "../components/AppLogo";
import { GradientButton } from "../components/GradientButton";
import { Screen } from "../components/Screen";
import { colors, radii, spacing } from "../theme";

type OnboardingScreenProps = {
  onContinue: () => void;
};

const features = [
  {
    title: "Smart matching",
    body: "Meet partners by goal, timezone, energy, and communication style.",
    icon: "users" as const,
    color: colors.orange
  },
  {
    title: "Daily check-ins",
    body: "Log streaks, tasks, photos, voice notes, and progress wins.",
    icon: "check-circle" as const,
    color: colors.emerald
  },
  {
    title: "Community energy",
    body: "Join focused groups, challenges, and motivation threads.",
    icon: "message-circle" as const,
    color: colors.purple
  }
];

export function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  return (
    <Screen>
      <View style={styles.hero}>
        <AppLogo />
        <Text style={styles.title}>Find your accountability partner.</Text>
        <Text style={styles.subtitle}>Swipe, check in, chat, and turn goals into a routine with people who actually show up.</Text>
      </View>

      <View style={styles.stack}>
        {features.map((feature) => (
          <View key={feature.title} style={styles.feature}>
            <View style={[styles.icon, { borderColor: feature.color }]}>
              <Feather name={feature.icon} color={feature.color} size={22} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureBody}>{feature.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.preview}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Today</Text>
          <MaterialCommunityIcons name="fire" color={colors.orange} size={22} />
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metric}>85%</Text>
          <Text style={styles.metricLabel}>overall progress</Text>
        </View>
      </View>

      <GradientButton label="Start Building" onPress={onContinue} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.lg,
    paddingTop: spacing.xl
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40
  },
  subtitle: {
    color: colors.soft,
    fontSize: 16,
    lineHeight: 24
  },
  stack: {
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  feature: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg
  },
  icon: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  featureText: {
    flex: 1
  },
  featureTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0
  },
  featureBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs
  },
  preview: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.lg
  },
  previewHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  previewTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  metricRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  metric: {
    color: colors.orange,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 0
  },
  metricLabel: {
    color: colors.soft,
    fontSize: 14,
    marginBottom: spacing.sm
  },
  button: {
    marginTop: spacing.xl
  }
});
