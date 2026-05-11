import { Image, StyleSheet, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { Pill } from "../components/Pill";
import { Screen } from "../components/Screen";
import { StatCard } from "../components/StatCard";
import { colors, radii, spacing } from "../theme";
import { Goal, LocalUser } from "../types/app";

type ProfileScreenProps = {
  user?: LocalUser | null;
  goals?: Goal[];
  matchesCount?: number;
};

export function ProfileScreen({ user, goals = [], matchesCount = 0 }: ProfileScreenProps) {
  const displayName = user?.username || "alex_productive";
  const level = user?.level ?? 12;
  const xp = user?.xp ?? 2460;
  const nextLevelXp = Math.max(300, level * 300);
  const xpProgress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <Screen footerSpace>
      <View style={styles.hero}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{displayName}</Text>
        <Text style={styles.level}>Level {level}</Text>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${xpProgress}%` }]} />
        </View>
        <Text style={styles.xp}>XP {xp} / {nextLevelXp}</Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="Streak" value={`${user?.streakDays ?? 0} days`} />
        <StatCard label="Buddies" value={`${matchesCount}`} />
        <StatCard label="Badges" value={`${user?.badges ?? 0}`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About me</Text>
        <Text style={styles.body}>Building better habits and becoming one percent better every day.</Text>
        <View style={styles.pills}>
          {(user?.goals?.length ? user.goals : goals.map((goal) => goal.category).slice(0, 3)).map((goal, index) => (
            <Pill key={`${goal}-${index}`} label={goal} tone={index === 0 ? "orange" : index === 1 ? "green" : "purple"} />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <Feather name="more-horizontal" color={colors.muted} size={22} />
        </View>
        <View style={styles.badges}>
          {["fire", "shield-star", "lightning-bolt"].map((badge) => (
            <View key={badge} style={styles.badge}>
              <MaterialCommunityIcons name={badge as keyof typeof MaterialCommunityIcons.glyphMap} color={colors.orange} size={30} />
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    marginTop: spacing.lg
  },
  avatar: {
    borderColor: colors.orange,
    borderRadius: 54,
    borderWidth: 2,
    height: 108,
    width: 108
  },
  username: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: spacing.md
  },
  level: {
    color: colors.soft,
    fontSize: 13,
    fontWeight: "800",
    marginTop: spacing.sm
  },
  xpTrack: {
    backgroundColor: colors.line,
    borderRadius: radii.pill,
    height: 8,
    marginTop: spacing.md,
    overflow: "hidden",
    width: "70%"
  },
  xpFill: {
    backgroundColor: colors.orange,
    height: "100%"
  },
  xp: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: spacing.sm
  },
  stats: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.lg
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  body: {
    color: colors.soft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.md
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  badges: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.lg
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.orange,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    width: 68
  }
});
