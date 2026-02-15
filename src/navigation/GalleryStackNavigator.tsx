/**
 * Gallery Stack Navigator
 * Навігація для табу з образами
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GalleryStackParamList } from './types';

// Screens
import GalleryScreen from '../screens/GalleryScreen';
import {
  OutfitDetailsScreen,
  GenerateOutfitScreen,
} from '../screens/PlaceholderScreens';

const Stack = createNativeStackNavigator<GalleryStackParamList>();

const GalleryStackNavigator: React.FC = () => {
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
        name="Gallery"
        component={GalleryScreen}
        options={{
          title: 'Мої образи',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="OutfitDetails"
        component={OutfitDetailsScreen}
        options={{
          title: 'Деталі образу',
        }}
      />
      <Stack.Screen
        name="GenerateOutfit"
        component={GenerateOutfitScreen}
        options={{
          title: 'Згенерувати образ',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default GalleryStackNavigator;
