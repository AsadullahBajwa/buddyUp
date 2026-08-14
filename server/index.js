const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { URL } = require("url");
const packageJson = require("../package.json");

const PORT = Number(process.env.PORT || 4000);
const defaultDataFile = process.env.BUDDYUP_DB_FILE || path.join(__dirname, "data", "buddyup-db.json");
const APP_VERSION = process.env.BUDDYUP_VERSION || packageJson.version;
const DATA_STORE = process.env.DATA_STORE || "json";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5";
const OLLAMA_ENABLED = process.env.OLLAMA_ENABLED !== "false";
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES || 64 * 1024);

const colors = ["#FF7A00", "#00D084", "#7C3AED", "#2F80ED", "#FFB347"];
const allowedCheckInTypes = new Set(["photo", "text", "voice", "habit"]);

function id(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

function now() {
  return new Date().toISOString();
}

function addDays(value, days) {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  safeDate.setDate(safeDate.getDate() + days);
  return safeDate.toISOString();
}

function seedDatabase() {
  return {
    users: [],
    goals: [],
    matches: [],
    commitments: [],
    checkIns: [],
    messages: [],
    posts: [
      {
        id: "post_focus",
        group: "Focus Warriors",
        timeAgo: "1h ago",
        body: "We are in this together. Who is in for a 7-day study challenge?",
        upvotes: 24,
        comments: 12,
        commentsList: [],
        accent: "#7C3AED",
        createdAt: now()
      },
      {
        id: "post_motivation",
        group: "Daily Motivation",
        timeAgo: "3h ago",
        body: "Discipline today, freedom tomorrow.",
        upvotes: 35,
        comments: 3,
        commentsList: [],
        accent: "#00D084",
        createdAt: now()
      }
    ],
    buddies: [
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
    ]
  };
}

function ensureDatabase(dataFile = defaultDataFile) {
  const dataDir = path.dirname(dataFile);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(seedDatabase(), null, 2));
}

function readDb(dataFile = defaultDataFile) {
  ensureDatabase(dataFile);
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeDb(db, dataFile = defaultDataFile) {
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
}

const collectionNames = ["users", "goals", "matches", "commitments", "checkIns", "messages", "posts", "buddies"];

function normalizeDatabase(db) {
  const seeded = seedDatabase();
  return {
    users: db.users || [],
    goals: db.goals || [],
    matches: db.matches || [],
    commitments: db.commitments || [],
    checkIns: db.checkIns || [],
    messages: db.messages || [],
    posts: db.posts?.length ? db.posts : seeded.posts,
    buddies: db.buddies?.length ? db.buddies : seeded.buddies
  };
}

function createJsonStore(dataFile = defaultDataFile) {
  return {
    async read() {
      return normalizeDatabase(readDb(dataFile));
    },
    async write(db) {
      writeDb(normalizeDatabase(db), dataFile);
    }
  };
}

function createFirestoreStore() {
  let firestore;

  function getFirestore() {
    if (!firestore) {
      const { Firestore } = require("@google-cloud/firestore");
      firestore = new Firestore();
    }
    return firestore;
  }

  return {
    async read() {
      const db = {};
      const client = getFirestore();
      await Promise.all(collectionNames.map(async (name) => {
        const snapshot = await client.collection(name).get();
        db[name] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }));
      return normalizeDatabase(db);
    },
    async write(db) {
      const client = getFirestore();
      const next = normalizeDatabase(db);
      const batch = client.batch();

      await Promise.all(collectionNames.map(async (name) => {
        const collection = client.collection(name);
        const incoming = next[name] || [];
        const incomingIds = new Set(incoming.map((item) => item.id));
        const snapshot = await collection.get();

        snapshot.docs.forEach((doc) => {
          if (!incomingIds.has(doc.id)) {
            batch.delete(doc.ref);
          }
        });

        incoming.forEach((item) => {
          batch.set(collection.doc(item.id), item, { merge: false });
        });
      }));

      await batch.commit();
    }
  };
}

function createDataStore(options = {}) {
  if (options.store) return options.store;
  if (options.dataFile) return createJsonStore(options.dataFile);
  if (DATA_STORE === "firestore") return createFirestoreStore();
  return createJsonStore(defaultDataFile);
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function json(res, status, payload) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
        const error = new Error("Request body is too large");
        error.statusCode = 413;
        req.destroy(error);
        reject(error);
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        error.statusCode = 400;
        error.message = "Request body must be valid JSON";
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function createStarterGoals(userId, selectedGoals) {
  const titles = selectedGoals.length ? selectedGoals : ["Study", "Fitness", "Reading", "Meditation"];
  return titles.slice(0, 4).map((category, index) => ({
    id: id("goal"),
    userId,
    title: category === "Fitness" ? "Workout 4x week" : `${category} habit`,
    category,
    progress: index === 0 ? 0.2 : 0,
    streak: 0,
    target: "0/7 days",
    accent: colors[index % colors.length],
    completed: false,
    createdAt: now(),
    updatedAt: now()
  }));
}

function coachPlan(goals) {
  const active = goals.slice(0, 4);
  if (!active.length) return ["Pick one goal to start", "Do a 10-minute starter session", "Check in tonight"];
  return active.map((goal) => {
    if (goal.category === "Study") return "Study for 45 minutes with phone away";
    if (goal.category === "Fitness") return "Do a 25-minute workout or walk";
    if (goal.category === "Reading") return "Read 10 pages and write one note";
    if (goal.category === "Meditation") return "Meditate for 10 minutes";
    if (goal.category === "Coding") return "Ship one tiny coding task";
    return `Make one concrete step for ${goal.category}`;
  });
}

function coachReply(text, goals) {
  const lower = String(text).toLowerCase();
  const lowest = [...goals].sort((a, b) => a.progress - b.progress)[0];
  if (lower.includes("plan")) return `Today's plan: ${coachPlan(goals).join(", ")}. Keep it small enough to finish.`;
  if (lower.includes("stuck")) return "Shrink the task. Do the first two minutes, send your buddy proof, then decide whether to continue.";
  if (lower.includes("motivat")) return "You do not need a perfect day. You need one completed promise. That is how reliability is built.";
  if (lowest) return `Your lowest-progress goal is ${lowest.title}. Give that one the first clean 20 minutes today.`;
  return "Start with one visible action and check in when it is done.";
}

function buildWeeklyReport(user, goals, commitments, checkIns, matches) {
  const overallProgress = goals.length
    ? Math.round((goals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0) / goals.length) * 100)
    : 0;
  const strongestGoal = goals.length ? [...goals].sort((a, b) => Number(b.progress || 0) - Number(a.progress || 0))[0] : null;
  const focusGoal = goals.length ? [...goals].sort((a, b) => Number(a.progress || 0) - Number(b.progress || 0))[0] : null;
  const completedCommitments = commitments.filter((commitment) => commitment.status === "completed").length;
  const openCommitments = commitments.filter((commitment) => commitment.status === "open").length;
  const totalCommitments = commitments.length;
  const commitmentCompletionRate = totalCommitments ? Math.round((completedCommitments / totalCommitments) * 100) : 0;

  return {
    userId: user.id,
    weekOf: now().slice(0, 10),
    overallProgress,
    reliabilityScore: user.reliabilityScore,
    checkIns: checkIns.length,
    completedCommitments,
    openCommitments,
    commitmentCompletionRate,
    activeMatches: matches.filter((match) => match.status === "matched").length,
    strongestGoal: strongestGoal?.title || "",
    focusGoal: focusGoal?.title || "",
    nextActions: [
      focusGoal ? `Give ${focusGoal.title} your first focused session.` : "Create your first goal.",
      commitments.some((commitment) => commitment.status === "open") ? "Close one open promise today." : "Add one promise for today.",
      matches.length ? "Send your buddy a proof update." : "Match with one accountability buddy."
    ]
  };
}

function buildStats(db) {
  const openCommitments = db.commitments.filter((commitment) => commitment.status === "open").length;
  const completedCommitments = db.commitments.filter((commitment) => commitment.status === "completed").length;
  return {
    users: db.users.length,
    goals: db.goals.length,
    buddies: db.buddies.length,
    matches: db.matches.length,
    messages: db.messages.length,
    checkIns: db.checkIns.length,
    commitments: {
      open: openCommitments,
      completed: completedCommitments,
      total: db.commitments.length
    },
    community: {
      posts: db.posts.length,
      comments: db.posts.reduce((sum, post) => sum + Number(post.comments || 0), 0),
      upvotes: db.posts.reduce((sum, post) => sum + Number(post.upvotes || 0), 0)
    }
  };
}

async function askOllama(text, goals) {
  if (!OLLAMA_ENABLED) throw new Error("Ollama is disabled");

  const goalSummary = goals.map((goal) => `${goal.title}: ${Math.round(goal.progress * 100)}%`).join(", ");
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        {
          role: "system",
          content: "You are BuddyUp's accountability coach. Be concise, practical, motivational, and specific. Give safe habit advice, not medical advice."
        },
        {
          role: "user",
          content: `User goals: ${goalSummary || "No goals yet"}. User asks: ${text}`
        }
      ]
    })
  });
  if (!response.ok) throw new Error("Ollama request failed");
  const data = await response.json();
  return data?.message?.content?.trim();
}

function createBuddyUpServer(options = {}) {
  const store = createDataStore(options);

  return http.createServer(async function handle(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });

  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      return json(res, 200, {
        ok: true,
        service: "buddyup-api",
        store: DATA_STORE,
        time: now(),
        version: APP_VERSION
      });
    }

    const db = await store.read();

    if (req.method === "GET" && url.pathname === "/stats") {
      return json(res, 200, { stats: buildStats(db) });
    }

    if (req.method === "POST" && url.pathname === "/auth/signup") {
      const body = await parseBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      if (!email) return json(res, 400, { error: "Email is required" });
      if (!isValidEmail(email)) return json(res, 400, { error: "Email format is invalid" });
      if (String(body.password || "").length < 6) return json(res, 400, { error: "Password must be at least 6 characters" });
      let user = db.users.find((item) => item.email === email);
      if (!user) {
        user = {
          id: id("user"),
          name: body.name || "BuddyUp User",
          email,
          username: "",
          age: 18,
          timezone: "GMT+1",
          interests: [],
          goals: [],
          xp: 0,
          level: 1,
          badges: 0,
          streakDays: 0,
          reliabilityScore: 70,
          studentVerified: false,
          passwordHash: hashPassword(body.password || "buddyup"),
          createdAt: now(),
          updatedAt: now()
        };
        db.users.push(user);
        db.goals.push(...createStarterGoals(user.id, []));
        await store.write(db);
      }
      return json(res, 200, { user: publicUser(user) });
    }

    if (req.method === "POST" && url.pathname === "/auth/login") {
      const body = await parseBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const user = db.users.find((item) => item.email === email);
      if (!user || user.passwordHash !== hashPassword(body.password || "")) {
        return json(res, 401, { error: "Invalid email or password" });
      }
      return json(res, 200, { user: publicUser(user) });
    }

    if (req.method === "POST" && url.pathname === "/auth/google") {
      const body = await parseBody(req);
      let profile = null;

      if (body.accessToken) {
        const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${body.accessToken}` }
        });
        if (!googleResponse.ok) return json(res, 401, { error: "Google token could not be verified" });
        profile = await googleResponse.json();
      }

      if (!profile && process.env.NODE_ENV === "test" && body.googleProfile) {
        profile = body.googleProfile;
      }

      if (!profile?.email) return json(res, 400, { error: "Google account email is required" });

      const email = String(profile.email).trim().toLowerCase();
      let user = db.users.find((item) => item.email === email);
      if (!user) {
        user = {
          id: id("user"),
          name: profile.name || email.split("@")[0],
          email,
          username: "",
          age: 18,
          timezone: "GMT+1",
          interests: [],
          goals: [],
          xp: 0,
          level: 1,
          badges: 0,
          streakDays: 0,
          reliabilityScore: 70,
          studentVerified: false,
          authProvider: "google",
          googleSub: profile.sub || "",
          photoURL: profile.picture || "",
          passwordHash: "",
          createdAt: now(),
          updatedAt: now()
        };
        db.users.push(user);
        db.goals.push(...createStarterGoals(user.id, []));
      } else {
        user.authProvider = "google";
        user.googleSub = profile.sub || user.googleSub || "";
        user.photoURL = profile.picture || user.photoURL || "";
        user.updatedAt = now();
      }
      await store.write(db);
      return json(res, 200, { user: publicUser(user) });
    }

    if (req.method === "PUT" && parts[0] === "users" && parts[1]) {
      const body = await parseBody(req);
      const user = db.users.find((item) => item.id === parts[1]);
      if (!user) return json(res, 404, { error: "User not found" });
      const username = String(body.username ?? user.username ?? "").trim();
      const age = Number(body.age || user.age);
      const goals = Array.isArray(body.goals) ? body.goals.filter(Boolean) : user.goals;
      if (!username) return json(res, 400, { error: "Username is required" });
      if (!Number.isFinite(age) || age < 13 || age > 100) return json(res, 400, { error: "Age must be between 13 and 100" });
      if (!Array.isArray(goals) || goals.length === 0) return json(res, 400, { error: "Select at least one goal" });
      const hadChosenGoals = Array.isArray(user.goals) && user.goals.length > 0;
      Object.assign(user, {
        username,
        age,
        timezone: body.timezone ?? user.timezone,
        goals,
        interests: goals,
        updatedAt: now()
      });
      const existingGoals = db.goals.filter((goal) => goal.userId === user.id);
      if (!hadChosenGoals || existingGoals.length === 0 || existingGoals.every((goal) => goal.progress === 0 && goal.streak === 0)) {
        db.goals = db.goals.filter((goal) => goal.userId !== user.id);
        db.goals.push(...createStarterGoals(user.id, user.goals));
      }
      await store.write(db);
      return json(res, 200, { user: publicUser(user), goals: db.goals.filter((goal) => goal.userId === user.id) });
    }

    if (req.method === "GET" && url.pathname === "/dashboard") {
      const userId = url.searchParams.get("userId");
      const user = db.users.find((item) => item.id === userId);
      if (!user) return json(res, 404, { error: "User not found" });
      return json(res, 200, {
        user: publicUser(user),
        goals: db.goals.filter((goal) => goal.userId === userId),
        matches: db.matches.filter((match) => match.userId === userId),
        commitments: db.commitments.filter((commitment) => commitment.userId === userId),
        posts: db.posts
      });
    }

    if (req.method === "GET" && url.pathname === "/buddies") {
      const seriousOnly = url.searchParams.get("seriousOnly") === "true";
      const goal = String(url.searchParams.get("goal") || "").trim().toLowerCase();
      let buddies = seriousOnly ? db.buddies.filter((buddy) => buddy.serious) : db.buddies;
      if (goal) {
        buddies = buddies.filter((buddy) => buddy.goals.some((item) => String(item).toLowerCase() === goal));
      }
      return json(res, 200, { buddies });
    }

    if (req.method === "GET" && url.pathname === "/reports/weekly") {
      const userId = url.searchParams.get("userId");
      const user = db.users.find((item) => item.id === userId);
      if (!user) return json(res, 404, { error: "User not found" });
      return json(res, 200, {
        report: buildWeeklyReport(
          publicUser(user),
          db.goals.filter((goal) => goal.userId === userId),
          db.commitments.filter((commitment) => commitment.userId === userId),
          db.checkIns.filter((checkIn) => checkIn.userId === userId),
          db.matches.filter((match) => match.userId === userId)
        )
      });
    }

    if (req.method === "POST" && url.pathname === "/matches") {
      const body = await parseBody(req);
      const user = db.users.find((item) => item.id === body.userId);
      if (!user) return json(res, 404, { error: "User not found" });
      const buddy = db.buddies.find((item) => item.id === body.buddyId);
      if (!buddy) return json(res, 404, { error: "Buddy not found" });
      let match = db.matches.find((item) => item.userId === body.userId && item.buddyId === body.buddyId);
      if (!match) {
        match = {
          id: id("match"),
          userId: body.userId,
          buddyId: body.buddyId,
          status: "matched",
          createdAt: now()
        };
        db.matches.push(match);
        db.messages.push({
          id: id("msg"),
          matchId: match.id,
          sender: "buddy",
          text: `Hey, I am ${buddy.name}. What commitment are we locking in today?`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          createdAt: now()
        });
      }
      await store.write(db);
      return json(res, 200, { match, buddy });
    }

    if (req.method === "GET" && url.pathname === "/messages") {
      const matchId = url.searchParams.get("matchId");
      return json(res, 200, { messages: db.messages.filter((message) => message.matchId === matchId) });
    }

    if (req.method === "POST" && url.pathname === "/messages") {
      const body = await parseBody(req);
      const text = String(body.text || "").trim();
      if (!text) return json(res, 400, { error: "Message text is required" });
      const message = {
        id: id("msg"),
        matchId: body.matchId,
        sender: "me",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        createdAt: now()
      };
      const reply = {
        id: id("msg"),
        matchId: body.matchId,
        sender: "buddy",
        text: "Nice. Send the proof when it is done and I will check in again tonight.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        createdAt: now()
      };
      db.messages.push(message, reply);
      await store.write(db);
      return json(res, 200, { messages: db.messages.filter((item) => item.matchId === body.matchId) });
    }

    if (req.method === "POST" && url.pathname === "/checkins") {
      const body = await parseBody(req);
      const user = db.users.find((item) => item.id === body.userId);
      if (!user) return json(res, 404, { error: "User not found" });
      const type = String(body.type || "text").toLowerCase();
      if (!allowedCheckInTypes.has(type)) return json(res, 400, { error: "Check-in type is invalid" });
      const completedTaskIds = Array.isArray(body.completedTaskIds) ? body.completedTaskIds : [];
      const checkIn = {
        id: id("checkin"),
        userId: user.id,
        note: String(body.note || "").trim(),
        type,
        completedTaskIds,
        createdAt: now()
      };
      db.checkIns.push(checkIn);
      db.goals.forEach((goal) => {
        if (goal.userId === user.id && completedTaskIds.includes(goal.id)) {
          goal.progress = Math.min(1, Number(goal.progress || 0) + 0.14);
          goal.streak = Number(goal.streak || 0) + 1;
          goal.target = `${Math.min(7, goal.streak)}/7 days`;
          goal.updatedAt = now();
        }
      });
      user.xp += 25 + completedTaskIds.length * 10;
      user.level = Math.max(1, Math.floor(user.xp / 300) + 1);
      user.badges = Math.floor(user.xp / 250);
      user.streakDays += 1;
      user.reliabilityScore = Math.min(99, user.reliabilityScore + 1);
      user.updatedAt = now();
      await store.write(db);
      return json(res, 200, {
        checkIn,
        user: publicUser(user),
        goals: db.goals.filter((goal) => goal.userId === user.id)
      });
    }

    if (req.method === "POST" && url.pathname === "/commitments") {
      const body = await parseBody(req);
      const user = db.users.find((item) => item.id === body.userId);
      if (!user) return json(res, 404, { error: "User not found" });
      const title = String(body.title || "").trim();
      if (!title) return json(res, 400, { error: "Commitment title is required" });
      const commitment = {
        id: id("commitment"),
        userId: user.id,
        goalId: body.goalId || "",
        title,
        status: "open",
        dueAt: body.dueAt || now(),
        createdAt: now()
      };
      db.commitments.unshift(commitment);
      await store.write(db);
      return json(res, 200, {
        commitment,
        commitments: db.commitments.filter((item) => item.userId === user.id)
      });
    }

    if (req.method === "PATCH" && parts[0] === "commitments" && parts[1] && parts[2] === "complete") {
      const commitment = db.commitments.find((item) => item.id === parts[1]);
      if (!commitment) return json(res, 404, { error: "Commitment not found" });
      commitment.status = "completed";
      commitment.completedAt = now();
      const user = db.users.find((item) => item.id === commitment.userId);
      if (user) {
        user.xp += 15;
        user.reliabilityScore = Math.min(99, user.reliabilityScore + 1);
        user.updatedAt = now();
      }
      await store.write(db);
      return json(res, 200, {
        commitment,
        commitments: db.commitments.filter((item) => item.userId === commitment.userId),
        user: publicUser(user)
      });
    }

    if (req.method === "PATCH" && parts[0] === "commitments" && parts[1] && parts[2] === "snooze") {
      const body = await parseBody(req);
      const commitment = db.commitments.find((item) => item.id === parts[1]);
      if (!commitment) return json(res, 404, { error: "Commitment not found" });
      const days = Number(body.days || 1);
      if (!Number.isFinite(days) || days < 1 || days > 14) return json(res, 400, { error: "Snooze days must be between 1 and 14" });
      commitment.dueAt = addDays(commitment.dueAt, days);
      commitment.snoozedAt = now();
      commitment.updatedAt = now();
      await store.write(db);
      return json(res, 200, {
        commitment,
        commitments: db.commitments.filter((item) => item.userId === commitment.userId)
      });
    }

    if (req.method === "DELETE" && parts[0] === "commitments" && parts[1]) {
      const commitment = db.commitments.find((item) => item.id === parts[1]);
      if (!commitment) return json(res, 404, { error: "Commitment not found" });
      db.commitments = db.commitments.filter((item) => item.id !== commitment.id);
      await store.write(db);
      return json(res, 200, {
        commitment,
        commitments: db.commitments.filter((item) => item.userId === commitment.userId)
      });
    }

    if (req.method === "GET" && url.pathname === "/community/posts") {
      return json(res, 200, { posts: db.posts });
    }

    if (req.method === "POST" && url.pathname === "/community/posts") {
      const body = await parseBody(req);
      const postBody = String(body.body || "").trim();
      if (!postBody) return json(res, 400, { error: "Post body is required" });
      const post = {
        id: id("post"),
        group: body.group || "Daily Motivation",
        timeAgo: "now",
        body: postBody,
        upvotes: 0,
        comments: 0,
        commentsList: [],
        accent: colors[db.posts.length % colors.length],
        createdAt: now()
      };
      db.posts.unshift(post);
      await store.write(db);
      return json(res, 200, { posts: db.posts });
    }

    if (req.method === "POST" && parts[0] === "community" && parts[1] === "posts" && parts[2] && parts[3] === "upvote") {
      const post = db.posts.find((item) => item.id === parts[2]);
      if (!post) return json(res, 404, { error: "Post not found" });
      post.upvotes = Number(post.upvotes || 0) + 1;
      await store.write(db);
      return json(res, 200, { post, posts: db.posts });
    }

    if (req.method === "POST" && parts[0] === "community" && parts[1] === "posts" && parts[2] && parts[3] === "comments") {
      const body = await parseBody(req);
      const post = db.posts.find((item) => item.id === parts[2]);
      if (!post) return json(res, 404, { error: "Post not found" });
      const commentBody = String(body.body || "").trim();
      if (!commentBody) return json(res, 400, { error: "Comment body is required" });
      const comment = {
        id: id("comment"),
        author: body.author || "BuddyUp member",
        body: commentBody,
        createdAt: now()
      };
      post.commentsList = Array.isArray(post.commentsList) ? post.commentsList : [];
      post.commentsList.push(comment);
      post.comments = Number(post.comments || 0) + 1;
      await store.write(db);
      return json(res, 200, { post, posts: db.posts });
    }

    if (req.method === "GET" && url.pathname === "/coach/plan") {
      const userId = url.searchParams.get("userId");
      const goals = db.goals.filter((goal) => goal.userId === userId);
      return json(res, 200, { plan: coachPlan(goals) });
    }

    if (req.method === "POST" && url.pathname === "/coach/message") {
      const body = await parseBody(req);
      const text = String(body.text || "").trim();
      if (!text) return json(res, 400, { error: "Coach message text is required" });
      const goals = db.goals.filter((goal) => goal.userId === body.userId);
      let reply = coachReply(text, goals);
      let provider = "rules";
      try {
        const ollamaReply = await askOllama(text, goals);
        if (ollamaReply) {
          reply = ollamaReply;
          provider = "ollama";
        }
      } catch (error) {
        provider = "rules";
      }
      return json(res, 200, { reply, plan: coachPlan(goals), provider });
    }

    return json(res, 404, { error: "Route not found" });
  } catch (error) {
    return json(res, error.statusCode || 500, { error: error.message });
  }
});
}

function getLanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => item.address);
}

if (require.main === module) {
  createBuddyUpServer().listen(PORT, "0.0.0.0", () => {
    console.log(`BuddyUp API listening on http://localhost:${PORT}`);
    console.log(`Ollama coach: ${OLLAMA_ENABLED ? `${OLLAMA_URL} model=${OLLAMA_MODEL}` : "disabled"}`);
    getLanAddresses().forEach((address) => console.log(`Phone/emulator API: http://${address}:${PORT}`));
  });
}

module.exports = {
  createBuddyUpServer,
  seedDatabase,
  buildWeeklyReport,
  coachPlan,
  coachReply
};
