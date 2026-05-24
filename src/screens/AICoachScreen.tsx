import { Image, Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";

import { GradientButton } from "../components/GradientButton";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { api } from "../services/api";
import { colors, radii, spacing } from "../theme";
import { Goal } from "../types/app";

type AICoachScreenProps = {
  goals?: Goal[];
  userId?: string;
  onBack?: () => void;
};

export function AICoachScreen({ goals = [], userId, onBack }: AICoachScreenProps) {
  const fallbackPlan = useMemo(() => goals.slice(0, 4).map((goal) => `Make one concrete step for ${goal.title}`), [goals]);
  const [plan, setPlan] = useState<string[]>(fallbackPlan.length ? fallbackPlan : ["Study 45 minutes", "Workout", "Read 10 pages", "Check in"]);
  const [reply, setReply] = useState("Remember why you started. Small steps every day lead to big changes.");
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (!userId) return;
    api.coachPlan(userId)
      .then((data) => setPlan(data.plan))
      .catch(() => undefined);
  }, [userId]);

  async function askCoach(text = draft) {
    const prompt = text.trim() || "motivate me";
    if (isThinking) return;
    setDraft("");
    Keyboard.dismiss();
    if (!userId) {
      setReply("Match your day to one tiny action: choose the easiest goal, do 10 minutes, then check in.");
      return;
    }
    setIsThinking(true);
    try {
      const data = await api.coachMessage(userId, prompt);
      setReply(data.reply);
      setPlan(data.plan);
    } catch (error) {
      setReply("I could not reach the coach service right now. Pick one goal, work for 10 focused minutes, then check in.");
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={onBack}>
          <Feather name="arrow-left" color={colors.text} size={20} />
        </Pressable>
        <Text style={styles.title}>AI Coach</Text>
      </View>

      <View style={styles.thread}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>Good morning, Alex. Here is your plan for today.</Text>
        </View>

        <View style={styles.plan}>
          <Text style={styles.planTitle}>Today&apos;s plan</Text>
          {plan.map((item) => (
            <Text key={item} style={styles.planItem}>{item}</Text>
          ))}
        </View>

        <GradientButton disabled={isThinking} label={isThinking ? "Thinking..." : "Give me motivation"} onPress={() => askCoach("motivate me")} variant="cool" />

        <View style={styles.coachCard}>
          <View style={styles.coachCopy}>
            <Text style={styles.coachText}>{reply}</Text>
          </View>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" }}
            style={styles.coachImage}
          />
        </View>
      </View>

      <View style={styles.composer}>
        <TextField placeholder="Ask me anything..." onChangeText={setDraft} onSubmitEditing={() => askCoach()} style={styles.input} value={draft} />
        <Pressable disabled={isThinking} style={[styles.send, isThinking && styles.sendDisabled]} onPress={() => askCoach()}>
          <Feather name={isThinking ? "clock" : "arrow-up"} color={colors.white} size={18} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  back: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0
  },
  thread: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center"
  },
  bubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    maxWidth: "86%",
    padding: spacing.lg
  },
  bubbleText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  plan: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg
  },
  planTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: spacing.md
  },
  planItem: {
    color: colors.soft,
    fontSize: 14,
    lineHeight: 24
  },
  coachCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.lg
  },
  coachCopy: {
    flex: 1
  },
  coachText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  coachImage: {
    borderRadius: radii.lg,
    height: 96,
    width: 96
  },
  composer: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingBottom: 76
  },
  input: {
    flex: 1
  },
  send: {
    alignItems: "center",
    backgroundColor: colors.purple,
    borderRadius: radii.pill,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  sendDisabled: {
    opacity: 0.6
  }
});
