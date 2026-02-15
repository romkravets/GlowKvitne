/**
 * Placeholder screens for navigation
 * These will be implemented later
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.emoji}>🚧</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>У розробці</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
  },
});

export const OutfitDetailsScreen: React.FC = () => (
  <PlaceholderScreen title="Деталі образу" />
);

export const GenerateOutfitScreen: React.FC = () => (
  <PlaceholderScreen title="Генерація образу" />
);

export const ColorDetailsScreen: React.FC = () => (
  <PlaceholderScreen title="Деталі кольору" />
);

export const DownloadPaletteScreen: React.FC = () => (
  <PlaceholderScreen title="Завантажити палітру" />
);

export const EditProfileScreen: React.FC = () => (
  <PlaceholderScreen title="Редагувати профіль" />
);

export const MyAnalysisScreen: React.FC = () => (
  <PlaceholderScreen title="Мої аналізи" />
);

export const SettingsScreen: React.FC = () => (
  <PlaceholderScreen title="Налаштування" />
);

export const AboutScreen: React.FC = () => (
  <PlaceholderScreen title="Про додаток" />
);

export const PrivacyScreen: React.FC = () => (
  <PlaceholderScreen title="Політика конфіденційності" />
);

export const TermsScreen: React.FC = () => (
  <PlaceholderScreen title="Умови використання" />
);
