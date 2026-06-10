import { ActivityIndicator, Alert, ImageBackground, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";

import { Pill } from "../components/Pill";
import { Screen } from "../components/Screen";
import { buddies } from "../data/mockData";
import { api } from "../services/api";
import { colors, radii, spacing } from "../theme";
import { Buddy, GoalCategory } from "../types/app";

type DiscoverScreenProps = {
  onMatch?: (buddy: Buddy) => void;
};

const goalFilters: Array<"All" | GoalCategory> = ["All", "Fitness", "Study", "Coding", "Meditation", "Productivity"];

export function DiscoverScreen({ onMatch }: DiscoverScreenProps) {
  const [index, setIndex] = useState(0);
  const [seriousOnly, setSeriousOnly] = useState(true);
  const [goalFilter, setGoalFilter] = useState<"All" | GoalCategory>("All");
  const [remoteBuddies, setRemoteBuddies] = useState<Buddy[]>(buddies);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const pool = useMemo(
    () =>
      remoteBuddies.filter((buddy) => {
        const matchesSerious = !seriousOnly || buddy.serious;
        const matchesGoal = goalFilter === "All" || buddy.goals.includes(goalFilter);
        return matchesSerious && matchesGoal;
      }),
    [goalFilter, remoteBuddies, seriousOnly]
  );
  const buddy = pool.length ? pool[index % pool.length] : null;

  useEffect(() => {
    setIsLoading(true);
    setLoadError("");
    api.buddies(seriousOnly, goalFilter === "All" ? undefined : goalFilter)
      .then((data) => {
        setRemoteBuddies(data.buddies);
        setIndex(0);
      })
      .catch(() => setLoadError("Could not refresh buddies. Showing saved suggestions."))
      .finally(() => setIsLoading(false));
  }, [goalFilter, seriousOnly]);

  function nextBuddy() {
    setIndex((current) => current + 1);
  }

  function likeBuddy() {
    if (!buddy) return;
    onMatch?.(buddy);
    nextBuddy();
  }

  function showBuddyInfo() {
    if (!buddy) return;
    Alert.alert(
      `${buddy.name}'s match style`,
      `${buddy.activityLevel} activity, ${buddy.communicationStyle.toLowerCase()}, ${buddy.streakDays}-day streak.`
    );
  }

  return (
    <Screen footerSpace>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Find your buddy</Text>
          <Text style={styles.subtitle}>Swipe energy, match with consistency.</Text>
        </View>
        <Pressable style={styles.filterButton}>
          <Feather name="sliders" color={colors.text} size={20} />
        </Pressable>
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>Serious partners</Text>
        <Switch
          onValueChange={setSeriousOnly}
          thumbColor={seriousOnly ? colors.orange : colors.soft}
          trackColor={{ false: colors.line, true: "#873E00" }}
          value={seriousOnly}
        />
      </View>

      <View style={styles.goalFilters}>
        {goalFilters.map((goal) => {
          const isActive = goalFilter === goal;
          return (
            <Pressable
              key={goal}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => {
                setGoalFilter(goal);
                setIndex(0);
              }}
              style={[styles.goalFilter, isActive ? styles.goalFilterActive : null]}
            >
              <Text style={[styles.goalFilterText, isActive ? styles.goalFilterTextActive : null]}>{goal}</Text>
            </Pressable>
          );
        })}
      </View>

      {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.orange} />
          <Text style={styles.loadingText}>Refreshing buddy suggestions...</Text>
        </View>
      ) : buddy ? (
        <ImageBackground source={{ uri: buddy.avatar }} style={styles.card} imageStyle={styles.cardImage}>
          <View style={styles.overlay} />
          <View style={styles.score}>
            <Ionicons name="shield-checkmark" color={colors.emerald} size={18} />
            <Text style={styles.scoreText}>{buddy.reliabilityScore}% reliable</Text>
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.name}>
              {buddy.name}, {buddy.age}
            </Text>
            <Text style={styles.location}>{buddy.city} - {buddy.timezone}</Text>
            <Text style={styles.headline}>{buddy.headline}</Text>
            <View style={styles.pills}>
              {buddy.goals.map((goal, goalIndex) => (
                <Pill key={goal} label={goal} tone={goalIndex === 0 ? "orange" : "default"} />
              ))}
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.emptyCard}>
          <Feather name="users" color={colors.orange} size={32} />
          <Text style={styles.emptyTitle}>No buddies found</Text>
          <Text style={styles.emptyText}>Try turning off the serious partner filter.</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.round} onPress={nextBuddy}>
          <Feather name="x" color={colors.soft} size={28} />
        </Pressable>
        <Pressable style={styles.round} onPress={showBuddyInfo}>
          <Feather name="info" color={colors.blue} size={25} />
        </Pressable>
        <Pressable style={[styles.round, styles.like]} onPress={likeBuddy}>
          <Feather name="heart" color={colors.white} size={29} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    color: colors.soft,
    fontSize: 14,
    marginTop: spacing.xs
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.xl
  },
  toggleText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  goalFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginTop: -spacing.sm
  },
  goalFilter: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  goalFilterActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange
  },
  goalFilterText: {
    color: colors.soft,
    fontSize: 12,
    fontWeight: "900"
  },
  goalFilterTextActive: {
    color: colors.white
  },
  card: {
    borderRadius: radii.xl,
    height: 480,
    justifyContent: "space-between",
    overflow: "hidden"
  },
  cardImage: {
    borderRadius: radii.xl
  },
  loadingCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    height: 480,
    justifyContent: "center"
  },
  loadingText: {
    color: colors.soft,
    fontSize: 14,
    fontWeight: "800"
  },
  errorText: {
    color: colors.yellow,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    height: 480,
    justifyContent: "center",
    padding: spacing.xl
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.soft,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 7, 18, 0.28)"
  },
  score: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "rgba(8, 13, 24, 0.72)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  scoreText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900"
  },
  cardCopy: {
    padding: spacing.xl
  },
  name: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0
  },
  location: {
    color: colors.soft,
    fontSize: 14,
    marginTop: spacing.xs
  },
  headline: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xl,
    justifyContent: "center",
    marginTop: spacing.xl
  },
  round: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    width: 62
  },
  like: {
    backgroundColor: colors.red,
    borderColor: colors.red
  }
});
