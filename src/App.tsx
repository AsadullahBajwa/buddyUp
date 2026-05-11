import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
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
import { Buddy, BuddyMatch, ChatMessage, FeedPost, Goal, LocalUser, TabKey } from "./types/app";

type AuthStep = "splash" | "onboarding" | "auth" | "profile" | "main";
type RouteKey = TabKey | "community" | "coach";

export default function App() {
  const [authStep, setAuthStep] = useState<AuthStep>("splash");
  const [route, setRoute] = useState<RouteKey>("home");
  const [user, setUser] = useState<LocalUser | null>(null);
  const [goals, setGoals] = useState<Goal[]>(seedGoals);
  const [posts, setPosts] = useState<FeedPost[]>(seedPosts);
  const [matches, setMatches] = useState<BuddyMatch[]>([]);
  const [activeBuddy, setActiveBuddy] = useState<Buddy>(seedBuddies[0]);
  const [activeMatchId, setActiveMatchId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);

  const enterOnboarding = useCallback(() => setAuthStep("onboarding"), []);
  const enterAuth = useCallback(() => setAuthStep("auth"), []);
  const enterMain = useCallback(() => setAuthStep("main"), []);

  useEffect(() => {
    if (!user) return;
    api.dashboard(user.id)
      .then((data) => {
        setUser(data.user);
        setGoals(data.goals);
        setMatches(data.matches);
        setPosts(data.posts);
      })
      .catch(() => undefined);
  }, [user?.id]);

  async function handleSignup(input: { name: string; email: string; password: string }) {
    try {
      const data = await api.signup(input);
      setUser(data.user);
      setAuthStep("profile");
    } catch (error) {
      Alert.alert("Signup failed", error instanceof Error ? error.message : "Could not create account");
    }
  }

  async function handleGoogleSignup(accessToken: string) {
    try {
      const data = await api.googleSignup(accessToken);
      setUser(data.user);
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
      setRoute("chat");
    } catch (error) {
      Alert.alert("Match failed", error instanceof Error ? error.message : "Could not match with this buddy");
    }
  }

  async function handleCheckIn(input: { completedTaskIds: string[]; note: string; type: string }) {
    if (!user) return;
    try {
      const data = await api.checkIn({ userId: user.id, ...input });
      setUser(data.user);
      setGoals(data.goals);
      Alert.alert("Check-in saved", `Nice work. You earned XP and updated ${input.completedTaskIds.length} goal(s).`);
      setRoute("home");
    } catch (error) {
      Alert.alert("Check-in failed", error instanceof Error ? error.message : "Could not save check-in");
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
    const data = await api.sendMessage(activeMatchId, text);
    setMessages(data.messages);
  }

  async function handleCreatePost(body: string) {
    const data = await api.createPost(body);
    setPosts(data.posts);
  }

  if (authStep === "splash") {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen onDone={enterOnboarding} />
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
        <GoalsScreen goals={goals} onOpenCommunity={() => setRoute("community")} onOpenCoach={() => setRoute("coach")} />
      ) : null}
      {route === "community" ? <CommunityScreen posts={posts} onCreatePost={handleCreatePost} /> : null}
      {route === "coach" ? <AICoachScreen goals={goals} userId={user?.id} onBack={() => setRoute("home")} /> : null}
      {route === "discover" ? <DiscoverScreen onMatch={handleMatch} /> : null}
      {route === "checkin" ? <CheckInScreen goals={goals} onSubmit={handleCheckIn} /> : null}
      {route === "chat" ? <ChatScreen buddy={activeBuddy} messages={messages} onSendMessage={handleSendMessage} /> : null}
      {route === "profile" ? <ProfileScreen user={user} goals={goals} matchesCount={matches.length} /> : null}
      <BottomTabs active={activeTab} onChange={setRoute} />
    </SafeAreaProvider>
  );
}
