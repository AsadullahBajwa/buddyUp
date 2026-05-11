import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { buddies, chatMessages } from "../data/mockData";
import { colors, radii, spacing } from "../theme";
import { Buddy, ChatMessage } from "../types/app";

type ChatScreenProps = {
  buddy?: Buddy;
  messages?: ChatMessage[];
  onSendMessage?: (text: string) => void;
};

export function ChatScreen({ buddy = buddies[0], messages = chatMessages, onSendMessage }: ChatScreenProps) {
  const [draft, setDraft] = useState("");

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    onSendMessage?.(text);
  }

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Image source={{ uri: buddy.avatar }} style={styles.avatar} />
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{buddy.name}</Text>
          <Text style={styles.status}>Online</Text>
        </View>
        <Pressable style={styles.iconButton}>
          <Feather name="phone" color={colors.text} size={19} />
        </Pressable>
      </View>

      <View style={styles.messages}>
        {messages.map((message) => {
          const mine = message.sender === "me";
          return (
            <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              {message.type === "voice" ? (
                <View style={styles.voice}>
                  <Feather name="mic" color={colors.white} size={17} />
                  <View style={styles.wave} />
                  <Text style={styles.voiceTime}>0:20</Text>
                </View>
              ) : (
                <Text style={styles.messageText}>{message.text}</Text>
              )}
              <Text style={styles.time}>{message.time}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.composer}>
        <TextField placeholder="Type a message..." onChangeText={setDraft} onSubmitEditing={send} style={styles.input} value={draft} />
        <Pressable style={styles.send} onPress={send}>
          <Feather name="send" color={colors.white} size={18} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingBottom: spacing.lg
  },
  avatar: {
    borderRadius: radii.pill,
    height: 48,
    width: 48
  },
  headerCopy: {
    flex: 1
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  status: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  messages: {
    flex: 1,
    gap: spacing.md,
    justifyContent: "flex-end",
    paddingVertical: spacing.xl
  },
  bubble: {
    borderRadius: radii.lg,
    maxWidth: "84%",
    padding: spacing.md
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: colors.purple
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  time: {
    alignSelf: "flex-end",
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: spacing.sm
  },
  voice: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    minWidth: 210
  },
  wave: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: radii.pill,
    flex: 1,
    height: 8
  },
  voiceTime: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800"
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
    backgroundColor: colors.orange,
    borderRadius: radii.pill,
    height: 50,
    justifyContent: "center",
    width: 50
  }
});
