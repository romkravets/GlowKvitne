/**
 * Celebrity Details Screen
 * Детально про celebrity twins
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';

const { width } = Dimensions.get('window');

const CelebrityDetailsScreen: React.FC<NavigationProps> = () => {
  const celebrities = [
    {
      name: 'Jennifer Lawrence',
      match: 87,
      colorType: 'Warm Autumn',
      kibbeType: 'Soft Natural',
      essence: 'Natural-Romantic',
    },
    {
      name: 'Jessica Alba',
      match: 82,
      colorType: 'Warm Autumn',
      kibbeType: 'Soft Natural',
      essence: 'Natural-Romantic',
    },
    {
      name: 'Blake Lively',
      match: 79,
      colorType: 'Warm Autumn',
      kibbeType: 'Soft Natural',
      essence: 'Natural-Romantic',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>
          Ваші celebrity twins — знаменитості з таким же типажем:
        </Text>

        {celebrities.map((celebrity, index) => (
          <View key={index} style={styles.celebrityCard}>
            <View style={styles.celebrityImageContainer}>
              <View style={styles.celebrityImage}>
                <Text style={styles.celebrityPlaceholder}>👤</Text>
              </View>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{celebrity.match}%</Text>
              </View>
            </View>

            <View style={styles.celebrityInfo}>
              <Text style={styles.celebrityName}>{celebrity.name}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Колоротип:</Text>
                <Text style={styles.infoValue}>{celebrity.colorType}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kibbe:</Text>
                <Text style={styles.infoValue}>{celebrity.kibbeType}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Есенція:</Text>
                <Text style={styles.infoValue}>{celebrity.essence}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>💡 Як використовувати:</Text>
          <Text style={styles.tipText}>
            Шукайте фото цих знаменитостей на red carpet та аналізуйте їхні
            образи. Це допоможе вам краще зрозуміти які стилі вам підходять.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
  },
  celebrityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  celebrityImageContainer: {
    marginRight: 16,
  },
  celebrityImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C49B63',
  },
  celebrityPlaceholder: {
    fontSize: 32,
  },
  matchBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#C49B63',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  celebrityInfo: {
    flex: 1,
  },
  celebrityName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    width: 90,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  tipContainer: {
    backgroundColor: '#FFF9F0',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C49B63',
    marginTop: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default CelebrityDetailsScreen;
