# BuddyUp API Reference

The BuddyUp API is a plain Node.js HTTP server (`server/index.js`) with no framework. It stores data in a local JSON file by default (`DATA_STORE=json`), or in Firestore when deployed to Cloud Run (`DATA_STORE=firestore`).

- Local base URL: `http://localhost:4000`
- All request and response bodies are JSON.
- Request bodies are limited to 64 KB by default (`MAX_BODY_BYTES`). Larger bodies get `413`.
- Errors always look like `{ "error": "Human readable message" }`.
- Responses never include `passwordHash`.

| Status | Meaning |
| --- | --- |
| `200` | Success |
| `400` | Validation failed or body isn't valid JSON |
| `401` | Wrong credentials or Google token couldn't be verified |
| `404` | Unknown resource or route |
| `409` | Signup email already belongs to another account |
| `413` | Request body too large |

> **Known limitation:** the API doesn't issue session tokens yet. Endpoints trust the `userId` sent by the client, so this is fine for local testing and demos but not for production. Token-based auth is the next planned backend change.

## Endpoint overview

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service metadata |
| `GET` | `/stats` | Aggregate counts |
| `POST` | `/auth/signup` | Create an account (idempotent with the correct password) |
| `POST` | `/auth/login` | Email/password login |
| `POST` | `/auth/google` | Sign in with a Google access token |
| `PUT` | `/users/:id` | Finish or update profile setup |
| `GET` | `/dashboard` | Everything the Goals screen needs |
| `GET` | `/buddies` | Filterable buddy list |
| `GET` | `/buddies/recommended` | Buddies ranked for a user |
| `POST` | `/matches` | Match a user with a buddy |
| `GET` | `/messages` | Messages for a match |
| `POST` | `/messages` | Send a message and get a buddy reply |
| `GET` | `/checkins` | Recent check-ins for a user |
| `POST` | `/checkins` | Submit a check-in with proof |
| `POST` | `/commitments` | Create a promise |
| `PATCH` | `/commitments/:id/complete` | Complete a promise |
| `PATCH` | `/commitments/:id/snooze` | Move a promise's due date |
| `DELETE` | `/commitments/:id` | Remove a promise |
| `GET` | `/reports/weekly` | Weekly accountability report |
| `GET` | `/community/posts` | Community feed |
| `POST` | `/community/posts` | Create a post |
| `POST` | `/community/posts/:id/upvote` | Upvote a post |
| `POST` | `/community/posts/:id/comments` | Comment on a post |
| `GET` | `/coach/plan` | Daily plan from the user's goals |
| `POST` | `/coach/message` | Ask the AI coach |

## Service

### `GET /health`

Doesn't touch the data store, so it's safe to use as a liveness probe.

```json
{ "ok": true, "service": "buddyup-api", "store": "json", "time": "2026-11-16T12:00:00.000Z", "version": "0.1.0" }
```

`version` comes from the root `package.json`, or from `BUDDYUP_VERSION` if that's set.

### `GET /stats`

```json
{
  "stats": {
    "users": 3, "goals": 12, "buddies": 6, "matches": 2, "messages": 9, "checkIns": 4,
    "commitments": { "open": 2, "completed": 5, "total": 7 },
    "community": { "posts": 5, "comments": 8, "upvotes": 41 }
  }
}
```

## Auth

### `POST /auth/signup`

```json
{ "name": "Alex Carter", "email": "alex@example.com", "password": "buddyup123" }
```

- `400` if the email is missing or invalid, or the password is shorter than 6 characters.
- A new email creates the user with four starter goals and returns `{ "user": { ... } }`.
- An existing email with the **correct** password returns the same user (no duplicate goals). With any other password the response is `409`.

Passwords are hashed with scrypt using a random salt for each user.

### `POST /auth/login`

```json
{ "email": "alex@example.com", "password": "buddyup123" }
```

Returns `{ "user": { ... } }`, or `401` with `Invalid email or password`. Accounts created before the scrypt change are re-hashed on their first successful login.

### `POST /auth/google`

```json
{ "accessToken": "<Google OAuth access token>" }
```

The server verifies the token against Google's `userinfo` endpoint. If no local user has that email, it creates one; otherwise it links the existing user (`authProvider`, `googleSub`, `photoURL`). Returns `401` if Google rejects the token and `400` if the profile has no email.

## Users

### `PUT /users/:id`

```json
{ "username": "alexc", "age": 24, "timezone": "GMT+1", "goals": ["Coding", "Fitness"] }
```

- `username` is required, `age` must be between 13 and 100, and at least one goal is required.
- If the user hasn't made progress yet, their starter goals are regenerated from the selected goals.
- Returns `{ "user": { ... }, "goals": [ ... ] }`.

### `GET /dashboard?userId=:id`

Returns `{ user, goals, matches, commitments, posts }` for that user. `404` if the user doesn't exist.

## Buddies and matches

### `GET /buddies?seriousOnly=true&goal=Coding`

Both query params are optional. The `goal` match is case-insensitive. Returns `{ "buddies": [ ... ] }`.

### `GET /buddies/recommended?userId=:id&seriousOnly=true`

Returns every buddy with two extra fields, `sharedGoals` and `matchScore` (0–100), sorted by score and then reliability. The score adds up:

| Signal | Points |
| --- | --- |
| Each shared goal | 18 |
| Serious buddy | 10 |
| Reliability score / 10 | up to 10 |
| Streak days / 3 | up to 10 |

### `POST /matches`

```json
{ "userId": "user_ab12cd34", "buddyId": "sara" }
```

Returns `{ match, buddy }`. Matching the same pair twice returns the existing match. A new match also gets an opening message from the buddy. `404` for an unknown user or buddy.

## Messages

### `GET /messages?matchId=:id`

Returns `{ "messages": [ ... ] }` in the order they were sent.

### `POST /messages`

```json
{ "matchId": "match_ab12cd34", "text": "Finished my workout" }
```

Stores the message and a contextual buddy reply, then returns the full thread. `400` for empty text, `404` for an unknown match.

## Check-ins

### `GET /checkins?userId=:id&limit=5`

Returns the newest check-ins first. `limit` is clamped to 1–20 and defaults to 5.

### `POST /checkins`

```json
{ "userId": "user_ab12cd34", "type": "photo", "note": "Gym done", "completedTaskIds": ["goal_3f9a1c2e"] }
```

- `type` is one of `photo`, `text`, `voice`, `habit` (default `text`). Anything else returns `400`.
- Each completed goal gains 14% progress (capped at 100%) and one streak day.
- The user gains `25 + 10 × completed goals` XP. Level, badges, streak and reliability update along with it.
- Returns `{ checkIn, user, goals }`.

## Commitments (promises)

### `POST /commitments`

```json
{ "userId": "user_ab12cd34", "title": "Finish chapter 3", "goalId": "goal_3f9a1c2e", "dueAt": "2026-11-17T18:00:00.000Z" }
```

`title` is required. `dueAt` defaults to now. Returns `{ commitment, commitments }`.

### `PATCH /commitments/:id/complete`

Marks the promise completed and awards the owner 15 XP and +1 reliability (capped at 99). Returns `{ commitment, commitments, user }`.

### `PATCH /commitments/:id/snooze`

```json
{ "days": 2 }
```

`days` must be between 1 and 14 (default 1). Returns `{ commitment, commitments }`.

### `DELETE /commitments/:id`

Returns the removed `commitment` and the remaining `commitments`.

## Reports

### `GET /reports/weekly?userId=:id`

```json
{
  "report": {
    "userId": "user_ab12cd34",
    "weekOf": "2026-11-16",
    "overallProgress": 42,
    "reliabilityScore": 74,
    "checkIns": 4,
    "checkInTypes": { "photo": 2, "text": 2 },
    "lastCheckInAt": "2026-11-16T09:12:00.000Z",
    "completedCommitments": 3,
    "openCommitments": 1,
    "commitmentCompletionRate": 75,
    "activeMatches": 1,
    "strongestGoal": "Gym 4x a week",
    "focusGoal": "Read 20 pages",
    "nextActions": ["...", "...", "..."]
  }
}
```

## Community

| Request | Body | Notes |
| --- | --- | --- |
| `GET /community/posts` | | Returns `{ posts }`, newest first |
| `POST /community/posts` | `{ "body": "...", "group": "Daily Motivation" }` | `body` required. Returns `{ posts }` |
| `POST /community/posts/:id/upvote` | | Returns `{ post, posts }` |
| `POST /community/posts/:id/comments` | `{ "body": "...", "author": "Alex" }` | `body` required. Returns `{ post, posts }` |

## AI coach

### `GET /coach/plan?userId=:id`

Returns `{ "plan": ["Study for 45 minutes with phone away", ...] }`, with one step for each of the user's first four goals.

### `POST /coach/message`

```json
{ "userId": "user_ab12cd34", "text": "I keep skipping my workouts" }
```

Returns `{ reply, plan, provider }`. `provider` is `ollama` when a local Ollama model answered and `rules` when the built-in fallback did. That makes it easy to tell in the app which path ran. Empty text returns `400`.
