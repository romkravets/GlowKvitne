import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createAnalysis } from '../api/analysisApi';
import { useAuth } from '../context/AuthContext';
import { navigateToSubscription } from '../navigation/helpers';
import { HomeStackParamList } from '../navigation/types';

type PhotoUploadScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'PhotoUpload'>;
};

// ─────────────────────────────────────────────────────────────
// Перевірка ліміту на фронті (дзеркалює billing.js на бекенді)
// ─────────────────────────────────────────────────────────────
function canUserAnalyze(user: any): boolean {
  if (!user?.subscription) return false;

  const plan = user.subscription.plan || 'free';
  const status = user.subscription.status || 'expired';
  const expiresAt = user.subscription.expiresAt;

  // Перевірка активності підписки (крім free)
  if (plan !== 'free') {
    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
    if (status !== 'active' || !expiresAtDate || expiresAtDate <= new Date()) {
      // підписка неактивна — поводимось як free
    }
  }

  const limits: Record<string, number> = { free: 1, basic: 5, premium: -1 };
  const limit = limits[plan] ?? 1;

  if (limit === -1) return true; // безліміт

  const used = user.subscription.usage?.analysesThisMonth || 0;
  if (used < limit) return true;

  // Перевіряємо разові покупки
  const singlePurchases = (user.purchases || []).filter(
    (p: any) => p.productId === 'single_analysis' && p.status === 'completed',
  );
  const totalBought = singlePurchases.reduce(
    (s: number, p: any) => s + (p.quantity || 1),
    0,
  );
  const totalUsed = singlePurchases.reduce(
    (s: number, p: any) => s + (p.used || 0),
    0,
  );

  return totalUsed < totalBought;
}

// ─────────────────────────────────────────────────────────────
// Upsell Modal
// ─────────────────────────────────────────────────────────────
const UpsellModal = ({
  visible,
  onClose,
  onUpgrade,
  onViewResult,
  hasResult,
}: {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onViewResult: () => void;
  hasResult: boolean;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={modal.overlay}>
      <View style={modal.container}>
        <Text style={modal.emoji}>✨</Text>
        <Text style={modal.title}>Ліміт аналізів вичерпано</Text>
        <Text style={modal.subtitle}>
          На безкоштовному плані доступний 1 аналіз на місяць.{'\n'}
          Оновіть план щоб отримати більше!
        </Text>

        {/* Плани */}
        <View style={modal.plansRow}>
          <View style={modal.planBox}>
            <Text style={modal.planName}>Basic</Text>
            <Text style={modal.planPrice}>199 ₴/міс</Text>
            <Text style={modal.planFeature}>✓ 5 аналізів</Text>
            <Text style={modal.planFeature}>✓ Макіяж + волосся</Text>
          </View>
          <View style={[modal.planBox, modal.planBoxPremium]}>
            <Text style={modal.planBadge}>🔥 Топ</Text>
            <Text style={[modal.planName, { color: '#e94560' }]}>Premium</Text>
            <Text style={modal.planPrice}>399 ₴/міс</Text>
            <Text style={modal.planFeature}>✓ Безліміт</Text>
            <Text style={modal.planFeature}>✓ Celebrity Twins</Text>
          </View>
        </View>

        <TouchableOpacity style={modal.upgradeButton} onPress={onUpgrade}>
          <Text style={modal.upgradeButtonText}>Обрати план</Text>
        </TouchableOpacity>

        {hasResult && (
          <TouchableOpacity style={modal.resultButton} onPress={onViewResult}>
            <Text style={modal.resultButtonText}>
              Переглянути попередній результат
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={modal.closeButton} onPress={onClose}>
          <Text style={modal.closeButtonText}>Закрити</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function PhotoUploadScreen({
  navigation,
}: PhotoUploadScreenProps) {
  const { user } = useAuth();
  const [facePhoto, setFacePhoto] = useState<Asset | null>(null);
  const [bodyPhoto, setBodyPhoto] = useState<Asset | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  const hasLatestResult = !!user?.latestAnalysis?.analysisId;

  const pickImage = async (type: 'face' | 'body') => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    });
    if (result.assets?.[0]) {
      type === 'face'
        ? setFacePhoto(result.assets[0])
        : setBodyPhoto(result.assets[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!facePhoto?.base64) {
      Alert.alert('Помилка', 'Будь ласка, додай фото обличчя');
      return;
    }

    // ── Перевірка ліміту на фронті ──────────────────────────────
    if (!canUserAnalyze(user)) {
      setShowUpsell(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await createAnalysis({
        facePhotoBase64: facePhoto.base64,
        bodyPhotoBase64: bodyPhoto?.base64,
      });

      navigation.navigate('AnalysisLoading', {
        analysisId: response.analysisId,
      });
    } catch (error: any) {
      // ── Обробка 403 з бекенду (подвійний захист) ────────────────
      if (error.response?.status === 403) {
        const code = error.response?.data?.code;
        if (code === 'LIMIT/EXCEEDED' || code === 'ANALYSIS/LIMIT_REACHED') {
          setShowUpsell(true);
          setIsAnalyzing(false);
          return;
        }
      }

      Alert.alert(
        'Помилка',
        error.response?.data?.message ||
          error.message ||
          'Не вдалося створити аналіз. Перевір підключення до інтернету.',
      );
      setIsAnalyzing(false);
    }
  };

  const handleViewResult = () => {
    setShowUpsell(false);
    if (user?.latestAnalysis?.analysisId) {
      // Переходимо до попереднього аналізу
      navigation.navigate('AnalysisResults', {
        analysisResult: { _id: user.latestAnalysis.analysisId },
      });
    }
  };

  const handleUpgrade = () => {
    setShowUpsell(false);
    navigateToSubscription(navigation);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Завантаж Фото</Text>
        <Text style={styles.subtitle}>
          Для найточнішого аналізу додай 2 фото
        </Text>

        {/* Банер ліміту якщо вичерпано */}
        {!canUserAnalyze(user) && (
          <TouchableOpacity
            style={styles.limitBanner}
            onPress={() => setShowUpsell(true)}
          >
            <Text style={styles.limitBannerText}>
              ⚠️ Ліміт аналізів вичерпано.{' '}
              <Text style={styles.limitBannerLink}>Оновити план →</Text>
            </Text>
          </TouchableOpacity>
        )}

        {/* Face Photo */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>
            1️⃣ Фото обличчя <Text style={styles.required}>(обов'язково)</Text>
          </Text>
          <Text style={styles.photoHint}>
            Обличчя має бути добре освітлене, природний макіяж або без нього
          </Text>

          {facePhoto ? (
            <View style={styles.photoPreview}>
              <Image
                source={{ uri: facePhoto.uri }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => pickImage('face')}
              >
                <Text style={styles.changeButtonText}>Змінити фото</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage('face')}
            >
              <Text style={styles.uploadIcon}>📸</Text>
              <Text style={styles.uploadText}>Вибрати фото обличчя</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Body Photo */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>
            2️⃣ Фото в повний ріст{' '}
            <Text style={styles.optional}>(опціонально)</Text>
          </Text>
          <Text style={styles.photoHint}>
            Для точного Kibbe аналізу. Облягаючий одяг або купальник
          </Text>

          {bodyPhoto ? (
            <View style={styles.photoPreview}>
              <Image
                source={{ uri: bodyPhoto.uri }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => pickImage('body')}
              >
                <Text style={styles.changeButtonText}>Змінити фото</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.uploadButton, styles.uploadButtonSecondary]}
              onPress={() => pickImage('body')}
            >
              <Text style={styles.uploadIcon}>🧍</Text>
              <Text style={styles.uploadText}>Вибрати фото тіла</Text>
            </TouchableOpacity>
          )}
        </View>

        {!bodyPhoto && facePhoto && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Без фото в повний ріст Kibbe аналіз буде попереднім (~50%
              точність)
            </Text>
          </View>
        )}

        {/* Analyze Button */}
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (!facePhoto || isAnalyzing) && styles.analyzeButtonDisabled,
          ]}
          onPress={handleAnalyze}
          disabled={!facePhoto || isAnalyzing}
        >
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.analyzeButtonText}>Аналіз... (1-3 хв)</Text>
            </View>
          ) : (
            <Text style={styles.analyzeButtonText}>🔬 Розпочати AI Аналіз</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isAnalyzing}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Upsell Modal */}
      <UpsellModal
        visible={showUpsell}
        onClose={() => setShowUpsell(false)}
        onUpgrade={handleUpgrade}
        onViewResult={handleViewResult}
        hasResult={hasLatestResult}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingTop: 40 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },

  limitBanner: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  limitBannerText: { fontSize: 14, color: '#856404', lineHeight: 20 },
  limitBannerLink: { fontWeight: '700', textDecorationLine: 'underline' },

  photoSection: { marginBottom: 30 },
  photoLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  required: { color: '#dc3545', fontSize: 14 },
  optional: { color: '#6c757d', fontSize: 14 },
  photoHint: { fontSize: 14, color: '#666', marginBottom: 15, lineHeight: 20 },

  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  uploadButtonSecondary: { borderColor: '#ccc' },
  uploadIcon: { fontSize: 48, marginBottom: 10 },
  uploadText: { fontSize: 16, color: '#667eea', fontWeight: '500' },

  photoPreview: { alignItems: 'center' },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 15,
  },
  changeButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  changeButtonText: { color: '#667eea', fontSize: 14, fontWeight: '500' },

  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  infoText: { fontSize: 14, color: '#004085', lineHeight: 20 },

  analyzeButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  analyzeButtonDisabled: { backgroundColor: '#ccc', shadowOpacity: 0 },
  analyzeButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  analyzingContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  backButton: { padding: 15, alignItems: 'center' },
  backButtonText: { color: '#667eea', fontSize: 16 },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
  },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  plansRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  planBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  planBoxPremium: {
    borderColor: '#e94560',
    backgroundColor: 'rgba(233,69,96,0.1)',
  },
  planBadge: {
    fontSize: 11,
    color: '#e94560',
    fontWeight: '700',
    marginBottom: 4,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  planPrice: { fontSize: 14, color: '#a0a0a0', marginBottom: 10 },
  planFeature: { fontSize: 12, color: '#ccc', marginBottom: 3 },

  upgradeButton: {
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  resultButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  resultButtonText: { fontSize: 14, color: '#ccc', fontWeight: '500' },

  closeButton: { alignItems: 'center', paddingVertical: 10 },
  closeButtonText: { fontSize: 14, color: '#666' },
});
