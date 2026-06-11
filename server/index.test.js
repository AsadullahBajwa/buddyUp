const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { createBuddyUpServer } = require("./index");

process.env.NODE_ENV = "test";

async function withApi(fn) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "buddyup-test-"));
  const dataFile = path.join(tempDir, "db.json");
  const server = createBuddyUpServer({ dataFile });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function api(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });
  const body = await response.json();
  return { response, body };
}

async function createUser(baseUrl) {
  const { response, body } = await api(baseUrl, "/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name: "Alex Carter",
      email: `alex-${Date.now()}@buddyup.test`,
      password: "buddyup123"
    })
  });
  assert.equal(response.status, 200);
  assert.ok(body.user.id);
  return body.user;
}

test("health endpoint reports the API is alive", async () => {
  await withApi(async (baseUrl) => {
    const { response, body } = await api(baseUrl, "/health");
    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.service, "buddyup-api");
    assert.equal(body.store, "json");
    assert.equal(body.version, "0.1.0");
    assert.ok(body.time);
  });
});

test("signup creates a public user and starter goals", async () => {
  await withApi(async (baseUrl) => {
    const user = await createUser(baseUrl);
    assert.equal(user.email.includes("@buddyup.test"), true);
    assert.equal(user.passwordHash, undefined);

    const { body } = await api(baseUrl, `/dashboard?userId=${user.id}`);
    assert.equal(body.user.id, user.id);
    assert.equal(body.goals.length, 4);
    assert.equal(body.posts.length, 2);
  });
});

test("email login returns an existing public user", async () => {
  await withApi(async (baseUrl) => {
    const email = `login-${Date.now()}@buddyup.test`;
    const password = "buddyup123";

    await api(baseUrl, "/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Login User", email, password })
    });

    const { response, body } = await api(baseUrl, "/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    assert.equal(response.status, 200);
    assert.equal(body.user.email, email);
    assert.equal(body.user.passwordHash, undefined);
  });
});

test("invalid JSON returns a client error", async () => {
  await withApi(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not-json"
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "Request body must be valid JSON");
  });
});

test("signup validates email and password inputs", async () => {
  await withApi(async (baseUrl) => {
    const invalidEmail = await api(baseUrl, "/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Bad Email", email: "bad-email", password: "buddyup123" })
    });
    assert.equal(invalidEmail.response.status, 400);
    assert.equal(invalidEmail.body.error, "Email format is invalid");

    const shortPassword = await api(baseUrl, "/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: "Short Password", email: "short@buddyup.test", password: "123" })
    });
    assert.equal(shortPassword.response.status, 400);
    assert.equal(shortPassword.body.error, "Password must be at least 6 characters");
  });
});

test("google auth connects a verified Google profile to a local user", async () => {
  await withApi(async (baseUrl) => {
    const { response, body } = await api(baseUrl, "/auth/google", {
      method: "POST",
      body: JSON.stringify({
        googleProfile: {
          sub: "google-user-123",
          email: "google.user@buddyup.test",
          name: "Google User",
          picture: "https://example.com/avatar.png"
        }
      })
    });

    assert.equal(response.status, 200);
    assert.equal(body.user.email, "google.user@buddyup.test");
    assert.equal(body.user.authProvider, "google");
    assert.equal(body.user.passwordHash, undefined);
  });
});

test("profile setup persists username and selected goals", async () => {
  await withApi(async (baseUrl) => {
    const user = await createUser(baseUrl);
    const { response, body } = await api(baseUrl, `/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify({
        username: "alex_productive",
        age: 22,
        timezone: "GMT+1",
        goals: ["Study", "Fitness", "Coding"]
      })
    });

    assert.equal(response.status, 200);
    assert.equal(body.user.username, "alex_productive");
    assert.deepEqual(body.user.goals, ["Study", "Fitness", "Coding"]);
    assert.equal(body.goals.length, 3);
  });
});

test("check-in updates goal progress, streak, XP, level inputs", async () => {
  await withApi(async (baseUrl) => {
    const user = await createUser(baseUrl);
    const profile = await api(baseUrl, `/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify({
        username: "alex_productive",
        age: 22,
        timezone: "GMT+1",
        goals: ["Study", "Fitness"]
      })
    });
    const firstGoalId = profile.body.goals[0].id;

    const { response, body } = await api(baseUrl, "/checkins", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        completedTaskIds: [firstGoalId],
        note: "Done.",
        type: "text"
      })
    });

    assert.equal(response.status, 200);
    assert.equal(body.user.xp, 35);
    assert.equal(body.user.streakDays, 1);
    assert.equal(body.goals[0].streak, 1);
    assert.ok(body.goals[0].progress > 0);
  });
});

test("commitments can be created and completed for accountability credit", async () => {
  await withApi(async (baseUrl) => {
    const user = await createUser(baseUrl);
    const created = await api(baseUrl, "/commitments", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        title: "Finish one study sprint"
      })
    });

    assert.equal(created.response.status, 200);
    assert.equal(created.body.commitment.status, "open");

    const dashboard = await api(baseUrl, `/dashboard?userId=${user.id}`);
    assert.equal(dashboard.body.commitments.length, 1);

    const completed = await api(baseUrl, `/commitments/${created.body.commitment.id}/complete`, {
      method: "PATCH"
    });

    assert.equal(completed.response.status, 200);
    assert.equal(completed.body.commitment.status, "completed");
    assert.equal(completed.body.user.xp, 15);
    assert.equal(completed.body.user.reliabilityScore, 71);
  });
});

test("commitments can be deleted when plans change", async () => {
  await withApi(async (baseUrl) => {
    const user = await createUser(baseUrl);
    const created = await api(baseUrl, "/commitments", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        title: "Read ten pages"
      })
    });

    const deleted = await api(baseUrl, `/commitments/${created.body.commitment.id}`, {
      method: "DELETE"
    });

    assert.equal(deleted.response.status, 200);
    assert.equal(deleted.body.commitment.title, "Read ten pages");
    assert.equal(deleted.body.commitments.length, 0);
  });
});

test("weekly report summarizes accountability progress", async () => {
  await withApi(async (baseUrl) => {
    const user = await createUser(baseUrl);
    const dashboard = await api(baseUrl, `/dashboard?userId=${user.id}`);
    const goalId = dashboard.body.goals[0].id;
    const commitment = await api(baseUrl, "/commitments", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, goalId, title: "Study for 45 minutes" })
    });
    await api(baseUrl, `/commitments/${commitment.body.commitment.id}/complete`, { method: "PATCH" });
    await api(baseUrl, "/checkins", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, completedTaskIds: [goalId], note: "Done", type: "text" })
    });

    const report = await api(baseUrl, `/reports/weekly?userId=${user.id}`);

    assert.equal(report.response.status, 200);
    assert.equal(report.body.report.completedCommitments, 1);
    assert.equal(report.body.report.checkIns, 1);
    assert.ok(report.body.report.overallProgress > 0);
    assert.ok(report.body.report.nextActions.length >= 3);
  });
});

test("buddy matching creates a match and starter message", async () => {
  await withApi(async (baseUrl) => {
    const user = await createUser(baseUrl);
    const buddies = await api(baseUrl, "/buddies?seriousOnly=true");
    assert.ok(buddies.body.buddies.length > 0);

    const matched = await api(baseUrl, "/matches", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, buddyId: buddies.body.buddies[0].id })
    });
    assert.equal(matched.response.status, 200);
    assert.equal(matched.body.match.status, "matched");

    const messages = await api(baseUrl, `/messages?matchId=${matched.body.match.id}`);
    assert.equal(messages.body.messages.length, 1);
    assert.equal(messages.body.messages[0].sender, "buddy");
  });
});

test("buddy discovery can be filtered by goal", async () => {
  await withApi(async (baseUrl) => {
    const coding = await api(baseUrl, "/buddies?seriousOnly=true&goal=Coding");
    assert.equal(coding.response.status, 200);
    assert.equal(coding.body.buddies.length, 1);
    assert.equal(coding.body.buddies[0].id, "leo");

    const meditation = await api(baseUrl, "/buddies?seriousOnly=true&goal=Meditation");
    assert.equal(meditation.response.status, 200);
    assert.equal(meditation.body.buddies.length, 0);
  });
});

test("chat sends a message and receives an accountability reply", async () => {
  await withApi(async (baseUrl) => {
    const user = await createUser(baseUrl);
    const matched = await api(baseUrl, "/matches", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, buddyId: "sara" })
    });

    const sent = await api(baseUrl, "/messages", {
      method: "POST",
      body: JSON.stringify({ matchId: matched.body.match.id, text: "I will study tonight." })
    });

    assert.equal(sent.response.status, 200);
    assert.equal(sent.body.messages.at(-2).sender, "me");
    assert.equal(sent.body.messages.at(-1).sender, "buddy");
  });
});

test("chat rejects empty messages", async () => {
  await withApi(async (baseUrl) => {
    const empty = await api(baseUrl, "/messages", {
      method: "POST",
      body: JSON.stringify({ matchId: "match_test", text: "   " })
    });

    assert.equal(empty.response.status, 400);
    assert.equal(empty.body.error, "Message text is required");
  });
});

test("community posts can be created and returned first", async () => {
  await withApi(async (baseUrl) => {
    const created = await api(baseUrl, "/community/posts", {
      method: "POST",
      body: JSON.stringify({ body: "I finished my workout.", group: "Fitness" })
    });

    assert.equal(created.response.status, 200);
    assert.equal(created.body.posts[0].body, "I finished my workout.");
    assert.equal(created.body.posts[0].group, "Fitness");
  });
});

test("community posts support upvotes and comments", async () => {
  await withApi(async (baseUrl) => {
    const created = await api(baseUrl, "/community/posts", {
      method: "POST",
      body: JSON.stringify({ body: "Day one is done.", group: "Daily Motivation" })
    });
    const postId = created.body.posts[0].id;

    const upvoted = await api(baseUrl, `/community/posts/${postId}/upvote`, { method: "POST" });
    assert.equal(upvoted.response.status, 200);
    assert.equal(upvoted.body.post.upvotes, 1);

    const commented = await api(baseUrl, `/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: "Proud of this start." })
    });

    assert.equal(commented.response.status, 200);
    assert.equal(commented.body.post.comments, 1);
    assert.equal(commented.body.post.commentsList[0].body, "Proud of this start.");
  });
});

test("coach returns a plan and a reply without requiring Ollama", async () => {
  await withApi(async (baseUrl) => {
    const user = await createUser(baseUrl);
    const plan = await api(baseUrl, `/coach/plan?userId=${user.id}`);
    assert.equal(plan.response.status, 200);
    assert.ok(plan.body.plan.length > 0);

    const message = await api(baseUrl, "/coach/message", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, text: "motivate me" })
    });
    assert.equal(message.response.status, 200);
    assert.ok(message.body.reply.length > 0);
    assert.match(message.body.provider, /rules|ollama/);
  });
});
