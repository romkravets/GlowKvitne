import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../navigation/types';

type ExploreScreenProps = {
  navigation: NativeStackNavigationProp<ExploreStackParamList, 'Explore'>;
};

const ExploreScreen = ({ navigation }: ExploreScreenProps) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Огляд</Text>
        <Text style={styles.heroSubtitle}>
          Відкрий найкращі салони та корисні статті про красу
        </Text>
      </View>

      {/* Main Categories */}
      <View style={styles.categoriesContainer}>
        {/* Salons Card */}
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Salons')}
          activeOpacity={0.8}
        >
          <View style={styles.categoryImageContainer}>
            <Text style={styles.categoryEmoji}>💇‍♀️</Text>
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Салони краси</Text>
            <Text style={styles.categoryDescription}>
              Знайди найкращі салони у твоєму місті. Перегляд послуг, відгуків
              та контактів
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>Переглянути</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Articles Card */}
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Articles')}
          activeOpacity={0.8}
        >
          <View style={styles.categoryImageContainer}>
            <Text style={styles.categoryEmoji}>📖</Text>
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Статті про красу</Text>
            <Text style={styles.categoryDescription}>
              Корисні поради, тренди та експертні рекомендації від професіоналів
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>Читати</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Що ми пропонуємо</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔍</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Пошук та фільтрація</Text>
            <Text style={styles.featureDescription}>
              Легко знайди те, що тобі потрібно за містом, категорією або
              ключовими словами
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⭐</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Відгуки користувачів</Text>
            <Text style={styles.featureDescription}>
              Реальні відгуки від реальних людей допоможуть зробити правильний
              вибір
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>💡</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Експертні поради</Text>
            <Text style={styles.featureDescription}>
              Статті від професіоналів індустрії краси з практичними порадами
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📱</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Зручний доступ</Text>
            <Text style={styles.featureDescription}>
              Вся інформація завжди під рукою - швидко, зручно, без реєстрації
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  heroSection: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  categoriesContainer: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryImageContainer: {
    height: 160,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 72,
  },
  categoryContent: {
    padding: 20,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#C49B63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  featuresSection: {
    backgroundColor: '#fff',
    padding: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ExploreScreen;
