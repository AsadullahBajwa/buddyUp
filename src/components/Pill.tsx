import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type PillProps = {
  label: string;
  tone?: "default" | "orange" | "purple" | "green";
};

const toneColors = {
  default: colors.line,
  orange: colors.orange,
  purple: colors.purple,
  green: colors.emerald
};

export function Pill({ label, tone = "default" }: PillProps) {
  return (
    <View style={[styles.pill, { borderColor: toneColors[tone] }]}>
      <Text style={[styles.label, tone !== "default" && styles.strong]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  label: {
    color: colors.soft,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0
  },
  strong: {
    color: colors.white
  }
});
