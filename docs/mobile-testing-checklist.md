# BuddyUp Mobile Testing Checklist

Use this checklist when testing BuddyUp on Android Emulator, iPhone with Expo Go, or Expo Web.

## Before Opening The App

1. Start the backend:

```powershell
npm run server
```

2. Confirm the server prints at least one phone/emulator URL, for example:

```text
Phone/emulator API: http://192.168.x.x:4000
```

3. Start Expo with a clean cache:

```powershell
npm start -- --clear
```

4. Open `GET /health` in a browser and confirm `ok: true`.
5. Open `GET /stats` and confirm counts return under `stats`.

## Auth And Profile

- Create an email account with a valid email and a password of at least 6 characters.
- Try profile setup with an empty username, invalid age, and no goals; each should be blocked.
- Complete profile setup with at least one goal and verify the app enters the main dashboard.
- For Google login, confirm platform OAuth client IDs are configured in `app.json` before testing.

## Core App Flow

- Create an accountability promise from the Goals screen.
- Tap `Promise this` on a goal and confirm it creates a real open promise.
- Complete, snooze, and delete promises to verify the list updates.
- Use Discover goal filters and match with a buddy.
- Confirm the buddy card shows match reasons such as reliability, streak, and goal fit.
- After signup/profile setup, confirm Discover shows personalized match scores and shared goals.
- Confirm matching only works after signup/profile setup has created a real app user.
- Switch Community tabs and confirm the feed changes for For You, Following, and Groups.
- Send a non-empty chat message and confirm the buddy reply appears.
- Tap each quick chat prompt and confirm the icon action sends a real message with a contextual buddy reply.
- Submit a check-in with at least one selected goal or a note.
- Confirm the selected-goal count changes when goals are toggled.
- Tap each check-in note template and confirm it fills the note field.
- Try an empty check-in and confirm the button stays disabled.
- Create a community post and comment; blank submissions should stay disabled.
- Ask the AI Coach for motivation and confirm the provider label shows `rules` or `ollama`.
- Tap each AI Coach quick prompt and confirm the plan or reply updates.
- Tap a goal-specific AI Coach quick prompt and confirm the reply names that goal.

## Visual QA

- Confirm card corners look tight and consistent across Goals, Discover, Check-in, Chat, Community, and Profile.
- Confirm buttons, tabs, and quick prompts do not resize when pressed or when text changes.
- Confirm the bottom tab bar does not cover submit buttons, composer fields, or final rows.
- Confirm long goal names and buddy communication styles wrap without overlapping icons.
- Confirm dark surfaces have enough contrast outdoors or at low screen brightness.

## Profile And Backend Status

- Open Profile and confirm API health shows online.
- Confirm backend stats show users, matches, and posts.
- Confirm weekly insights update after check-ins and promises.
- Confirm weekly insights show reliability, latest check-in date, and top proof type after at least one check-in.
- Confirm recent proofs show the latest check-in notes first.

## Common Fixes

- If iPhone cannot open the project, make sure the phone and PC are on the same Wi-Fi.
- If Expo Go says the SDK is incompatible, upgrade the project SDK or use a matching simulator/dev build.
- If API calls time out, use the LAN API URL printed by `npm run server`.
- If Android Emulator display is black, cold boot the device from Android Studio Device Manager.
