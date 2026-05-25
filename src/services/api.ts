import Constants from "expo-constants";

import { Buddy, BuddyMatch, ChatMessage, Commitment, FeedPost, Goal, GoalCategory, LocalUser } from "../types/app";

type ApiResponse<T> = T & {
  error?: string;
};

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

function getDevHost() {
  const constants = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };
  const hostUri = constants.expoConfig?.hostUri ?? constants.manifest2?.extra?.expoClient?.hostUri;
  return hostUri?.split(":")[0];
}

export const API_BASE_URL = extra?.apiBaseUrl || (getDevHost() ? `http://${getDevHost()}:4000` : "http://localhost:4000");

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });
  const data = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  signup(input: { name: string; email: string; password: string }) {
    return request<{ user: LocalUser }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  login(input: { email: string; password: string }) {
    return request<{ user: LocalUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  googleSignup(accessToken: string) {
    return request<{ user: LocalUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ accessToken })
    });
  },
  updateProfile(userId: string, input: { username: string; age: number; timezone: string; goals: GoalCategory[] }) {
    return request<{ user: LocalUser; goals: Goal[] }>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },
  dashboard(userId: string) {
    return request<{ user: LocalUser; goals: Goal[]; matches: BuddyMatch[]; posts: FeedPost[]; commitments: Commitment[] }>(`/dashboard?userId=${userId}`);
  },
  buddies(seriousOnly: boolean) {
    return request<{ buddies: Buddy[] }>(`/buddies?seriousOnly=${seriousOnly}`);
  },
  match(userId: string, buddyId: string) {
    return request<{ match: BuddyMatch; buddy: Buddy }>("/matches", {
      method: "POST",
      body: JSON.stringify({ userId, buddyId })
    });
  },
  messages(matchId: string) {
    return request<{ messages: ChatMessage[] }>(`/messages?matchId=${matchId}`);
  },
  sendMessage(matchId: string, text: string) {
    return request<{ messages: ChatMessage[] }>("/messages", {
      method: "POST",
      body: JSON.stringify({ matchId, text })
    });
  },
  checkIn(input: { userId: string; completedTaskIds: string[]; note: string; type: string }) {
    return request<{ user: LocalUser; goals: Goal[] }>("/checkins", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  posts() {
    return request<{ posts: FeedPost[] }>("/community/posts");
  },
  createPost(body: string) {
    return request<{ posts: FeedPost[] }>("/community/posts", {
      method: "POST",
      body: JSON.stringify({ body, group: "Daily Motivation" })
    });
  },
  upvotePost(postId: string) {
    return request<{ post: FeedPost; posts: FeedPost[] }>(`/community/posts/${postId}/upvote`, {
      method: "POST"
    });
  },
  commentPost(postId: string, body: string) {
    return request<{ post: FeedPost; posts: FeedPost[] }>(`/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body })
    });
  },
  createCommitment(input: { userId: string; title: string; goalId?: string; dueAt?: string }) {
    return request<{ commitment: Commitment; commitments: Commitment[] }>("/commitments", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  completeCommitment(commitmentId: string) {
    return request<{ commitment: Commitment; commitments: Commitment[]; user: LocalUser }>(`/commitments/${commitmentId}/complete`, {
      method: "PATCH"
    });
  },
  coachPlan(userId: string) {
    return request<{ plan: string[] }>(`/coach/plan?userId=${userId}`);
  },
  coachMessage(userId: string, text: string) {
    return request<{ reply: string; plan: string[] }>("/coach/message", {
      method: "POST",
      body: JSON.stringify({ userId, text })
    });
  }
};
