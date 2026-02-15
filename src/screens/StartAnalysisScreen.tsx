/**
 * Start Analysis Screen
 * Пояснення що таке аналіз і що потрібно
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';

const StartAnalysisScreen: React.FC<NavigationProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustration}>🎨✨</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Отримай науковий{'\n'}аналіз своєї зовнішності
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="🎨"
            title="Larson колористика"
            description="Визначення колоротипу на основі наукових досліджень"
          />
          <FeatureItem
            icon="👗"
            title="Kibbe типування тіла"
            description="Підбір силуетів під вашу фігуру"
          />
          <FeatureItem
            icon="✨"
            title="Визначення архетипу"
            description="Ваша унікальна есенція та стильовий вайб"
          />
          <FeatureItem
            icon="🌟"
            title="Celebrity twins"
            description="Знайди знаменитостей з твоїм типажем"
          />
        </View>

        {/* Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>📋 Що вам знадобиться:</Text>

          <RequirementItem text="Фото обличчя при денному світлі без макіяжу" />
          <RequirementItem text="Фото в повний ріст (опційно)" />
        </View>

        {/* Time */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeIcon}>⏱</Text>
          <Text style={styles.timeText}>Час обробки: 2-3 хвилини</Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('PhotoUpload')}
        >
          <Text style={styles.ctaButtonText}>Почати аналіз</Text>
        </TouchableOpacity>

        {/* Premium Upsell */}
        <TouchableOpacity
          style={styles.premiumContainer}
          onPress={() =>
            navigation.navigate('ProfileTab', {
              screen: 'Subscription',
            } as any)
          }
        >
          <Text style={styles.premiumText}>
            💎 Premium: необмежені аналізи та образи
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Feature Item Component
interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
}) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

// Requirement Item Component
interface RequirementItemProps {
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ text }) => (
  <View style={styles.requirementItem}>
    <Text style={styles.requirementBullet}>•</Text>
    <Text style={styles.requirementText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  illustration: {
    fontSize: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 36,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    color: '#666666',
    lineHeight: 20,
  },
  requirementsContainer: {
    backgroundColor: '#FFF9F0',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C49B63',
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requirementBullet: {
    fontSize: 16,
    color: '#C49B63',
    marginRight: 8,
    marginTop: 2,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#999999',
  },
  ctaButton: {
    backgroundColor: '#C49B63',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#C49B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  premiumContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 14,
    color: '#C49B63',
    fontWeight: '500',
  },
});

export default StartAnalysisScreen;
