# 🔐 Налаштування Google Sign In для GlowKvitne

Ця інструкція допоможе налаштувати вхід через Google використовуючи Firebase Authentication.

## ✅ Встановлено

- ✅ `@react-native-google-signin/google-signin` - пакет встановлено
- ✅ `@react-native-firebase/auth` - вже є в проекті
- ✅ Код додано в `AuthContext`, `LoginScreen`, `WelcomeScreen`

---

## 📋 Кроки налаштування

### 1. Firebase Console - Увімкнути Google автентифікацію

1. **Відкрити Firebase Console**: https://console.firebase.google.com/
2. **Вибрати проект**: `haikvitne`
3. **Перейти**: Authentication → Sign-in method
4. **Увімкнути Google**:
   - Натиснути на "Google"
   - Toggle "Enable"
   - Вказати публічний email проекту
   - Зберегти

### 2. Отримати Web Client ID

1. **Firebase Console** → Project Settings ⚙️ → General
2. **Прокрутити до** "Your apps" → Web app
3. **Скопіювати** Web Client ID (формат: `XXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`)
4. **Вставити в** `src/config/firebase.ts`:

```typescript
export const API_CONFIG = {
  baseURL: __DEV__ ? 'http://localhost:3000' : 'https://api.glowkvitne.com',
  timeout: 300000,
  googleWebClientId: 'ВАШ_WEB_CLIENT_ID_СЮДИ', // ← ВСТАВИТИ ЦЕ
};
```

---

## 🍎 iOS Налаштування

### 1. Встановити CocoaPods залежності

```bash
cd ios
pod install
cd ..
```

### 2. Додати URL Scheme в Xcode

1. Відкрити `ios/HaiKvitne.xcworkspace` в Xcode
2. Вибрати проект → Target `HaiKvitne` → Info
3. Прокрутити до **URL Types**
4. Натиснути "+" щоб додати новий URL Type
5. **Заповнити**:

   - **Identifier**: `com.googleusercontent.apps.YOUR_CLIENT_ID`
   - **URL Schemes**: Reversed Client ID (знайти в `GoogleService-Info.plist`)

   Приклад reversed Client ID: `com.googleusercontent.apps.955927835101-xxxxx`

### 3. Переконатися, що GoogleService-Info.plist додано

1. Файл має бути в `ios/HaiKvitne/GoogleService-Info.plist`
2. Якщо немає - завантажити з Firebase Console → Project Settings → iOS app
3. Перетягнути в Xcode проект

### 4. Додати capabilities (якщо потрібно)

У Xcode: Target → Signing & Capabilities → Увімкнути "Sign in with Apple" (опціонально)

---

## 🤖 Android Налаштування

### 1. Додати SHA-1 fingerprint до Firebase

#### Development SHA-1:

```bash
# macOS/Linux
keytool -J-Duser.language=en -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Windows
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Скопіювати **SHA1 fingerprint**

#### Додати в Firebase:

1. **Firebase Console** → Project Settings → Android app
2. Прокрутити до **SHA certificate fingerprints**
3. Натиснути "Add fingerprint"
4. Вставити SHA-1 fingerprint
5. Зберегти

### 2. Production SHA-1 (для релізу)

```bash
keytool -J-Duser.language=en -list -v -keystore /path/to/your/keystore.keystore -alias your-key-alias
```

Додати цей SHA-1 також до Firebase.

### 3. Оновити google-services.json

1. **Firebase Console** → Project Settings → Android app
2. Натиснути "Download google-services.json"
3. Замінити файл `android/app/google-services.json`

### 4. Перевірити gradle конфігурацію

Файл `android/build.gradle`:

```gradle
buildscript {
  dependencies {
    // Перевірити, що є Google Services plugin
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

Файл `android/app/build.gradle`:

```gradle
// В кінці файлу
apply plugin: 'com.google.gms.google-services'
```

---

## 🔧 Backend налаштування

Backends endpoint для Google Sign In:

### POST `/api/auth/google`

Backend має приймати:

```json
{
  "email": "user@gmail.com",
  "displayName": "User Name",
  "photoURL": "https://..."
}
```

Headers:

```
Authorization: Bearer FIREBASE_ID_TOKEN
```

Backend має:

1. Verify Firebase ID token
2. Створити/оновити користувача в БД
3. Повернути профіль користувача з підпискою

### Приклад backend коду (Node.js):

```javascript
// routes/auth.js
router.post('/google', async (req, res) => {
  try {
    // Get Firebase token from header
    const token = req.headers.authorization?.split('Bearer ')[1];

    // Verify token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get user data from request
    const { email, displayName, photoURL } = req.body;

    // Find or create user in DB
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user
      user = await User.create({
        firebaseUid: uid,
        email,
        displayName,
        photoURL,
        subscription: {
          plan: 'free',
          status: 'active',
        },
      });
    } else {
      // Update existing user
      user.displayName = displayName;
      user.photoURL = photoURL;
      await user.save();
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});
```

---

## 🧪 Тестування

### 1. Build проект

```bash
# iOS
npm run ios

# Android
npm run android
```

### 2. Перевірити кнопки Google Sign In

Кнопки додано на:

- ✅ **WelcomeScreen** - перша кнопка з Google входом
- ✅ **LoginScreen** - після divider "АБО"

### 3. Тест флоу

1. Відкрити додаток
2. На Welcome screen натиснути "Увійти через Google"
3. Вибрати Google акаунт
4. Дозволити доступ
5. Має перенаправити на Home screen

### 4. Debugging

Якщо щось не працює, перевірити логи:

```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

Типові помилки:

- ❌ **`DEVELOPER_ERROR`** → Неправильний Web Client ID або не додано SHA-1
- ❌ **`SIGN_IN_CANCELLED`** → Користувач скасував вхід (нормально)
- ❌ **`IN_PROGRESS`** → Вже виконується вхід
- ❌ **`PLAY_SERVICES_NOT_AVAILABLE`** → Google Play Services не встановлено (тільки Android)

---

## 📱 UI Компоненти

### Google Sign In Button

Дизайн:

- **Білий фон** (`#fff`)
- **Темний текст** (`#1a1a2e`)
- **Червона G іконка** (`#e94560`)
- **Rounded corners** (12px)

Код:

```tsx
<TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
  <Text style={styles.googleIcon}>G</Text>
  <Text style={styles.googleButtonText}>Увійти через Google</Text>
</TouchableOpacity>
```

---

## 🔐 Безпека

### Best Practices:

1. **Ніколи не комітити**:

   - `google-services.json`
   - `GoogleService-Info.plist`
   - Web Client ID в публічних репозиторіях

2. **Використовувати environment variables**:

   ```typescript
   // .env
   GOOGLE_WEB_CLIENT_ID=your-client-id

   // firebase.ts
   import Config from 'react-native-config';
   googleWebClientId: Config.GOOGLE_WEB_CLIENT_ID,
   ```

3. **Production secrets**:
   - Зберігати в CI/CD секретах (GitHub Secrets, etc.)
   - Використовувати Firebase Remote Config

---

## 📚 Документація

- [React Native Google Sign In](https://react-native-google-signin.github.io/docs/)
- [Firebase Authentication](https://firebase.google.com/docs/auth/android/google-signin)
- [iOS URL Schemes](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app)

---

## ✅ Checklist

- [ ] Firebase Console - Google Sign In увімкнено
- [ ] Web Client ID скопійовано та додано в `firebase.ts`
- [ ] iOS - `pod install` виконано
- [ ] iOS - URL Scheme додано в Xcode
- [ ] iOS - `GoogleService-Info.plist` на місці
- [ ] Android - SHA-1 fingerprint додано в Firebase
- [ ] Android - `google-services.json` оновлено
- [ ] Backend - endpoint `/api/auth/google` імплементовано
- [ ] Backend - Firebase Admin SDK налаштовано
- [ ] Тестування - Google Sign In працює на iOS
- [ ] Тестування - Google Sign In працює на Android

---

## 🆘 Troubleshooting

### iOS не працює

1. Перевірити reversed Client ID в URL Schemes
2. Переконатися, що `GoogleService-Info.plist` в проекті
3. Clean build: `cd ios && rm -rf Pods Podfile.lock && pod install`
4. Restart Metro: `npm start -- --reset-cache`

### Android не працює

1. Перевірити SHA-1 fingerprint
2. Переконатися, що `google-services.json` свіжий
3. Clean build: `cd android && ./gradlew clean && cd ..`
4. Rebuild: `npm run android`

### Backend помилки

1. Перевірити Firebase Admin SDK налаштовано
2. Перевірити endpoint `/api/auth/google` існує
3. Перевірити CORS якщо веб версія
4. Перевірити логи backend

---

## 🎉 Готово!

Після виконання всіх кроків Google Sign In має працювати на обох платформах.

Користувачі зможуть:

- ✅ Входити через Google одним кліком
- ✅ Автоматично реєструватися якщо нові
- ✅ Синхронізувати фото профілю з Google
- ✅ Використовувати один акаунт на всіх пристроях

**Час налаштування**: ~30-45 хвилин  
**Складність**: Середня 🟡

---

**Потрібна допомога?** Перевірити документацію або написати в підтримку.
