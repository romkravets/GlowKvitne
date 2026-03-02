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

type RootStackParamList = {
  Home: undefined;
  PhotoUpload: undefined;
  Results: { analysisResult: any };
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
  const la = analysisResult?.larsonAnalysis || {};
  const colorSeason = analysisResult?.colorSeason || {};
  const rec = analysisResult?.recommendations || {};
  const styleType = la?.styleType || {};
  const colorPalette = la?.colorPalette?.bestColors || {};
  const celebrityMatches: any[] = la?.celebrityMatches || [];
  const archetype = la?.archetypeAnalysis;

  const neutrals: string[] = colorPalette.neutrals || [];
  const accents: string[] = colorPalette.accents || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.mainTitle}>Твої Результати</Text>

      {/* Color Season */}
      {!!colorSeason.primary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌸 Колірний Сезон</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Основний сезон</Text>
            <Text style={styles.cardValue}>{colorSeason.primary}</Text>
            {!!colorSeason.secondary && (
              <Text style={styles.confidence}>
                Також: {colorSeason.secondary}
              </Text>
            )}
            <View style={styles.tagsRow}>
              {!!colorSeason.temperature && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {colorSeason.temperature === 'cool' ? '❄️ Cool' : '☀️ Warm'}
                  </Text>
                </View>
              )}
              {!!colorSeason.intensity && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{colorSeason.intensity}</Text>
                </View>
              )}
              {!!colorSeason.contrast && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    Contrast: {colorSeason.contrast}
                  </Text>
                </View>
              )}
            </View>
            {!!colorSeason.reasoning && (
              <Text style={[styles.description, { marginTop: 10 }]}>
                {colorSeason.reasoning}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Larson Style Type */}
      {!!(styleType.blendName || styleType.primaryType) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Larson Style Type</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Стиль-тип</Text>
            <Text style={styles.cardValue}>
              {styleType.blendName || styleType.primaryType}
            </Text>
            {(!!styleType.primaryType || !!styleType.secondaryType) && (
              <View style={styles.tagsRow}>
                {!!styleType.primaryType && (
                  <View style={[styles.tag, { backgroundColor: '#EEE8FF' }]}>
                    <Text style={[styles.tagText, { color: '#7B5EA7' }]}>
                      Primary: {styleType.primaryType}
                    </Text>
                  </View>
                )}
                {!!styleType.secondaryType && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      Secondary: {styleType.secondaryType}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Type Scores */}
            {!!styleType.typeScores && (
              <View style={{ marginTop: 12 }}>
                {Object.entries(styleType.typeScores).map(
                  ([key, val]: [string, any]) => {
                    const score =
                      typeof val === 'object' ? val.score ?? 0 : val ?? 0;
                    return (
                      <View key={key} style={styles.barRow}>
                        <Text style={styles.barLabel}>{key}</Text>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${score * 100}%` as any },
                            ]}
                          />
                        </View>
                        <Text style={styles.barPct}>
                          {Math.round(score * 100)}%
                        </Text>
                      </View>
                    );
                  },
                )}
              </View>
            )}

            {/* Dominant Traits */}
            {styleType.dominantTraits?.face?.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.traitTitle}>😊 Риси обличчя</Text>
                {styleType.dominantTraits.face.map((t: string, i: number) => (
                  <Text key={i} style={styles.listItem}>
                    • {t}
                  </Text>
                ))}
              </View>
            )}
            {styleType.dominantTraits?.body?.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.traitTitle}>🧍 Тіло</Text>
                {styleType.dominantTraits.body.map((t: string, i: number) => (
                  <Text key={i} style={styles.listItem}>
                    • {t}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Color Palette */}
      {(neutrals.length > 0 || accents.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Ваша Палітра</Text>

          <View style={styles.card}>
            {neutrals.length > 0 && (
              <>
                <Text style={styles.cardLabel}>Базові кольори</Text>
                <View style={styles.colorPalette}>
                  {neutrals.slice(0, 5).map((color: string, index: number) => {
                    const hex =
                      (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0] || color;
                    return (
                      <View
                        key={index}
                        style={[styles.colorBox, { backgroundColor: hex }]}
                      />
                    );
                  })}
                </View>
              </>
            )}
            {accents.length > 0 && (
              <>
                <Text style={[styles.colorLabel, { marginTop: 10 }]}>
                  Акцентні кольори
                </Text>
                <View style={styles.colorPalette}>
                  {accents.slice(0, 5).map((color: string, index: number) => {
                    const hex =
                      (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0] || color;
                    return (
                      <View
                        key={index}
                        style={[styles.colorBox, { backgroundColor: hex }]}
                      />
                    );
                  })}
                </View>
              </>
            )}
            {!!colorPalette.metals && (
              <Text style={styles.metalInfo}>
                Метали: {colorPalette.metals}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Archetype */}
      {!!archetype?.blendName && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Архетип</Text>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{archetype.blendName}</Text>
            {!!archetype.primaryEssence?.name && (
              <Text style={styles.confidence}>
                {archetype.primaryEssence.percentage}%{' '}
                {archetype.primaryEssence.name}
              </Text>
            )}
            {archetype.styleKeywords?.length > 0 && (
              <View style={[styles.tagsRow, { marginTop: 8 }]}>
                {archetype.styleKeywords.map((kw: string, i: number) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{kw}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Celebrity Twins */}
      {celebrityMatches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Твої Celebrity Twins</Text>

          {celebrityMatches.map((celebrity: any, index: number) => (
            <View key={index} style={styles.celebrityCard}>
              <Text style={styles.celebrityName}>{celebrity.name}</Text>
              <Text style={styles.similarityBadge}>
                {celebrity.similarity}% схожість
              </Text>
              <Text style={styles.matchReason}>{celebrity.matchReason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Makeup & Hair Recommendations */}
      {(rec.makeup || rec.hair) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💄 Рекомендації</Text>

          {rec.makeup && (
            <View style={styles.card}>
              {!!rec.makeup.makeupStyle && (
                <Text style={[styles.description, { marginBottom: 10 }]}>
                  {rec.makeup.makeupStyle}
                </Text>
              )}
              {rec.makeup.lipColors?.length > 0 && (
                <>
                  <Text style={styles.cardLabel}>Губи</Text>
                  <View style={styles.colorPalette}>
                    {rec.makeup.lipColors
                      .slice(0, 5)
                      .map((color: string, index: number) => {
                        const hex =
                          (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0] ||
                          '#ccc';
                        return (
                          <View
                            key={index}
                            style={[styles.colorBox, { backgroundColor: hex }]}
                          />
                        );
                      })}
                  </View>
                </>
              )}
              {rec.makeup.eyeColors?.length > 0 && (
                <>
                  <Text style={styles.cardLabel}>Очі</Text>
                  <View style={styles.colorPalette}>
                    {rec.makeup.eyeColors
                      .slice(0, 5)
                      .map((color: string, index: number) => {
                        const hex =
                          (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0] ||
                          '#ccc';
                        return (
                          <View
                            key={index}
                            style={[styles.colorBox, { backgroundColor: hex }]}
                          />
                        );
                      })}
                  </View>
                </>
              )}
            </View>
          )}

          {rec.hair && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Волосся</Text>
              {rec.hair.colors
                ?.slice(0, 4)
                .map((color: string, index: number) => (
                  <Text key={index} style={styles.listItem}>
                    • {color}
                  </Text>
                ))}
              {!!(
                rec.hair.recommendedStyles ||
                (rec.hair.styles && Array.isArray(rec.hair.styles))
              ) && (
                <Text style={[styles.description, { marginTop: 8 }]}>
                  {rec.hair.recommendedStyles ||
                    (Array.isArray(rec.hair.styles)
                      ? rec.hair.styles.join(' ')
                      : rec.hair.styles)}
                </Text>
              )}
              {!!rec.hair.avoid && (
                <Text
                  style={[
                    styles.description,
                    { marginTop: 8, color: '#E57373' },
                  ]}
                >
                  ❌ Уникати: {rec.hair.avoid}
                </Text>
              )}
            </View>
          )}

          {rec.jewelry && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Прикраси</Text>
              {!!rec.jewelry.metals && (
                <Text style={styles.listItem}>
                  Метали: {rec.jewelry.metals}
                </Text>
              )}
              {!!(rec.jewelry.size || rec.jewelry.sizes) && (
                <Text style={styles.listItem}>
                  Розмір: {rec.jewelry.size || rec.jewelry.sizes}
                </Text>
              )}
              {!!(rec.jewelry.style || rec.jewelry.styles) && (
                <Text style={styles.listItem}>
                  Стиль: {rec.jewelry.style || rec.jewelry.styles}
                </Text>
              )}
              {!!rec.jewelry.recommendation && (
                <Text style={[styles.description, { marginTop: 8 }]}>
                  {rec.jewelry.recommendation}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Signature Style */}
      {!!rec.signatureStyle?.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👗 Стиль Образу</Text>
          <View style={styles.card}>
            <Text style={styles.description}>
              {rec.signatureStyle.description}
            </Text>
            {!!rec.signatureStyle.lines && (
              <Text style={[styles.listItem, { marginTop: 8 }]}>
                📐 {rec.signatureStyle.lines}
              </Text>
            )}
            {!!rec.signatureStyle.silhouette && (
              <Text style={styles.listItem}>
                👗 {rec.signatureStyle.silhouette}
              </Text>
            )}
            {!!rec.signatureStyle.lengths && (
              <Text style={styles.listItem}>
                📏 {rec.signatureStyle.lengths}
              </Text>
            )}
            {!!rec.signatureStyle.fabrics && (
              <Text style={styles.listItem}>
                🧵 {rec.signatureStyle.fabrics}
              </Text>
            )}
            {!!rec.signatureStyle.avoid && (
              <Text style={[styles.listItem, { color: '#E57373' }]}>
                ❌ Уникати: {rec.signatureStyle.avoid}
              </Text>
            )}
          </View>
        </View>
      )}

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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#555',
    textTransform: 'capitalize',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabel: {
    width: 70,
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%' as any,
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  barPct: {
    width: 36,
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  traitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
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
