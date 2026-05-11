# BuddyUp Firebase Schema

## Collections

### users

```ts
type User = {
  uid: string;
  name: string;
  email: string;
  username: string;
  age: number;
  timezone: string;
  photoURL?: string;
  interests: string[];
  goals: string[];
  communicationStyle: "daily_chat" | "voice_notes" | "weekly_report" | "focus_room";
  activityLevel: "chill" | "consistent" | "intense";
  studentVerified: boolean;
  reliabilityScore: number;
  xp: number;
  level: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### goals

```ts
type Goal = {
  id: string;
  userId: string;
  title: string;
  category: string;
  target: string;
  cadence: "daily" | "weekly" | "custom";
  completedCount: number;
  streakCount: number;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### buddyMatches

```ts
type BuddyMatch = {
  id: string;
  userIds: [string, string];
  status: "pending" | "matched" | "declined" | "blocked";
  matchScore: number;
  seriousPartner: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### checkIns

```ts
type CheckIn = {
  id: string;
  userId: string;
  buddyMatchId?: string;
  goalIds: string[];
  type: "text" | "photo" | "voice" | "habit";
  note?: string;
  mediaURL?: string;
  completedTasks: string[];
  mood?: "low" | "neutral" | "good" | "great";
  createdAt: Timestamp;
};
```

### chats/{matchId}/messages

```ts
type Message = {
  id: string;
  senderId: string;
  type: "text" | "voice" | "goal_share" | "prompt";
  text?: string;
  mediaURL?: string;
  reactions: Record<string, string>;
  readBy: string[];
  createdAt: Timestamp;
};
```

### communities

```ts
type Community = {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
  public: boolean;
  createdAt: Timestamp;
};
```

### communityPosts

```ts
type CommunityPost = {
  id: string;
  communityId: string;
  authorId?: string;
  anonymous: boolean;
  body: string;
  mediaURL?: string;
  upvoteCount: number;
  commentCount: number;
  createdAt: Timestamp;
};
```

## Firebase Setup

1. Create a Firebase project named `BuddyUp`.
2. Enable Authentication providers: Email/password, Google, and Apple.
3. Enable Firestore, Cloud Storage, Cloud Functions, and Cloud Messaging.
4. Copy the web app config into `app.json` under `expo.extra`.
5. Keep secrets out of source control for production by moving config into environment-specific app config.
6. Add Firestore security rules that scope writes by `request.auth.uid` and validate message membership against `buddyMatches`.

## Cloud Functions

- `onCheckInCreated`: update streaks, XP, weekly report counters, and reliability score.
- `onMessageCreated`: send Cloud Messaging notifications to the matched buddy.
- `scheduledGhostingDetection`: flag matches with missed check-ins or unanswered commitments.
- `moderateCommunityPost`: run toxicity and harassment checks before public visibility.
- `generateDailyPlan`: produce an AI daily plan from active goals, calendar preferences, and mood history.
