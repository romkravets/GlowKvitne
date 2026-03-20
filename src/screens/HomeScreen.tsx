import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  Palette,
  Shirt,
  Star,
  ScanFace,
  Store,
  Users,
  BarChart2,
  Sparkles,
  Newspaper,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  Rocket,
  type LucideProps,
} from 'lucide-react-native';

type IconComponent = React.FC<LucideProps>;
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { checkApiStatus } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getClients } from '../api/clientsApi';
import { navigateToSubscription } from '../navigation/helpers';
import { HomeStackParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
};

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  basic: 5,
  premium: -1,
  stylist: -1,
};

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

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, refreshUser } = useAuth();
  const [isServerRunning, setIsServerRunning] = useState<boolean | null>(null);
  const [clientsCount, setClientsCount] = useState<number | null>(null);

  const plan = user?.subscription?.plan || 'free';
  const analysesUsed = user?.subscription?.usage?.analysesThisMonth || 0;
  const analysesLimit =
    user?.subscription?.limits?.analysesPerMonth ??
    PLAN_LIMITS[plan] ??
    1;
  const limitReached = user ? !canUserAnalyze(user) : false;
  const hasResult = !!user?.latestAnalysis?.analysisId;
  const isUnlimited = analysesLimit === -1;
  const isStylist = plan === 'stylist';

  useEffect(() => {
    checkServer();
  }, []);

  // Оновлюємо user при поверненні на екран — refreshUser стабільна (useCallback в AuthContext)
  useFocusEffect(useCallback(() => { refreshUser(); }, [refreshUser]));

  // Завантажуємо кількість клієнтів тільки коли isStylist стає true
  useEffect(() => {
    if (!isStylist) return;
    getClients()
      .then(data => setClientsCount(data.count))
      .catch(() => setClientsCount(null));
  }, [isStylist]);

  const checkServer = async () => {
    const status = await checkApiStatus();
    setIsServerRunning(status);
  };

  const handleStartAnalysis = () => {
    if (limitReached) {
      navigateToSubscription(navigation);
      return;
    }
    navigation.navigate('PhotoUpload');
  };

  const handleViewResult = () => {
    navigation.navigate('AnalysisResults', {
      analysisResult: { _id: user!.latestAnalysis!.analysisId },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Sparkles color="#C49B63" size={48} strokeWidth={1.5} />
        <Text style={styles.title}>GlowKvitne</Text>
        <Text style={styles.subtitle}>AI Fashion & Style Analysis</Text>
      </View>

      {/* Description */}
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>
          Персональний AI-стиліст у кишені. Визначаємо твій кольоротип (16 сезонів),
          Larson Style Type, підбираємо палітру кольорів, образи, макіяж та
          celebrity twins. Virtual Try-On, статті та каталог салонів — все в одному.
        </Text>
      </View>

      {/* Статус аналізів */}
      {user && (
        <View style={[styles.statusBar, limitReached && styles.statusBarWarning]}>
          {isUnlimited ? (
            <Text style={styles.statusText}>
              ✅ Безліміт аналізів ({isStylist ? 'Стиліст' : 'Premium'})
            </Text>
          ) : limitReached ? (
            <Text style={[styles.statusText, styles.statusTextWarning]}>
              ⚠️ Ліміт вичерпано: {analysesUsed}/{analysesLimit} аналізів цього місяця
            </Text>
          ) : (
            <Text style={styles.statusText}>
              📊 {analysesUsed}/{analysesLimit} аналізів використано цього місяця
            </Text>
          )}
        </View>
      )}

      {/* Stylist Dashboard */}
      {isStylist && (
        <View style={styles.stylistSection}>
          <Text style={styles.stylistSectionTitle}>Панель стиліста</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{analysesUsed}</Text>
              <Text style={styles.statLabel}>аналізів{'\n'}цього місяця</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {clientsCount === null ? '—' : clientsCount}
              </Text>
              <Text style={styles.statLabel}>клієнтів{'\n'}у базі</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.clientsButton}
            onPress={() => (navigation as any).navigate('ProfileTab', {
              screen: 'MyClients',
            })}
          >
            <Users color="#C49B63" size={24} strokeWidth={1.8} />
            <View style={styles.clientsButtonBody}>
              <Text style={styles.clientsButtonTitle}>Мої клієнти</Text>
              <Text style={styles.clientsButtonSub}>
                CRM, аналізи, брендований PDF
              </Text>
            </View>
            <ChevronRight color="#555" size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}

      {/* Features */}
      <View style={styles.features}>
        <FeatureItem Icon={Palette}   title="Кольоротип"       description="16 сезонів + еталонна палітра Sci/ART" />
        <FeatureItem Icon={Shirt}     title="Larson Style Type" description="5 типів: Dramatic, Natural, Classic, Romantic, Gamine" />
        <FeatureItem Icon={Star}      title="Celebrity Twins"   description="Знаменитості з твоїм типом, включно з українськими" />
        <FeatureItem Icon={ScanFace}  title="Virtual Try-On"    description="Зміна зачіски, кольору волосся, макіяжу" />
        <FeatureItem Icon={Store}     title="Салони"            description="Каталог салонів краси зі спеціалізацією" />
        <FeatureItem Icon={Newspaper} title="Статті"            description="Стиль, кольори, тренди для твого типу" />
        <FeatureItem Icon={BarChart2} title="Мої аналізи"       description="Історія, порівняння, прогрес" />
      </View>

      {/* Server warning */}
      {isServerRunning === false && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ Сервер не відповідає. Перевірте підключення до інтернету.
          </Text>
        </View>
      )}

      {/* Головна кнопка */}
      {limitReached ? (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => navigateToSubscription(navigation)}
        >
          <View style={styles.btnRow}>
            <Rocket color="#fff" size={18} strokeWidth={2} />
            <Text style={styles.upgradeButtonText}>Отримати більше аналізів</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.analyzeButton, isServerRunning === false && styles.analyzeButtonDisabled]}
          onPress={handleStartAnalysis}
          disabled={isServerRunning === false}
        >
          {isServerRunning === null ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnRow}>
              <Sparkles color="#fff" size={18} strokeWidth={2} />
              <Text style={styles.analyzeButtonText}>Почати AI Аналіз</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {hasResult && (
        <TouchableOpacity style={styles.resultButton} onPress={handleViewResult}>
          <View style={styles.btnRow}>
            <ClipboardList color="#a0a0a0" size={16} strokeWidth={2} />
            <Text style={styles.resultButtonText}>
              {limitReached ? 'Переглянути результат' : 'Попередній результат'}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {isServerRunning === false && (
        <TouchableOpacity style={styles.retryButton} onPress={checkServer}>
          <View style={styles.btnRow}>
            <RefreshCw color="#C49B63" size={16} strokeWidth={2} />
            <Text style={styles.retryText}>Перевірити знову</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function FeatureItem({
  Icon,
  title,
  description,
}: {
  Icon: IconComponent;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconWrap}>
        <Icon color="#C49B63" size={22} strokeWidth={1.8} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingTop: 48, paddingBottom: 40 },

  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 52, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#a0a0a0', letterSpacing: 0.5 },

  descriptionCard: {
    backgroundColor: 'rgba(196,155,99,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(196,155,99,0.25)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#c8c8c8',
    lineHeight: 22,
    textAlign: 'center',
  },

  statusBar: {
    backgroundColor: 'rgba(196,155,99,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196,155,99,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  statusBarWarning: {
    backgroundColor: 'rgba(255,193,7,0.1)',
    borderColor: 'rgba(255,193,7,0.4)',
  },
  statusText: { fontSize: 13, color: '#C49B63', textAlign: 'center', fontWeight: '500' },
  statusTextWarning: { color: '#ffc107' },

  // Stylist Dashboard
  stylistSection: {
    backgroundColor: 'rgba(196,155,99,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(196,155,99,0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  stylistSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C49B63',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#a0a0a0', textAlign: 'center', lineHeight: 16 },

  clientsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  clientsButtonIcon: { fontSize: 24 },
  clientsButtonBody: { flex: 1 },
  clientsButtonTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  clientsButtonSub: { fontSize: 12, color: '#a0a0a0' },
  clientsButtonArrow: { fontSize: 22, color: '#555' },

  // Features
  features: { marginBottom: 28, gap: 10 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  featureIcon: { fontSize: 28 },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(196,155,99,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  featureDescription: { fontSize: 12, color: '#a0a0a0', lineHeight: 16 },

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
  analyzeButtonDisabled: { backgroundColor: '#555', shadowOpacity: 0 },
  analyzeButtonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },

  upgradeButton: {
    backgroundColor: '#e94560',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  resultButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resultButtonText: { color: '#a0a0a0', fontSize: 14, fontWeight: '500' },

  warning: {
    backgroundColor: 'rgba(255,193,7,0.1)',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.3)',
  },
  warningText: { color: '#ffc107', fontSize: 13, textAlign: 'center' },

  retryButton: { padding: 14, alignItems: 'center' },
  retryText: { color: '#C49B63', fontSize: 15, fontWeight: '500' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
