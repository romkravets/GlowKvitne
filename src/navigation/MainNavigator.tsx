/**
 * Main Navigator
 * Головна навігація з bottom tabs: Home, Gallery, Palette, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { MainTabParamList } from './types';

// Stack Navigators для кожного табу
import HomeStackNavigator from './HomeStackNavigator';
import ExploreStackNavigator from './ExploreStackNavigator';
import GalleryStackNavigator from './GalleryStackNavigator';
import PaletteStackNavigator from './PaletteStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

// Icons (можна замінити на react-native-vector-icons)
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: { [key: string]: string } = {
    HomeTab: focused ? '🏠' : '🏡',
    ExploreTab: focused ? '🔍' : '🔎',
    GalleryTab: focused ? '👗' : '👚',
    PaletteTab: focused ? '🎨' : '🖌️',
    ProfileTab: focused ? '👤' : '👥',
  };
  return icons[name] || '•';
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#C49B63', // Золотий акцент
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => TabIcon({ name: route.name, focused }),
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Головна',
          title: 'Головна',
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStackNavigator}
        options={{
          tabBarLabel: 'Огляд',
          title: 'Огляд',
        }}
      />
      <Tab.Screen
        name="GalleryTab"
        component={GalleryStackNavigator}
        options={{
          tabBarLabel: 'Образи',
          title: 'Мої образи',
        }}
      />
      <Tab.Screen
        name="PaletteTab"
        component={PaletteStackNavigator}
        options={{
          tabBarLabel: 'Палітра',
          title: 'Моя палітра',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Профіль',
          title: 'Профіль',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default MainNavigator;
