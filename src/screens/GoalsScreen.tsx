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
  onOpenCommunity?: () => void;
  onOpenCoach?: () => void;
};

export function GoalsScreen({
  commitments = [],
  goals: currentGoals = goals,
  onAddCommitment,
  onCompleteCommitment,
  onDeleteCommitment,
  onOpenCommunity,
  onOpenCoach
}: GoalsScreenProps) {
  const [promiseDraft, setPromiseDraft] = useState("");
  const overall = currentGoals.length
    ? Math.round((currentGoals.reduce((sum, goal) => sum + goal.progress, 0) / currentGoals.length) * 100)
    : 0;
  const openCommitments = commitments.filter((commitment) => commitment.status === "open").slice(0, 3);

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

      <View style={styles.ring}>
        <View style={styles.innerRing}>
          <Text style={styles.percent}>{overall}%</Text>
          <Text style={styles.percentLabel}>Overall progress</Text>
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
            <Text style={styles.cardSubtitle}>{openCommitments.length} active today</Text>
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
        {openCommitments.length ? (
          <View style={styles.promiseList}>
            {openCommitments.map((commitment) => (
              <View key={commitment.id} style={styles.promiseRow}>
                <Pressable
                  accessibilityLabel={`Complete ${commitment.title}`}
                  style={styles.promiseMainAction}
                  onPress={() => onCompleteCommitment?.(commitment.id)}
                >
                  <View style={styles.promiseCheck}>
                    <Feather name="check" color={colors.emerald} size={15} />
                  </View>
                  <Text style={styles.promiseText}>{commitment.title}</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Delete ${commitment.title}`}
                  style={styles.promiseDelete}
                  onPress={() => onDeleteCommitment?.(commitment.id)}
                >
                  <Feather name="trash-2" color={colors.red} size={16} />
                </Pressable>
              </View>
            ))}
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
    fontSize: 28,
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
  ring: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: colors.orange,
    borderLeftColor: colors.purple,
    borderRadius: 92,
    borderWidth: 14,
    height: 184,
    justifyContent: "center",
    marginTop: spacing.xxl,
    width: 184
  },
  innerRing: {
    alignItems: "center",
    justifyContent: "center"
  },
  percent: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 0
  },
  percentLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
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
    borderRadius: radii.md,
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
    borderRadius: radii.pill,
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
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  promiseText: {
    color: colors.soft,
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18
  },
  promiseDelete: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.line,
    borderRadius: radii.pill,
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
    borderRadius: radii.md,
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
  }
});
