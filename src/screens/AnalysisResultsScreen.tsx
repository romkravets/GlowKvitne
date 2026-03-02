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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';
import { Analysis } from '../api/analysisApi';

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
  const la = analysisResult.larsonAnalysis as any;

  // ── Larson Style Type ─────────────────────────────────────────
  const styleType =
    la?.styleType?.blendName || la?.styleType?.primaryType || 'Unknown';
  const primaryType = la?.styleType?.primaryType || '';
  const secondaryType = la?.styleType?.secondaryType || '';
  // typeScores format: { dramatic: { score, matchingTraits }, classic: { score, matchingTraits }, ... }
  const confidence = (la?.styleType?.typeScores ||
    la?.styleType?.confidence ||
    {}) as Record<string, any>;
  const dominantScore = Math.max(
    ...Object.values(confidence).map((v: any) =>
      typeof v === 'object' ? v.score ?? 0 : v ?? 0,
    ),
    0,
  );
  const dominantTraits = la?.styleType?.dominantTraits;
  const styleReasoning = la?.styleType?.reasoning || '';

  // ── Color Season ─────────────────────────────────────────────
  const colorSeason = (analysisResult as any).colorSeason;
  const colorSeasonPrimary = colorSeason?.primary || '';
  const colorSeasonSecondary = colorSeason?.secondary || '';
  const colorSeasonReasoning = colorSeason?.reasoning || '';
  const colorSeasonTemperature = colorSeason?.temperature || '';
  const colorSeasonIntensity = colorSeason?.intensity || '';
  const colorSeasonContrast = colorSeason?.contrast || '';

  // ── Value & Chroma ────────────────────────────────────────────
  const chromaResult = la?.chroma?.result || '';
  const chromaReason = la?.chroma?.reasoning || '';
  const valueResult = la?.value?.result || '';
  const overallContrast = la?.value?.overallContrast || '';
  const skinLevel = la?.value?.skinLevel || '';
  const hairLevel = la?.value?.hairLevel || '';
  const eyeLevel = la?.value?.eyeLevel || '';

  // ── Palette ───────────────────────────────────────────────────
  const neutralColors = la?.colorPalette?.bestColors?.neutrals || [];
  const accentColors = la?.colorPalette?.bestColors?.accents || [];
  const whiteColors = la?.colorPalette?.bestColors?.whites || [];
  const blackColors = la?.colorPalette?.bestColors?.blacks || [];
  const metals = la?.colorPalette?.bestColors?.metals || '';
  const avoidColors = la?.colorPalette?.avoidColors || [];
  const paletteReason = la?.colorPalette?.reasoning || '';

  // ── Recommendations ───────────────────────────────────────────
  // Berememo z recommendations (top-level) abo la.integratedRecommendations
  const topRec = (analysisResult as any).recommendations;
  const intRec = la?.integratedRecommendations;
  const makeupRecs = topRec?.makeup || intRec?.makeup;
  const hairRecs = topRec?.hair || intRec?.hair;
  const sigStyleRec = topRec?.signatureStyle || intRec?.signatureStyle;
  const sigStyle = sigStyleRec?.description || '';
  const sigLines = sigStyleRec?.lines || '';
  const sigSilhouette = sigStyleRec?.silhouette || '';
  const sigLengths = sigStyleRec?.lengths || '';
  const sigFabrics = sigStyleRec?.fabrics || '';
  const sigAvoid = sigStyleRec?.avoid || '';
  const patterns =
    intRec?.patterns?.bestPatterns ||
    (typeof sigStyleRec?.patterns === 'string'
      ? sigStyleRec.patterns.split(/,\s*/).filter(Boolean)
      : []);
  const jewelry = topRec?.jewelry || intRec?.jewelryAndAccessories;

  // ── Celebrity matches ─────────────────────────────────────────
  const celebrityMatches = la?.celebrityMatches || [];

  // ── Archetype ─────────────────────────────────────────────────
  const archetype = la?.archetypeAnalysis;
  const hasArchetype = !!archetype?.blendName;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Я пройшла аналіз у GlowKvitne! Мій стиль-тип: ${styleType}${
          colorSeasonPrimary ? `, колірний сезон: ${colorSeasonPrimary}` : ''
        }`,
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
            {(!!primaryType || !!secondaryType) && (
              <View style={[styles.tagsRow, { marginBottom: 8 }]}>
                {!!primaryType && (
                  <View style={[styles.tag, styles.tagGold]}>
                    <Text style={styles.tagText}>Primary: {primaryType}</Text>
                  </View>
                )}
                {!!secondaryType && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      Secondary: {secondaryType}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                Домінуючий тип: {Math.round(dominantScore * 100)}%
              </Text>
            </View>

            {/* Type Score bars */}
            <View style={{ marginTop: 16 }}>
              {Object.entries(confidence).map(([key, val]: [string, any]) => {
                const score =
                  typeof val === 'object' ? val.score ?? 0 : val ?? 0;
                const traits: string[] =
                  typeof val === 'object' ? val.matchingTraits || [] : [];
                return (
                  <View key={key} style={{ marginBottom: 10 }}>
                    <View style={styles.barRow}>
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
                    {traits.length > 0 && (
                      <Text style={styles.traitsMiniText}>
                        {traits.join(' · ')}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Dominant Traits */}
            {dominantTraits && (
              <View style={{ marginTop: 12 }}>
                {dominantTraits.face?.length > 0 && (
                  <View style={styles.traitsSection}>
                    <Text style={styles.traitsSectionTitle}>
                      😊 Риси обличчя
                    </Text>
                    <View style={styles.tagsRow}>
                      {dominantTraits.face.map((t: string, i: number) => (
                        <View key={i} style={styles.traitTag}>
                          <Text style={styles.traitTagText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {dominantTraits.body?.length > 0 && (
                  <View style={styles.traitsSection}>
                    <Text style={styles.traitsSectionTitle}>🧍 Тіло</Text>
                    <View style={styles.tagsRow}>
                      {dominantTraits.body.map((t: string, i: number) => (
                        <View key={i} style={styles.traitTag}>
                          <Text style={styles.traitTagText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {!!dominantTraits.mostRepeatedFeatures && (
                  <Text
                    style={[
                      styles.reasonText,
                      { marginTop: 8, fontStyle: 'italic' },
                    ]}
                  >
                    {dominantTraits.mostRepeatedFeatures}
                  </Text>
                )}
              </View>
            )}

            {/* Style reasoning */}
            {!!styleReasoning && (
              <Text style={[styles.reasonText, { marginTop: 12 }]}>
                {styleReasoning}
              </Text>
            )}

            {/* Signature style */}
            {!!sigStyle && (
              <View style={styles.sigStyleBox}>
                <Text style={styles.sigStyleLabel}>Ваш стиль:</Text>
                <Text style={styles.sigStyleText}>{sigStyle}</Text>
                {!!sigLines && (
                  <Text style={[styles.sigStyleText, { marginTop: 6 }]}>
                    📐 {sigLines}
                  </Text>
                )}
                {!!sigSilhouette && (
                  <Text style={[styles.sigStyleText, { marginTop: 6 }]}>
                    👗 {sigSilhouette}
                  </Text>
                )}
                {!!sigLengths && (
                  <Text style={[styles.sigStyleText, { marginTop: 6 }]}>
                    📏 {sigLengths}
                  </Text>
                )}
                {!!sigFabrics && (
                  <Text style={[styles.sigStyleText, { marginTop: 6 }]}>
                    🧵 {sigFabrics}
                  </Text>
                )}
                {!!sigAvoid && (
                  <Text
                    style={[
                      styles.sigStyleText,
                      { marginTop: 6, color: '#E57373' },
                    ]}
                  >
                    ❌ Уникати: {sigAvoid}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* ── Color Season ── */}
        {!!colorSeasonPrimary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌸 КОЛІРНИЙ СЕЗОН</Text>
            <View style={styles.resultCard}>
              <Text style={[styles.resultType, { fontSize: 22 }]}>
                {colorSeasonPrimary}
              </Text>
              {!!colorSeasonSecondary && (
                <Text
                  style={[
                    styles.reasonText,
                    { fontWeight: '600', marginTop: 4 },
                  ]}
                >
                  Також: {colorSeasonSecondary}
                </Text>
              )}
              <View style={[styles.tagsRow, { marginTop: 10 }]}>
                {!!colorSeasonTemperature && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {colorSeasonTemperature === 'cool'
                        ? '❄️ Cool'
                        : '☀️ Warm'}
                    </Text>
                  </View>
                )}
                {!!colorSeasonIntensity && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      Intensity: {colorSeasonIntensity}
                    </Text>
                  </View>
                )}
                {!!colorSeasonContrast && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      Contrast: {colorSeasonContrast}
                    </Text>
                  </View>
                )}
              </View>
              {!!colorSeasonReasoning && (
                <Text style={[styles.reasonText, { marginTop: 12 }]}>
                  {colorSeasonReasoning}
                </Text>
              )}
            </View>
          </View>
        )}

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
            {(!!skinLevel || !!hairLevel || !!eyeLevel) && (
              <View style={[styles.tagsRow, { marginTop: 8 }]}>
                {!!skinLevel && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Шкіра: {skinLevel}</Text>
                  </View>
                )}
                {!!hairLevel && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Волосся: {hairLevel}</Text>
                  </View>
                )}
                {!!eyeLevel && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Очі: {eyeLevel}</Text>
                  </View>
                )}
              </View>
            )}
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
                    {neutralColors.map((color: string, index: number) => {
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
                    {accentColors.map((color: string, index: number) => {
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

              {whiteColors.length > 0 && (
                <>
                  <Text style={styles.paletteSubtitleWithMargin}>
                    Білі відтінки
                  </Text>
                  <View style={styles.colorRowFull}>
                    {whiteColors.map((color: string, index: number) => {
                      const hex =
                        (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0] || color;
                      return (
                        <View key={index} style={styles.colorSwatchItem}>
                          <View
                            style={[
                              styles.colorCircle,
                              { backgroundColor: hex, borderColor: '#DDD' },
                            ]}
                          />
                          <Text style={styles.colorHexText}>{hex}</Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}

              {blackColors.length > 0 && (
                <>
                  <Text style={styles.paletteSubtitleWithMargin}>
                    Темні відтінки
                  </Text>
                  <View style={styles.colorRowFull}>
                    {blackColors.map((color: string, index: number) => {
                      const hex =
                        (color || '').match(/#[0-9A-Fa-f]{3,6}/)?.[0] || color;
                      const desc = color
                        .replace(/#[0-9A-Fa-f]{3,6}\s*/g, '')
                        .trim();
                      return (
                        <View key={index} style={styles.colorSwatchItem}>
                          <View
                            style={[
                              styles.colorCircle,
                              { backgroundColor: hex },
                            ]}
                          />
                          <Text style={styles.colorHexText}>{hex}</Text>
                          {!!desc && (
                            <Text style={styles.colorDescText}>{desc}</Text>
                          )}
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
                {avoidColors.map((color: string, index: number) => {
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
              {!!makeupRecs.makeupStyle && (
                <Text style={[styles.reasonText, { marginBottom: 12 }]}>
                  {makeupRecs.makeupStyle}
                </Text>
              )}
              {makeupRecs.lipColors?.length > 0 && (
                <ColorTipRow label="Губи" colors={makeupRecs.lipColors} />
              )}
              {makeupRecs.eyeColors?.length > 0 && (
                <ColorTipRow label="Очі" colors={makeupRecs.eyeColors} />
              )}
              {makeupRecs.blushColors?.length > 0 && (
                <ColorTipRow label="Рум'яна" colors={makeupRecs.blushColors} />
              )}
              {!!makeupRecs.foundationUndertone && (
                <TipItem
                  label="Тональний"
                  value={`Undertone: ${makeupRecs.foundationUndertone}`}
                />
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
              {(hairRecs.styles?.length > 0 || hairRecs.recommendedStyles) && (
                <TipItem
                  label="Стиль"
                  value={
                    hairRecs.recommendedStyles ||
                    (Array.isArray(hairRecs.styles)
                      ? hairRecs.styles.join(' ')
                      : hairRecs.styles)
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
              {!!(jewelry.sizes || jewelry.size) && (
                <TipItem label="Розмір" value={jewelry.sizes || jewelry.size} />
              )}
              {!!(jewelry.styles || jewelry.style) && (
                <TipItem
                  label="Стиль"
                  value={jewelry.styles || jewelry.style}
                />
              )}
              {!!jewelry.recommendation && (
                <Text style={[styles.reasonText, { marginTop: 8 }]}>
                  {jewelry.recommendation}
                </Text>
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
  traitsMiniText: {
    fontSize: 11,
    color: '#aaa',
    marginLeft: 78,
    marginTop: 2,
    fontStyle: 'italic',
  },
  traitsSection: { marginBottom: 10, marginTop: 4 },
  traitsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  traitTag: {
    backgroundColor: '#F5F0FF',
    borderWidth: 1,
    borderColor: '#D4B8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  traitTagText: { fontSize: 11, color: '#7B5EA7' },
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
