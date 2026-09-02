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
    body: "Rank partners by shared goals, reliability, timezone, and communication style.",
    icon: "users" as const,
    color: colors.orange
  },
  {
    title: "Proof-led progress",
    body: "Turn goals into check-ins, promises, streaks, and weekly proof history.",
    icon: "check-circle" as const,
    color: colors.emerald
  },
  {
    title: "Focused support",
    body: "Use buddy chat, community posts, and coaching prompts when momentum drops.",
    icon: "message-circle" as const,
    color: colors.purple
  }
];

export function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  return (
    <Screen>
      <View style={styles.hero}>
        <AppLogo />
        <Text style={styles.title}>Build momentum with an accountability partner.</Text>
        <Text style={styles.subtitle}>Set goals, prove progress, and keep a practical weekly rhythm with people who show up.</Text>
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
          <Text style={styles.previewTitle}>This week</Text>
          <MaterialCommunityIcons name="fire" color={colors.orange} size={22} />
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metric}>72%</Text>
          <Text style={styles.metricLabel}>promise completion</Text>
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
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40
  },
  subtitle: {
    color: colors.soft,
    fontSize: 15,
    lineHeight: 23
  },
  stack: {
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  feature: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg
  },
  icon: {
    alignItems: "center",
    borderRadius: radii.lg,
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
