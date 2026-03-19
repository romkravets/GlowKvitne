# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start Metro bundler
npx react-native start

# Run on iOS simulator
npx react-native run-ios

# Run on Android emulator
npx react-native run-android

# Lint
npm run lint

# Tests
npm test

# Run single test file
npx jest path/to/test.ts
```

## Architecture

**React Native 0.84 / TypeScript** app (project name internally: `HaiKvitne`). Firebase for auth, Express backend (`GlowKvitne-Back`) for AI analysis.

### Navigation (src/navigation/)
Five-level hierarchy:
1. `RootNavigator` — top-level: Splash → Onboarding (first launch) → `AuthNavigator` | `MainNavigator`
2. `AuthNavigator` — unauthenticated: Login, Register, ForgotPassword
3. `MainNavigator` — bottom tabs: HomeTab, ExploreTab, GalleryTab (Образи), PaletteTab, ProfileTab
4. Each tab has its own Stack navigator (`HomeStackNavigator`, etc.)
5. Type definitions in `navigation/types.ts`, helpers in `navigation/helpers.ts`

### Auth (src/context/AuthContext.tsx)
`AuthProvider` wraps the whole app. Provides `useAuth()` hook with: `user`, `loading`, `signIn`, `signUp`, `signInWithGoogle`, `linkGoogleAccount`, `signOut`, `refreshUser`.

- Firebase Auth (`@react-native-firebase/auth`) handles identity
- On auth state change → calls `GET /api/auth/me`; if 404 → auto-registers via `POST /api/auth/register`
- Firebase ID token stored in `AsyncStorage` as `authToken`
- Axios interceptor auto-attaches Bearer token and retries once on 401 with a refreshed token

### API (src/api/)
- `client.ts` — `analyzePhotos(faceBase64, bodyBase64?)` → `POST /api/analysis/test-with-photo`, 5-minute timeout
- `analysisApi.ts` — authenticated analysis endpoints:
  - `createAnalysis(facePhotoBase64, bodyPhotoBase64?)` — analysis flow
  - `virtualTryOn({ imageBase64, prompt })` → `POST /api/virtual-tryon` — AI image editing
  - `saveTryOnResult(imageSource)` → `POST /api/virtual-tryon/save` — persist try-on result to Firebase Storage
- Base URL: `localhost:3000` in dev, `https://api.glowkvitne.com` in production (set in `src/config/firebase.ts` → `API_CONFIG.baseURL`)

### Config (src/config/firebase.ts)
Exports `firebaseConfig`, `API_CONFIG` (baseURL + timeout), `ONE_TIME_PURCHASES`, and `SUBSCRIPTION_PLANS` (free / basic / premium). Billing constants are mirrored from the backend — keep in sync with `GlowKvitne-Back/config/billing.js`.

### Subscription tiers
- **free** — 1 analysis/month, 3 outfits/month
- **basic** — 5 analyses, 20 outfits, celebrity twins, detailed analysis
- **premium** — unlimited, PDF export, priority support

### Key screens
- `PhotoUploadScreen` → `AnalysisLoadingScreen` → `AnalysisResultsScreen` / `ResultsScreen` — the main analysis flow; picks face/body photos via `react-native-image-picker`, encodes to base64, sends to backend
- `PaletteScreen` — color palette from analysis result
- `MyAnalysesScreen` — history of analyses
- `VirtualTryOnScreen` — AI portrait editing (Hair, Makeup, Eye Color, Skin, etc.); picks photo → sends to `POST /api/virtual-tryon` (Replicate Flux Kontext) → user saves result via `saveTryOnResult()`
- `SubscriptionScreen` — plan upgrades and one-time purchases

### Photo storage (src/services/storageService.ts)
Client-side service — currently a lightweight placeholder; actual uploads happen server-side. Documents the Firebase Storage path structure:
- `users/{uid}/analyses/{analysisId}/face.jpg` / `body.jpg`
- `users/{uid}/tryon/{timestamp}.jpg`

Firebase Storage security rules (`storage.rules`): each user can read/write only their own folder (`users/{userId}/{allPaths}`); backend (firebase-admin) bypasses client rules entirely.

`AnalysisResponse` (from `src/types/analysis.ts`) includes a `photos` field with `facePhoto` and `bodyPhoto` objects containing signed URLs returned from the backend.

### Types (src/types/analysis.ts)
`AnalysisResponse` defines the shape returned by the backend: `larsonAnalysis` (styleType, value, chroma, colorSeason, colorPalette, integratedRecommendations, archetypeAnalysis, celebrityMatches).
