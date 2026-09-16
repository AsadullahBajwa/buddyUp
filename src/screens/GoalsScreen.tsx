import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import { ProgressBar } from "../components/ProgressBar";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { goals } from "../data/mockData";
import { colors, radii, spacing } from "../theme";
import { Commitment, Goal } from "../types/app";

type GoalsScreenProps = {
  commitments?: Commitment[];
  goals?: Goal[];
  onAddCommitment?: (title?: string) => void;
  onCompleteCommitment?: (commitmentId: string) => void;
  onDeleteCommitment?: (commitmentId: string) => void;
  onSnoozeCommitment?: (commitmentId: string) => void;
  onOpenCommunity?: () => void;
  onOpenCoach?: () => void;
};

function getDueState(dueAt: string) {
  const dueDate = new Date(dueAt);
  if (Number.isNaN(dueDate.getTime())) {
    return { label: "Due soon", tone: "neutral" as const };
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
  const dayDiff = Math.round((startOfDueDate - startOfToday) / 86400000);

  if (dayDiff < 0) return { label: "Overdue", tone: "danger" as const };
  if (dayDiff === 0) return { label: "Due today", tone: "urgent" as const };
  if (dayDiff === 1) return { label: "Tomorrow", tone: "neutral" as const };
  return { label: dueDate.toLocaleDateString([], { month: "short", day: "numeric" }), tone: "neutral" as const };
}

export function GoalsScreen({
  commitments = [],
  goals: currentGoals = goals,
  onAddCommitment,
  onCompleteCommitment,
  onDeleteCommitment,
  onSnoozeCommitment,
  onOpenCommunity,
  onOpenCoach
}: GoalsScreenProps) {
  const [promiseDraft, setPromiseDraft] = useState("");
  const overall = currentGoals.length
    ? Math.round((currentGoals.reduce((sum, goal) => sum + goal.progress, 0) / currentGoals.length) * 100)
    : 0;
  const openCommitments = commitments.filter((commitment) => commitment.status === "open").slice(0, 3);
  const openCommitmentCount = commitments.filter((commitment) => commitment.status === "open").length;
  const completedCommitmentCount = commitments.filter((commitment) => commitment.status === "completed").length;
  const overdueCommitmentCount = commitments.filter((commitment) => {
    if (commitment.status !== "open") return false;
    return getDueState(commitment.dueAt).tone === "danger";
  }).length;

  function addPromise() {
    const title = promiseDraft.trim();
    setPromiseDraft("");
    Keyboard.dismiss();
    onAddCommitment?.(title || undefined);
  }

  return (
    <Screen footerSpace>
      <View style={styles.header}>
        <Text style={styles.title}>My Goals</Text>
        <Pressable style={styles.period}>
          <Text style={styles.periodText}>This week</Text>
          <Feather name="chevron-down" color={colors.soft} size={16} />
        </Pressable>
      </View>

      <View style={styles.overview}>
        <View style={styles.overviewHeader}>
          <View>
            <Text style={styles.overviewLabel}>Weekly progress</Text>
            <Text style={styles.overviewTitle}>Stay consistent</Text>
          </View>
          <Text style={styles.percent}>{overall}%</Text>
        </View>
        <ProgressBar progress={overall / 100} accent={colors.orange} />
        <View style={styles.overviewMeta}>
          <Text style={styles.overviewMetaText}>{openCommitmentCount} open promises</Text>
          <Text style={[styles.overviewMetaText, overdueCommitmentCount > 0 && styles.overdueMetaText]}>
            {overdueCommitmentCount > 0 ? `${overdueCommitmentCount} overdue` : `${completedCommitmentCount} closed`}
          </Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Pressable style={styles.quickAction} onPress={onOpenCommunity}>
          <Feather name="users" color={colors.emerald} size={19} />
          <Text style={styles.quickText}>Community</Text>
        </Pressable>
        <Pressable style={styles.quickAction} onPress={onOpenCoach}>
          <Feather name="zap" color={colors.purple} size={19} />
          <Text style={styles.quickText}>AI coach</Text>
        </Pressable>
      </View>

      <View style={styles.commitmentsCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Accountability promises</Text>
            <Text style={styles.cardSubtitle}>{openCommitmentCount} active today</Text>
          </View>
          <Pressable style={styles.addPromise} onPress={addPromise}>
            <Feather name="plus" color={colors.white} size={18} />
          </Pressable>
        </View>
        <View style={styles.promiseComposer}>
          <TextField
            placeholder="Write today's promise..."
            onChangeText={setPromiseDraft}
            onSubmitEditing={addPromise}
            style={styles.promiseInput}
            value={promiseDraft}
          />
        </View>
        <View style={styles.promiseStats}>
          <View style={styles.promiseStat}>
            <Text style={styles.promiseStatValue}>{openCommitmentCount}</Text>
            <Text style={styles.promiseStatLabel}>Open</Text>
          </View>
          <View style={styles.promiseStat}>
            <Text style={styles.promiseStatValue}>{completedCommitmentCount}</Text>
            <Text style={styles.promiseStatLabel}>Closed</Text>
          </View>
          <View style={styles.promiseStat}>
            <Text style={styles.promiseStatValue}>{commitments.length}</Text>
            <Text style={styles.promiseStatLabel}>Total</Text>
          </View>
        </View>
        {openCommitments.length ? (
          <View style={styles.promiseList}>
            {openCommitments.map((commitment) => {
              const dueState = getDueState(commitment.dueAt);

              return (
                <View key={commitment.id} style={styles.promiseRow}>
                  <Pressable
                    accessibilityLabel={`Complete ${commitment.title}`}
                    style={styles.promiseMainAction}
                    onPress={() => onCompleteCommitment?.(commitment.id)}
                  >
                    <View style={styles.promiseCheck}>
                      <Feather name="check" color={colors.emerald} size={15} />
                    </View>
                    <View style={styles.promiseCopy}>
                      <Text style={styles.promiseText}>{commitment.title}</Text>
                      <View style={[styles.dueBadge, dueState.tone === "danger" && styles.dueBadgeDanger, dueState.tone === "urgent" && styles.dueBadgeUrgent]}>
                        <Feather name="calendar" color={dueState.tone === "danger" ? colors.red : dueState.tone === "urgent" ? colors.orange : colors.muted} size={11} />
                        <Text style={[styles.dueBadgeText, dueState.tone === "danger" && styles.dueBadgeTextDanger, dueState.tone === "urgent" && styles.dueBadgeTextUrgent]}>{dueState.label}</Text>
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Delete ${commitment.title}`}
                    style={styles.promiseDelete}
                    onPress={() => onDeleteCommitment?.(commitment.id)}
                  >
                    <Feather name="trash-2" color={colors.red} size={16} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Snooze ${commitment.title}`}
                    style={styles.promiseSnooze}
                    onPress={() => onSnoozeCommitment?.(commitment.id)}
                  >
                    <Feather name="clock" color={colors.blue} size={16} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyPromise}>Add one promise for today and close the loop when it is done.</Text>
        )}
      </View>

      <View style={styles.goalList}>
        {currentGoals.map((goal) => (
          <View key={goal.id} style={styles.goalRow}>
            <View style={[styles.goalIcon, { borderColor: goal.accent }]}>
              <Feather name="target" color={goal.accent} size={17} />
            </View>
            <View style={styles.goalMain}>
              <View style={styles.goalTop}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalTarget}>{goal.target}</Text>
              </View>
              <ProgressBar progress={goal.progress} accent={goal.accent} />
              <Pressable
                accessibilityLabel={`Create promise for ${goal.title}`}
                style={styles.goalPromiseButton}
                onPress={() => onAddCommitment?.(`Make progress on ${goal.title} today`)}
              >
                <Feather name="plus-circle" color={goal.accent} size={14} />
                <Text style={styles.goalPromiseText}>Promise this</Text>
              </Pressable>
            </View>
          </View>
        ))}
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
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0
  },
  period: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  periodText: {
    color: colors.soft,
    fontSize: 12,
    fontWeight: "800"
  },
  overview: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.xxl,
    padding: spacing.lg
  },
  overviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  overviewLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  overviewTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  percent: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0
  },
  overviewMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md
  },
  overviewMetaText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  overdueMetaText: {
    color: colors.red
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 50
  },
  quickText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  commitmentsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.xl,
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
  cardSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  addPromise: {
    alignItems: "center",
    backgroundColor: colors.orange,
    borderRadius: radii.lg,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  promiseComposer: {
    marginTop: spacing.lg
  },
  promiseInput: {
    minHeight: 46
  },
  promiseStats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  promiseStat: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  promiseStatValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  promiseStatLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  promiseList: {
    gap: spacing.md,
    marginTop: spacing.lg
  },
  promiseRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  promiseMainAction: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md
  },
  promiseCheck: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.emerald,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  promiseText: {
    color: colors.soft,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18
  },
  promiseCopy: {
    flex: 1,
    gap: spacing.xs
  },
  dueBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  dueBadgeDanger: {
    borderColor: colors.red
  },
  dueBadgeUrgent: {
    borderColor: colors.orange
  },
  dueBadgeText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900"
  },
  dueBadgeTextDanger: {
    color: colors.red
  },
  dueBadgeTextUrgent: {
    color: colors.orange
  },
  promiseDelete: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  promiseSnooze: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  emptyPromise: {
    color: colors.soft,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.lg
  },
  goalList: {
    gap: spacing.lg,
    marginTop: spacing.xxl
  },
  goalRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  goalIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  goalMain: {
    flex: 1,
    gap: spacing.sm
  },
  goalTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  goalTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "800"
  },
  goalTarget: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  goalPromiseButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  goalPromiseText: {
    color: colors.soft,
    fontSize: 11,
    fontWeight: "900"
  }
});
