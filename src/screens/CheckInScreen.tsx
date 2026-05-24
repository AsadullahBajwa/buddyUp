import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";

import { GradientButton } from "../components/GradientButton";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { dailyTasks } from "../data/mockData";
import { colors, radii, spacing } from "../theme";
import { Goal } from "../types/app";

const checkInTypes = [
  { label: "Photo", icon: "camera" as const },
  { label: "Text", icon: "edit-3" as const },
  { label: "Voice", icon: "mic" as const },
  { label: "Habit", icon: "activity" as const }
];

type CheckInScreenProps = {
  goals?: Goal[];
  isSubmitting?: boolean;
  onSubmit?: (input: { completedTaskIds: string[]; note: string; type: string }) => void;
};

export function CheckInScreen({ goals = [], isSubmitting = false, onSubmit }: CheckInScreenProps) {
  const taskSeed = useMemo(
    () => goals.length ? goals.map((goal) => ({ id: goal.id, title: goal.title, done: false })) : dailyTasks,
    [goals]
  );
  const [doneIds, setDoneIds] = useState<string[]>(taskSeed.filter((task) => task.done).map((task) => task.id));
  const [note, setNote] = useState("");
  const [type, setType] = useState("text");

  function toggleTask(id: string) {
    setDoneIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <Screen footerSpace>
      <Text style={styles.title}>How was your day?</Text>
      <Text style={styles.subtitle}>Share progress with your buddy.</Text>

      <View style={styles.typeGrid}>
        {checkInTypes.map((item) => (
          <Pressable key={item.label} style={[styles.type, type === item.label.toLowerCase() && styles.activeType]} onPress={() => setType(item.label.toLowerCase())}>
            <Feather name={item.icon} color={type === item.label.toLowerCase() ? colors.orange : colors.soft} size={22} />
            <Text style={[styles.typeText, type === item.label.toLowerCase() && styles.activeTypeText]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Today&apos;s goals</Text>
          <MaterialCommunityIcons name="dots-horizontal" color={colors.muted} size={22} />
        </View>
        <View style={styles.tasks}>
          {taskSeed.map((task) => {
            const done = doneIds.includes(task.id);
            return (
            <Pressable key={task.id} style={styles.taskRow} onPress={() => toggleTask(task.id)}>
              <Text style={styles.taskText}>{task.title}</Text>
              <View style={[styles.check, done && styles.checkDone]}>
                {done ? <Feather name="check" color={colors.white} size={14} /> : null}
              </View>
            </Pressable>
            );
          })}
        </View>
      </View>

      <TextField placeholder="Add a note..." multiline onChangeText={setNote} style={styles.note} value={note} />
      <GradientButton
        disabled={isSubmitting}
        label={isSubmitting ? "Saving..." : "Check In"}
        onPress={() => {
          Keyboard.dismiss();
          onSubmit?.({ completedTaskIds: doneIds, note, type });
        }}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: spacing.xl
  },
  subtitle: {
    color: colors.soft,
    fontSize: 15,
    marginTop: spacing.sm
  },
  typeGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xxl
  },
  type: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minHeight: 82,
    justifyContent: "center"
  },
  typeText: {
    color: colors.soft,
    fontSize: 12,
    fontWeight: "800"
  },
  activeType: {
    borderColor: colors.orange
  },
  activeTypeText: {
    color: colors.orange
  },
  card: {
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
    fontSize: 17,
    fontWeight: "900"
  },
  tasks: {
    gap: spacing.md,
    marginTop: spacing.lg
  },
  taskRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  taskText: {
    color: colors.soft,
    fontSize: 15
  },
  check: {
    alignItems: "center",
    borderColor: colors.muted,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 22,
    justifyContent: "center",
    width: 22
  },
  checkDone: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  note: {
    marginTop: spacing.xl,
    minHeight: 88,
    paddingTop: spacing.md,
    textAlignVertical: "top"
  },
  button: {
    marginTop: spacing.lg
  }
});
