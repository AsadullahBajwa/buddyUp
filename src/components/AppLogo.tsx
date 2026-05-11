import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, spacing } from "../theme";

type AppLogoProps = {
  size?: "small" | "large";
};

export function AppLogo({ size = "large" }: AppLogoProps) {
  const isLarge = size === "large";

  return (
    <View style={styles.row}>
      <View style={[styles.mark, isLarge ? styles.markLarge : styles.markSmall]}>
        <MaterialCommunityIcons
          name="account-heart"
          size={isLarge ? 42 : 28}
          color={colors.orange}
        />
      </View>
      <Text style={[styles.name, isLarge ? styles.nameLarge : styles.nameSmall]}>
        Buddy<Text style={styles.up}>Up</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  mark: {
    alignItems: "center",
    justifyContent: "center"
  },
  markLarge: {
    height: 54,
    width: 54
  },
  markSmall: {
    height: 36,
    width: 36
  },
  name: {
    color: colors.text,
    fontWeight: "900",
    letterSpacing: 0
  },
  nameLarge: {
    fontSize: 36
  },
  nameSmall: {
    fontSize: 22
  },
  up: {
    color: colors.orange
  }
});
