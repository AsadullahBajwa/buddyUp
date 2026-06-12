# BuddyUp

BuddyUp is a React Native + Expo mobile app for accountability partnerships. It helps users create goals, match with serious partners, check in daily, chat with buddies, post progress in communities, and receive AI coaching through a Node API that can run locally or on Google Cloud Run.

This repository is structured as a portfolio project: it includes a mobile app, a backend API, local JSON persistence, Firestore-ready deployment mode, CI/CD configuration, Google OAuth wiring, and Ollama-backed coaching fallback logic.

## Project Snapshot

| Area | Implementation |
| --- | --- |
| Mobile app | Expo SDK 54, React Native, TypeScript |
| Backend | Node.js HTTP API with test coverage |
| Local storage | JSON file store for quick PC and emulator testing |
| Cloud storage | Firestore mode for Google Cloud Run deployment |
| Auth | Email/password plus real Google OAuth token verification path |
| AI coach | Ollama on local PC, rule-based fallback in hosted mode |
| CI/CD | Cloud Build trigger, Artifact Registry, Cloud Run deployment |
| Quality gates | Node test runner and TypeScript typecheck |

## Core Features

- Onboarding, signup, login, Google OAuth handoff, and profile setup
- Goal dashboard with streaks, progress, promises, community shortcut, and AI coach shortcut
- Goal-filtered buddy discovery backed by the API
- Daily check-ins with task completion, notes, XP, streak, and reliability updates
- Buddy matching, starter chat messages, and validated chat sends
- Community feed with posts, comments, upvotes, and input validation
- AI coach daily plan and message endpoint with Ollama support
- Profile insights backed by the weekly report API
- Backend health visibility inside the mobile profile screen

## Architecture

```mermaid
flowchart LR
  subgraph Client["Mobile Client"]
    Expo["Expo React Native App"]
    Screens["Auth, Goals, Discover, Check-in, Chat, Community, Profile"]
    LocalState["AsyncStorage Session"]
  end

  subgraph API["BuddyUp API"]
    Server["Node HTTP Server"]
    Routes["Auth, Users, Buddies, Matches, Messages, Check-ins, Commitments, Posts, Coach"]
    StoreAdapter["Store Adapter"]
    Coach["Coach Service"]
  end

  subgraph LocalDev["Local Development"]
    JsonStore["JSON DB File"]
    Ollama["Ollama qwen2.5"]
  end

  subgraph Cloud["Google Cloud"]
    CloudRun["Cloud Run Service"]
    Firestore["Firestore Native Mode"]
    ArtifactRegistry["Artifact Registry"]
    CloudBuild["Cloud Build Trigger"]
  end

  subgraph External["External Providers"]
    GoogleOAuth["Google OAuth Userinfo"]
  end

  Expo --> Screens
  Screens --> LocalState
  Screens -->|HTTP JSON| Server
  Server --> Routes
  Routes --> StoreAdapter
  StoreAdapter --> JsonStore
  StoreAdapter --> Firestore
  Routes --> Coach
  Coach --> Ollama
  Routes --> GoogleOAuth
  CloudBuild --> ArtifactRegistry
  ArtifactRegistry --> CloudRun
  CloudRun --> Server
  CloudRun --> Firestore
```

The same API surface is used for local testing and Cloud Run. The `DATA_STORE` environment variable selects JSON or Firestore, while `OLLAMA_ENABLED` controls whether hosted deployments use local AI calls or the rule-based fallback.

## Database Model

```mermaid
erDiagram
  USER ||--o{ GOAL : owns
  USER ||--o{ COMMITMENT : creates
  USER ||--o{ CHECK_IN : submits
  USER ||--o{ BUDDY_MATCH : starts
  BUDDY ||--o{ BUDDY_MATCH : joins
  BUDDY_MATCH ||--o{ MESSAGE : contains
  USER ||--o{ COMMUNITY_POST : writes
  COMMUNITY_POST ||--o{ COMMUNITY_COMMENT : has

  USER {
    string id
    string name
    string email
    string username
    number xp
    number level
    number reliabilityScore
    number streakDays
    string authProvider
  }

  GOAL {
    string id
    string userId
    string title
    string category
    number progress
    number streak
    string target
  }

  COMMITMENT {
    string id
    string userId
    string goalId
    string title
    string status
    string dueAt
    string completedAt
  }

  CHECK_IN {
    string id
    string userId
    string type
    string note
    string[] completedTaskIds
    string createdAt
  }

  BUDDY {
    string id
    string name
    string[] goals
    string activityLevel
    string communicationStyle
    number reliabilityScore
    boolean serious
  }

  BUDDY_MATCH {
    string id
    string userId
    string buddyId
    string status
    string createdAt
  }

  MESSAGE {
    string id
    string matchId
    string sender
    string text
    string time
  }

  COMMUNITY_POST {
    string id
    string group
    string body
    number upvotes
    number comments
    string accent
  }

  COMMUNITY_COMMENT {
    string id
    string postId
    string author
    string body
    string createdAt
  }
```

The local JSON database uses these collections directly. Firestore mode stores the same top-level collections so local and hosted behavior stay aligned during testing.

## Run Locally

```bash
npm install
npm run server
```

In a second terminal:

```bash
npm run web
```

For iPhone/Android Expo Go testing, run:

```bash
npm start -- --clear
```

Run tests:

```bash
npm test
npm run typecheck
```

## API Notes

The Expo app reads `expo.extra.apiBaseUrl` from `app.json`. If that is empty during local development, it uses the Expo dev host and talks to your PC on port `4000`, which is what phones and Android emulators need.

Useful endpoints while testing:

- `GET /health` returns API metadata, version, store type, and current server time.
- `GET /buddies?seriousOnly=true&goal=Coding` returns filtered buddy suggestions.
- `POST /commitments` creates an accountability promise.
- `PATCH /commitments/:id/complete` closes a promise and awards accountability credit.
- `DELETE /commitments/:id` removes a promise that no longer applies.
- `GET /reports/weekly?userId=...` powers the weekly insight card on the profile screen.

## Google Sign-In

Google sign-in is wired as a real OAuth browser flow. To enable it:

1. Create OAuth client IDs in Google Cloud Console for iOS, Android, and/or Web.
2. Add them to `app.json` under `expo.extra`:

```json
{
  "googleExpoClientId": "",
  "googleIosClientId": "",
  "googleAndroidClientId": "",
  "googleWebClientId": ""
}
```

3. Restart Expo with:

```bash
npm start -- --clear
```

The app sends the Google access token to the local API, and the API verifies it through Google's userinfo endpoint before creating or connecting the account.

## Ollama AI Coach

The AI Coach first tries Ollama on your PC:

```bash
ollama run qwen2.5
```

In a separate terminal:

```bash
$env:OLLAMA_MODEL="qwen2.5"
npm run server
```

If Ollama is not running, the API falls back to local rule-based coaching so the app remains usable.

## Firebase

Add the Firebase project config values to `app.json` under `expo.extra`, then wire the screens to `auth`, `db`, and `storage` from `src/services/firebase.ts`.
