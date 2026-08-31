export type GoalCategory =
  | "Fitness"
  | "Study"
  | "Productivity"
  | "Weight loss"
  | "Mental health"
  | "Language"
  | "Meditation"
  | "Business"
  | "Coding"
  | "Reading"
  | "Custom";

export type CommunicationStyle = "Daily chat" | "Voice notes" | "Weekly report" | "Focus room";

export type Buddy = {
  id: string;
  name: string;
  age: number;
  city: string;
  timezone: string;
  avatar: string;
  headline: string;
  goals: GoalCategory[];
  activityLevel: "Chill" | "Consistent" | "Intense";
  communicationStyle: CommunicationStyle;
  reliabilityScore: number;
  streakDays: number;
  serious: boolean;
  sharedGoals?: GoalCategory[];
  matchScore?: number;
};

export type Goal = {
  id: string;
  userId?: string;
  title: string;
  category: GoalCategory;
  progress: number;
  streak: number;
  target: string;
  accent: string;
  completed?: boolean;
};

export type FeedPost = {
  id: string;
  group: string;
  timeAgo: string;
  body: string;
  upvotes: number;
  comments: number;
  commentsList?: {
    id: string;
    body: string;
    author: string;
    createdAt: string;
  }[];
  accent: string;
};

export type ChatMessage = {
  id: string;
  matchId?: string;
  sender: "me" | "buddy";
  text: string;
  time: string;
  type?: "text" | "voice";
};

export type TabKey = "home" | "discover" | "checkin" | "chat" | "profile";

export type LocalUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  age: number;
  timezone: string;
  interests: string[];
  goals: GoalCategory[];
  xp: number;
  level: number;
  badges: number;
  streakDays: number;
  reliabilityScore: number;
  studentVerified: boolean;
};

export type BuddyMatch = {
  id: string;
  userId: string;
  buddyId: string;
  status: "matched" | "pending" | "declined";
  createdAt: string;
};

export type Commitment = {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  status: "open" | "completed";
  dueAt: string;
  createdAt: string;
  completedAt?: string;
  snoozedAt?: string;
  updatedAt?: string;
};

export type CheckIn = {
  id: string;
  userId: string;
  note: string;
  type: string;
  completedTaskIds: string[];
  createdAt: string;
};

export type WeeklyReport = {
  userId: string;
  weekOf: string;
  overallProgress: number;
  completedCommitments: number;
  openCommitments: number;
  commitmentCompletionRate: number;
  checkIns: number;
  activeMatches: number;
  strongestGoal: string;
  focusGoal: string;
  nextActions: string[];
};

export type ApiHealth = {
  ok: boolean;
  service: string;
  store: string;
  time: string;
  version: string;
};

export type ApiStats = {
  users: number;
  goals: number;
  buddies: number;
  matches: number;
  messages: number;
  checkIns: number;
  commitments: {
    open: number;
    completed: number;
    total: number;
  };
  community: {
    posts: number;
    comments: number;
    upvotes: number;
  };
};
