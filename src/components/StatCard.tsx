import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: spacing.xs
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0
  }
});
