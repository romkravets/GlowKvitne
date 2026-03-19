/**
 * Gallery Screen — Образи та Шопінг
 * Персоналізовані рекомендації брендів по кольоротипу + сезонні нотатки.
 *
 * Монетизація:
 *  • Affiliate посилання (Zara/H&M → UTM трекінг)
 *  • Платне розміщення брендів ("Партнер" badge)
 *  • Premium lock на локальні дизайнери (Bevza, Gunia)
 *  • Сезонні кампанії tied до поточного місяця
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';
import { getUserAnalyses, type Analysis } from '../api/analysisApi';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// ТИПИ
// ─────────────────────────────────────────────────────────────────────────────
interface Brand {
  id: string;
  name: string;
  emoji: string;
  type: 'mass' | 'premium' | 'local'; // mass=Zara/H&M, local=Bevza/Gunia
  isPartner: boolean; // платне розміщення
  tag: string; // "Масмаркет" / "Локальний дизайнер"
  description: string; // чому підходить цьому сезону
  url: string; // affiliate link з UTM
  seasons: string[]; // яким сезонам підходить
  accentColor: string;
}

interface OutfitIdea {
  id: string;
  title: string;
  occasion: 'casual' | 'work' | 'evening' | 'weekend';
  colors: string[]; // hex з палітри юзера
  brandId: string;
  searchQuery: string; // що шукати на сайті бренду
  tip: string; // "Кемел + чорний — підпис Autumn"
  isPremium: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// СТАТИЧНІ ДАНІ БРЕНДІВ
// ─────────────────────────────────────────────────────────────────────────────
const BRANDS: Brand[] = [
  {
    id: 'zara',
    name: 'Zara UA',
    emoji: '🔥',
    type: 'mass',
    isPartner: false,
    tag: 'Масмаркет',
    description: 'Широка палітра нейтральних відтінків у кожній колекції',
    url: 'https://www.zara.com/ua/uk/?utm_source=glowkvitne&utm_medium=app&utm_campaign=palette',
    seasons: [
      'True Autumn',
      'Warm Autumn',
      'Muted Autumn',
      'Deep Autumn',
      'True Winter',
      'Cool Winter',
      'Deep Winter',
      'Bright Winter',
      'True Summer',
      'Light Summer',
      'Cool Summer',
      'Muted Summer',
      'True Spring',
      'Warm Spring',
      'Light Spring',
      'Bright Spring',
    ],
    accentColor: '#1A1A1A',
  },
  {
    id: 'hm',
    name: 'H&M UA',
    emoji: '🛍️',
    type: 'mass',
    isPartner: false,
    tag: 'Масмаркет',
    description: 'Базовий гардероб за доступними цінами',
    url: 'https://www2.hm.com/uk_ua/?utm_source=glowkvitne&utm_medium=app&utm_campaign=palette',
    seasons: [
      'True Autumn',
      'Warm Autumn',
      'Muted Autumn',
      'True Summer',
      'Light Summer',
      'Muted Summer',
      'True Spring',
      'Light Spring',
    ],
    accentColor: '#E50010',
  },
  {
    id: 'mango',
    name: 'Mango UA',
    emoji: '🌿',
    type: 'mass',
    isPartner: false,
    tag: 'Масмаркет',
    description: 'Середземноморський стиль у теплих і нейтральних тонах',
    url: 'https://shop.mango.com/ua?utm_source=glowkvitne&utm_medium=app&utm_campaign=palette',
    seasons: [
      'True Autumn',
      'Warm Autumn',
      'Muted Autumn',
      'True Summer',
      'Cool Summer',
    ],
    accentColor: '#B07D5B',
  },
  {
    id: 'cos',
    name: 'COS',
    emoji: '⬜',
    type: 'premium',
    isPartner: false,
    tag: 'Преміум масмаркет',
    description:
      'Мінімалізм з чистими холодними відтінками — ідеал для Winter та Summer',
    url: 'https://www.cosstores.com/uk_ua/?utm_source=glowkvitne&utm_medium=app&utm_campaign=palette',
    seasons: [
      'True Winter',
      'Cool Winter',
      'Deep Winter',
      'Bright Winter',
      'True Summer',
      'Light Summer',
      'Cool Summer',
    ],
    accentColor: '#333333',
  },
  {
    id: 'bevza',
    name: 'Bevza',
    emoji: '🇺🇦',
    type: 'local',
    isPartner: true, // платний партнер
    tag: 'Партнер · Локальний дизайнер',
    description:
      'Київський бренд. Мінімалізм, вовна, натуральні тони — Autumn та Winter',
    url: 'https://bevza.com/?utm_source=glowkvitne&utm_medium=app&utm_campaign=local_partner',
    seasons: [
      'True Autumn',
      'Warm Autumn',
      'Deep Autumn',
      'True Winter',
      'Cool Winter',
      'Deep Winter',
    ],
    accentColor: '#8B6914',
  },
  {
    id: 'gunia',
    name: 'Gunia Project',
    emoji: '🇺🇦',
    type: 'local',
    isPartner: true, // платний партнер
    tag: 'Партнер · Локальний дизайнер',
    description:
      'Вишивка, лляні тканини, тепла земляна палітра — Natural та Autumn типи',
    url: 'https://guniaproject.com/?utm_source=glowkvitne&utm_medium=app&utm_campaign=local_partner',
    seasons: [
      'True Autumn',
      'Warm Autumn',
      'Muted Autumn',
      'True Spring',
      'Warm Spring',
      'True Summer',
      'Muted Summer',
    ],
    accentColor: '#704214',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ІДЕЇ ОБРАЗІВ по сезону
// ─────────────────────────────────────────────────────────────────────────────
const OUTFIT_IDEAS: Record<string, OutfitIdea[]> = {
  autumn: [
    {
      id: 'a1',
      title: 'Кемел пальто',
      occasion: 'work',
      colors: ['#C19A6B', '#3C1414', '#8B4513'],
      brandId: 'bevza',
      searchQuery: 'camel coat wool',
      tip: 'Кемел — підписний колір Autumn. Поєднуйте з темно-коричневим',
      isPremium: false,
    },
    {
      id: 'a2',
      title: 'Оверсайз у гірчиці',
      occasion: 'casual',
      colors: ['#D4A017', '#8B4513', '#F5E6D0'],
      brandId: 'zara',
      searchQuery: 'mustard oversized sweater',
      tip: 'Гірчиця + кемел = чисто Autumn — жодного чорного!',
      isPremium: false,
    },
    {
      id: 'a3',
      title: 'Лляний костюм',
      occasion: 'weekend',
      colors: ['#DEB887', '#A0785A', '#556B2F'],
      brandId: 'gunia',
      searchQuery: 'linen suit natural',
      tip: 'Льон + оливка. Натурал та Autumn — ваш дует',
      isPremium: false,
    },
    {
      id: 'a4',
      title: 'Вечірній образ Deep Autumn',
      occasion: 'evening',
      colors: ['#800020', '#3C1414', '#8B6914'],
      brandId: 'bevza',
      searchQuery: 'burgundy evening dress',
      tip: 'Бургундія та темне золото — розкіш Autumn на вечір',
      isPremium: true,
    },
  ],
  winter: [
    {
      id: 'w1',
      title: 'Монохром чорний',
      occasion: 'work',
      colors: ['#000000', '#1A1A2E', '#4A4A4A'],
      brandId: 'cos',
      searchQuery: 'black monochrome',
      tip: 'Для Dramatic Winter: чистий чорний завжди ваш',
      isPremium: false,
    },
    {
      id: 'w2',
      title: 'Яскравий акцент',
      occasion: 'casual',
      colors: ['#CC0000', '#000000', '#FFFFFF'],
      brandId: 'zara',
      searchQuery: 'red coat winter',
      tip: 'True Winter: яскраво-червоний + чорний = ваша сила',
      isPremium: false,
    },
    {
      id: 'w3',
      title: 'Холодний нейтрал',
      occasion: 'weekend',
      colors: ['#E6E6FA', '#4169E1', '#1A1A2E'],
      brandId: 'hm',
      searchQuery: 'lavender blue neutral',
      tip: 'Лаванда + темно-синій — мʼяка елегантність Winter',
      isPremium: false,
    },
    {
      id: 'w4',
      title: 'Вечірня класика',
      occasion: 'evening',
      colors: ['#800080', '#000000', '#C0C0C0'],
      brandId: 'cos',
      searchQuery: 'purple evening minimal',
      tip: 'Насичений фіолетовий + срібло — вечір Winter',
      isPremium: true,
    },
  ],
  summer: [
    {
      id: 's1',
      title: 'Пудровий образ',
      occasion: 'casual',
      colors: ['#DDA0DD', '#B0C4DE', '#D4A5A5'],
      brandId: 'hm',
      searchQuery: 'dusty pink powder blue',
      tip: 'True Summer: пастельні тони без контрасту',
      isPremium: false,
    },
    {
      id: 's2',
      title: 'Лавандовий офіс',
      occasion: 'work',
      colors: ['#C8A2C8', '#9BA4B5', '#E8D5D5'],
      brandId: 'zara',
      searchQuery: 'lavender office blouse',
      tip: 'Лаванда + сіро-блакитний — ідеальний Summer на роботу',
      isPremium: false,
    },
    {
      id: 's3',
      title: 'Плавний вихідний',
      occasion: 'weekend',
      colors: ['#DDA0DD', '#7EB8CF', '#888888'],
      brandId: 'mango',
      searchQuery: 'soft mauve flowy dress',
      tip: 'Мʼякий мов + блакитний. Light Summer у своїй стихії',
      isPremium: true,
    },
  ],
  spring: [
    {
      id: 'sp1',
      title: 'Свіжа весна',
      occasion: 'casual',
      colors: ['#FFDAB9', '#90EE90', '#FFD700'],
      brandId: 'zara',
      searchQuery: 'peach green spring outfit',
      tip: 'True Spring: персиковий + зелений = рання весна',
      isPremium: false,
    },
    {
      id: 'sp2',
      title: 'Яскравий вихід',
      occasion: 'weekend',
      colors: ['#FF7F50', '#FFD700', '#87CEEB'],
      brandId: 'hm',
      searchQuery: 'coral bright spring',
      tip: 'Bright Spring: коралевий + блакитне небо',
      isPremium: false,
    },
    {
      id: 'sp3',
      title: 'Романтичний вечір',
      occasion: 'evening',
      colors: ['#FFB6C1', '#FFFACD', '#C19A6B'],
      brandId: 'gunia',
      searchQuery: 'romantic floral dress spring',
      tip: 'Warm Spring + квітковий принт = ваш образ',
      isPremium: true,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// СЕЗОННІ НОТАТКИ (динамічно по місяцю)
// ─────────────────────────────────────────────────────────────────────────────
function getSeasonalNote(colorSeason: string): {
  note: string;
  urgency: string;
  emoji: string;
} {
  const month = new Date().getMonth(); // 0-11
  const family = colorSeason.toLowerCase();

  // Який реальний сезон зараз
  const isSpring = month >= 2 && month <= 4;
  const isSummer = month >= 5 && month <= 7;
  const isAutumn = month >= 8 && month <= 10;
  const isWinter = month === 11 || month <= 1;

  if (family.includes('autumn')) {
    if (isAutumn)
      return {
        note: 'Ваша палітра зараз в піку трендів! Осінні колекції в магазинах',
        urgency: 'Найкращий час шопінгу',
        emoji: '🍂',
      };
    if (isWinter)
      return {
        note: 'Розпродаж осінньої колекції — ваші кольори зі знижками до 50%',
        urgency: 'Розпродаж!',
        emoji: '🏷️',
      };
    if (isSpring)
      return {
        note: 'Ваша земляна палітра актуальна і навесні. Шукайте нові колекції',
        urgency: 'Нова колекція',
        emoji: '🌱',
      };
    return {
      note: 'Ваша тепла палітра — базис будь-якого сезону',
      urgency: 'Вічна класика',
      emoji: '✨',
    };
  }
  if (family.includes('winter')) {
    if (isWinter)
      return {
        note: 'Зимові колекції в магазинах — ваш час! Чорний та холодні кольори в топі',
        urgency: 'Найкращий час шопінгу',
        emoji: '❄️',
      };
    if (isAutumn)
      return {
        note: 'Осінні колекції надходять у магазини — холодні тони вже в продажу',
        urgency: 'Нові надходження',
        emoji: '🍃',
      };
    return {
      note: 'Ваша чітка холодна палітра — завжди актуально',
      urgency: 'Вічна класика',
      emoji: '✨',
    };
  }
  if (family.includes('summer')) {
    if (isSummer)
      return {
        note: 'Ваші пастельні тони — хіт цього літа. Поспішайте!',
        urgency: 'Найкращий час шопінгу',
        emoji: '☀️',
      };
    if (isSpring)
      return {
        note: 'Весняні колекції вже в магазинах — ваші пудрові тони надходять',
        urgency: 'Нові надходження',
        emoji: '🌸',
      };
    return {
      note: 'Пастельна палітра Summer доречна в будь-яку пору',
      urgency: 'Вічна класика',
      emoji: '✨',
    };
  }
  if (family.includes('spring')) {
    if (isSpring)
      return {
        note: 'Ваші яскраві теплі тони — тренд номер один цієї весни!',
        urgency: 'Найкращий час шопінгу',
        emoji: '🌺',
      };
    if (isSummer)
      return {
        note: 'Літні колекції в магазинах — ваші персикові та коралеві тони в асортименті',
        urgency: 'Нові надходження',
        emoji: '🌻',
      };
    return {
      note: 'Spring кольори завжди свіжо та актуально',
      urgency: 'Вічна класика',
      emoji: '✨',
    };
  }
  return {
    note: 'Ваша палітра підходить для будь-якого сезону',
    urgency: 'Вічна класика',
    emoji: '✨',
  };
}

function getSeasonFamily(colorSeason: string): keyof typeof OUTFIT_IDEAS {
  const s = colorSeason.toLowerCase();
  if (s.includes('autumn')) return 'autumn';
  if (s.includes('winter')) return 'winter';
  if (s.includes('summer')) return 'summer';
  if (s.includes('spring')) return 'spring';
  return 'autumn';
}

const OCCASION_LABEL: Record<string, string> = {
  casual: '☕ Casual',
  work: '💼 Офіс',
  evening: '🌙 Вечір',
  weekend: '🌿 Вихідні',
};

// ─────────────────────────────────────────────────────────────────────────────
// КОМПОНЕНТИ
// ─────────────────────────────────────────────────────────────────────────────

const SeasonalBanner: React.FC<{
  season: string;
  colors: string[];
  note: { note: string; urgency: string; emoji: string };
}> = ({ season, colors, note }) => (
  <View style={sb.wrap}>
    <View style={sb.topRow}>
      <Text style={sb.emoji}>{note.emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={sb.urgencyBadge}>
          <Text style={sb.urgencyText}>{note.urgency}</Text>
        </View>
        <Text style={sb.season}>{season}</Text>
      </View>
      {/* мінікольори */}
      <View style={sb.dots}>
        {colors.slice(0, 5).map((hex, i) => (
          <View key={i} style={[sb.dot, { backgroundColor: hex }]} />
        ))}
      </View>
    </View>
    <Text style={sb.note}>{note.note}</Text>
  </View>
);
const sb = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  emoji: { fontSize: 28 },
  urgencyBadge: {
    backgroundColor: '#C49B63',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  season: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 16, height: 16, borderRadius: 4 },
  note: { fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },
});

const BrandCard: React.FC<{ brand: Brand; isPremiumUser: boolean }> = ({
  brand,
  isPremiumUser,
}) => {
  const locked = brand.type === 'local' && !isPremiumUser && !brand.isPartner;

  const handlePress = async () => {
    if (locked) {
      Alert.alert(
        'Premium',
        'Локальні українські дизайнери доступні в Basic+ підписці',
        [
          { text: 'Скасувати', style: 'cancel' },
          { text: 'Переглянути підписку', onPress: () => {} },
        ],
      );
      return;
    }
    try {
      await Linking.openURL(brand.url);
    } catch {
      Alert.alert('Помилка', 'Не вдалося відкрити сайт');
    }
  };

  return (
    <TouchableOpacity
      style={[bc.card, { borderColor: brand.accentColor + '30' }]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      {brand.isPartner && (
        <View style={[bc.partnerBadge, { backgroundColor: brand.accentColor }]}>
          <Text style={bc.partnerText}>Партнер</Text>
        </View>
      )}
      {locked && (
        <View style={bc.lockOverlay}>
          <Text style={bc.lockIcon}>🔒</Text>
        </View>
      )}
      <Text style={bc.emoji}>{brand.emoji}</Text>
      <Text style={bc.name}>{brand.name}</Text>
      <Text style={bc.tag}>{brand.tag}</Text>
      <Text style={bc.desc} numberOfLines={2}>
        {brand.description}
      </Text>
      <View style={[bc.cta, { backgroundColor: brand.accentColor }]}>
        <Text style={bc.ctaText}>Перейти →</Text>
      </View>
    </TouchableOpacity>
  );
};
const bc = StyleSheet.create({
  card: {
    width: 150,
    marginRight: 12,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  partnerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  partnerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  lockIcon: { fontSize: 28 },
  emoji: { fontSize: 26, marginBottom: 6 },
  name: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  tag: { fontSize: 10, color: '#C49B63', fontWeight: '600', marginBottom: 6 },
  desc: {
    fontSize: 11,
    color: '#888',
    lineHeight: 15,
    marginBottom: 10,
    flexGrow: 1,
  },
  cta: { paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  ctaText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
});

const OutfitIdeaCard: React.FC<{
  idea: OutfitIdea;
  brand: Brand | undefined;
  isPremiumUser: boolean;
  onPress: () => void;
}> = ({ idea, brand, isPremiumUser, onPress }) => {
  const locked = idea.isPremium && !isPremiumUser;

  return (
    <TouchableOpacity style={oc.card} onPress={onPress} activeOpacity={0.8}>
      {locked && (
        <View style={oc.lockBadge}>
          <Text style={oc.lockText}>👑 Premium</Text>
        </View>
      )}
      {/* Кольорова смужка */}
      <View style={oc.colorStrip}>
        {idea.colors.map((hex, i) => (
          <View
            key={i}
            style={[oc.colorBlock, { backgroundColor: hex, flex: 1 }]}
          />
        ))}
      </View>
      <View style={oc.body}>
        <View style={oc.headerRow}>
          <View style={oc.occasionBadge}>
            <Text style={oc.occasionText}>{OCCASION_LABEL[idea.occasion]}</Text>
          </View>
          {brand && <Text style={oc.brandName}>{brand.name}</Text>}
        </View>
        <Text style={oc.title}>{idea.title}</Text>
        <Text style={oc.tip}>{idea.tip}</Text>
        {!locked && brand && (
          <TouchableOpacity
            style={oc.shopBtn}
            onPress={async () => {
              const url = `${brand.url}&q=${encodeURIComponent(
                idea.searchQuery,
              )}`;
              try {
                await Linking.openURL(url);
              } catch {
                /* ignore */
              }
            }}
          >
            <Text style={oc.shopBtnText}>Знайти схожий → {brand.name}</Text>
          </TouchableOpacity>
        )}
        {locked && (
          <View style={oc.shopBtn}>
            <Text style={oc.shopBtnText}>🔒 Доступно в Basic+</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
const oc = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 3,
    backgroundColor: '#C49B63',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lockText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  colorStrip: { flexDirection: 'row', height: 48 },
  colorBlock: { height: '100%' },
  body: { padding: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  occasionBadge: {
    backgroundColor: '#F5F0FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  occasionText: { fontSize: 11, color: '#7B5EA7', fontWeight: '600' },
  brandName: { fontSize: 11, color: '#C49B63', fontWeight: '600' },
  title: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  tip: { fontSize: 12, color: '#888', lineHeight: 17, marginBottom: 10 },
  shopBtn: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  shopBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
});

// ─────────────────────────────────────────────────────────────────────────────
// ГОЛОВНИЙ КОМПОНЕНТ
// ─────────────────────────────────────────────────────────────────────────────
const GalleryScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState<Analysis | null>(null);
  const [isPremiumUser] = useState(false); // TODO: взяти з user profile

  const load = useCallback(async () => {
    try {
      const { analyses } = await getUserAnalyses();
      const completed = analyses.filter(a => a.status === 'completed');
      setLastAnalysis(completed[0] || null);
    } catch {
      // без аналізу — показуємо загальні рекомендації
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Дані з аналізу ────────────────────────────────────────────
  const la = (lastAnalysis as any)?.larsonAnalysis;
  const colorSeason: string =
    (lastAnalysis as any)?.colorSeason?.primary || 'True Autumn';
  const seasonFamily = getSeasonFamily(colorSeason);
  const seasonalNote = getSeasonalNote(colorSeason);

  // Нейтральні кольори для банера — беремо hex з {hex,name} або рядка
  const rawNeutrals: any[] = la?.colorPalette?.bestColors?.neutrals || [];
  const paletteHexes: string[] = rawNeutrals.map((c: any) =>
    c?.hex ? c.hex : (String(c).match(/#[0-9A-Fa-f]{3,6}/) || [])[0] || '#CCC',
  );

  // Бренди для поточного сезону (mass першими, потім local/premium)
  const filteredBrands = BRANDS.filter(b =>
    b.seasons.includes(colorSeason),
  ).sort((a, b) => {
    if (a.isPartner && !b.isPartner) return -1; // партнери першими
    if (a.type === 'local' && b.type !== 'local') return 1; // local в кінці (якщо не партнери)
    return 0;
  });

  // Ідеї образів для сезону
  const outfitIdeas: OutfitIdea[] =
    OUTFIT_IDEAS[seasonFamily] || OUTFIT_IDEAS.autumn;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C49B63" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Seasonal Banner ── */}
        <View style={styles.topPadding} />
        <SeasonalBanner
          season={colorSeason}
          colors={
            paletteHexes.length > 0
              ? paletteHexes
              : ['#C19A6B', '#8B4513', '#D4A017', '#556B2F', '#3C1414']
          }
          note={seasonalNote}
        />

        {/* ── Virtual Try-On ── */}
        <TouchableOpacity
          style={styles.tryOnBanner}
          onPress={() => navigation.navigate('VirtualTryOn')}
          activeOpacity={0.85}
        >
          <Text style={styles.tryOnEmoji}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tryOnTitle}>Virtual Try-On</Text>
            <Text style={styles.tryOnSub}>
              Виберіть зачіску, колір волосся та макіяж
            </Text>
          </View>
          <Text style={styles.tryOnArrow}>›</Text>
        </TouchableOpacity>

        {/* ── Бренди ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🛍️ Бренди для вашого типу</Text>
          {!lastAnalysis && (
            <Text style={styles.sectionSub}>
              Загальні рекомендації · Пройдіть аналіз для персональних
            </Text>
          )}
        </View>
        <FlatList
          data={filteredBrands}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={b => b.id}
          renderItem={({ item }) => (
            <BrandCard brand={item} isPremiumUser={isPremiumUser} />
          )}
          contentContainerStyle={styles.brandsList}
        />

        {/* Пояснення монетизації (для B2B) */}
        <TouchableOpacity
          style={styles.b2bNote}
          onPress={() =>
            Alert.alert(
              'Розміщення бренду',
              'Якщо ви бренд або стиліст — напишіть нам для розміщення в розділі "Бренди для вашого типу". Контакт: team@glowkvitne.com',
            )
          }
        >
          <Text style={styles.b2bNoteText}>
            💼 Ваш бренд тут? Зв'яжіться з нами
          </Text>
        </TouchableOpacity>

        {/* ── Ідеї образів ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👗 Ідеї образів</Text>
          <Text style={styles.sectionSub}>
            Підібрані під вашу палітру {colorSeason}
          </Text>
        </View>
        <View style={styles.ideasList}>
          {outfitIdeas.map(idea => (
            <OutfitIdeaCard
              key={idea.id}
              idea={idea}
              brand={BRANDS.find(b => b.id === idea.brandId)}
              isPremiumUser={isPremiumUser}
              onPress={() => {
                if (idea.isPremium && !isPremiumUser) {
                  Alert.alert(
                    'Premium',
                    'Цей образ доступний у Basic+ підписці',
                    [
                      { text: 'Скасувати', style: 'cancel' },
                      {
                        text: 'Переглянути підписку',
                        onPress: () =>
                          navigation.navigate('ProfileTab', {
                            screen: 'Subscription',
                          }),
                      },
                    ],
                  );
                }
              }}
            />
          ))}
        </View>

        {/* ── Нема аналізу — CTA ── */}
        {!lastAnalysis && (
          <TouchableOpacity
            style={styles.analysisCta}
            onPress={() =>
              navigation.navigate('HomeTab', { screen: 'StartAnalysis' } as any)
            }
          >
            <Text style={styles.analysisCtaTitle}>
              🔬 Отримати персональні рекомендації
            </Text>
            <Text style={styles.analysisCtaSub}>
              Пройдіть аналіз — і бренди та образи будуть підібрані під вашу
              палітру
            </Text>
            <View style={styles.analysisCtaBtn}>
              <Text style={styles.analysisCtaBtnText}>Пройти аналіз →</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topPadding: { height: 16 },

  // Try-On banner
  tryOnBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  tryOnEmoji: { fontSize: 28 },
  tryOnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  tryOnSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  tryOnArrow: { fontSize: 28, color: '#C49B63', fontWeight: '300' },

  // Sections
  sectionHeader: { paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  sectionSub: { fontSize: 12, color: '#999', marginTop: 2 },

  // Brands
  brandsList: { paddingHorizontal: 16, paddingBottom: 4 },
  b2bNote: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  b2bNoteText: { fontSize: 12, color: '#999' },

  // Outfit ideas
  ideasList: { paddingHorizontal: 16 },

  // No analysis CTA
  analysisCta: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FFF8EF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C49B63',
  },
  analysisCtaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  analysisCtaSub: {
    fontSize: 13,
    color: '#888',
    lineHeight: 19,
    marginBottom: 14,
  },
  analysisCtaBtn: {
    backgroundColor: '#C49B63',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  analysisCtaBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});

export default GalleryScreen;
