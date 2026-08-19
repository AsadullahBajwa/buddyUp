import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BottomTabs } from "./components/BottomTabs";
import { AICoachScreen } from "./screens/AICoachScreen";
import { AuthScreen } from "./screens/AuthScreen";
import { ChatScreen } from "./screens/ChatScreen";
import { CheckInScreen } from "./screens/CheckInScreen";
import { CommunityScreen } from "./screens/CommunityScreen";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { GoalsScreen } from "./screens/GoalsScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ProfileSetupScreen } from "./screens/ProfileSetupScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { api } from "./services/api";
import { buddies as seedBuddies, chatMessages as seedMessages, feedPosts as seedPosts, goals as seedGoals } from "./data/mockData";
import { ApiHealth, ApiStats, Buddy, BuddyMatch, ChatMessage, CheckIn, Commitment, FeedPost, Goal, LocalUser, TabKey, WeeklyReport } from "./types/app";

type AuthStep = "splash" | "onboarding" | "auth" | "profile" | "main";
type RouteKey = TabKey | "community" | "coach";
const SESSION_USER_ID = "buddyup:userId";

export default function App() {
  const [authStep, setAuthStep] = useState<AuthStep>("splash");
  const [route, setRoute] = useState<RouteKey>("home");
  const [user, setUser] = useState<LocalUser | null>(null);
  const [goals, setGoals] = useState<Goal[]>(seedGoals);
  const [posts, setPosts] = useState<FeedPost[]>(seedPosts);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);
  const [matches, setMatches] = useState<BuddyMatch[]>([]);
  const [activeBuddy, setActiveBuddy] = useState<Buddy>(seedBuddies[0]);
  const [activeMatchId, setActiveMatchId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [isSavingCheckIn, setIsSavingCheckIn] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  const enterAuth = useCallback(() => setAuthStep("auth"), []);
  const enterMain = useCallback(() => setAuthStep("main"), []);

  const refreshApiHealth = useCallback(async () => {
    try {
      const data = await api.health();
      setApiHealth(data);
    } catch (error) {
      setApiHealth(null);
    }
  }, []);

  const refreshApiStats = useCallback(async () => {
    try {
      const data = await api.stats();
      setApiStats(data.stats);
    } catch (error) {
      setApiStats(null);
    }
  }, []);

  async function refreshWeeklyReport(userId: string) {
    try {
      const data = await api.weeklyReport(userId);
      setWeeklyReport(data.report);
    } catch (error) {
      setWeeklyReport(null);
    }
  }

  async function refreshCheckIns(userId: string) {
    try {
      const data = await api.checkIns(userId, 5);
      setRecentCheckIns(data.checkIns);
    } catch (error) {
      setRecentCheckIns([]);
    }
  }

  const restoreOrStart = useCallback(async () => {
    if (isRestoringSession) return;
    setIsRestoringSession(true);
    try {
      const userId = await AsyncStorage.getItem(SESSION_USER_ID);
      if (!userId) {
        setAuthStep("onboarding");
        return;
      }
      const data = await api.dashboard(userId);
      setUser(data.user);
      setGoals(data.goals);
      setMatches(data.matches);
      setPosts(data.posts);
      setCommitments(data.commitments);
      await refreshApiHealth();
      await refreshApiStats();
      await refreshWeeklyReport(data.user.id);
      await refreshCheckIns(data.user.id);
      setRoute("home");
      setAuthStep("main");
    } catch (error) {
      await AsyncStorage.removeItem(SESSION_USER_ID);
      setAuthStep("onboarding");
    } finally {
      setIsRestoringSession(false);
    }
  }, [isRestoringSession, refreshApiHealth, refreshApiStats]);

  useEffect(() => {
    if (!user) return;
    api.dashboard(user.id)
      .then(async (data) => {
        setUser(data.user);
        setGoals(data.goals);
        setMatches(data.matches);
        setPosts(data.posts);
        setCommitments(data.commitments);
        await refreshApiHealth();
        await refreshApiStats();
        await refreshWeeklyReport(data.user.id);
        await refreshCheckIns(data.user.id);
      })
      .catch(() => undefined);
  }, [refreshApiHealth, refreshApiStats, user?.id]);

  async function handleSignup(input: { name: string; email: string; password: string }) {
    try {
      const data = await api.signup(input);
      setUser(data.user);
      await AsyncStorage.setItem(SESSION_USER_ID, data.user.id);
      setAuthStep("profile");
    } catch (error) {
      Alert.alert("Signup failed", error instanceof Error ? error.message : "Could not create account");
    }
  }

  async function handleLogin(input: { email: string; password: string }) {
    try {
      const data = await api.login(input);
      setUser(data.user);
      await AsyncStorage.setItem(SESSION_USER_ID, data.user.id);
      enterMain();
    } catch (error) {
      Alert.alert("Login failed", error instanceof Error ? error.message : "Could not sign in");
    }
  }

  async function handleGoogleSignup(accessToken: string) {
    try {
      const data = await api.googleSignup(accessToken);
      setUser(data.user);
      await AsyncStorage.setItem(SESSION_USER_ID, data.user.id);
      setAuthStep("profile");
    } catch (error) {
      Alert.alert("Google sign-in failed", error instanceof Error ? error.message : "Could not connect Google account");
    }
  }

  async function handleProfileComplete(input: Parameters<typeof api.updateProfile>[1]) {
    if (!user) return;
    try {
      const data = await api.updateProfile(user.id, input);
      setUser(data.user);
      setGoals(data.goals);
      await AsyncStorage.setItem(SESSION_USER_ID, data.user.id);
      enterMain();
    } catch (error) {
      Alert.alert("Profile setup failed", error instanceof Error ? error.message : "Could not save profile");
    }
  }

  async function handleMatch(buddy: Buddy) {
    if (!user) return;
    try {
      const data = await api.match(user.id, buddy.id);
      setActiveBuddy(data.buddy);
      setActiveMatchId(data.match.id);
      setMatches((current) => {
        if (current.some((match) => match.id === data.match.id)) return current;
        return [...current, data.match];
      });
      const messageData = await api.messages(data.match.id);
      setMessages(messageData.messages);
      await refreshApiStats();
      await refreshWeeklyReport(user.id);
      setRoute("chat");
    } catch (error) {
      Alert.alert("Match failed", error instanceof Error ? error.message : "Could not match with this buddy");
    }
  }

  async function handleCheckIn(input: { completedTaskIds: string[]; note: string; type: string }) {
    if (!user) return;
    if (input.completedTaskIds.length === 0 && !input.note.trim()) {
      Alert.alert("Check-in needs progress", "Select at least one goal or add a short note first.");
      return;
    }
    try {
      setIsSavingCheckIn(true);
      const data = await api.checkIn({ userId: user.id, ...input });
      setUser(data.user);
      setGoals(data.goals);
      setRecentCheckIns((current) => [data.checkIn, ...current.filter((checkIn) => checkIn.id !== data.checkIn.id)].slice(0, 5));
      await refreshApiStats();
      await refreshWeeklyReport(user.id);
      Alert.alert("Check-in saved", `Nice work. You earned XP and updated ${input.completedTaskIds.length} goal(s).`);
      setRoute("home");
    } catch (error) {
      Alert.alert("Check-in failed", error instanceof Error ? error.message : "Could not save check-in");
    } finally {
      setIsSavingCheckIn(false);
    }
  }

  async function handleSendMessage(text: string) {
    if (!activeMatchId) {
      setMessages((current) => [
        ...current,
        { id: `local_${Date.now()}`, sender: "me", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        { id: `reply_${Date.now()}`, sender: "buddy", text: "Match with a buddy first and I will keep you accountable.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      ]);
      return;
    }
    try {
      const data = await api.sendMessage(activeMatchId, text);
      setMessages(data.messages);
    } catch (error) {
      Alert.alert("Message failed", error instanceof Error ? error.message : "Could not send this message");
    }
  }

  async function handleCreatePost(body: string) {
    const data = await api.createPost(body);
    setPosts(data.posts);
    await refreshApiStats();
  }

  async function handleUpvotePost(postId: string) {
    const data = await api.upvotePost(postId);
    setPosts(data.posts);
    await refreshApiStats();
  }

  async function handleCommentPost(postId: string, body: string) {
    const data = await api.commentPost(postId, body);
    setPosts(data.posts);
    await refreshApiStats();
  }

  async function handleLogout() {
    await AsyncStorage.removeItem(SESSION_USER_ID);
    setUser(null);
    setMatches([]);
    setMessages(seedMessages);
    setCommitments([]);
    setRecentCheckIns([]);
    setWeeklyReport(null);
    setApiHealth(null);
    setApiStats(null);
    setRoute("home");
    setAuthStep("auth");
  }

  async function handleAddCommitment(titleOverride?: string) {
    if (!user) return;
    const priorityGoal = goals.find((goal) => goal.progress < 1) ?? goals[0];
    const title = titleOverride?.trim() || (priorityGoal ? `Finish one ${priorityGoal.category.toLowerCase()} session today` : "Finish one focused session today");
    try {
      const data = await api.createCommitment({
        userId: user.id,
        goalId: priorityGoal?.id,
        title
      });
      setCommitments(data.commitments);
      await refreshApiStats();
      await refreshWeeklyReport(user.id);
    } catch (error) {
      Alert.alert("Commitment failed", error instanceof Error ? error.message : "Could not create commitment");
    }
  }

  async function handleCompleteCommitment(commitmentId: string) {
    try {
      const data = await api.completeCommitment(commitmentId);
      setUser(data.user);
      setCommitments(data.commitments);
      await refreshApiStats();
      if (data.user?.id) await refreshWeeklyReport(data.user.id);
    } catch (error) {
      Alert.alert("Commitment failed", error instanceof Error ? error.message : "Could not complete commitment");
    }
  }

  async function handleSnoozeCommitment(commitmentId: string) {
    try {
      const data = await api.snoozeCommitment(commitmentId);
      setCommitments(data.commitments);
      await refreshApiStats();
      if (user?.id) await refreshWeeklyReport(user.id);
      Alert.alert("Promise snoozed", "Moved this promise forward by one day.");
    } catch (error) {
      Alert.alert("Snooze failed", error instanceof Error ? error.message : "Could not snooze commitment");
    }
  }

  async function handleDeleteCommitment(commitmentId: string) {
    try {
      const data = await api.deleteCommitment(commitmentId);
      setCommitments(data.commitments);
      await refreshApiStats();
      if (user?.id) await refreshWeeklyReport(user.id);
    } catch (error) {
      Alert.alert("Commitment failed", error instanceof Error ? error.message : "Could not delete commitment");
    }
  }

  if (authStep === "splash") {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen onDone={restoreOrStart} />
      </SafeAreaProvider>
    );
  }

  if (authStep === "onboarding") {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen onContinue={enterAuth} />
      </SafeAreaProvider>
    );
  }

  if (authStep === "auth") {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthScreen
          onAuthError={(message) => Alert.alert("Authentication", message)}
          onAuthenticated={handleSignup}
          onLogin={handleLogin}
          onGoogleAuthenticated={handleGoogleSignup}
        />
      </SafeAreaProvider>
    );
  }

  if (authStep === "profile") {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ProfileSetupScreen onComplete={handleProfileComplete} />
      </SafeAreaProvider>
    );
  }

  const activeTab: TabKey = route === "community" || route === "coach" ? "home" : route;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {route === "home" ? (
        <GoalsScreen
          commitments={commitments}
          goals={goals}
          onAddCommitment={handleAddCommitment}
          onCompleteCommitment={handleCompleteCommitment}
          onDeleteCommitment={handleDeleteCommitment}
          onSnoozeCommitment={handleSnoozeCommitment}
          onOpenCommunity={() => setRoute("community")}
          onOpenCoach={() => setRoute("coach")}
        />
      ) : null}
      {route === "community" ? (
        <CommunityScreen
          posts={posts}
          onCommentPost={handleCommentPost}
          onCreatePost={handleCreatePost}
          onUpvotePost={handleUpvotePost}
        />
      ) : null}
      {route === "coach" ? <AICoachScreen goals={goals} userId={user?.id} onBack={() => setRoute("home")} /> : null}
      {route === "discover" ? <DiscoverScreen onMatch={handleMatch} /> : null}
      {route === "checkin" ? <CheckInScreen goals={goals} isSubmitting={isSavingCheckIn} onSubmit={handleCheckIn} /> : null}
      {route === "chat" ? <ChatScreen buddy={activeBuddy} messages={messages} onSendMessage={handleSendMessage} /> : null}
      {route === "profile" ? (
        <ProfileScreen
          commitments={commitments}
          goals={goals}
          matchesCount={matches.length}
          onLogout={handleLogout}
          apiHealth={apiHealth}
          apiStats={apiStats}
          recentCheckIns={recentCheckIns}
          user={user}
          weeklyReport={weeklyReport}
        />
      ) : null}
      <BottomTabs active={activeTab} onChange={setRoute} />
    </SafeAreaProvider>
  );
}
