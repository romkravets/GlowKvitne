/**
 * Profile Stack Navigator
 * Навігація для табу профілю
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';

// Screens
import ProfileScreen from '../screens/ProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import {
  EditProfileScreen,
  MyAnalysisScreen,
  SettingsScreen,
  AboutScreen,
  PrivacyScreen,
  TermsScreen,
} from '../screens/PlaceholderScreens';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1A1A1A',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профіль',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Редагувати профіль',
        }}
      />
      <Stack.Screen
        name="MyAnalysis"
        component={MyAnalysisScreen}
        options={{
          title: 'Мої аналізи',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Налаштування',
        }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          title: 'Підписка',
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'Про додаток',
        }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          title: 'Політика конфіденційності',
        }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          title: 'Умови використання',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
