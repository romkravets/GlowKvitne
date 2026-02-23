/**
 * Analysis Results Screen — оновлено під нову схему MongoDB
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
  const la = analysisResult.larsonAnalysis;

  // ── Larson Style Type ─────────────────────────────────────────
  const styleType = la?.styleType?.result || 'Unknown';
  const confidence = la?.styleType?.confidence || {};
  const dominantScore = Math.max(
    ...Object.values(confidence).map((v: any) =>
      typeof v === 'object' ? v.score ?? 0 : v ?? 0,
    ),
    0,
  );

  // ── Color season (з colorPalette або recommendations) ────────
  // colorSeason не зберігається в схемі — беремо з reasoning або показуємо chroma
  const chromaResult = la?.chroma?.result || '';
  const chromaReason = la?.chroma?.reasoning || '';
  const valueResult = la?.value?.result || '';
  const overallContrast = la?.value?.overallContrast || '';

  // ── Palette ───────────────────────────────────────────────────
  const neutralColors = la?.colorPalette?.bestColors?.neutrals || [];
  const accentColors = la?.colorPalette?.bestColors?.accents || [];
  const metals = la?.colorPalette?.bestColors?.metals || '';
  const avoidColors = la?.colorPalette?.avoidColors || [];
  const paletteReason = la?.colorPalette?.reasoning || '';

  // ── Recommendations ───────────────────────────────────────────
  // Можуть бути в la.integratedRecommendations АБО в recommendations (верхній рівень)
  const rec = (la?.integratedRecommendations ||
    analysisResult.recommendations) as any;
  const makeupRecs = rec?.makeup;
  const hairRecs = rec?.hair;
  const sigStyle = rec?.signatureStyle?.description || '';
  const patterns =
    rec?.patterns?.bestPatterns ||
    (typeof rec?.signatureStyle?.patterns === 'string'
      ? rec.signatureStyle.patterns.split(/,\s*/).filter(Boolean)
      : []);
  const jewelry = rec?.jewelryAndAccessories;

  // ── Celebrity matches ─────────────────────────────────────────
  const celebrityMatches = la?.celebrityMatches || [];

  // ── Archetype ─────────────────────────────────────────────────
  const archetype = la?.archetypeAnalysis;
  const hasArchetype = !!archetype?.blendName;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Я пройшла аналіз у GlowKvitne! Мій стиль-тип: ${styleType}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Header */}
      <View style={styles.headerButtonsRow}>
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIconText}>◀ Назад</Text>
        </TouchableOpacity>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Text style={styles.iconButtonText}>📤 Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('MyAnalysis')}
          >
            <Text style={styles.iconButtonText}>📊 Мої аналізи</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Larson Style Type ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ LARSON STYLE TYPE</Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultType}>{styleType.toUpperCase()}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                Впевненість: {Math.round(dominantScore * 100)}%
              </Text>
            </View>

            {/* Confidence bars */}
            <View style={{ marginTop: 16 }}>
              {Object.entries(confidence).map(([key, val]: [string, any]) => {
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
              })}
            </View>

            {/* Signature style */}
            {!!sigStyle && (
              <View style={styles.sigStyleBox}>
                <Text style={styles.sigStyleLabel}>Ваш стиль:</Text>
                <Text style={styles.sigStyleText}>{sigStyle}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Value & Chroma ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔬 АНАЛІЗ КОЛОРИСТИКИ</Text>
          <View style={styles.resultCard}>
            <View style={styles.tagsRow}>
              {!!valueResult && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Value: {valueResult}</Text>
                </View>
              )}
              {!!chromaResult && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Chroma: {chromaResult}</Text>
                </View>
              )}
              {!!overallContrast && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    Contrast: {overallContrast}
                  </Text>
                </View>
              )}
              {!!metals && (
                <View style={[styles.tag, styles.tagGold]}>
                  <Text style={styles.tagText}>
                    {metals === 'gold'
                      ? '🥇'
                      : metals === 'silver'
                      ? '🥈'
                      : '💍'}{' '}
                    {metals}
                  </Text>
                </View>
              )}
            </View>
            {!!chromaReason && (
              <Text style={styles.reasonText}>{chromaReason}</Text>
            )}
          </View>
        </View>

        {/* ── Color Palette ── */}
        {(neutralColors.length > 0 || accentColors.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 ВАША ПАЛІТРА</Text>
            <View style={styles.paletteCard}>
              {neutralColors.length > 0 && (
                <>
                  <Text style={styles.paletteSubtitle}>Базові кольори</Text>
                  <View style={styles.colorRowFull}>
                    {neutralColors.map((color, index) => {
                      const hex =
                        (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0] || color;
                      return (
                        <View key={index} style={styles.colorSwatchItem}>
                          <View
                            style={[
                              styles.colorCircle,
                              { backgroundColor: hex },
                            ]}
                          />
                          <Text style={styles.colorHexText}>{hex}</Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}

              {accentColors.length > 0 && (
                <>
                  <Text style={styles.paletteSubtitleWithMargin}>
                    Акцентні кольори
                  </Text>
                  <View style={styles.colorRowFull}>
                    {accentColors.map((color, index) => {
                      const hex =
                        (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0] || color;
                      return (
                        <View key={index} style={styles.colorSwatchItem}>
                          <View
                            style={[
                              styles.colorCircle,
                              { backgroundColor: hex },
                            ]}
                          />
                          <Text style={styles.colorHexText}>{hex}</Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}

              {!!paletteReason && (
                <Text style={[styles.reasonText, { marginTop: 12 }]}>
                  {paletteReason}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ── Avoid Colors ── */}
        {avoidColors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❌ УНИКАЙТЕ</Text>
            <View style={styles.paletteCard}>
              <View style={styles.colorRowFull}>
                {avoidColors.map((color, index) => {
                  const hex =
                    (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0] || color;
                  return (
                    <View key={index} style={styles.colorSwatchItem}>
                      <View
                        style={[
                          styles.colorCircle,
                          styles.avoidCircle,
                          { backgroundColor: hex },
                        ]}
                      />
                      <Text style={styles.colorHexText}>{hex}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ── Patterns ── */}
        {patterns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🖼 ПРИНТИ ТА ВІЗЕРУНКИ</Text>
            <View style={styles.resultCard}>
              <View style={styles.tagsRow}>
                {patterns.map((p: string, i: number) => (
                  <View key={i} style={styles.tagOutline}>
                    <Text style={styles.tagOutlineText}>{p.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Celebrity Twins ── */}
        {celebrityMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌟 CELEBRITY TWINS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.celebritiesRow}
            >
              {celebrityMatches.map((celeb: any, index: number) => (
                <View key={index} style={styles.celebrityCard}>
                  <View style={styles.celebrityImage}>
                    <Text style={styles.celebrityPlaceholder}>👤</Text>
                  </View>
                  <Text style={styles.celebrityName}>{celeb.name}</Text>
                  <Text style={styles.celebrityMatch}>{celeb.similarity}%</Text>
                  {!!celeb.matchReason && (
                    <Text style={styles.celebrityReason} numberOfLines={3}>
                      {celeb.matchReason}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Makeup ── */}
        {makeupRecs && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💄 МАКІЯЖ</Text>
            <View style={styles.tipsCard}>
              {makeupRecs.lipColors?.length > 0 && (
                <ColorTipRow label="Губи" colors={makeupRecs.lipColors} />
              )}
              {makeupRecs.eyeColors?.length > 0 && (
                <ColorTipRow label="Очі" colors={makeupRecs.eyeColors} />
              )}
              {makeupRecs.blushColors?.length > 0 && (
                <ColorTipRow label="Рум'яна" colors={makeupRecs.blushColors} />
              )}
            </View>
          </View>
        )}

        {/* ── Hair ── */}
        {hairRecs && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💇 ВОЛОССЯ</Text>
            <View style={styles.tipsCard}>
              {hairRecs.colors?.length > 0 && (
                <>
                  <Text style={styles.tipsTitle}>Кращі відтінки:</Text>
                  <View style={styles.colorRowFull}>
                    {hairRecs.colors
                      .slice(0, 6)
                      .map((color: string, idx: number) => {
                        const hex = (color || '').match(
                          /#[0-9A-Fa-f]{3,6}/,
                        )?.[0];
                        const name = color
                          .replace(/#[0-9A-Fa-f]{3,6}\s*/g, '')
                          .trim();
                        return (
                          <View key={idx} style={styles.colorSwatchItem}>
                            {hex ? (
                              <View
                                style={[
                                  styles.colorCircle,
                                  { backgroundColor: hex },
                                ]}
                              />
                            ) : null}
                            <Text style={styles.colorHexText}>
                              {hex || name}
                            </Text>
                            {name && hex ? (
                              <Text style={styles.colorDescText}>{name}</Text>
                            ) : null}
                          </View>
                        );
                      })}
                  </View>
                </>
              )}
              {hairRecs.styles?.length > 0 && (
                <TipItem
                  label="Стиль"
                  value={
                    Array.isArray(hairRecs.styles)
                      ? hairRecs.styles.join(' ')
                      : hairRecs.styles
                  }
                />
              )}
              {!!hairRecs.avoid && (
                <TipItem label="Уникати" value={hairRecs.avoid} />
              )}
            </View>
          </View>
        )}

        {/* ── Jewelry ── */}
        {jewelry && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💍 ПРИКРАСИ</Text>
            <View style={styles.tipsCard}>
              {!!jewelry.metals && (
                <TipItem label="Метали" value={jewelry.metals} />
              )}
              {!!jewelry.sizes && (
                <TipItem label="Розмір" value={jewelry.sizes} />
              )}
              {!!jewelry.styles && (
                <TipItem label="Стиль" value={jewelry.styles} />
              )}
            </View>
          </View>
        )}

        {/* ── Archetype (якщо є) ── */}
        {hasArchetype && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ АРХЕТИП</Text>
            <View style={styles.resultCard}>
              <Text style={styles.essenceType}>{archetype?.blendName}</Text>
              {archetype?.primaryEssence?.name && (
                <View style={styles.essenceBar}>
                  <Text style={styles.essenceLabel}>
                    {archetype.primaryEssence.percentage}%{' '}
                    {archetype.primaryEssence.name}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width:
                            `${archetype.primaryEssence.percentage}%` as any,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
              {archetype?.styleKeywords?.length > 0 && (
                <View style={[styles.tagsRow, { marginTop: 8 }]}>
                  {archetype.styleKeywords.map((kw: string, i: number) => (
                    <View key={i} style={styles.tagOutline}>
                      <Text style={styles.tagOutlineText}>{kw}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* CTA */}
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
          onPress={() =>
            Alert.alert('У розробці', 'Функція завантаження PDF в розробці')
          }
        >
          <Text style={styles.secondaryButtonText}>📥 Завантажити PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Helper Components ─────────────────────────────────────────────────────────

const ColorTipRow: React.FC<{ label: string; colors: string[] }> = ({
  label,
  colors,
}) => (
  <View style={styles.colorTipRow}>
    <Text style={styles.tipLabel}>{label}:</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 }}>
      {colors.slice(0, 4).map((color, i) => {
        const hex = (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0];
        const name = color.replace(/#[0-9A-Fa-f]{3,6}\s*/g, '').trim();
        return (
          <View key={i} style={styles.colorTipChip}>
            {hex && (
              <View style={[styles.colorDot, { backgroundColor: hex }]} />
            )}
            <Text style={styles.colorTipText}>{name || hex}</Text>
          </View>
        );
      })}
    </View>
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
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
  },
  backIconButton: { paddingVertical: 8, paddingHorizontal: 10 },
  backIconText: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  headerButtons: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  iconButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  iconButtonText: { fontSize: 14, fontWeight: '600', color: '#666666' },
  scrollContent: { padding: 20 },
  section: { marginBottom: 24 },
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultType: {
    fontSize: 28,
    fontWeight: '800',
    color: '#C49B63',
    marginBottom: 8,
  },
  confidenceBadge: {
    backgroundColor: '#FFF8EF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C49B63',
  },
  confidenceText: { fontSize: 13, fontWeight: '600', color: '#C49B63' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
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
  barFill: { height: '100%', backgroundColor: '#C49B63', borderRadius: 3 },
  barPct: { width: 36, fontSize: 12, color: '#999', textAlign: 'right' },
  sigStyleBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF8EF',
    borderRadius: 8,
  },
  sigStyleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C49B63',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sigStyleText: { fontSize: 13, color: '#555', lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagGold: {
    backgroundColor: '#FFF8EF',
    borderWidth: 1,
    borderColor: '#C49B63',
  },
  tagText: { fontSize: 13, color: '#555', textTransform: 'capitalize' },
  tagOutline: {
    borderWidth: 1,
    borderColor: '#C49B63',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  tagOutlineText: { fontSize: 12, color: '#C49B63' },
  reasonText: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 8 },
  paletteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  paletteSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paletteSubtitleWithMargin: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colorRowFull: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorSwatchItem: { alignItems: 'center', width: 60 },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  avoidCircle: { borderWidth: 2, borderColor: '#FF4444' },
  colorHexText: { marginTop: 4, fontSize: 10, color: '#888' },
  colorDescText: { fontSize: 10, color: '#aaa', textAlign: 'center' },
  celebritiesRow: { paddingRight: 20 },
  celebrityCard: { width: 130, marginRight: 16, alignItems: 'center' },
  celebrityImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#C49B63',
  },
  celebrityPlaceholder: { fontSize: 36 },
  celebrityName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  celebrityMatch: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C49B63',
    marginBottom: 4,
  },
  celebrityReason: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipItem: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  tipLabel: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', width: 80 },
  tipValue: { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },
  colorTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  colorTipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  colorTipText: { fontSize: 11, color: '#555' },
  essenceType: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  essenceBar: { marginBottom: 12 },
  essenceLabel: { fontSize: 13, color: '#666', marginBottom: 6 },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
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
  primaryButtonText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C49B63',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: '#C49B63' },
});

export default AnalysisResultsScreen;
