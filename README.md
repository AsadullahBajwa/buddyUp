# BuddyUp

BuddyUp is a React Native + Expo mobile app for finding accountability partners, tracking goals, sharing daily check-ins, chatting, and joining motivation communities.

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

## Implemented In This Starter

- Splash, onboarding, signup, and profile setup flow
- Goal dashboard with progress, streaks, community shortcut, and AI coach shortcut
- Swipe-inspired buddy discovery
- Daily check-in screen with task completion, note input, and media-type actions
- Chat screen with text and voice-note message states
- Community feed with groups, posts, upvotes, comments, and member activity
- AI coach daily plan screen
- Profile screen with XP, level, streak, buddies, badges, and interests
- Local Node API for auth, profile, goals, check-ins, matching, chat, community posts, and rule-based coach responses
- Optional Ollama-backed AI coach using your local PC
- Real Google OAuth code path through Expo AuthSession, once Google client IDs are configured
- Firebase config bootstrap in `src/services/firebase.ts`
- Firestore schema and product planning docs in `docs/`

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
