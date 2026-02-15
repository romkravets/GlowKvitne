/**
 * Analysis Results Screen
 * Відображення результатів аналізу
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';
import { Analysis } from '../api/analysisApi';

const { width } = Dimensions.get('window');

interface AnalysisResultsScreenProps extends NavigationProps {
  route: {
    params: {
      analysisResult: Analysis;
    };
  };
}

const AnalysisResultsScreen: React.FC<AnalysisResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { analysisResult } = route.params;

  // Extract data from analysisResult
  const colorType =
    analysisResult.larsonAnalysis?.seasonalType?.primary || 'Unknown';
  const confidence =
    parseFloat(analysisResult.larsonAnalysis?.seasonalType?.confidence || '0') /
    100;

  const undertone = analysisResult.larsonAnalysis?.undertone || 'neutral';
  const undertoneConfidence =
    analysisResult.larsonAnalysis?.undertoneConfidence || 'N/A';

  const kibbeType =
    analysisResult.kibbeAnalysis?.kibbeType?.result || 'Unknown';
  const kibbeConfidence =
    analysisResult.kibbeAnalysis?.kibbeType?.confidence || 'N/A';
  const kibbeRecommendations =
    analysisResult.kibbeAnalysis?.styleRecommendations;

  const archetypeBlend =
    analysisResult.archetypeAnalysis?.blendName || 'Unknown';
  const archetypeKeywords =
    analysisResult.archetypeAnalysis?.styleKeywords || [];
  const primaryEssence = analysisResult.archetypeAnalysis?.primaryEssence;

  // Палітра кольорів
  const neutralColors =
    analysisResult.larsonAnalysis?.colorPalette?.bestColors?.neutrals || [];
  const accentColors =
    analysisResult.larsonAnalysis?.colorPalette?.bestColors?.accents || [];
  const metals =
    analysisResult.larsonAnalysis?.colorPalette?.bestColors?.metals ||
    'Unknown';

  // Рекомендації
  const makeupRecs = analysisResult.recommendations?.makeup;
  const hairRecs = analysisResult.recommendations?.hair;
  const celebrityTwins =
    analysisResult.recommendations?.celebrityTwins ||
    analysisResult.celebrityMatches ||
    [];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Я пройшла аналіз у GlowKvitne! Мій колоротип: ${colorType}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewMyAnalyses = () => {
    navigation.navigate('MyAnalysis');
  };

  const handleDownloadPDF = () => {
    Alert.alert('У розробці', 'Функція завантаження PDF в розробці');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header Buttons */}
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <Text style={styles.iconButtonText}>📤 Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleViewMyAnalyses}
        >
          <Text style={styles.iconButtonText}>📊 Мої аналізи</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Color Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 ВАШ КОЛОРОТИП</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultType}>{colorType}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  Впевненість: {Math.round(confidence * 100)}%
                </Text>
              </View>
            </View>

            {/* User Photo Placeholder */}
            <View style={styles.photoContainer}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoText}>Ваше фото</Text>
              </View>
            </View>

            <View style={styles.characteristics}>
              <Text style={styles.characteristicsTitle}>Характеристики:</Text>
              <CharacteristicItem
                text={`Undertone: ${undertone} (${undertoneConfidence})`}
              />
              {analysisResult.larsonAnalysis?.undertoneIndicators
                ?.slice(0, 3)
                .map((indicator, idx) => (
                  <CharacteristicItem key={idx} text={indicator} />
                ))}
            </View>
          </View>
        </View>

        {/* Color Palette Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 ВАША ПАЛІТРА</Text>
          <View style={styles.paletteCard}>
            <Text style={styles.paletteSubtitle}>Базові кольори</Text>
            <View style={styles.colorRow}>
              {neutralColors.slice(0, 5).map((color, index) => (
                <View
                  key={index}
                  style={[styles.colorCircle, { backgroundColor: color }]}
                />
              ))}
            </View>

            {accentColors.length > 0 && (
              <>
                <Text style={styles.paletteSubtitleWithMargin}>
                  Акцентні кольори
                </Text>
                <View style={styles.colorRow}>
                  {accentColors.slice(0, 5).map((color, index) => (
                    <View
                      key={index}
                      style={[styles.colorCircle, { backgroundColor: color }]}
                    />
                  ))}
                </View>
              </>
            )}

            <View style={styles.metalContainer}>
              <Text style={styles.metalLabel}>Метал:</Text>
              <Text style={styles.metalValue}>{metals}</Text>
            </View>

            <TouchableOpacity
              style={styles.downloadPaletteButton}
              onPress={() => navigation.navigate('PaletteTab' as any)}
            >
              <Text style={styles.downloadPaletteText}>
                Переглянути повну палітру →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avoid Colors - hide if no data */}
        {analysisResult.larsonAnalysis?.colorPalette && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❌ УНИКАЙТЕ</Text>
            <View style={styles.avoidCard}>
              <Text style={styles.avoidText}>
                {analysisResult.larsonAnalysis.colorPalette.reasoning ||
                  'Уникайте кольорів, що не гармонують з вашим колоротипом'}
              </Text>
            </View>
          </View>
        )}

        {/* Kibbe Body Type */}
        {kibbeType !== 'Unknown' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👗 ТИП ФІГУРИ (KIBBE)</Text>
            <View style={styles.resultCard}>
              <Text style={styles.kibbeType}>{kibbeType}</Text>
              <Text style={styles.confidenceSmall}>
                Впевненість: {kibbeConfidence}
              </Text>

              {kibbeRecommendations && (
                <View style={styles.kibbeDetails}>
                  {kibbeRecommendations.silhouettes &&
                    kibbeRecommendations.silhouettes.length > 0 && (
                      <>
                        <Text style={styles.kibbeSubtitle}>
                          Рекомендовані силуети:
                        </Text>
                        {kibbeRecommendations.silhouettes
                          .slice(0, 5)
                          .map((item, idx) => (
                            <CharacteristicItem key={idx} text={item} />
                          ))}
                      </>
                    )}

                  {kibbeRecommendations.fabrics && (
                    <>
                      <Text style={styles.kibbeSubtitleWithMargin}>
                        Тканини:
                      </Text>
                      <CharacteristicItem text={kibbeRecommendations.fabrics} />
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Essence */}
        {archetypeBlend !== 'Unknown' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ ВАША ЕСЕНЦІЯ</Text>
            <View style={styles.resultCard}>
              <Text style={styles.essenceType}>{archetypeBlend}</Text>

              {primaryEssence && (
                <View style={styles.essenceBar}>
                  <Text style={styles.essenceLabel}>
                    {primaryEssence.percentage}% {primaryEssence.name}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${primaryEssence.percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              )}

              {archetypeKeywords.length > 0 && (
                <Text style={styles.essenceVibe}>
                  Ваш вайб:{' '}
                  <Text style={styles.essenceVibeText}>
                    {archetypeKeywords.slice(0, 5).join(', ')}
                  </Text>
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Celebrity Twins */}
        {celebrityTwins.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌟 ВАШІ CELEBRITY TWINS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.celebritiesRow}
            >
              {celebrityTwins.map((celeb, index) => (
                <View key={index} style={styles.celebrityCard}>
                  <View style={styles.celebrityImage}>
                    <Text style={styles.celebrityPlaceholder}>👤</Text>
                  </View>
                  <Text style={styles.celebrityName}>{celeb.name}</Text>
                  <Text style={styles.celebrityMatch}>{celeb.similarity}%</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                navigation.navigate('CelebrityDetails', {
                  celebrities: celebrityTwins,
                } as any)
              }
            >
              <Text style={styles.detailsButtonText}>Детальніше →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Makeup & Hair */}
        {makeupRecs && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💄 МАКІЯЖ</Text>
            <View style={styles.tipsCard}>
              {makeupRecs.lipColors && makeupRecs.lipColors.length > 0 && (
                <TipItem
                  label="Губи"
                  value={makeupRecs.lipColors.slice(0, 2).join(', ')}
                />
              )}
              {makeupRecs.eyeColors && makeupRecs.eyeColors.length > 0 && (
                <TipItem
                  label="Очі"
                  value={makeupRecs.eyeColors.slice(0, 2).join(', ')}
                />
              )}
              {makeupRecs.blushColors && makeupRecs.blushColors.length > 0 && (
                <TipItem
                  label="Рум'яна"
                  value={makeupRecs.blushColors.slice(0, 2).join(', ')}
                />
              )}
            </View>
          </View>
        )}

        {hairRecs && hairRecs.colors && hairRecs.colors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💇 ВОЛОССЯ</Text>
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Кращі відтінки:</Text>
              {hairRecs.colors.slice(0, 5).map((color, idx) => (
                <CharacteristicItem key={idx} text={color} />
              ))}
            </View>
          </View>
        )}

        {/* CTA Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate('GalleryTab', {
              screen: 'GenerateOutfit',
            } as any)
          }
        >
          <Text style={styles.primaryButtonText}>Згенерувати образи</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleDownloadPDF}
        >
          <Text style={styles.secondaryButtonText}>📥 Завантажити PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper Components
const CharacteristicItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.characteristicItem}>
    <Text style={styles.characteristicBullet}>•</Text>
    <Text style={styles.characteristicText}>{text}</Text>
  </View>
);

const TipItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.tipItem}>
    <Text style={styles.tipLabel}>{label}:</Text>
    <Text style={styles.tipValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    marginBottom: 16,
  },
  resultType: {
    fontSize: 24,
    fontWeight: '700',
    color: '#C49B63',
    marginBottom: 8,
  },
  confidenceBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  photoPlaceholder: {
    width: width - 80,
    height: (width - 80) * 1.2,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 16,
    color: '#999999',
  },
  characteristics: {
    marginTop: 16,
  },
  characteristicsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  characteristicBullet: {
    fontSize: 16,
    color: '#C49B63',
    marginRight: 8,
  },
  characteristicText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  paletteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paletteSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
  },
  paletteSubtitleWithMargin: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
    marginTop: 16,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  metalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  metalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginRight: 8,
  },
  metalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  downloadPaletteButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  downloadPaletteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C49B63',
  },
  avoidCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avoidText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
  kibbeType: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  confidenceSmall: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 16,
  },
  kibbeDetails: {
    marginTop: 12,
  },
  kibbeSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  kibbeSubtitleWithMargin: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 12,
  },
  essenceType: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  essenceBar: {
    marginBottom: 16,
  },
  essenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C49B63',
  },
  progressFill65: {
    height: '100%',
    width: '65%',
    backgroundColor: '#C49B63',
  },
  progressFill35: {
    height: '100%',
    width: '35%',
    backgroundColor: '#C49B63',
  },
  essenceVibe: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  essenceVibeText: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  celebritiesRow: {
    paddingRight: 20,
  },
  celebrityCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  celebrityImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#C49B63',
  },
  celebrityPlaceholder: {
    fontSize: 40,
  },
  celebrityName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  celebrityMatch: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C49B63',
  },
  detailsButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C49B63',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    minWidth: 80,
  },
  tipValue: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  primaryButton: {
    backgroundColor: '#C49B63',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
    shadowColor: '#C49B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C49B63',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C49B63',
  },
});

export default AnalysisResultsScreen;
