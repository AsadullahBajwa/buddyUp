import { Keyboard, StyleSheet, TextInput, TextInputProps } from "react-native";

import { colors, radii, spacing } from "../theme";

export function TextField(props: TextInputProps) {
  const { multiline, onSubmitEditing, returnKeyType, style, blurOnSubmit, ...rest } = props;

  return (
    <TextInput
      blurOnSubmit={blurOnSubmit ?? !multiline}
      multiline={multiline}
      onSubmitEditing={(event) => {
        onSubmitEditing?.(event);
        if (!multiline) {
          Keyboard.dismiss();
        }
      }}
      placeholderTextColor={colors.muted}
      returnKeyType={returnKeyType ?? (multiline ? "default" : "done")}
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
