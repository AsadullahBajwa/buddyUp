import { StyleSheet, TextInput, TextInputProps } from "react-native";

import { colors, radii, spacing } from "../theme";

export function TextField(props: TextInputProps) {
  const { style, ...rest } = props;

  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={[styles.input, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: spacing.lg
  }
});
