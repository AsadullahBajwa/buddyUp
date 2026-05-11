import { Buddy, ChatMessage, FeedPost, Goal, GoalCategory } from "../types/app";
import { colors } from "../theme";

export const goalCategories: GoalCategory[] = [
  "Fitness",
  "Study",
  "Productivity",
  "Weight loss",
  "Mental health",
  "Language",
  "Meditation",
  "Business",
  "Coding",
  "Reading",
  "Custom"
];

export const buddies: Buddy[] = [
  {
    id: "sara",
    name: "Sara",
    age: 21,
    city: "Berlin",
    timezone: "GMT+1",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    headline: "Study sprints, gym check-ins, and no skipped Sundays.",
    goals: ["Study", "Productivity", "Reading"],
    activityLevel: "Consistent",
    communicationStyle: "Daily chat",
    reliabilityScore: 94,
    streakDays: 23,
    serious: true
  },
  {
    id: "leo",
    name: "Leo",
    age: 24,
    city: "Toronto",
    timezone: "GMT-5",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
    headline: "Building a coding routine and training for a half marathon.",
    goals: ["Coding", "Fitness", "Productivity"],
    activityLevel: "Intense",
    communicationStyle: "Focus room",
    reliabilityScore: 91,
    streakDays: 18,
    serious: true
  },
  {
    id: "maya",
    name: "Maya",
    age: 22,
    city: "Lisbon",
    timezone: "GMT+0",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    headline: "Meditation, language learning, and calm daily momentum.",
    goals: ["Meditation", "Language", "Mental health"],
    activityLevel: "Chill",
    communicationStyle: "Voice notes",
    reliabilityScore: 88,
    streakDays: 31,
    serious: false
  }
];

export const goals: Goal[] = [
  {
    id: "study",
    title: "Study 2 hours daily",
    category: "Study",
    progress: 0.87,
    streak: 12,
    target: "8/10 days",
    accent: colors.orange
  },
  {
    id: "workout",
    title: "Workout 4x week",
    category: "Fitness",
    progress: 0.68,
    streak: 7,
    target: "3/4 days",
    accent: colors.emerald
  },
  {
    id: "read",
    title: "Read 20 pages",
    category: "Reading",
    progress: 0.74,
    streak: 9,
    target: "7/10 days",
    accent: colors.purple
  },
  {
    id: "meditate",
    title: "Meditate 10 mins",
    category: "Meditation",
    progress: 0.52,
    streak: 4,
    target: "4/7 days",
    accent: colors.blue
  }
];

export const feedPosts: FeedPost[] = [
  {
    id: "focus-warriors",
    group: "Focus Warriors",
    timeAgo: "1h ago",
    body: "We are in this together. Who is in for a 7-day study challenge?",
    upvotes: 24,
    comments: 12,
    accent: colors.purple
  },
  {
    id: "daily-motivation",
    group: "Daily Motivation",
    timeAgo: "3h ago",
    body: "Discipline today, freedom tomorrow.",
    upvotes: 35,
    comments: 3,
    accent: colors.emerald
  },
  {
    id: "habit-masters",
    group: "Habit Masters",
    timeAgo: "5h ago",
    body: "Share your progress pic, checklist, or streak before midnight.",
    upvotes: 18,
    comments: 8,
    accent: colors.orange
  }
];

export const chatMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "buddy",
    text: "Hey Alex, how was your study session today?",
    time: "10:42"
  },
  {
    id: "2",
    sender: "me",
    text: "It was great. Completed 3 chapters and took notes.",
    time: "10:45"
  },
  {
    id: "3",
    sender: "buddy",
    text: "Amazing. Let us keep the streak going.",
    time: "10:50"
  },
  {
    id: "4",
    sender: "me",
    text: "Voice update sent",
    time: "10:54",
    type: "voice"
  }
];

export const dailyTasks = [
  { id: "study", title: "Study 2 hours", done: true },
  { id: "workout", title: "Workout", done: true },
  { id: "read", title: "Read 20 pages", done: false },
  { id: "meditate", title: "Meditate 10 mins", done: true }
];
