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
  - `createAnalysis(facePhotoBase64, bodyPhotoBase64?)` — initiates analysis, returns `analysisId`
  - `checkAnalysisStatus(analysisId)` → `GET /api/analysis/:id/status`
  - `getAnalysis(analysisId)` → `GET /api/analysis/:id` — full analysis with photo URLs
  - `getUserAnalyses()` → `GET /api/analysis/user` — list of user's analyses (max 20, sorted newest first); returns `{ analyses: Analysis[], count: number }`; used by `PaletteScreen`, `GalleryScreen`, `MyAnalysesScreen`
  - `generatePdf(analysisId)` → `GET /api/analysis/:id/pdf` — Premium only; generates PDF Style Guide, uploads to Firebase Storage, returns `{ url }` (signed URL, 7 days); frontend calls `Share.share({ url })` (iOS) or `Share.share({ message: url })` (Android)
  - `pollAnalysisStatus(id, onStatus, maxAttempts, interval, signal)` — polls until `completed`/`failed`
  - `deleteAnalysis(analysisId)` → `DELETE /api/analysis/:id`
  - `virtualTryOn({ imageBase64, prompt })` → `POST /api/virtual-tryon` — AI image editing
  - `saveTryOnResult(imageSource)` → `POST /api/virtual-tryon/save` — persist try-on result to Firebase Storage
- Base URL: `localhost:3000` in dev, `https://api.glowkvitne.com` in production (set in `src/config/firebase.ts` → `API_CONFIG.baseURL`)

### Config (src/config/firebase.ts)
Exports `firebaseConfig`, `API_CONFIG` (baseURL + timeout), `ONE_TIME_PURCHASES`, and `SUBSCRIPTION_PLANS` (free / basic / premium). Billing constants are mirrored from the backend — keep in sync with `GlowKvitne-Back/config/billing.js`.

### Subscription tiers
- **free** — 1 analysis/month, 3 outfits/month; Virtual Try-On заблоковано (paywall)
- **basic** — 5 analyses/month, 20 outfits/month; 5 try-ons/week, 1 save/week; локальні дизайнери в Gallery розблоковано
- **premium** — unlimited; 10 try-ons/week, unlimited saves, Share; PDF export, priority support

`isPremiumUser` у компонентах: `user?.subscription?.plan === 'basic' || === 'premium'` (з `useAuth()`).
Після зміни плану `refreshUser()` в `AuthContext` оновлює стан → всі компоненти що використовують `useAuth()` автоматично реагують.

### Key screens
- `PhotoUploadScreen` → `AnalysisLoadingScreen` → `AnalysisResultsScreen` / `ResultsScreen` — the main analysis flow; picks face/body photos via `react-native-image-picker`, encodes to base64, sends to backend
- `PaletteScreen` — color palette loaded from real API (`getUserAnalyses`); horizontal `FlatList` picker if user has >1 completed analysis; renders palette via `PaletteSection` + `ColorRect` (3 swatches/row, rectangular); handles both old `"#HEX name"` strings and new `{hex, name}` objects via `parseColor()`
- `GalleryScreen` — "Образи та Шопінг" hub:
  - `SeasonalBanner` — dynamic urgency note (cross-references current month with user's color season family via `getSeasonalNote()`)
  - `BrandCard` — 6 brands (Zara UA, H&M UA, Mango, COS, Bevza, Gunia Project) with affiliate UTM links; `isPartner` badge for paid placement; premium lock overlay for local designers
  - `OutfitIdeaCard` — color strip (hex array), occasion badge, "Знайти схожий →" affiliate deep-link button; `isPremium` lock for non-basic users
  - `BRANDS` + `OUTFIT_IDEAS` static data; brands include `seasons[]` filter (16 seasons)
  - Loads last completed analysis via `getUserAnalyses()` for personalized recommendations
  - B2B CTA: "💼 Ваш бренд тут?"
- `AnalysisLoadingScreen` — step-by-step progress indicator:
  - 5 steps with emoji: тип обличчя (15%) → кольоротип (40%) → палітра (65%) → рекомендації (85%) → готово (98%)
  - Animated `Animated.Value` progress bar (`width` animation, `useNativeDriver: false`)
  - Pulsing emoji for active step; ✓ checkmark for completed; grey for pending
  - Fun facts with fade crossfade (9s interval)
  - Auto-advances steps as fallback; real polling sets step 1+ when `processing`, final navigate on `completed`
- `AnalysisResultsScreen` — palette section uses `PaletteSection` + `ColorRect` components (same as PaletteScreen): Нейтральні → Basic → Акцентні → Білі відтінки → Темні відтінки + seasonSignature label; Avoid Colors section below
- `MyAnalysesScreen` — history of analyses
- `VirtualTryOnScreen` — AI portrait editing з підписочними лімітами:
  - Free: повний paywall з порівнянням планів → navigate до Subscription
  - Basic/Premium: ліміти зберігаються в `AsyncStorage` по ISO-тижню (`tryOn_{year}_W{week}_count`, `_saves`)
  - Share (Premium only): `Share.share()` з saved URL після `saveTryOnResult()`
  - `TRYON_LIMITS` об'єкт: `{ free: {tryOns:0}, basic: {tryOns:5, saves:1}, premium: {tryOns:10, saves:-1, canShare:true} }`
- `SubscriptionScreen` — план підписки + разові покупки:
  - Приймає `navigation` prop (обов'язково для кнопки "← Назад" та `goBack()` після підписки)
  - Кнопка "← Назад" у header, `SafeAreaView` як root (замість `View`)
  - Після успішного `handleSubscribe` → `Alert` з `onPress: navigation.goBack()` → повернення на попередній екран
  - `refreshUser()` після зміни плану → `useAuth()` оновлюється → всі екрани автоматично відображають новий план

### Shared color helpers (PaletteScreen, AnalysisResultsScreen)
```tsx
type PaletteColor = string | { hex: string; name: string };

const parseColor = (color: PaletteColor): { hex: string; name: string } => {
  // handles both old "#HEX name" strings and new {hex, name} objects
};

const ColorRect: React.FC<{ color: PaletteColor; avoid?: boolean }> = ...  // 3/row, rounded rectangle
const PaletteSection: React.FC<{ title, description?, colors, avoid? }> = ... // wrapping grid of ColorRects
```

### Photo storage (src/services/storageService.ts)
Client-side service — currently a lightweight placeholder; actual uploads happen server-side. Documents the Firebase Storage path structure:
- `users/{uid}/analyses/{analysisId}/face.jpg` / `body.jpg`
- `users/{uid}/tryon/{timestamp}.jpg`

Firebase Storage security rules (`storage.rules`): each user can read/write only their own folder (`users/{userId}/{allPaths}`); backend (firebase-admin) bypasses client rules entirely.

`AnalysisResponse` (from `src/types/analysis.ts`) includes a `photos` field with `facePhoto` and `bodyPhoto` objects containing signed URLs returned from the backend.

### Types (src/types/analysis.ts)
`AnalysisResponse` defines the shape returned by the backend: `larsonAnalysis` (styleType, value, chroma, colorSeason, colorPalette, integratedRecommendations, archetypeAnalysis, celebrityMatches).
