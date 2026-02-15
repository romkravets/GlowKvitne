/**
 * Home Stack Navigator
 * Навігація всередині Home табу: Home → Analysis Flow → Results
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HomeStackParamList } from './types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import StartAnalysisScreen from '../screens/StartAnalysisScreen';
import PhotoUploadScreen from '../screens/PhotoUploadScreen';
import AnalysisLoadingScreen from '../screens/AnalysisLoadingScreen';
import AnalysisResultsScreen from '../screens/AnalysisResultsScreen';
import CelebrityDetailsScreen from '../screens/CelebrityDetailsScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => {
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
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="StartAnalysis"
        component={StartAnalysisScreen}
        options={({ navigation }) => ({
          title: 'Новий аналіз',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Назад</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="PhotoUpload"
        component={PhotoUploadScreen}
        options={{
          title: 'Завантаження фото',
        }}
      />
      <Stack.Screen
        name="AnalysisLoading"
        component={AnalysisLoadingScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Заборона свайпу назад під час обробки
        }}
      />
      <Stack.Screen
        name="AnalysisResults"
        component={AnalysisResultsScreen}
        options={({ navigation }) => ({
          title: 'Ваш аналіз',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Головна</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="CelebrityDetails"
        component={CelebrityDetailsScreen}
        options={{
          title: 'Ваші дублери',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    color: '#C49B63',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeStackNavigator;
