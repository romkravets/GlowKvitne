import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExploreStackParamList } from './types';

// Screens
import ExploreScreen from '../screens/ExploreScreen';
import SalonsScreen from '../screens/SalonsScreen';
import SalonDetailsScreen from '../screens/SalonDetailsScreen';
import ArticlesScreen from '../screens/ArticlesScreen';
import ArticleDetailsScreen from '../screens/ArticleDetailsScreen';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

const ExploreStackNavigator = () => {
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
        name="Explore"
        component={ExploreScreen}
        options={{ title: 'Огляд' }}
      />
      <Stack.Screen
        name="Salons"
        component={SalonsScreen}
        options={{ title: 'Салони' }}
      />
      <Stack.Screen
        name="SalonDetails"
        component={SalonDetailsScreen}
        options={{ title: 'Деталі салону' }}
      />
      <Stack.Screen
        name="Articles"
        component={ArticlesScreen}
        options={{ title: 'Статті' }}
      />
      <Stack.Screen
        name="ArticleDetails"
        component={ArticleDetailsScreen}
        options={{ title: 'Стаття' }}
      />
    </Stack.Navigator>
  );
};

export default ExploreStackNavigator;
