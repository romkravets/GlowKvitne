/**
 * Profile Screen
 * Профіль користувача з налаштуваннями
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from '@react-native-firebase/auth';
import { useAuth } from '../context/AuthContext';
import { NavigationProps } from '../navigation/types';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  subscription: 'free' | 'basic' | 'premium' | 'stylist';
  analysisCount: number;
  outfitCount: number;
}

const ProfileScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { user, signOut, linkGoogleAccount } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasGoogleProvider, setHasGoogleProvider] = useState(false);
  const [checkingProviders, setCheckingProviders] = useState(true);

  console.log('User in ProfileScreen:', user);

  const loadProfile = async () => {
    try {
      // TODO: Завантажити профіль з API
      // const data = await userService.getProfile();

      // Симуляція
      const mockProfile: UserProfile = {
        name: user?.displayName || 'Користувач',
        email: user?.email || 'user@example.com',
        subscription: (user?.subscription?.plan || 'free') as UserProfile['subscription'],
        analysisCount: user?.subscription?.usage.analysesThisMonth || 0,
        outfitCount: user?.subscription?.usage.outfitsThisMonth || 0,
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    loadProfile();
    checkAuthProviders();
  }, []);

  const checkAuthProviders = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const providers = currentUser.providerData.map(p => p.providerId);
        setHasGoogleProvider(providers.includes('google.com'));
      }
    } catch (error) {
      console.error('Error checking providers:', error);
    } finally {
      setCheckingProviders(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Вихід', 'Ви впевнені що хочете вийти?', [
      { text: 'Скасувати', style: 'cancel' },
      { text: 'Вийти', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleLinkGoogle = async () => {
    Alert.alert(
      "Прив'язати Google",
      "Після прив'язування ви зможете входити через Google замість пароля",
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: "Прив'язати",
          onPress: async () => {
            try {
              await linkGoogleAccount();
              Alert.alert(
                'Успіх! 🎉',
                "Google акаунт успішно прив'язано. Тепер ви можете входити через Google!",
              );
              checkAuthProviders(); // Refresh provider status
            } catch (error: any) {
              Alert.alert('Помилка', error.message);
            }
          },
        },
      ],
    );
  };

  const isStylist = profile?.subscription === 'stylist';

  const subscriptionBadge = () => {
    const badges: Record<string, { text: string; color: string; emoji: string }> = {
      free: { text: 'FREE', color: '#9E9E9E', emoji: '🆓' },
      basic: { text: 'BASIC', color: '#4CAF50', emoji: '⭐' },
      premium: { text: 'PREMIUM', color: '#FFD700', emoji: '👑' },
      stylist: { text: 'STYLIST', color: '#C49B63', emoji: '💼' },
    };
    const badge = badges[profile?.subscription || 'free'];

    return (
      <View style={[styles.badge, { backgroundColor: badge.color }]}>
        <Text style={styles.badgeText}>
          {badge.emoji} {badge.text}
        </Text>
      </View>
    );
  };

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>

          {subscriptionBadge()}

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Редагувати профіль</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.analysisCount}</Text>
            <Text style={styles.statLabel}>Аналізів</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.outfitCount}</Text>
            <Text style={styles.statLabel}>Образів</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          <MenuButton
            icon="📊"
            title="Мої аналізи"
            onPress={() => navigation.navigate('MyAnalysis')}
          />

          {isStylist && (
            <MenuButton
              icon="👥"
              title="Мої клієнти"
              subtitle="Управління клієнтами"
              onPress={() => navigation.navigate('MyClients')}
            />
          )}

          {profile.subscription === 'free' && (
            <MenuButton
              icon="👑"
              title="Оновити до Premium"
              subtitle="Необмежені можливості"
              highlight
              onPress={() => navigation.navigate('Subscription')}
            />
          )}

          <MenuButton
            icon="💳"
            title="Підписка"
            subtitle={`Поточний план: ${profile.subscription.toUpperCase()}`}
            onPress={() => navigation.navigate('Subscription')}
          />

          <MenuButton
            icon="⚙️"
            title="Налаштування"
            onPress={() => navigation.navigate('Settings')}
          />

          {/* Google Account Linking */}
          {!checkingProviders && !hasGoogleProvider && (
            <MenuButton
              icon="🔗"
              title="Прив'язати Google акаунт"
              subtitle="Увійдіть через Google одним кліком"
              highlight
              onPress={handleLinkGoogle}
            />
          )}

          {!checkingProviders && hasGoogleProvider && (
            <MenuButton
              icon="✅"
              title="Google акаунт прив'язано"
              subtitle="Можете входити через Google"
              onPress={() => {}}
            />
          )}

          <MenuButton
            icon="❓"
            title="Про додаток"
            onPress={() => navigation.navigate('About')}
          />

          <MenuButton
            icon="🔒"
            title="Конфіденційність"
            onPress={() => navigation.navigate('Privacy')}
          />

          <MenuButton
            icon="📜"
            title="Умови використання"
            onPress={() => navigation.navigate('Terms')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Вийти</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Версія 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Menu Button Component
interface MenuButtonProps {
  icon: string;
  title: string;
  subtitle?: string;
  highlight?: boolean;
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  title,
  subtitle,
  highlight,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.menuButton, highlight && styles.menuButtonHighlight]}
    onPress={onPress}
  >
    <Text style={styles.menuIcon}>{icon}</Text>
    <View style={styles.menuTextContainer}>
      <Text style={[styles.menuTitle, highlight && styles.menuTitleHighlight]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#C49B63',
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C49B63',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#C49B63',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  menu: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuButtonHighlight: {
    backgroundColor: '#FFF9F0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  menuTitleHighlight: {
    color: '#C49B63',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#999999',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: '#CCCCCC',
  },
  logoutButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  version: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});

export default ProfileScreen;
