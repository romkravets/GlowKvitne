/**
 * Palette Stack Navigator
 * Навігація для табу з палітрою
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaletteStackParamList } from './types';

// Screens
import PaletteScreen from '../screens/PaletteScreen';
import {
  ColorDetailsScreen,
  DownloadPaletteScreen,
} from '../screens/PlaceholderScreens';

const Stack = createNativeStackNavigator<PaletteStackParamList>();

const PaletteStackNavigator: React.FC = () => {
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
        name="Palette"
        component={PaletteScreen}
        options={{
          title: 'Моя палітра',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ColorDetails"
        component={ColorDetailsScreen}
        options={{
          title: 'Деталі кольору',
        }}
      />
      <Stack.Screen
        name="DownloadPalette"
        component={DownloadPaletteScreen}
        options={{
          title: 'Завантажити палітру',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default PaletteStackNavigator;
