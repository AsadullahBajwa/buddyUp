import { StyleSheet, View } from "react-native";

import { colors, radii } from "../theme";

type ProgressBarProps = {
  progress: number;
  accent: string;
};

export function ProgressBar({ progress, accent }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.line,
    borderRadius: radii.pill,
    height: 8,
    overflow: "hidden"
  },
  fill: {
    borderRadius: radii.pill,
    height: "100%"
  }
});
