/**
 * Main Navigator
 * Головна навігація з bottom tabs: Home, Gallery, Palette, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { Home, Compass, Shirt, Palette, User } from 'lucide-react-native';
import { MainTabParamList } from './types';

// Stack Navigators для кожного табу
import HomeStackNavigator from './HomeStackNavigator';
import ExploreStackNavigator from './ExploreStackNavigator';
import GalleryStackNavigator from './GalleryStackNavigator';
import PaletteStackNavigator from './PaletteStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

function getTabIcon(routeName: string, color: string, size: number) {
  const props = { color, size, strokeWidth: 1.8 };
  switch (routeName) {
    case 'HomeTab':    return <Home {...props} />;
    case 'ExploreTab': return <Compass {...props} />;
    case 'GalleryTab': return <Shirt {...props} />;
    case 'PaletteTab': return <Palette {...props} />;
    case 'ProfileTab': return <User {...props} />;
    default:           return null;
  }
}

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#C49B63',
        tabBarInactiveTintColor: '#555566',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size }) => getTabIcon(route.name, color, size ?? 24),
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
    backgroundColor: '#121220',
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,155,99,0.15)',
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default MainNavigator;
