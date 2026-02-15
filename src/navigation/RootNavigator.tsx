/**
 * Root Navigator
 * Головний навігатор який керує потоком: Splash → Onboarding → Auth/Main
 */

import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      setIsFirstLaunch(hasLaunched === null);

      // Splash screen показуємо 2 секунди
      setTimeout(() => setShowSplash(false), 2000);
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
      setShowSplash(false);
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    setIsFirstLaunch(false);
  };

  // Поки завантажується або показуємо splash
  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isFirstLaunch ? (
        // Перший запуск - показуємо онбординг
        <Stack.Screen name="Onboarding">
          {props => (
            <OnboardingScreen {...props} onComplete={completeOnboarding} />
          )}
        </Stack.Screen>
      ) : !user ? (
        // Не залогінений - Auth flow
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // Залогінений - Main app
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
