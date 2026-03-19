/**
 * Virtual Try-On Screen
 * Дозволяє завантажити фото та змінити колір волосся,
 * зачіску, макіяж, колір очей тощо через AI (Replicate Flux Kontext).
 *
 * Ліміти по плану:
 *  free    → заблоковано (paywall)
 *  basic   → 5 try-on/тиж, 1 збереження/тиж, без sharing
 *  premium → 10 try-on/тиж, необмежені збереження, sharing
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { virtualTryOn, saveTryOnResult } from '../api/analysisApi';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// ── Типи ────────────────────────────────────────────────────────────────────
type TryOnOption = {
  id: string;
  label: string;
  prompt: string;
  preview?: string;
};

type Category = {
  id: string;
  emoji: string;
  label: string;
  options: TryOnOption[];
};

type NavigationProps = { navigation: any; route?: any };

// ── Ліміти по плану ──────────────────────────────────────────────────────────
const TRYON_LIMITS: Record<string, { tryOns: number; saves: number; canShare: boolean }> = {
  free:    { tryOns: 0,  saves: 0,  canShare: false },
  basic:   { tryOns: 5,  saves: 1,  canShare: false },
  premium: { tryOns: 10, saves: -1, canShare: true  }, // -1 = unlimited
};

/** Ключ для AsyncStorage — унікальний для поточного тижня */
function getWeekKey(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7,
  );
  return `tryOn_${now.getFullYear()}_W${week}`;
}

// ── Категорії ────────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    id: 'hair_color',
    emoji: '💇',
    label: 'Колір волосся',
    options: [
      { id: 'blonde',     label: 'Блонд',             prompt: 'change hair color to golden blonde',         preview: '#F5D060' },
      { id: 'ash_blonde', label: 'Попелястий блонд',  prompt: 'change hair color to cool ash blonde',      preview: '#D4C9B0' },
      { id: 'brunette',   label: 'Брюнетка',          prompt: 'change hair color to dark brown',           preview: '#3B2314' },
      { id: 'chestnut',   label: 'Каштановий',        prompt: 'change hair color to warm chestnut brown',  preview: '#6B3A2A' },
      { id: 'red',        label: 'Рудий',             prompt: 'change hair color to natural auburn red',   preview: '#B34700' },
      { id: 'black',      label: 'Чорний',            prompt: 'change hair color to deep black',           preview: '#1A1A1A' },
      { id: 'gray',       label: 'Сивий/Срібний',     prompt: 'change hair color to silver gray',          preview: '#C0C0C0' },
      { id: 'rose_gold',  label: 'Рожеве золото',     prompt: 'change hair color to rose gold pink',       preview: '#E8A598' },
      { id: 'cool_brown', label: 'Холодний каштан',   prompt: 'change hair color to cool toned ash brown', preview: '#6B5D52' },
    ],
  },
  {
    id: 'hairstyle',
    emoji: '✂️',
    label: 'Зачіска',
    options: [
      { id: 'long_straight',  label: 'Довге пряме',         prompt: 'give long straight sleek hair, keep face unchanged' },
      { id: 'long_waves',     label: 'Довге хвилясте',      prompt: 'give long wavy hair with soft waves, keep face unchanged' },
      { id: 'bob',            label: 'Каре (bob)',           prompt: 'give classic chin-length bob haircut, keep face unchanged' },
      { id: 'lob',            label: 'Lob (подовжене каре)',  prompt: 'give modern shoulder-length lob haircut, keep face unchanged' },
      { id: 'pixie',          label: 'Пікс',                prompt: 'give short pixie cut, keep face unchanged' },
      { id: 'bun',            label: 'Пучок (bun)',          prompt: 'style hair in elegant low bun updo, keep face unchanged' },
      { id: 'ponytail',       label: 'Хвіст',               prompt: 'style hair in sleek high ponytail, keep face unchanged' },
      { id: 'curtain_bangs',  label: 'Занавіска (банги)',    prompt: 'add curtain bangs framing the face, keep face unchanged' },
    ],
  },
  {
    id: 'makeup',
    emoji: '💄',
    label: 'Макіяж',
    options: [
      { id: 'no_makeup',   label: 'Без макіяжу',      prompt: 'apply natural no-makeup look, clear fresh skin' },
      { id: 'natural',     label: 'Натуральний',      prompt: 'apply soft natural everyday makeup with light foundation and mascara' },
      { id: 'smoky',       label: 'Смокі-айс',        prompt: 'apply dramatic smoky eye makeup with dark eyeshadow' },
      { id: 'bold_lip',    label: 'Яскрава помада',   prompt: 'apply bold red lip makeup with minimal eye makeup' },
      { id: 'dusty_rose',  label: 'Пиловий троянда',  prompt: 'apply dusty rose lip color and soft blush makeup' },
      { id: 'evening',     label: 'Вечірній',         prompt: 'apply glamorous evening makeup with defined eyes and nude lip' },
      { id: 'fresh_dewy',  label: 'Свіжий/Dewy',      prompt: 'apply fresh dewy glow skin makeup look' },
    ],
  },
  {
    id: 'eye_color',
    emoji: '👁️',
    label: 'Колір очей',
    options: [
      { id: 'blue',        label: 'Синій',          prompt: 'change eye color to bright blue, keep makeup',          preview: '#4A90D9' },
      { id: 'green',       label: 'Зелений',        prompt: 'change eye color to natural green, keep makeup',        preview: '#5A9E6F' },
      { id: 'hazel',       label: 'Карі (горіхові)', prompt: 'change eye color to hazel brown-green, keep makeup',   preview: '#8B6914' },
      { id: 'dark_brown',  label: 'Темно-карі',     prompt: 'change eye color to deep dark brown, keep makeup',      preview: '#3D1C02' },
      { id: 'gray',        label: 'Сірий',          prompt: 'change eye color to gray, keep makeup',                 preview: '#9BA4B5' },
      { id: 'light_brown', label: 'Світло-карі',    prompt: 'change eye color to light warm brown, keep makeup',     preview: '#A0785A' },
    ],
  },
  {
    id: 'brows',
    emoji: '🪮',
    label: 'Брови',
    options: [
      { id: 'natural',     label: 'Натуральні',     prompt: 'natural groomed eyebrows' },
      { id: 'bold_straight', label: 'Прямі жирні', prompt: 'give thick straight bold eyebrows Korean style' },
      { id: 'arched',      label: 'Арочні',         prompt: 'give classic high arched eyebrows' },
      { id: 'soft_arch',   label: "М'який вигин",   prompt: 'give soft naturally arched filled eyebrows' },
      { id: 'bleached',    label: 'Знебарвлені',    prompt: 'bleach eyebrows to very light barely visible blonde' },
    ],
  },
  {
    id: 'skin',
    emoji: '✨',
    label: 'Шкіра',
    options: [
      { id: 'glow',      label: 'Сяйво',     prompt: 'apply glowing radiant skin effect, healthy glow' },
      { id: 'matte',     label: 'Матова',    prompt: 'apply smooth matte flawless skin' },
      { id: 'freckles',  label: 'Веснянки',  prompt: 'add natural sun freckles on nose and cheeks' },
      { id: 'tanned',    label: 'Засмага',   prompt: 'apply sun-kissed tan skin tone' },
      { id: 'porcelain', label: 'Фарфорова', prompt: 'apply porcelain pale fair flawless skin' },
    ],
  },
];

// ── Компонент ────────────────────────────────────────────────────────────────
const VirtualTryOnScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { user } = useAuth();
  const plan = (user?.subscription?.plan ?? 'free') as 'free' | 'basic' | 'premium';
  const limit = TRYON_LIMITS[plan];

  // Лічильники поточного тижня
  const [tryOnCount, setTryOnCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [_selectedOption, setSelectedOption] = useState<TryOnOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [customizationQueue, setCustomizationQueue] = useState<TryOnOption[]>([]);

  // Завантажити лічильники з AsyncStorage при монтуванні
  useEffect(() => {
    const weekKey = getWeekKey();
    Promise.all([
      AsyncStorage.getItem(`${weekKey}_count`),
      AsyncStorage.getItem(`${weekKey}_saves`),
    ]).then(([c, s]) => {
      setTryOnCount(Number(c) || 0);
      setSaveCount(Number(s) || 0);
    });
  }, []);

  // ── Вибір фото ──────────────────────────────────────────────────────────
  const pickFromGallery = async () => {
    setShowPhotoMenu(false);
    await new Promise<void>(resolve => setTimeout(resolve, 300));
    try {
      const response = await launchImageLibrary({ mediaType: 'photo', quality: 0.9, includeBase64: true, maxWidth: 1024, maxHeight: 1024 });
      handleImageResponse(response as ImagePickerResponse);
    } catch { /* ignore */ }
  };

  const pickFromCamera = async () => {
    setShowPhotoMenu(false);
    await new Promise<void>(resolve => setTimeout(resolve, 300));
    try {
      const response = await launchCamera({ mediaType: 'photo', quality: 0.9, includeBase64: true, maxWidth: 1024, maxHeight: 1024 });
      handleImageResponse(response as ImagePickerResponse);
    } catch { /* ignore */ }
  };

  const handleImageResponse = (response: ImagePickerResponse | any) => {
    if (!response || response.didCancel || response.errorCode) return;
    const asset = response.assets?.[0];
    if (!asset) return;
    if (asset.base64) {
      setSourceImage(asset.base64);
    } else if (asset.uri?.startsWith('data:')) {
      const comma = asset.uri.indexOf(',');
      if (comma !== -1) setSourceImage(asset.uri.slice(comma + 1));
    }
    setResultImage(null);
    setSaved(false);
    setSavedUrl(null);
    setCustomizationQueue([]);
  };

  // ── Черга змін ──────────────────────────────────────────────────────────
  const applyOption = (option: TryOnOption) => {
    if (!sourceImage) {
      Alert.alert('Спочатку завантажте фото', 'Натисніть на велику рамку зверху щоб додати фото');
      return;
    }
    setSelectedOption(option);
    if (!customizationQueue.find(q => q.id === option.id)) {
      setCustomizationQueue(prev => [...prev, option]);
    }
  };

  const removeFromQueue = (optionId: string) => {
    setCustomizationQueue(prev => prev.filter(q => q.id !== optionId));
  };

  // ── Застосувати Try-On ───────────────────────────────────────────────────
  const runTryOn = async () => {
    if (!sourceImage) {
      Alert.alert('Потрібне фото', 'Спочатку завантажте фото обличчя');
      return;
    }
    if (customizationQueue.length === 0) {
      Alert.alert('Оберіть зміни', 'Виберіть хоча б одну опцію для трансформації');
      return;
    }

    // Перевірка ліміту
    if (limit.tryOns > 0 && tryOnCount >= limit.tryOns) {
      Alert.alert(
        'Ліміт тижня використано',
        `У вашому плані ${limit.tryOns} Try-On на тиждень. Оновіть підписку для більшого доступу.`,
        [
          { text: 'Скасувати', style: 'cancel' },
          { text: 'Оновити план', onPress: () => navigation.navigate('ProfileTab', { screen: 'Subscription' }) },
        ],
      );
      return;
    }

    setLoading(true);
    setResultImage(null);
    setSaved(false);
    setSavedUrl(null);

    try {
      const combinedPrompt = customizationQueue.map(q => q.prompt).join(', ');
      const result = await virtualTryOn({ imageBase64: sourceImage, prompt: combinedPrompt });
      const image = result.resultImageBase64 || result.resultImageUrl || null;
      setResultImage(image);

      // Інкремент лічильника
      const newCount = tryOnCount + 1;
      setTryOnCount(newCount);
      await AsyncStorage.setItem(`${getWeekKey()}_count`, String(newCount));
    } catch (error: any) {
      Alert.alert('Помилка обробки', error.message || 'Не вдалося обробити зображення. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  // ── Зберегти результат ───────────────────────────────────────────────────
  const handleSaveResult = async () => {
    if (!resultImage) return;

    // Перевірка ліміту збережень
    if (limit.saves !== -1 && saveCount >= limit.saves) {
      Alert.alert(
        'Ліміт збережень',
        plan === 'basic'
          ? 'У Basic плані доступне 1 збереження на тиждень. Оновіть до Premium для необмежених збережень.'
          : 'Ліміт збережень вичерпано.',
        [
          { text: 'Скасувати', style: 'cancel' },
          { text: 'Оновити до Premium', onPress: () => navigation.navigate('ProfileTab', { screen: 'Subscription' }) },
        ],
      );
      return;
    }

    setSaving(true);
    try {
      const result = await saveTryOnResult(resultImage);
      setSaved(true);
      setSavedUrl((result as any)?.url || null);

      // Інкремент лічильника збережень
      const newSaves = saveCount + 1;
      setSaveCount(newSaves);
      await AsyncStorage.setItem(`${getWeekKey()}_saves`, String(newSaves));

      Alert.alert('Збережено ✓', 'Результат збережено у вашому профілі.');
    } catch (err: any) {
      Alert.alert('Помилка', 'Не вдалося зберегти. Спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  };

  // ── Поширити (тільки Premium) ────────────────────────────────────────────
  const handleShare = async () => {
    const urlToShare = savedUrl || (resultImage?.startsWith('http') ? resultImage : null);
    if (!urlToShare) {
      Alert.alert(
        'Спочатку збережіть',
        'Збережіть результат — і тоді зможете поширити його.',
        [{ text: 'Зберегти', onPress: handleSaveResult }, { text: 'Скасувати', style: 'cancel' }],
      );
      return;
    }
    try {
      await Share.share({
        message: 'Мій Virtual Try-On від GlowKvitne ✨ Дізнайся свій кольоротип: glowkvitne.com',
        url: urlToShare,
      });
    } catch { /* ignore user cancel */ }
  };

  // ── Paywall для Free ─────────────────────────────────────────────────────
  if (plan === 'free') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.paywallScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.paywallEmoji}>✨</Text>
          <Text style={styles.paywallTitle}>Virtual Try-On</Text>
          <Text style={styles.paywallSub}>
            Спробуйте різні зачіски, кольори волосся та макіяж за допомогою AI — прямо на вашому фото
          </Text>

          <View style={styles.paywallPlans}>
            {/* Basic */}
            <View style={styles.paywallPlanCard}>
              <Text style={styles.paywallPlanName}>Basic · ₴199/міс</Text>
              <Text style={styles.paywallPlanFeature}>✓ 5 Try-On на тиждень</Text>
              <Text style={styles.paywallPlanFeature}>✓ 1 збереження на тиждень</Text>
              <Text style={styles.paywallPlanFeature}>✓ 5 аналізів на місяць</Text>
            </View>
            {/* Premium */}
            <View style={[styles.paywallPlanCard, styles.paywallPlanPremium]}>
              <View style={styles.paywallBestBadge}><Text style={styles.paywallBestText}>Найкращий вибір</Text></View>
              <Text style={[styles.paywallPlanName, { color: '#C49B63' }]}>Premium · ₴399/міс</Text>
              <Text style={styles.paywallPlanFeature}>✓ 10 Try-On на тиждень</Text>
              <Text style={styles.paywallPlanFeature}>✓ Необмежені збереження</Text>
              <Text style={styles.paywallPlanFeature}>✓ Поширення в соцмережі</Text>
              <Text style={styles.paywallPlanFeature}>✓ Необмежені аналізи</Text>
              <Text style={styles.paywallPlanFeature}>✓ PDF Style Guide</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.paywallBtn}
            onPress={() => navigation.navigate('ProfileTab', { screen: 'Subscription' })}
          >
            <Text style={styles.paywallBtnText}>Отримати доступ →</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.paywallBack}>Повернутись назад</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Основний UI ──────────────────────────────────────────────────────────
  const displayImage = resultImage || (sourceImage ? `data:image/jpeg;base64,${sourceImage}` : null);
  const tryOnsLeft = limit.tryOns - tryOnCount;
  const savesLeft = limit.saves === -1 ? null : limit.saves - saveCount;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Заголовок */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>✨ Virtual Try-On</Text>
          <View style={styles.headerRight}>
            {/* Лічильник try-ons */}
            <View style={[styles.counterBadge, tryOnsLeft <= 1 && styles.counterBadgeLow]}>
              <Text style={styles.counterText}>{tryOnsLeft}/{limit.tryOns} ✨</Text>
            </View>
            {resultImage && (
              <View style={styles.headerActions}>
                {/* Зберегти */}
                <TouchableOpacity
                  style={[styles.saveBtn, saved && styles.saveBtnDone, savesLeft === 0 && !saved && styles.saveBtnDisabled]}
                  onPress={handleSaveResult}
                  disabled={saving || saved || savesLeft === 0}
                >
                  <Text style={styles.saveBtnText}>
                    {saving ? '…' : saved ? '✓ Збережено' : savesLeft === 0 ? '🔒 Ліміт' : '💾 Зберегти'}
                  </Text>
                </TouchableOpacity>
                {/* Share (тільки Premium) */}
                {limit.canShare && (
                  <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <Text style={styles.shareBtnText}>📤</Text>
                  </TouchableOpacity>
                )}
                {/* Скинути */}
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => { setResultImage(null); setCustomizationQueue([]); setSaved(false); setSavedUrl(null); }}
                >
                  <Text style={styles.resetBtnText}>Скинути</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.subtitle}>
          Завантажте фото та спробуйте різні зачіски, кольори та макіяж
        </Text>

        {/* Підказка ліміту збережень для Basic */}
        {plan === 'basic' && savesLeft !== null && (
          <View style={[styles.limitNote, savesLeft === 0 && styles.limitNoteWarn]}>
            <Text style={styles.limitNoteText}>
              {savesLeft > 0
                ? `💾 Залишилось збережень: ${savesLeft}/тиждень`
                : '🔒 Ліміт збережень вичерпано. Оновіть до Premium.'}
            </Text>
            {savesLeft === 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('ProfileTab', { screen: 'Subscription' })}>
                <Text style={styles.limitNoteLink}>Оновити →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Фото preview */}
        <TouchableOpacity
          style={[styles.photoBox, !displayImage && styles.photoBoxEmpty]}
          onPress={() => setShowPhotoMenu(true)}
          activeOpacity={0.8}
        >
          {displayImage ? (
            <>
              <Image
                source={{ uri: displayImage.startsWith('data:') || displayImage.startsWith('http') ? displayImage : `data:image/jpeg;base64,${displayImage}` }}
                style={styles.photoPreview}
                resizeMode="cover"
              />
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color="#FFFFFF" size="large" />
                  <Text style={styles.loadingOverlayText}>AI обробляє фото…</Text>
                </View>
              )}
              {!loading && (
                <TouchableOpacity style={styles.changePhotoBtn} onPress={() => setShowPhotoMenu(true)}>
                  <Text style={styles.changePhotoBtnText}>📷 Змінити фото</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderEmoji}>📸</Text>
              <Text style={styles.photoPlaceholderText}>Натисніть щоб завантажити фото</Text>
              <Text style={styles.photoPlaceholderHint}>Краще підходить фото обличчя анфас</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Черга змін */}
        {customizationQueue.length > 0 && (
          <View style={styles.queueSection}>
            <Text style={styles.queueTitle}>Обрані зміни</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.queueScroll}>
              {customizationQueue.map(option => (
                <View key={option.id} style={styles.queueChip}>
                  <Text style={styles.queueChipText}>{option.label}</Text>
                  <TouchableOpacity onPress={() => removeFromQueue(option.id)}>
                    <Text style={styles.queueChipRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Кнопка застосувати */}
        <TouchableOpacity
          style={[styles.applyButton, (loading || !sourceImage || customizationQueue.length === 0 || tryOnsLeft <= 0) && styles.applyButtonDisabled]}
          onPress={runTryOn}
          disabled={loading || !sourceImage || customizationQueue.length === 0 || tryOnsLeft <= 0}
        >
          {loading ? (
            <View style={styles.applyButtonInner}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.applyButtonText}> Обробка AI…</Text>
            </View>
          ) : tryOnsLeft <= 0 ? (
            <Text style={styles.applyButtonText}>🔒 Ліміт тижня вичерпано</Text>
          ) : (
            <Text style={styles.applyButtonText}>🪄 Застосувати ({customizationQueue.length})</Text>
          )}
        </TouchableOpacity>

        {/* Категорії */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTab, selectedCategory.id === cat.id && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryLabel, selectedCategory.id === cat.id && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Опції поточної категорії */}
        <View style={styles.optionsGrid}>
          {selectedCategory.options.map(option => {
            const isSelected = customizationQueue.some(q => q.id === option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => applyOption(option)}
                activeOpacity={0.75}
              >
                {option.preview ? (
                  <View style={[styles.colorDot, { backgroundColor: option.preview }]} />
                ) : (
                  <Text style={styles.optionEmoji}>{selectedCategory.emoji}</Text>
                )}
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]} numberOfLines={2}>
                  {option.label}
                </Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Підказка */}
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Можна обрати кілька змін одразу — наприклад, колір волосся + макіяж
          </Text>
        </View>

      </ScrollView>

      {/* Photo picker modal */}
      <Modal visible={showPhotoMenu} transparent animationType="slide" onRequestClose={() => setShowPhotoMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPhotoMenu(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Додати фото</Text>
            <TouchableOpacity style={styles.modalOption} onPress={pickFromCamera}>
              <Text style={styles.modalOptionEmoji}>📷</Text>
              <Text style={styles.modalOptionText}>Зробити фото</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={pickFromGallery}>
              <Text style={styles.modalOptionEmoji}>🖼️</Text>
              <Text style={styles.modalOptionText}>Вибрати з галереї</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowPhotoMenu(false)}>
              <Text style={styles.modalCancelText}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 20, paddingBottom: 40 },

  // ── Paywall ──
  paywallScroll: { padding: 24, paddingBottom: 48, alignItems: 'center' },
  paywallEmoji: { fontSize: 72, marginBottom: 16, marginTop: 24 },
  paywallTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 10, textAlign: 'center' },
  paywallSub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  paywallPlans: { width: '100%', gap: 12, marginBottom: 24 },
  paywallPlanCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E8E8E8' },
  paywallPlanPremium: { borderColor: '#C49B63', borderWidth: 2 },
  paywallBestBadge: { backgroundColor: '#C49B63', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  paywallBestText: { fontSize: 10, fontWeight: '700', color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  paywallPlanName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  paywallPlanFeature: { fontSize: 13, color: '#555', marginBottom: 4, lineHeight: 20 },
  paywallBtn: { backgroundColor: '#C49B63', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14, marginBottom: 16, shadowColor: '#C49B63', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  paywallBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  paywallBack: { fontSize: 14, color: '#AAA', textDecorationLine: 'underline' },

  // ── Header ──
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 12, lineHeight: 20 },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  // Лічильник
  counterBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  counterBadgeLow: { backgroundColor: '#FFF3E0' },
  counterText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },

  // Ліміт збережень
  limitNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FFF4', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, borderWidth: 1, borderColor: '#A5D6A7' },
  limitNoteWarn: { backgroundColor: '#FFF8E1', borderColor: '#FFD54F' },
  limitNoteText: { fontSize: 12, color: '#555', flex: 1 },
  limitNoteLink: { fontSize: 12, fontWeight: '700', color: '#C49B63', marginLeft: 8 },

  // Кнопки
  saveBtn: { backgroundColor: '#C49B63', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  saveBtnDone: { backgroundColor: '#4CAF50' },
  saveBtnDisabled: { backgroundColor: '#E0E0E0' },
  saveBtnText: { fontSize: 12, color: '#FFF', fontWeight: '600' },
  shareBtn: { backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  shareBtnText: { fontSize: 14 },
  resetBtn: { backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  resetBtnText: { fontSize: 12, color: '#555', fontWeight: '600' },

  // Photo
  photoBox: { height: 320, borderRadius: 16, overflow: 'hidden', backgroundColor: '#FFFFFF', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  photoBoxEmpty: { borderWidth: 2, borderColor: '#E0D5C8', borderStyle: 'dashed' },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  photoPlaceholderEmoji: { fontSize: 56, marginBottom: 12 },
  photoPlaceholderText: { fontSize: 16, fontWeight: '600', color: '#555', textAlign: 'center', marginBottom: 6 },
  photoPlaceholderHint: { fontSize: 13, color: '#AAA', textAlign: 'center' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  loadingOverlayText: { color: '#FFF', marginTop: 12, fontSize: 14, fontWeight: '600' },
  changePhotoBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  changePhotoBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  // Queue
  queueSection: { marginBottom: 12 },
  queueTitle: { fontSize: 13, fontWeight: '700', color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  queueScroll: { flexGrow: 0 },
  queueChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C49B63', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, gap: 6 },
  queueChipText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  queueChipRemove: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700' },

  // Apply button
  applyButton: { backgroundColor: '#C49B63', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: '#C49B63', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  applyButtonDisabled: { backgroundColor: '#E0D5C8', shadowOpacity: 0 },
  applyButtonInner: { flexDirection: 'row', alignItems: 'center' },
  applyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Categories
  categoriesScroll: { marginBottom: 16 },
  categoriesContent: { gap: 8 },
  categoryTab: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F5F5', minWidth: 80 },
  categoryTabActive: { backgroundColor: '#1A1A1A' },
  categoryEmoji: { fontSize: 20, marginBottom: 2 },
  categoryLabel: { fontSize: 11, color: '#666', fontWeight: '600', textAlign: 'center' },
  categoryLabelActive: { color: '#FFFFFF' },

  // Options
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  optionCard: { width: (width - 60) / 3, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  optionCardSelected: { borderColor: '#C49B63', backgroundColor: '#FFF8EF' },
  colorDot: { width: 40, height: 40, borderRadius: 20, marginBottom: 6, borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' },
  optionEmoji: { fontSize: 28, marginBottom: 6 },
  optionLabel: { fontSize: 11, color: '#555', textAlign: 'center', lineHeight: 15 },
  optionLabelSelected: { color: '#C49B63', fontWeight: '700' },
  checkmark: { position: 'absolute', top: 6, right: 8, fontSize: 14, color: '#C49B63', fontWeight: '700' },

  // Tip
  tipBox: { backgroundColor: '#FFF8EF', borderRadius: 10, padding: 14, borderLeftWidth: 3, borderLeftColor: '#C49B63' },
  tipText: { fontSize: 13, color: '#888', lineHeight: 19 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 20, textAlign: 'center' },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalOptionEmoji: { fontSize: 28, marginRight: 16 },
  modalOptionText: { fontSize: 17, color: '#1A1A1A', fontWeight: '500' },
  modalCancel: { marginTop: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12 },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: '#666' },
});

export default VirtualTryOnScreen;
