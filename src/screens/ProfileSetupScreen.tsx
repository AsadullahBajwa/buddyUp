import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import { GradientButton } from "../components/GradientButton";
import { Pill } from "../components/Pill";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { goalCategories } from "../data/mockData";
import { colors, radii, spacing } from "../theme";
import { GoalCategory } from "../types/app";

type ProfileSetupScreenProps = {
  onComplete: (input: { username: string; age: number; timezone: string; goals: GoalCategory[] }) => void;
};

export function ProfileSetupScreen({ onComplete }: ProfileSetupScreenProps) {
  const [username, setUsername] = useState("alex_productive");
  const [age, setAge] = useState("22");
  const [timezone, setTimezone] = useState("(GMT+1) Berlin");
  const [selectedGoals, setSelectedGoals] = useState<GoalCategory[]>(["Study", "Fitness", "Productivity"]);
  const parsedAge = Number(age || 0);
  const canContinue = Boolean(username.trim()) && Number.isFinite(parsedAge) && parsedAge >= 13 && parsedAge <= 100 && selectedGoals.length > 0;

  function toggleGoal(goal: GoalCategory) {
    setSelectedGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]
    );
  }

  function submit() {
    if (!username.trim()) {
      Alert.alert("Profile setup", "Please choose a username.");
      return;
    }
    if (!Number.isFinite(parsedAge) || parsedAge < 13 || parsedAge > 100) {
      Alert.alert("Profile setup", "Age must be between 13 and 100.");
      return;
    }
    if (!selectedGoals.length) {
      Alert.alert("Profile setup", "Select at least one goal.");
      return;
    }
    onComplete({ username: username.trim(), age: parsedAge, timezone: timezone.trim(), goals: selectedGoals });
  }

  return (
    <Screen>
      <Text style={styles.title}>Tell us about you</Text>
      <Text style={styles.subtitle}>This helps us find the best buddy for your goals.</Text>

      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80" }}
          style={styles.avatar}
        />
        <Pressable style={styles.camera}>
          <Feather name="camera" color={colors.text} size={18} />
        </Pressable>
      </View>

      <View style={styles.form}>
        <TextField placeholder="Username" autoCapitalize="none" onChangeText={setUsername} value={username} />
        <TextField placeholder="Age" keyboardType="number-pad" onChangeText={setAge} value={age} />
        <TextField placeholder="Timezone" onChangeText={setTimezone} value={timezone} />
      </View>

      <Text style={styles.label}>Goals</Text>
      <View style={styles.pills}>
        {goalCategories.slice(0, 9).map((goal, index) => (
          <Pressable key={goal} onPress={() => toggleGoal(goal)}>
            <Pill
              label={goal}
              tone={selectedGoals.includes(goal) ? (index % 2 === 0 ? "orange" : "purple") : "default"}
            />
          </Pressable>
        ))}
      </View>

      <GradientButton disabled={!canContinue} label="Continue" onPress={submit} style={styles.button} />
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
    lineHeight: 22,
    marginTop: spacing.sm
  },
  avatarWrap: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: colors.orange,
    borderRadius: 62,
    borderWidth: 2,
    height: 118,
    justifyContent: "center",
    marginTop: spacing.xxl,
    width: 118
  },
  avatar: {
    borderRadius: 54,
    height: 108,
    width: 108
  },
  camera: {
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    bottom: 2,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 2,
    width: 36
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: spacing.xl
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  button: {
    marginTop: spacing.xxl
  }
});
