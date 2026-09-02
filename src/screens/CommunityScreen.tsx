import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";

import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { feedPosts } from "../data/mockData";
import { colors, radii, spacing } from "../theme";
import { FeedPost } from "../types/app";

type CommunityTab = "For You" | "Following" | "Groups";

const tabs: CommunityTab[] = ["For You", "Following", "Groups"];

type CommunityScreenProps = {
  posts?: FeedPost[];
  onCommentPost?: (postId: string, body: string) => void;
  onCreatePost?: (body: string) => void;
  onUpvotePost?: (postId: string) => void;
};

export function CommunityScreen({ posts = feedPosts, onCommentPost, onCreatePost, onUpvotePost }: CommunityScreenProps) {
  const [activeTab, setActiveTab] = useState<CommunityTab>("For You");
  const [draft, setDraft] = useState("");
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const canPost = draft.trim().length > 0;
  const canComment = commentDraft.trim().length > 0;
  const visiblePosts = useMemo(() => {
    if (activeTab === "Following") {
      return posts.filter((post) => post.upvotes >= 10 || post.comments > 0);
    }
    if (activeTab === "Groups") {
      return posts.filter((post, index, list) => list.findIndex((item) => item.group === post.group) === index);
    }
    return posts;
  }, [activeTab, posts]);

  function createPost() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    onCreatePost?.(body);
  }

  function createComment(postId: string) {
    const body = commentDraft.trim();
    if (!body) return;
    setCommentDraft("");
    setCommentingPostId(null);
    onCommentPost?.(postId, body);
  }

  return (
    <Screen footerSpace>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Proof feed and accountability groups</Text>
        </View>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80" }}
          style={styles.avatar}
        />
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.feedSummary}>
        <Text style={styles.feedSummaryText}>{visiblePosts.length} visible post{visiblePosts.length === 1 ? "" : "s"}</Text>
        <Text style={styles.feedSummaryText}>{activeTab}</Text>
      </View>

      <View style={styles.composer}>
        <TextField placeholder="Post a progress update..." onChangeText={setDraft} style={styles.composerInput} value={draft} />
        <Pressable disabled={!canPost} style={[styles.postButton, !canPost && styles.disabledButton]} onPress={createPost}>
          <Feather name="send" color={colors.white} size={17} />
        </Pressable>
      </View>

      <View style={styles.postList}>
        {visiblePosts.length ? visiblePosts.map((post) => (
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
              <Pressable style={styles.reaction} onPress={() => onUpvotePost?.(post.id)}>
                <Feather name="arrow-up-circle" color={colors.soft} size={17} />
                <Text style={styles.reactionText}>{post.upvotes}</Text>
              </Pressable>
              <Pressable style={styles.reaction} onPress={() => setCommentingPostId((current) => current === post.id ? null : post.id)}>
                <Feather name="message-circle" color={colors.soft} size={17} />
                <Text style={styles.reactionText}>{post.comments}</Text>
              </Pressable>
              <View style={styles.memberDots}>
                {[0, 1, 2].map((dot) => (
                  <View key={dot} style={[styles.dot, { marginLeft: dot === 0 ? 0 : -6 }]} />
                ))}
              </View>
            </View>
            {post.commentsList?.slice(-1).map((comment) => (
              <View key={comment.id} style={styles.latestComment}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentBody}>{comment.body}</Text>
              </View>
            ))}
            {commentingPostId === post.id ? (
              <View style={styles.commentComposer}>
                <TextField placeholder="Add encouragement..." onChangeText={setCommentDraft} style={styles.commentInput} value={commentDraft} />
                <Pressable disabled={!canComment} style={[styles.commentButton, !canComment && styles.disabledButton]} onPress={() => createComment(post.id)}>
                  <Feather name="corner-down-left" color={colors.white} size={16} />
                </Pressable>
              </View>
            ) : null}
          </View>
        )) : (
          <View style={styles.emptyState}>
            <Feather name="message-square" color={colors.orange} size={26} />
            <Text style={styles.emptyTitle}>No posts here yet</Text>
            <Text style={styles.emptyText}>Share a progress update to start the conversation.</Text>
          </View>
        )}
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
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    color: colors.soft,
    fontSize: 14,
    marginTop: spacing.xs
  },
  avatar: {
    borderColor: colors.line,
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
    backgroundColor: colors.surfaceHigh
  },
  tabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  activeTabText: {
    color: colors.text
  },
  feedSummary: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md
  },
  feedSummaryText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
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
    borderRadius: radii.lg,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  postList: {
    gap: spacing.lg,
    marginTop: spacing.xl
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.soft,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center"
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
    borderRadius: radii.lg,
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
    backgroundColor: colors.line,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 24,
    width: 24
  },
  latestComment: {
    backgroundColor: colors.surfaceHigh,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md
  },
  commentAuthor: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: "900"
  },
  commentBody: {
    color: colors.soft,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs
  },
  commentComposer: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  commentInput: {
    flex: 1,
    minHeight: 44
  },
  commentButton: {
    alignItems: "center",
    backgroundColor: colors.purple,
    borderRadius: radii.lg,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  disabledButton: {
    opacity: 0.45
  }
});
