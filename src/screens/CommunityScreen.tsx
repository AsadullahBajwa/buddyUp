import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { feedPosts } from "../data/mockData";
import { colors, radii, spacing } from "../theme";
import { FeedPost } from "../types/app";

const tabs = ["For You", "Following", "Groups"];

type CommunityScreenProps = {
  posts?: FeedPost[];
  onCreatePost?: (body: string) => void;
};

export function CommunityScreen({ posts = feedPosts, onCreatePost }: CommunityScreenProps) {
  const [draft, setDraft] = useState("");

  function createPost() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    onCreatePost?.(body);
  }

  return (
    <Screen footerSpace>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>BuddyUp</Text>
          <Text style={styles.subtitle}>Community feed</Text>
        </View>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80" }}
          style={styles.avatar}
        />
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab, index) => (
          <Pressable key={tab} style={[styles.tab, index === 0 && styles.activeTab]}>
            <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.composer}>
        <TextField placeholder="Post a progress update..." onChangeText={setDraft} style={styles.composerInput} value={draft} />
        <Pressable style={styles.postButton} onPress={createPost}>
          <Feather name="send" color={colors.white} size={17} />
        </Pressable>
      </View>

      <View style={styles.postList}>
        {posts.map((post) => (
          <View key={post.id} style={styles.post}>
            <View style={styles.postHeader}>
              <View style={[styles.groupIcon, { backgroundColor: post.accent }]}>
                <Feather name="users" color={colors.white} size={18} />
              </View>
              <View style={styles.postMeta}>
                <Text style={styles.group}>{post.group}</Text>
                <Text style={styles.time}>{post.timeAgo}</Text>
              </View>
              <Pressable>
                <Feather name="more-horizontal" color={colors.muted} size={22} />
              </Pressable>
            </View>
            <Text style={styles.body}>{post.body}</Text>
            <View style={styles.reactions}>
              <View style={styles.reaction}>
                <Feather name="arrow-up-circle" color={colors.soft} size={17} />
                <Text style={styles.reactionText}>{post.upvotes}</Text>
              </View>
              <View style={styles.reaction}>
                <Feather name="message-circle" color={colors.soft} size={17} />
                <Text style={styles.reactionText}>{post.comments}</Text>
              </View>
              <View style={styles.memberDots}>
                {[0, 1, 2].map((dot) => (
                  <View key={dot} style={[styles.dot, { marginLeft: dot === 0 ? 0 : -6 }]} />
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    color: colors.soft,
    fontSize: 14,
    marginTop: spacing.xs
  },
  avatar: {
    borderColor: colors.orange,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 48,
    width: 48
  },
  tabs: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xl,
    padding: spacing.xs
  },
  tab: {
    alignItems: "center",
    borderRadius: radii.sm,
    flex: 1,
    paddingVertical: spacing.sm
  },
  activeTab: {
    backgroundColor: colors.orange
  },
  tabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  activeTabText: {
    color: colors.white
  },
  composer: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg
  },
  composerInput: {
    flex: 1,
    minHeight: 48
  },
  postButton: {
    alignItems: "center",
    backgroundColor: colors.orange,
    borderRadius: radii.pill,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  postList: {
    gap: spacing.lg,
    marginTop: spacing.xl
  },
  post: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg
  },
  postHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  groupIcon: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  postMeta: {
    flex: 1
  },
  group: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  time: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.lg
  },
  reactions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.lg
  },
  reaction: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  reactionText: {
    color: colors.soft,
    fontSize: 13,
    fontWeight: "800"
  },
  memberDots: {
    flexDirection: "row",
    marginLeft: "auto"
  },
  dot: {
    backgroundColor: colors.orangeLight,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 24,
    width: 24
  }
});
