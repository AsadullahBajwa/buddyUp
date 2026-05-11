import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";

import { AppLogo } from "../components/AppLogo";
import { GradientButton } from "../components/GradientButton";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { colors, radii, spacing } from "../theme";

type AuthScreenProps = {
  onAuthenticated: (input: { name: string; email: string; password: string }) => void;
  onGoogleAuthenticated?: (accessToken: string) => void;
  onAuthError?: (message: string) => void;
};

WebBrowser.maybeCompleteAuthSession();

type GoogleButtonProps = {
  onGoogleAuthenticated?: (accessToken: string) => void;
  onAuthError?: (message: string) => void;
};

function getGoogleClientConfig() {
  const extra = Constants.expoConfig?.extra as {
    googleExpoClientId?: string;
    googleIosClientId?: string;
    googleAndroidClientId?: string;
    googleWebClientId?: string;
  } | undefined;

  const requiredClientId =
    Platform.OS === "ios"
      ? extra?.googleIosClientId
      : Platform.OS === "android"
        ? extra?.googleAndroidClientId
        : extra?.googleWebClientId || extra?.googleExpoClientId;

  return {
    configured: Boolean(requiredClientId),
    config: {
      clientId: extra?.googleExpoClientId || extra?.googleWebClientId || requiredClientId,
      iosClientId: extra?.googleIosClientId,
      androidClientId: extra?.googleAndroidClientId,
      webClientId: extra?.googleWebClientId
    }
  };
}

function GoogleSignInButton({ onGoogleAuthenticated, onAuthError }: GoogleButtonProps) {
  const { config } = useMemo(getGoogleClientConfig, []);
  const [request, response, promptAsync] = Google.useAuthRequest(config);

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        onGoogleAuthenticated?.(accessToken);
      } else {
        onAuthError?.("Google did not return an access token.");
      }
    }
    if (response?.type === "error") {
      onAuthError?.(response.error?.message || "Google sign-in failed.");
    }
  }, [onAuthError, onGoogleAuthenticated, response]);

  return (
    <Pressable disabled={!request} style={styles.social} onPress={() => promptAsync()}>
      <AntDesign name="google" color={colors.text} size={19} />
      <Text style={styles.socialText}>Continue with Google</Text>
    </Pressable>
  );
}

export function AuthScreen({ onAuthenticated, onGoogleAuthenticated, onAuthError }: AuthScreenProps) {
  const [name, setName] = useState("Alex Carter");
  const [email, setEmail] = useState("alex@buddyup.test");
  const [password, setPassword] = useState("buddyup123");
  const googleConfig = useMemo(getGoogleClientConfig, []);

  function submit() {
    onAuthenticated({ name, email, password });
  }

  function googleSignIn() {
    onAuthError?.("Google sign-in needs the platform OAuth client ID in app.json expo.extra first.");
  }

  return (
    <Screen>
      <View style={styles.top}>
        <AppLogo size="small" />
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Let us get your accountability circle started.</Text>
      </View>

      <View style={styles.form}>
        <TextField placeholder="Full name" autoCapitalize="words" onChangeText={setName} value={name} />
        <TextField placeholder="Email" keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} value={email} />
        <TextField placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
        <GradientButton label="Sign Up" onPress={submit} />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.or}>or</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socials}>
        {googleConfig.configured ? (
          <GoogleSignInButton
            onAuthError={onAuthError}
            onGoogleAuthenticated={onGoogleAuthenticated}
          />
        ) : (
          <Pressable style={styles.social} onPress={googleSignIn}>
            <AntDesign name="google" color={colors.text} size={19} />
            <Text style={styles.socialText}>Continue with Google</Text>
          </Pressable>
        )}
        <Pressable style={styles.social} onPress={() => onAuthError?.("Apple sign-in needs Apple Developer configuration and an iOS-capable build. I will wire it when you are ready for that step.")}>
          <AntDesign name="apple" color={colors.text} size={20} />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </Pressable>
        <Pressable style={styles.student} onPress={() => onAuthError?.("Student email verification needs an email verification provider or Firebase/Auth backend. We can add it in the next backend phase.")}>
          <Feather name="mail" color={colors.orange} size={18} />
          <Text style={styles.studentText}>Verify student email later</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    gap: spacing.md,
    paddingTop: spacing.xl
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: spacing.xl
  },
  subtitle: {
    color: colors.soft,
    fontSize: 15
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginVertical: spacing.xl
  },
  divider: {
    backgroundColor: colors.line,
    flex: 1,
    height: 1
  },
  or: {
    color: colors.muted,
    fontWeight: "800"
  },
  socials: {
    gap: spacing.md
  },
  social: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg
  },
  socialText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  },
  student: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.sm
  },
  studentText: {
    color: colors.orange,
    fontSize: 13,
    fontWeight: "800"
  }
});
