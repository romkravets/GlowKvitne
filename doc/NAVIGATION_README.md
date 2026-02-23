# GlowKvitne - Navigation Structure

## 📱 Структура додатку

### Навігація

```
Root Navigator
├── Splash Screen (при завантаженні)
├── Onboarding (перший запуск)
│
├── Auth Stack (не авторизовані)
│   ├── Welcome Screen
│   ├── Login Screen
│   ├── Register Screen
│   └── Forgot Password Screen
│
└── Main Tab Navigator (авторизовані)
    │
    ├── 🏠 Home Tab
    │   ├── Home Screen (дашборд)
    │   ├── Start Analysis Screen
    │   ├── Photo Upload Screen
    │   ├── Analysis Loading Screen
    │   ├── Analysis Results Screen
    │   └── Celebrity Details Screen
    │
    ├── 👗 Gallery Tab
    │   ├── Gallery Screen (список образів)
    │   ├── Outfit Details Screen
    │   └── Generate Outfit Screen
    │
    ├── 🎨 Palette Tab
    │   ├── Palette Screen (кольорова палітра)
    │   ├── Color Details Screen
    │   └── Download Palette Screen
    │
    └── 👤 Profile Tab
        ├── Profile Screen
        ├── Edit Profile Screen
        ├── My Analysis Screen
        ├── Settings Screen
        ├── Subscription Screen
        ├── About Screen
        ├── Privacy Screen
        └── Terms Screen
```

## 🚀 Встановлення додаткових пакетів

```bash
cd /Users/romkravets/Documents/GitHub/GlowKvitne

# Додати bottom tabs navigation
npm install @react-navigation/bottom-tabs
```

## 📝 Основні файли

### Навігація

- `src/navigation/RootNavigator.tsx` - головний навігатор
- `src/navigation/AuthNavigator.tsx` - auth flow
- `src/navigation/MainNavigator.tsx` - bottom tabs
- `src/navigation/HomeStackNavigator.tsx` - home stack
- `src/navigation/GalleryStackNavigator.tsx` - gallery stack
- `src/navigation/PaletteStackNavigator.tsx` - palette stack
- `src/navigation/ProfileStackNavigator.tsx` - profile stack

### Екрани

#### Auth Flow

- `SplashScreen.tsx` - splash при завантаженні
- `OnboardingScreen.tsx` - 3 слайди з поясненням
- `WelcomeScreen.tsx` - welcome екран
- `LoginScreen.tsx` - логін
- `RegisterScreen.tsx` - реєстрація
- `ForgotPasswordScreen.tsx` - відновлення пароля

#### Main Tabs

- `HomeScreen.tsx` - головний дашборд
- `GalleryScreen.tsx` - галерея образів
- `PaletteScreen.tsx` - кольорова палітра
- `ProfileScreen.tsx` - профіль користувача

#### Analysis Flow

- `StartAnalysisScreen.tsx` - початок аналізу
- `PhotoUploadScreen.tsx` - завантаження фото (вже існує)
- `AnalysisLoadingScreen.tsx` - обробка
- `AnalysisResultsScreen.tsx` - результати
- `CelebrityDetailsScreen.tsx` - celebrity twins

#### Інші екрани

- `PlaceholderScreens.tsx` - placeholder екрани для розробки

## 🎨 Дизайн

### Колірна схема

- Primary: `#C49B63` (золотий)
- Background: `#FAFAFA`
- Card Background: `#FFFFFF`
- Text Primary: `#1A1A1A`
- Text Secondary: `#666666`
- Text Tertiary: `#999999`
- Error: `#FF3B30`

### Компоненти

- Кнопки з shadow
- Cards з rounded corners (12px)
- Bottom tabs з іконками
- Smooth animations

## 🔄 Flow користувача

### Перший запуск

1. Splash Screen (2 сек)
2. Onboarding (3 слайди)
3. Welcome Screen → Login/Register

### Авторизований користувач

#### Немає аналізу

Home → Start Analysis → Upload Photos → Loading → Results

#### Є аналіз

Home (показує результат) → Quick actions (Gallery, Palette, Generate)

## 📦 Версії (Free/Premium)

### Free

- 1 аналіз на місяць
- 3 образи на місяць
- Базовий функціонал

### Basic

- 3 аналізи на місяць
- 10 образів на місяць
- Додаткові фічі

### Premium

- Необмежені аналізи
- Необмежені образи
- Всі функції
- Priority support

## 🛠 TODO для реалізації

- [ ] Встановити @react-navigation/bottom-tabs
- [ ] Додати іконки (react-native-vector-icons)
- [ ] Імплементувати HomeScreen з даними
- [ ] Додати API integration
- [ ] Додати image picker в PhotoUploadScreen
- [ ] Реалізувати subscription logic
- [ ] Додати analytics
- [ ] Додати error boundaries
- [ ] Тести

## 🔧 Команди для розробки

```bash
# iOS
npm run ios

# Android
npm run android

# Start Metro
npm start

# Lint
npm run lint

# Tests
npm test
```

## 📱 Сумісність

- iOS: 13.0+
- Android: API 21+
- React Native: 0.84.0
- Node: >= 22.11.0
