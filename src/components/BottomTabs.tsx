import { Pressable, StyleSheet, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import { colors, radii, spacing } from "../theme";
import { TabKey } from "../types/app";

type BottomTabsProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const tabs: Array<{
  key: TabKey;
  icon: keyof typeof Feather.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
}> = [
  { key: "home", icon: "home" },
  { key: "discover", icon: "search" },
  { key: "checkin", icon: "plus" },
  { key: "chat", icon: "message-circle" },
  { key: "profile", icon: "user" }
];

export function BottomTabs({ active, onChange }: BottomTabsProps) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const isCreate = tab.key === "checkin";

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${tab.key} tab`}
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.item, isCreate && styles.create, isCreate && isActive && styles.createActive]}
          >
            {isCreate ? (
              <Feather name="plus" color={colors.white} size={26} />
            ) : (
              <Feather name={tab.icon} color={isActive ? colors.orange : colors.muted} size={23} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    bottom: 14,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    padding: spacing.sm,
    position: "absolute",
    width: "92%"
  },
  item: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 44,
    justifyContent: "center",
    width: 48
  },
  create: {
    backgroundColor: colors.orange,
    borderRadius: radii.pill,
    height: 52,
    marginHorizontal: spacing.xs,
    width: 52
  },
  createActive: {
    backgroundColor: colors.orangeLight
  }
});
