import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  launchImageLibrary,
  launchCamera,
  Asset,
} from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Camera,
  Image as ImageIcon,
  User,
  PersonStanding,
  Sparkles,
  AlertCircle,
  Info,
  X,
  RefreshCw,
  ChevronRight,
  Rocket,
} from 'lucide-react-native';
import { createAnalysis } from '../api/analysisApi';
import { useAuth } from '../context/AuthContext';
import { navigateToSubscription } from '../navigation/helpers';
import { HomeStackParamList } from '../navigation/types';

type PhotoUploadScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'PhotoUpload'>;
};

// ─────────────────────────────────────────────────────────────
const PLAN_LIMITS: Record<string, number> = { free: 1, basic: 5, premium: -1, stylist: -1 };

function canUserAnalyze(user: any): boolean {
  if (!user?.subscription) return false;
  const limit =
    user.subscription.limits?.analysesPerMonth ??
    PLAN_LIMITS[user.subscription.plan || 'free'] ??
    1;
  if (limit === -1) return true;
  const used = user.subscription.usage?.analysesThisMonth || 0;
  if (used < limit) return true;
  const singles = (user.purchases || []).filter(
    (p: any) => p.productId === 'single_analysis' && p.status === 'completed',
  );
  const bought = singles.reduce((s: number, p: any) => s + (p.quantity || 1), 0);
  const usedP = singles.reduce((s: number, p: any) => s + (p.used || 0), 0);
  return usedP < bought;
}

function getErrorMessage(error: any): string {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  const msg = error?.response?.data?.message;

  if (!status && error?.message?.includes('Network'))
    return 'Немає підключення до інтернету. Перевірте мережу і спробуйте знову.';
  if (status === 403 && (code === 'LIMIT/EXCEEDED' || code === 'ANALYSIS/LIMIT_REACHED'))
    return 'UPSELL';
  if (status === 413)
    return 'Фото занадто велике. Спробуйте зменшити розмір або вибрати інше.';
  if (status === 400)
    return msg || 'Невірний формат фото. Спробуйте інше зображення.';
  if (status >= 500)
    return 'Сервер тимчасово недоступний. Спробуйте за кілька хвилин.';
  return msg || error?.message || 'Щось пішло не так. Спробуйте ще раз.';
}

// ─────────────────────────────────────────────────────────────
// Photo Source Sheet (Camera / Gallery)
// ─────────────────────────────────────────────────────────────
const PhotoSourceSheet = ({
  visible,
  onCamera,
  onGallery,
  onClose,
  title,
}: {
  visible: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onClose: () => void;
  title: string;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={sheet.overlay} activeOpacity={1} onPress={onClose}>
      <View style={sheet.container}>
        <View style={sheet.handle} />
        <Text style={sheet.title}>{title}</Text>

        <TouchableOpacity style={sheet.option} onPress={onCamera}>
          <View style={sheet.optionIcon}>
            <Camera color="#C49B63" size={22} strokeWidth={1.8} />
          </View>
          <View style={sheet.optionBody}>
            <Text style={sheet.optionTitle}>Камера</Text>
            <Text style={sheet.optionSub}>Зробити фото прямо зараз</Text>
          </View>
          <ChevronRight color="#555" size={18} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity style={sheet.option} onPress={onGallery}>
          <View style={sheet.optionIcon}>
            <ImageIcon color="#C49B63" size={22} strokeWidth={1.8} />
          </View>
          <View style={sheet.optionBody}>
            <Text style={sheet.optionTitle}>Галерея</Text>
            <Text style={sheet.optionSub}>Вибрати з наявних фото</Text>
          </View>
          <ChevronRight color="#555" size={18} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity style={sheet.cancel} onPress={onClose}>
          <Text style={sheet.cancelText}>Скасувати</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

// ─────────────────────────────────────────────────────────────
// Upsell Modal
// ─────────────────────────────────────────────────────────────
type PlanId = 'free' | 'basic' | 'premium' | 'stylist';
const PLAN_TIER: Record<PlanId, number> = { free: 0, basic: 1, premium: 2, stylist: 3 };
const UPSELL_PLANS = [
  { id: 'basic' as PlanId, name: 'Basic', price: '199 ₴/міс', features: ['✓ 5 аналізів', '✓ Макіяж + волосся'], highlight: false },
  { id: 'premium' as PlanId, name: 'Premium', price: '399 ₴/міс', features: ['✓ Безліміт аналізів', '✓ Celebrity Twins', '✓ PDF'], highlight: true },
  { id: 'stylist' as PlanId, name: 'Стиліст', price: '999 ₴/міс', features: ['✓ Безліміт + клієнти', '✓ Брендований PDF'], highlight: false },
];

const UpsellModal = ({
  visible, onClose, onUpgrade, onViewResult, hasResult, currentPlan = 'free',
}: {
  visible: boolean; onClose: () => void; onUpgrade: () => void;
  onViewResult: () => void; hasResult: boolean; currentPlan?: PlanId;
}) => {
  const tier = PLAN_TIER[currentPlan] ?? 0;
  const plans = UPSELL_PLANS.filter(p => PLAN_TIER[p.id] > tier);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.container}>
          <Sparkles color="#C49B63" size={40} strokeWidth={1.5} style={modal.icon as any} />
          <Text style={modal.title}>Ліміт аналізів вичерпано</Text>
          <Text style={modal.subtitle}>Оновіть план щоб отримати більше аналізів</Text>

          <View style={modal.plansRow}>
            {plans.map(plan => (
              <View key={plan.id} style={[modal.planBox, plan.highlight && modal.planBoxPremium]}>
                {plan.highlight && <Text style={modal.planBadge}>🔥 Топ</Text>}
                <Text style={[modal.planName, plan.highlight && modal.planNameHighlight]}>{plan.name}</Text>
                <Text style={modal.planPrice}>{plan.price}</Text>
                {plan.features.map(f => <Text key={f} style={modal.planFeature}>{f}</Text>)}
              </View>
            ))}
          </View>

          <TouchableOpacity style={modal.upgradeButton} onPress={onUpgrade}>
            <Rocket color="#fff" size={16} strokeWidth={2} />
            <Text style={modal.upgradeButtonText}>Обрати план</Text>
          </TouchableOpacity>

          {hasResult && (
            <TouchableOpacity style={modal.resultButton} onPress={onViewResult}>
              <Text style={modal.resultButtonText}>Переглянути попередній результат</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={modal.closeButton} onPress={onClose}>
            <Text style={modal.closeButtonText}>Закрити</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
// Photo Card
// ─────────────────────────────────────────────────────────────
const PhotoCard = ({
  photo,
  onPress,
  onRemove,
  step,
  title,
  hint,
  required,
  Icon,
}: {
  photo: Asset | null;
  onPress: () => void;
  onRemove: () => void;
  step: string;
  title: string;
  hint: string;
  required: boolean;
  Icon: React.FC<any>;
}) => (
  <View style={styles.photoCard}>
    <View style={styles.photoCardHeader}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepText}>{step}</Text>
      </View>
      <View style={styles.photoCardMeta}>
        <Text style={styles.photoCardTitle}>{title}</Text>
        <Text style={[styles.photoCardBadge, required ? styles.badgeRequired : styles.badgeOptional]}>
          {required ? "Обов'язково" : 'Опціонально'}
        </Text>
      </View>
    </View>

    <Text style={styles.photoHint}>{hint}</Text>

    {photo ? (
      <View style={styles.previewWrap}>
        <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="cover" />
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.previewBtn} onPress={onPress}>
            <RefreshCw color="#fff" size={16} strokeWidth={2} />
            <Text style={styles.previewBtnText}>Змінити</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.previewBtn, styles.previewBtnDanger]} onPress={onRemove}>
            <X color="#fff" size={16} strokeWidth={2} />
            <Text style={styles.previewBtnText}>Видалити</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : (
      <TouchableOpacity style={styles.uploadZone} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.uploadZoneIcon}>
          <Icon color="#C49B63" size={32} strokeWidth={1.5} />
        </View>
        <Text style={styles.uploadZoneTitle}>Додати фото</Text>
        <Text style={styles.uploadZoneSub}>Камера або галерея</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function PhotoUploadScreen({ navigation }: PhotoUploadScreenProps) {
  const { user } = useAuth();
  const [facePhoto, setFacePhoto] = useState<Asset | null>(null);
  const [bodyPhoto, setBodyPhoto] = useState<Asset | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<'face' | 'body' | null>(null);

  const hasLatestResult = !!user?.latestAnalysis?.analysisId;
  const limitReached = !canUserAnalyze(user);

  const openSheet = (type: 'face' | 'body') => {
    setErrorMsg(null);
    setActiveSheet(type);
  };

  const handleCamera = async () => {
    const type = activeSheet;
    setActiveSheet(null);
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
        cameraType: type === 'face' ? 'front' : 'back',
        saveToPhotos: false,
      });
      if (result.didCancel || result.errorCode) return;
      const asset = result.assets?.[0];
      if (!asset) return;
      type === 'face' ? setFacePhoto(asset) : setBodyPhoto(asset);
    } catch {
      setErrorMsg('Не вдалося відкрити камеру. Перевірте дозволи у налаштуваннях телефону.');
    }
  };

  const handleGallery = async () => {
    const type = activeSheet;
    setActiveSheet(null);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      });
      if (result.didCancel || result.errorCode) return;
      const asset = result.assets?.[0];
      if (!asset) return;
      type === 'face' ? setFacePhoto(asset) : setBodyPhoto(asset);
    } catch {
      setErrorMsg('Не вдалося відкрити галерею. Перевірте дозволи у налаштуваннях телефону.');
    }
  };

  const handleAnalyze = async () => {
    setErrorMsg(null);

    if (!facePhoto?.base64) {
      setErrorMsg('Додай фото обличчя — воно необхідне для аналізу кольоротипу.');
      return;
    }
    if (limitReached) {
      setShowUpsell(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await createAnalysis({
        facePhotoBase64: facePhoto.base64,
        bodyPhotoBase64: bodyPhoto?.base64,
      });
      navigation.navigate('AnalysisLoading', { analysisId: response.analysisId });
    } catch (error: any) {
      const msg = getErrorMessage(error);
      if (msg === 'UPSELL') {
        setShowUpsell(true);
      } else {
        setErrorMsg(msg);
      }
      setIsAnalyzing(false);
    }
  };

  const handleViewResult = () => {
    setShowUpsell(false);
    if (user?.latestAnalysis?.analysisId) {
      navigation.navigate('AnalysisResults', {
        analysisResult: { _id: user.latestAnalysis.analysisId },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Завантаж фото</Text>
          <Text style={styles.subtitle}>
            Два фото дають значно точніший результат
          </Text>
        </View>

        {/* Ліміт banner */}
        {limitReached && (
          <TouchableOpacity style={styles.limitBanner} onPress={() => setShowUpsell(true)}>
            <AlertCircle color="#ffc107" size={16} strokeWidth={2} />
            <Text style={styles.limitBannerText}>
              Ліміт аналізів вичерпано.{' '}
              <Text style={styles.limitBannerLink}>Оновити план</Text>
            </Text>
          </TouchableOpacity>
        )}

        {/* Inline error */}
        {errorMsg && (
          <View style={styles.errorBanner}>
            <AlertCircle color="#e94560" size={16} strokeWidth={2} />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity onPress={() => setErrorMsg(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X color="#e94560" size={16} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        {/* Face Photo */}
        <PhotoCard
          photo={facePhoto}
          onPress={() => openSheet('face')}
          onRemove={() => setFacePhoto(null)}
          step="1"
          title="Фото обличчя"
          hint="Добре освітлення, природний або без макіяжу. Фронтальний ракурс."
          required
          Icon={User}
        />

        {/* Body Photo */}
        <PhotoCard
          photo={bodyPhoto}
          onPress={() => openSheet('body')}
          onRemove={() => setBodyPhoto(null)}
          step="2"
          title="Фото в повний ріст"
          hint="Облягаючий одяг або купальник. Потрібен для Larson Style Type."
          required={false}
          Icon={PersonStanding}
        />

        {/* Tip: without body photo */}
        {!bodyPhoto && facePhoto && (
          <View style={styles.tipBox}>
            <Info color="#C49B63" size={16} strokeWidth={2} />
            <Text style={styles.tipText}>
              Без фото в повний ріст точність Larson Style Type знижена (~50%).
              Рекомендуємо додати.
            </Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (!facePhoto || isAnalyzing || limitReached) && styles.analyzeButtonDisabled,
          ]}
          onPress={handleAnalyze}
          disabled={!facePhoto || isAnalyzing}
          activeOpacity={0.85}
        >
          {isAnalyzing ? (
            <View style={styles.btnRow}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.analyzeButtonText}>Запускаємо аналіз...</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Sparkles color="#fff" size={18} strokeWidth={2} />
              <Text style={styles.analyzeButtonText}>Розпочати AI Аналіз</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isAnalyzing}
        >
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Photo Source Sheet */}
      <PhotoSourceSheet
        visible={activeSheet !== null}
        title={activeSheet === 'face' ? 'Фото обличчя' : 'Фото в повний ріст'}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onClose={() => setActiveSheet(null)}
      />

      {/* Upsell Modal */}
      <UpsellModal
        visible={showUpsell}
        onClose={() => setShowUpsell(false)}
        onUpgrade={() => { setShowUpsell(false); navigateToSubscription(navigation); }}
        onViewResult={handleViewResult}
        hasResult={hasLatestResult}
        currentPlan={(user?.subscription?.plan as PlanId) ?? 'free'}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 24, paddingBottom: 40 },

  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#a0a0a0', lineHeight: 20 },

  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,193,7,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  limitBannerText: { flex: 1, fontSize: 13, color: '#ffc107', lineHeight: 18 },
  limitBannerLink: { fontWeight: '700', textDecorationLine: 'underline' },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(233,69,96,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(233,69,96,0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: '#e94560', lineHeight: 18 },

  // Photo Card
  photoCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  photoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  photoCardMeta: { flex: 1 },
  photoCardTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  photoCardBadge: { fontSize: 11, fontWeight: '600' as const },
  badgeRequired: { color: '#e94560' },
  badgeOptional: { color: '#a0a0a0' },
  photoHint: { fontSize: 12, color: '#777', lineHeight: 17, marginBottom: 14 },

  uploadZone: {
    borderWidth: 1.5,
    borderColor: 'rgba(196,155,99,0.3)',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadZoneIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(196,155,99,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  uploadZoneTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  uploadZoneSub: { fontSize: 12, color: '#a0a0a0' },

  previewWrap: { borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: 220, borderRadius: 12 },
  previewOverlay: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(196,155,99,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196,155,99,0.3)',
    borderRadius: 10,
    paddingVertical: 10,
  },
  previewBtnDanger: {
    backgroundColor: 'rgba(233,69,96,0.1)',
    borderColor: 'rgba(233,69,96,0.3)',
  },
  previewBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(196,155,99,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(196,155,99,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  tipText: { flex: 1, fontSize: 13, color: '#C49B63', lineHeight: 18 },

  // Buttons
  analyzeButton: {
    backgroundColor: '#C49B63',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#C49B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  analyzeButtonDisabled: { backgroundColor: 'rgba(196,155,99,0.3)', shadowOpacity: 0, elevation: 0 },
  analyzeButtonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  backButton: { alignItems: 'center', paddingVertical: 12 },
  backButtonText: { color: '#666', fontSize: 14 },
});

// ─────────────────────────────────────────────────────────────
const sheet = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1e1e30',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(196,155,99,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBody: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  optionSub: { fontSize: 12, color: '#a0a0a0' },
  cancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  cancelText: { fontSize: 15, color: '#666', fontWeight: '500' },
});

// ─────────────────────────────────────────────────────────────
const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    alignItems: 'center',
  },
  icon: { marginBottom: 12 } as any,
  title: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#a0a0a0', marginBottom: 20, textAlign: 'center' },
  plansRow: { flexDirection: 'row', gap: 10, marginBottom: 20, width: '100%' },
  planBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  planBoxPremium: { borderColor: '#C49B63', backgroundColor: 'rgba(196,155,99,0.08)' },
  planBadge: { fontSize: 10, color: '#C49B63', fontWeight: '700', marginBottom: 4 },
  planName: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
  planNameHighlight: { color: '#C49B63' },
  planPrice: { fontSize: 12, color: '#a0a0a0', marginBottom: 8 },
  planFeature: { fontSize: 11, color: '#ccc', marginBottom: 2 },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#C49B63',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#C49B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  resultButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  resultButtonText: { fontSize: 13, color: '#a0a0a0' },
  closeButton: { paddingVertical: 10 },
  closeButtonText: { fontSize: 13, color: '#555' },
});
