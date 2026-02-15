import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AnalysisResult } from '../types/analysis';

type RootStackParamList = {
  Home: undefined;
  PhotoUpload: undefined;
  Results: { analysisResult: AnalysisResult };
};

type ResultsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export default function ResultsScreen({
  navigation,
  route,
}: ResultsScreenProps) {
  const { analysisResult } = route.params;
  const { larsonAnalysis, kibbeAnalysis, integratedRecommendations } =
    analysisResult;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.mainTitle}>Твої Результати</Text>

      {/* Larson Color Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Larson Color Analysis</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Колоротип</Text>
          <Text style={styles.cardValue}>
            {larsonAnalysis.seasonalType.primary}
          </Text>
          <Text style={styles.confidence}>
            Впевненість: {larsonAnalysis.seasonalType.confidence}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Undertone</Text>
          <Text style={styles.cardValue}>
            {larsonAnalysis.undertone.result === 'cool'
              ? '❄️ Cool (Холодний)'
              : larsonAnalysis.undertone.result === 'warm'
              ? '☀️ Warm (Теплий)'
              : '⚖️ Neutral (Нейтральний)'}
          </Text>
          <Text style={styles.confidence}>
            {larsonAnalysis.undertone.confidence}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Твої кращі кольори</Text>
          <View style={styles.colorPalette}>
            {larsonAnalysis.colorPalette.bestColors.neutrals
              .slice(0, 5)
              .map((color, index) => (
                <View
                  key={index}
                  style={[styles.colorBox, { backgroundColor: color }]}
                />
              ))}
          </View>
          <Text style={styles.colorLabel}>Нейтральні</Text>

          <View style={styles.colorPalette}>
            {larsonAnalysis.colorPalette.bestColors.accents
              .slice(0, 5)
              .map((color, index) => (
                <View
                  key={index}
                  style={[styles.colorBox, { backgroundColor: color }]}
                />
              ))}
          </View>
          <Text style={styles.colorLabel}>Акценти</Text>

          <Text style={styles.metalInfo}>
            Метали: {larsonAnalysis.colorPalette.bestColors.metals}
          </Text>
        </View>
      </View>

      {/* Kibbe Body Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👗 Kibbe Body Type</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Тип фігури</Text>
          <Text style={styles.cardValue}>
            {kibbeAnalysis.kibbeType.result ||
              kibbeAnalysis.kibbeType.preliminaryResult}
          </Text>
          <Text style={styles.confidence}>
            Впевненість: {kibbeAnalysis.kibbeType.confidence}
          </Text>

          {kibbeAnalysis.kibbeType.preliminaryResult && (
            <Text style={styles.warningText}>
              ⚠️ Попередній результат. Для точності потрібне фото в повний ріст
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Рекомендовані силуети</Text>
          {kibbeAnalysis.styleRecommendations.silhouettes
            .slice(0, 3)
            .map((silhouette, index) => (
              <Text key={index} style={styles.listItem}>
                • {silhouette}
              </Text>
            ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Тканини</Text>
          <Text style={styles.description}>
            {kibbeAnalysis.styleRecommendations.fabrics}
          </Text>
        </View>
      </View>

      {/* Celebrity Twins */}
      {integratedRecommendations.celebrityTwins.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Твої Celebrity Twins</Text>

          {integratedRecommendations.celebrityTwins.map((celebrity, index) => (
            <View key={index} style={styles.celebrityCard}>
              <Text style={styles.celebrityName}>{celebrity.name}</Text>
              <Text style={styles.similarityBadge}>
                {celebrity.similarity}% схожість
              </Text>
              <Text style={styles.celebrityInfo}>
                {celebrity.larsonType} × {celebrity.kibbeType}
              </Text>
              <Text style={styles.matchReason}>{celebrity.matchReason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Style Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💄 Makeup Recommendations</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Губи</Text>
          <View style={styles.colorPalette}>
            {integratedRecommendations.makeup.lipColors
              .slice(0, 5)
              .map((color, index) => {
                const hexMatch = color.match(/#[0-9A-Fa-f]{6}/);
                const hex = hexMatch ? hexMatch[0] : '#ccc';
                return (
                  <View
                    key={index}
                    style={[styles.colorBox, { backgroundColor: hex }]}
                  />
                );
              })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Волосся</Text>
          {integratedRecommendations.hair.colors
            .slice(0, 3)
            .map((color, index) => (
              <Text key={index} style={styles.listItem}>
                • {color}
              </Text>
            ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('PhotoUpload')}
        >
          <Text style={styles.primaryButtonText}>🔄 Новий Аналіз</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.secondaryButtonText}>← На Головну</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    marginTop: 10,
    fontStyle: 'italic',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  colorBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  metalInfo: {
    fontSize: 14,
    color: '#444',
    marginTop: 10,
    fontStyle: 'italic',
  },
  listItem: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  celebrityCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  celebrityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  similarityBadge: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 8,
  },
  celebrityInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  matchReason: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  actions: {
    marginTop: 20,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
  },
});
