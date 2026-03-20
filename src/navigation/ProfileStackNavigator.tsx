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
import MyAnalysesScreen from '../screens/MyAnalysesScreen';
import StartAnalysisScreen from '../screens/StartAnalysisScreen';
import AnalysisLoadingScreen from '../screens/AnalysisLoadingScreen';
import AnalysisResultsScreen from '../screens/AnalysisResultsScreen';
import MyClientsScreen from '../screens/MyClientsScreen';
import AddClientScreen from '../screens/AddClientScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import {
  EditProfileScreen,
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
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#C49B63',
        headerTitleStyle: { fontWeight: '600', fontSize: 18, color: '#fff' },
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
        component={MyAnalysesScreen}
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
      <Stack.Screen
        name="StartAnalysis"
        component={StartAnalysisScreen}
        options={{
          title: 'Новий аналіз',
        }}
      />
      <Stack.Screen
        name="AnalysisLoading"
        component={AnalysisLoadingScreen}
        options={{
          title: 'Аналіз',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AnalysisResults"
        component={AnalysisResultsScreen as any}
        options={{
          title: 'Результати',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyClients"
        component={MyClientsScreen}
        options={{
          title: 'Мої клієнти',
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#C49B63',
          headerTitleStyle: { color: '#fff', fontWeight: '600', fontSize: 18 },
        }}
      />
      <Stack.Screen
        name="AddClient"
        component={AddClientScreen}
        options={{
          title: 'Новий клієнт',
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#C49B63',
          headerTitleStyle: { color: '#fff', fontWeight: '600', fontSize: 18 },
        }}
      />
      <Stack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={({ route }) => ({
          title: route.params.clientName,
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#C49B63',
          headerTitleStyle: { color: '#fff', fontWeight: '600', fontSize: 18 },
        })}
      />
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
