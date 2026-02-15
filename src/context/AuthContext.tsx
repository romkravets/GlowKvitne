import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { API_CONFIG } from '../config/firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  subscription?: {
    plan: 'free' | 'basic' | 'premium';
    status: string;
    expiresAt?: string;
    usage?: {
      analysesThisMonth: number;
      outfitsThisMonth: number;
    };
    limits?: {
      analysesPerMonth: number;
      outfitsPerMonth: number;
    };
  };
  purchases?: Array<{
    productId: string;
    quantity: number;
    used: number;
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure Google Sign In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: API_CONFIG.googleWebClientId, // from Firebase Console
    });
  }, []);

  // Setup axios interceptor for auth token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(async config => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Fetch user data from backend
  const fetchUserData = async (firebaseUser: FirebaseAuthTypes.User) => {
    try {
      const token = await firebaseUser.getIdToken();
      await AsyncStorage.setItem('authToken', token);

      // Get user data from backend
      const response = await axios.get(`${API_CONFIG.baseURL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.user;
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        subscription: userData.subscription,
        purchases: userData.purchases,
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Fallback to Firebase user only
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const auth = getAuth();
    const subscriber = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
        await AsyncStorage.removeItem('authToken');
      }
      setLoading(false);
    });

    return subscriber;
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Помилка входу');
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    try {
      // Create Firebase user
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update display name
      await updateProfile(userCredential.user, { displayName });

      // Get ID token
      const token = await userCredential.user.getIdToken();

      // Register in backend
      await axios.post(
        `${API_CONFIG.baseURL}/api/auth/register`,
        {
          email,
          displayName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Помилка реєстрації');
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      // Check if device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get user info from Google
      const userInfo = await GoogleSignin.signIn();

      // Create Firebase credential
      const googleCredential = GoogleAuthProvider.credential(
        userInfo.data?.idToken ?? null,
      );

      // Sign in with Firebase
      const auth = getAuth();
      const userCredential = await signInWithCredential(
        auth,
        googleCredential,
      );

      // Get ID token
      const token = await userCredential.user.getIdToken();

      // Register/login in backend
      await axios.post(
        `${API_CONFIG.baseURL}/api/auth/google`,
        {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.code === 'GOOGLE_SIGNIN_CANCELLED') {
        throw new Error('Вхід через Google скасовано');
      } else if (error.code === 'IN_PROGRESS') {
        throw new Error('Вхід вже виконується');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play Services недоступний');
      }
      throw new Error(error.message || 'Помилка входу через Google');
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await fetchUserData(firebaseUser);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
