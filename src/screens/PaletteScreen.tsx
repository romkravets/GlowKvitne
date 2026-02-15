/**
 * Palette Screen
 * Відображення кольорової палітри користувача
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';

const { width } = Dimensions.get('window');
const COLOR_SIZE = (width - 80) / 4; // 4 кольори в ряд

interface ColorPalette {
  baseColors: string[];
  accentColors: string[];
  avoidColors: string[];
  metal: 'gold' | 'silver';
  colorType: string;
}

const PaletteScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPalette();
  }, []);

  const loadPalette = async () => {
    try {
      // TODO: Завантажити палітру з API
      // const data = await analysisService.getMyPalette();

      // Симуляція
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      const mockPalette: ColorPalette = {
        colorType: 'Тепла Осінь',
        baseColors: [
          '#8B4513', // Saddle Brown
          '#D2691E', // Chocolate
          '#CD853F', // Peru
          '#DEB887', // Burlywood
          '#BC8F8F', // Rosy Brown
          '#A0522D', // Sienna
          '#708090', // Slate Gray
          '#2F4F4F', // Dark Slate Gray
        ],
        accentColors: ['#B8860B', '#DAA520', '#FF8C00', '#CD5C5C', '#8B0000'],
        avoidColors: ['#E0FFFF', '#B0E0E6', '#87CEEB', '#BA55D3', '#FF1493'],
        metal: 'gold',
      };

      setPalette(mockPalette);
    } catch (error) {
      console.error('Error loading palette:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити палітру');
    } finally {
      setLoading(false);
    }
  };

  const renderColorCircle = (color: string, index: number) => (
    <TouchableOpacity
      key={`${color}-${index}`}
      style={[styles.colorCircle, { backgroundColor: color }]}
      onPress={() => navigation.navigate('ColorDetails', { color })}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C49B63" />
        </View>
      </SafeAreaView>
    );
  }

  if (!palette) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎨</Text>
          <Text style={styles.emptyTitle}>Немає палітри</Text>
          <Text style={styles.emptyText}>
            Пройдіть аналіз колоротипу, щоб отримати персональну палітру
          </Text>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() =>
              navigation.navigate('HomeTab', {
                screen: 'StartAnalysis',
              } as any)
            }
          >
            <Text style={styles.analyzeButtonText}>Пройти аналіз</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.colorType}>🎨 {palette.colorType}</Text>
          <Text style={styles.subtitle}>Ваша персональна палітра</Text>
        </View>

        {/* Base Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Базові кольори</Text>
          <Text style={styles.sectionDescription}>
            Ідеальні для основного гардеробу
          </Text>
          <View style={styles.colorGrid}>
            {palette.baseColors.map(renderColorCircle)}
          </View>
        </View>

        {/* Accent Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Акцентні кольори</Text>
          <Text style={styles.sectionDescription}>
            Для аксесуарів та яскравих деталей
          </Text>
          <View style={styles.colorGrid}>
            {palette.accentColors.map(renderColorCircle)}
          </View>
        </View>

        {/* Metal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Метал</Text>
          <View style={styles.metalContainer}>
            <Text style={styles.metalEmoji}>
              {palette.metal === 'gold' ? '🥇' : '🥈'}
            </Text>
            <Text style={styles.metalText}>
              {palette.metal === 'gold' ? 'Золото' : 'Срібло'}
            </Text>
          </View>
          <Text style={styles.metalDescription}>
            Цей метал найкраще підходить для прикрас та аксесуарів
          </Text>
        </View>

        {/* Avoid Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❌ Уникайте</Text>
          <Text style={styles.sectionDescription}>
            Ці кольори можуть зробити вас блідішою
          </Text>
          <View style={styles.colorGrid}>
            {palette.avoidColors.map(renderColorCircle)}
          </View>
        </View>

        {/* Download Button */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => navigation.navigate('DownloadPalette')}
        >
          <Text style={styles.downloadButtonText}>📥 Завантажити палітру</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  colorType: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: COLOR_SIZE,
    height: COLOR_SIZE,
    borderRadius: COLOR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  metalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  metalEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  metalText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  metalDescription: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  downloadButton: {
    backgroundColor: '#C49B63',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#C49B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  analyzeButton: {
    backgroundColor: '#C49B63',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#C49B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PaletteScreen;
