import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppLogo } from "../components/AppLogo";
import { GradientButton } from "../components/GradientButton";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";

type SplashScreenProps = {
  onDone: () => void;
};

export function SplashScreen({ onDone }: SplashScreenProps) {
  useEffect(() => {
    const timeout = setTimeout(onDone, 900);
    return () => clearTimeout(timeout);
  }, [onDone]);

  return (
    <Screen scroll={false}>
      <View style={styles.wrap}>
        <AppLogo />
        <View style={styles.copy}>
          <Text style={styles.title}>Welcome to BuddyUp</Text>
          <Text style={styles.subtitle}>Find accountability partners, build better habits, and keep showing up.</Text>
        </View>
        <GradientButton label="Get Started" onPress={onDone} style={styles.button} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  copy: {
    marginTop: spacing.xxl,
    maxWidth: 310
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center"
  },
  subtitle: {
    color: colors.soft,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
    textAlign: "center"
  },
  button: {
    marginTop: spacing.xxl,
    width: "100%"
  }
});
