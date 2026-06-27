import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { Pill } from "../components/Pill";
import { Screen } from "../components/Screen";
import { StatCard } from "../components/StatCard";
import { colors, radii, spacing } from "../theme";
import { ApiHealth, ApiStats, Commitment, Goal, LocalUser, WeeklyReport } from "../types/app";

type ProfileScreenProps = {
  commitments?: Commitment[];
  user?: LocalUser | null;
  goals?: Goal[];
  matchesCount?: number;
  onLogout?: () => void;
  apiHealth?: ApiHealth | null;
  apiStats?: ApiStats | null;
  weeklyReport?: WeeklyReport | null;
};

export function ProfileScreen({ commitments = [], user, goals = [], matchesCount = 0, onLogout, apiHealth, apiStats, weeklyReport }: ProfileScreenProps) {
  const displayName = user?.username || "alex_productive";
  const level = user?.level ?? 12;
  const xp = user?.xp ?? 2460;
  const nextLevelXp = Math.max(300, level * 300);
  const xpProgress = Math.min(100, Math.round((xp / nextLevelXp) * 100));
  const localProgress = goals.length ? Math.round((goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) * 100) : 0;
  const localStrongestGoal = goals.length ? [...goals].sort((a, b) => b.progress - a.progress)[0]?.title : "Pick your first goal";
  const localFocusGoal = goals.length ? [...goals].sort((a, b) => a.progress - b.progress)[0]?.title : "Create a routine";
  const progress = weeklyReport?.overallProgress ?? localProgress;
  const activeMatches = weeklyReport?.activeMatches ?? matchesCount;
  const completedPromises = weeklyReport?.completedCommitments ?? commitments.filter((commitment) => commitment.status === "completed").length;
  const openPromises = weeklyReport?.openCommitments ?? commitments.filter((commitment) => commitment.status === "open").length;
  const strongestGoal = weeklyReport?.strongestGoal || localStrongestGoal;
  const focusGoal = weeklyReport?.focusGoal || localFocusGoal;

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
        <StatCard label="Buddies" value={`${activeMatches}`} />
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
        <Text style={styles.cardTitle}>Weekly insights</Text>
        <View style={styles.insightGrid}>
          <View style={styles.insight}>
            <Text style={styles.insightValue}>{progress}%</Text>
            <Text style={styles.insightLabel}>Goal progress</Text>
          </View>
          <View style={styles.insight}>
            <Text style={styles.insightValue}>{user?.reliabilityScore ?? 70}%</Text>
            <Text style={styles.insightLabel}>Reliability</Text>
          </View>
        </View>
        <View style={styles.insightRow}>
          <Feather name="trending-up" color={colors.emerald} size={18} />
          <Text style={styles.insightText}>Strongest: {strongestGoal}</Text>
        </View>
        <View style={styles.insightRow}>
          <Feather name="target" color={colors.orange} size={18} />
          <Text style={styles.insightText}>Next focus: {focusGoal}</Text>
        </View>
        <View style={styles.insightRow}>
          <Feather name="check-circle" color={colors.purple} size={18} />
          <Text style={styles.insightText}>{completedPromises} promise{completedPromises === 1 ? "" : "s"} closed this week</Text>
        </View>
        <View style={styles.insightRow}>
          <Feather name="clock" color={colors.blue} size={18} />
          <Text style={styles.insightText}>{openPromises} open promise{openPromises === 1 ? "" : "s"} still need attention</Text>
        </View>
        <View style={styles.insightRow}>
          <Feather name={apiHealth?.ok ? "wifi" : "wifi-off"} color={apiHealth?.ok ? colors.emerald : colors.red} size={18} />
          <Text style={styles.insightText}>
            API {apiHealth?.ok ? `online v${apiHealth.version} (${apiHealth.store})` : "status unavailable"}
          </Text>
        </View>
        <View style={styles.insightRow}>
          <Feather name="database" color={colors.orange} size={18} />
          <Text style={styles.insightText}>
            {apiStats ? `${apiStats.users} users, ${apiStats.matches} matches, ${apiStats.community.posts} posts tracked` : "Backend stats loading"}
          </Text>
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

      <Pressable style={styles.logout} onPress={onLogout}>
        <Feather name="log-out" color={colors.red} size={18} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
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
  insightGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg
  },
  insight: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md
  },
  insightValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  insightLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  insightRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  insightText: {
    color: colors.soft,
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18
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
  },
  logout: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  logoutText: {
    color: colors.red,
    fontSize: 14,
    fontWeight: "900"
  }
});
