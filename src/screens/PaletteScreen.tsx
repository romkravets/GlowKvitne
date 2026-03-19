/**
 * Palette Screen
 * Показує кольорову палітру з реального аналізу юзера.
 * Якщо аналізів декілька — горизонтальний пікер зверху.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';
import { getUserAnalyses, type Analysis } from '../api/analysisApi';

const { width } = Dimensions.get('window');
const SWATCH_W = (width - 40 - 16) / 3;
const SWATCH_H = SWATCH_W * 0.72;

// ── helpers ──────────────────────────────────────────────────────────────────
type PaletteColor = string | { hex: string; name: string };

const parseColor = (color: PaletteColor): { hex: string; name: string } => {
  if (color && typeof color === 'object' && (color as any).hex) {
    return { hex: (color as any).hex, name: (color as any).name || '' };
  }
  const str = String(color || '');
  const hex = str.match(/#[0-9A-Fa-f]{3,6}/)?.[0] || str;
  const name = str.replace(/#[0-9A-Fa-f]{3,6}\s*/g, '').trim();
  return { hex, name };
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ── ColorRect ─────────────────────────────────────────────────────────────────
const ColorRect: React.FC<{ color: PaletteColor; avoid?: boolean }> = ({
  color,
  avoid,
}) => {
  const { hex, name } = parseColor(color);
  return (
    <View style={sw.item}>
      <View
        style={[sw.rect, { backgroundColor: hex }, avoid && sw.avoidBorder]}
      />
      {!!name && (
        <Text style={sw.name} numberOfLines={2}>
          {name}
        </Text>
      )}
    </View>
  );
};

const sw = StyleSheet.create({
  item: { width: SWATCH_W, alignItems: 'center' },
  rect: {
    width: SWATCH_W,
    height: SWATCH_H,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  avoidBorder: { borderWidth: 2, borderColor: '#FF4444' },
  name: {
    marginTop: 5,
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    lineHeight: 13,
  },
});

// ── PaletteSection ────────────────────────────────────────────────────────────
const PaletteSection: React.FC<{
  title: string;
  description?: string;
  colors: PaletteColor[];
  avoid?: boolean;
}> = ({ title, description, colors, avoid }) => {
  if (!colors?.length) return null;
  return (
    <View style={styles.section}>
      {!!title && <Text style={styles.sectionTitle}>{title}</Text>}
      {!!description && <Text style={styles.sectionDesc}>{description}</Text>}
      <View style={styles.grid}>
        {colors.map((c, i) => (
          <ColorRect key={i} color={c} avoid={avoid} />
        ))}
      </View>
    </View>
  );
};

// ── Palette picker card ───────────────────────────────────────────────────────
const PickerCard: React.FC<{
  analysis: Analysis;
  selected: boolean;
  onPress: () => void;
}> = ({ analysis, selected, onPress }) => {
  const la = (analysis as any).larsonAnalysis;
  const styleType =
    la?.styleType?.blendName || la?.styleType?.primaryType || '—';
  const season = (analysis as any).colorSeason?.primary || '';
  const neutrals: PaletteColor[] = la?.colorPalette?.bestColors?.neutrals || [];

  return (
    <TouchableOpacity
      style={[pick.card, selected && pick.cardSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* мінімальна кольорова смужка */}
      <View style={pick.dots}>
        {neutrals.slice(0, 4).map((c, i) => {
          const { hex } = parseColor(c);
          return <View key={i} style={[pick.dot, { backgroundColor: hex }]} />;
        })}
        {neutrals.length === 0 && (
          <View style={[pick.dot, { backgroundColor: '#DDD' }]} />
        )}
      </View>
      <Text
        style={[pick.type, selected && pick.typeSelected]}
        numberOfLines={1}
      >
        {styleType}
      </Text>
      {!!season && (
        <Text style={pick.season} numberOfLines={1}>
          {season}
        </Text>
      )}
      <Text style={pick.date}>{formatDate(analysis.createdAt)}</Text>
    </TouchableOpacity>
  );
};

const pick = StyleSheet.create({
  card: {
    width: 110,
    marginRight: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: { borderColor: '#C49B63' },
  dots: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  dot: { width: 18, height: 18, borderRadius: 4 },
  type: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 2 },
  typeSelected: { color: '#C49B63' },
  season: { fontSize: 10, color: '#888', marginBottom: 2 },
  date: { fontSize: 10, color: '#BBB' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
const PaletteScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { analyses: list } = await getUserAnalyses();
      const completed = list.filter(a => a.status === 'completed');
      setAnalyses(completed);
      if (completed.length > 0) setSelectedId((completed[0] as any)._id);
    } catch (e: any) {
      Alert.alert('Помилка', e.message || 'Не вдалося завантажити аналізи');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C49B63" />
        </View>
      </SafeAreaView>
    );
  }

  if (analyses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎨</Text>
          <Text style={styles.emptyTitle}>Немає аналізів</Text>
          <Text style={styles.emptyText}>
            Пройдіть аналіз кольоротипу, щоб отримати персональну палітру
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() =>
              navigation.navigate('HomeTab', { screen: 'StartAnalysis' } as any)
            }
          >
            <Text style={styles.ctaBtnText}>Пройти аналіз</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selected =
    analyses.find(a => (a as any)._id === selectedId) || analyses[0];
  const la = (selected as any).larsonAnalysis;
  const colorSeason = (selected as any).colorSeason;

  const styleType =
    la?.styleType?.blendName || la?.styleType?.primaryType || '';
  const seasonName = colorSeason?.primary || '';
  const seasonSignature = la?.colorPalette?.seasonSignature || '';

  const neutralColors: PaletteColor[] =
    la?.colorPalette?.bestColors?.neutrals || [];
  const basicColors: PaletteColor[] = la?.colorPalette?.bestColors?.basic || [];
  const accentColors: PaletteColor[] =
    la?.colorPalette?.bestColors?.accents || [];
  const whiteColors: PaletteColor[] =
    la?.colorPalette?.bestColors?.whites || [];
  const blackColors: PaletteColor[] =
    la?.colorPalette?.bestColors?.blacks || [];
  const avoidColors: PaletteColor[] = la?.colorPalette?.avoidColors || [];
  const metals: string = la?.colorPalette?.bestColors?.metals || '';

  const hasAnyColors =
    neutralColors.length > 0 ||
    basicColors.length > 0 ||
    accentColors.length > 0 ||
    avoidColors.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Пікер аналізів (тільки якщо > 1) ── */}
        {analyses.length > 1 && (
          <View style={styles.pickerBlock}>
            <Text style={styles.pickerLabel}>Оберіть аналіз</Text>
            <FlatList
              data={analyses}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={a => (a as any)._id}
              renderItem={({ item }) => (
                <PickerCard
                  analysis={item}
                  selected={(item as any)._id === selectedId}
                  onPress={() => setSelectedId((item as any)._id)}
                />
              )}
              contentContainerStyle={{ paddingRight: 20 }}
            />
          </View>
        )}

        {/* ── Заголовок ── */}
        <View style={styles.header}>
          {!!styleType && <Text style={styles.styleType}>{styleType}</Text>}
          {!!seasonName && (
            <Text style={styles.seasonName}>🎨 {seasonName}</Text>
          )}
          {!!seasonSignature && (
            <Text style={styles.seasonSignature}>{seasonSignature}</Text>
          )}
          <Text style={styles.headerSub}>{formatDate(selected.createdAt)}</Text>
        </View>

        {/* ── Палітра ── */}
        {hasAnyColors ? (
          <>
            <PaletteSection
              title="Нейтральні"
              description="Тональна шкала — основа гардеробу"
              colors={neutralColors}
            />
            <PaletteSection
              title="Basic"
              description="Підписні кольори сезону"
              colors={basicColors}
            />
            <PaletteSection
              title="Акцентні"
              description="Для аксесуарів та яскравих деталей"
              colors={accentColors}
            />
            <PaletteSection title="Білі відтінки" colors={whiteColors} />
            <PaletteSection title="Темні відтінки" colors={blackColors} />

            {!!metals && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Метал</Text>
                <View style={styles.metalRow}>
                  <Text style={styles.metalEmoji}>
                    {metals === 'gold'
                      ? '🥇'
                      : metals === 'silver'
                      ? '🥈'
                      : '🌹'}
                  </Text>
                  <Text style={styles.metalText}>
                    {metals === 'gold'
                      ? 'Золото'
                      : metals === 'silver'
                      ? 'Срібло'
                      : 'Рожеве золото'}
                  </Text>
                </View>
              </View>
            )}

            <PaletteSection
              title="❌ Уникайте"
              description="Ці кольори можуть зробити вас блідішою"
              colors={avoidColors}
              avoid
            />
          </>
        ) : (
          <View style={styles.noPaletteBox}>
            <Text style={styles.noPaletteText}>
              Палітра цього аналізу недоступна — можливо він був зроблений у
              старому форматі.
            </Text>
          </View>
        )}

        {/* ── CTA ── */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() =>
            Alert.alert('У розробці', 'Функція завантаження PDF в розробці')
          }
        >
          <Text style={styles.ctaBtnText}>📥 Завантажити PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() =>
            navigation.navigate('AnalysisResults', {
              analysisResult: selected,
            } as any)
          }
        >
          <Text style={styles.secondaryBtnText}>Переглянути повний аналіз</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  scroll: { padding: 20 },

  // Picker
  pickerBlock: { marginBottom: 20 },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Header
  header: { alignItems: 'center', marginBottom: 24 },
  styleType: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  seasonName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C49B63',
    marginBottom: 4,
  },
  seasonSignature: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSub: { fontSize: 11, color: '#BBB' },

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionDesc: { fontSize: 12, color: '#999', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Metal
  metalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  metalEmoji: { fontSize: 30 },
  metalText: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

  // No palette
  noPaletteBox: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 20,
  },
  noPaletteText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },

  // CTA
  ctaBtn: {
    backgroundColor: '#C49B63',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#C49B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  secondaryBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#C49B63',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: '#C49B63' },

  // Empty
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
});

export default PaletteScreen;
