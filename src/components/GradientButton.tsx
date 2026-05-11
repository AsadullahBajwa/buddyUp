import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, gradients, radii, shadows, spacing } from "../theme";

type GradientButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "cool";
  style?: ViewStyle;
};

export function GradientButton({ label, onPress, variant = "primary", style }: GradientButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={style}>
      <LinearGradient
        colors={variant === "primary" ? gradients.primary : gradients.cool}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radii.md,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: spacing.xl,
    ...shadows.glow
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0
  }
});
