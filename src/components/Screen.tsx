import { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, gradients, spacing } from "../theme";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  footerSpace?: boolean;
};

export function Screen({ children, scroll = true, footerSpace = false }: ScreenProps) {
  const content = <View style={[styles.content, footerSpace && styles.footerSpace]}>{children}</View>;

  return (
    <LinearGradient colors={gradients.hero} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          style={styles.keyboard}
        >
          <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
            {scroll ? (
              <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {content}
              </ScrollView>
            ) : (
              content
            )}
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1
  },
  safe: {
    flex: 1
  },
  keyboard: {
    flex: 1
  },
  scroll: {
    flexGrow: 1
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg
  },
  footerSpace: {
    paddingBottom: 92
  }
});
