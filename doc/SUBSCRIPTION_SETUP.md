# GlowKvitne - Інструкції по налаштуванню підписок

## ✅ Що зроблено

### Backend

1. **Оновлена User модель** (`/models/User.js`)

   - Додано поле `purchases` для разових покупок
   - Tracking споживання (quantity/used)

2. **Створено систему billing** (`/config/billing.js`)

   - Константи для підписок (free, basic, premium)
   - Константи для разових покупок (single_analysis, outfit_pack_10, pdf_style_guide)
   - Helper функції: `canUserAnalyze()`, `useAnalysisCredit()`, `shouldUseDetailedPrompt()`

3. **Додано 2 версії AI промпту:**

   - `freeColorAnalysis.js` - спрощений промпт для безкоштовних користувачів (8000 tokens)
   - `scientificColorAnalysis.js` - детальний промпт для платних (16000 tokens)

4. **Оновлено Analysis Controller**
   - Перевірка підписки/покупок перед аналізом
   - Вибір промпту залежно від плану
   - Автоматичне списання кредитів

### Frontend (React Native)

1. **Firebase Auth SDK**

   - `@react-native-firebase/app`
   - `@react-native-firebase/auth`
   - `@react-native-async-storage/async-storage`

2. **Auth Context** (`/src/context/AuthContext.tsx`)

   - Управління станом авторизації
   - Інтеграція з backend API
   - Збереження токенів в AsyncStorage

3. **Auth екрани:**

   - `WelcomeScreen.tsx` - Onboarding з features
   - `LoginScreen.tsx` - Вхід
   - `RegisterScreen.tsx` - Реєстрація з показом безкоштовного плану

4. **Subscription екран** (`/src/screens/SubscriptionScreen.tsx`)

   - Підписки (Free/Basic/Premium)
   - Разові покупки
   - Порівняння features

5. **Оновлена навігація** (`App.tsx`)
   - Auth Stack (Welcome/Login/Register)
   - Main Stack (Home/PhotoUpload/Results)
   - Умовний рендеринг залежно від авторизації

## 🔧 Налаштування Firebase

### 1. Створити Firebase проект

1. Перейти на [Firebase Console](https://console.firebase.google.com/)
2. Створити новий проект "GlowKvitne"
3. Увімкнути Firebase Authentication (Email/Password)

### 2. Налаштувати iOS

```bash
cd ios
pod install
```

**Додати GoogleService-Info.plist:**

1. Завантажити з Firebase Console
2. Перемістити в `/ios/HaiKvitne/GoogleService-Info.plist`

### 3. Налаштувати Android

**Додати google-services.json:**

1. Завантажити з Firebase Console
2. Перемістити в `/android/app/google-services.json`

**Оновити `android/build.gradle`:**

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

**Оновити `android/app/build.gradle`:**

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 4. Оновити Firebase Config

Файл: `/src/config/firebase.ts`

Замінити:

```typescript
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY', // З Firebase Console
  authDomain: 'glowkvitne.firebaseapp.com',
  projectId: 'glowkvitne',
  storageBucket: 'glowkvitne.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 5. Backend Firebase Admin SDK

Файл: `/Users/romkravets/Documents/GitHub/GlowKvitne-Back/.env`

Додати:

```
FIREBASE_PROJECT_ID=glowkvitne
FIREBASE_CLIENT_EMAIL=xxx@glowkvitne.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 📱 Підписки та ціни

### Безкоштовний план

- ✅ 1 аналіз на місяць
- ✅ 3 образи на місяць
- ✅ Базовий колор-аналіз
- ❌ Celebrity Twins
- ❌ PDF Export

### Базовий план (199 ₴/міс)

- ✅ 5 аналізів на місяць
- ✅ 20 образів на місяць
- ✅ Детальний аналіз
- ✅ Celebrity Twins
- ❌ PDF Export

### Преміум план (399 ₴/міс)

- ✅ Необмежено аналізів
- ✅ Необмежено образів
- ✅ Детальний аналіз
- ✅ Celebrity Twins
- ✅ PDF Export
- ✅ Пріоритетна підтримка

### Разові покупки

**Разовий аналіз** - 149 ₴

- 1 повний аналіз без підписки

**Пакет 10 образів** - 199 ₴

- 10 згенерованих образів

**PDF Style Guide** - 99 ₴

- Детальний гайд стилю в PDF

## 🚀 Тестування

### Backend

```bash
cd /Users/romkravets/Documents/GitHub/GlowKvitne-Back

# Тест безкоштовного користувача
curl -X POST http://localhost:3000/api/analysis \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"facePhotoBase64": "..."}' | jq

# Перевірити що повертається tier: "free"
```

### Frontend

```bash
cd /Users/romkravets/Documents/GitHub/GlowKvitne

# Запустити iOS
npm run ios

# Перевірити flow:
# 1. Welcome screen
# 2. Register -> створення акаунта
# 3. Home screen -> авторизований
# 4. Перейти до Subscription screen
```

## 📋 TODO

- [ ] Інтегрувати платіжну систему (LiqPay, Stripe)
- [ ] Додати Subscription screen до Main Navigation
- [ ] Реалізувати PDF Export для Premium
- [ ] Додати email notifications при закінченні підписки
- [ ] Додати Analytics (Firebase Analytics)
- [ ] Реалізувати "Invite friends" для bonus credits

## 🔗 Посилання

- Backend API: http://localhost:3000
- Firebase Console: https://console.firebase.google.com/
- Billing Config: `/config/billing.js`
- Auth Context: `/src/context/AuthContext.tsx`
