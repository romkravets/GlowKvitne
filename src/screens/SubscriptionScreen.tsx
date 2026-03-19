import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/firebase';

// ─── Types ────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: { UAH: number };
  tier: number;
  badge: string | null;
  interval?: string;
  limits: { analysesPerMonth: number; outfitsPerMonth: number };
  features: string[];
}

// ─── Hardcoded one-time purchases (no backend endpoint yet) ───

const ONE_TIME_PURCHASES = [
  { id: 'single_analysis', name: 'Разовий аналіз', price: 149, description: 'Один повний аналіз без підписки' },
  { id: 'outfit_pack_10', name: 'Пакет 10 образів', price: 199, description: '10 згенерованих образів' },
  { id: 'pdf_style_guide', name: 'PDF Style Guide', price: 99, description: 'Детальний гайд вашого стилю у PDF форматі' },
];

// ─── Screen ───────────────────────────────────────────────────

const SubscriptionScreen = ({ navigation }: { navigation: any }) => {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscription' | 'purchase'>('subscription');

  const currentPlan = user?.subscription?.plan || 'free';

  // Fetch plans from backend — single source of truth
  useEffect(() => {
    axios
      .get(`${API_CONFIG.baseURL}/api/subscription/plans`)
      .then(res => setPlans(res.data.plans ?? []))
      .catch(() => Alert.alert('Помилка', 'Не вдалося завантажити плани'))
      .finally(() => setPlansLoading(false));
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    setSubscribing(true);
    try {
      const confirmed = await new Promise<boolean>(resolve => {
        Alert.alert(
          'Тестове замовлення плану',
          `Підтвердити тестове підключення плану "${plan.name}"?`,
          [
            { text: 'Скасувати', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Підтвердити', style: 'default', onPress: () => resolve(true) },
          ],
        );
      });

      if (!confirmed) return;

      await axios.post(`${API_CONFIG.baseURL}/api/subscription/upgrade`, { planId: plan.id });
      await refreshUser();

      Alert.alert('Готово ✓', `План змінено на "${plan.name}"`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Невідома помилка';
      Alert.alert('Помилка', message);
    } finally {
      setSubscribing(false);
    }
  };

  const handlePurchase = (productId: string) => {
    Alert.alert('Покупка', `Оплата ${productId} буде реалізована в наступному оновленні`);
  };

  const currentTier = plans.find(p => p.id === currentPlan)?.tier ?? 0;

  const renderPlans = () => {
    if (plansLoading) {
      return <ActivityIndicator color="#C49B63" style={styles.loader} />;
    }

    return plans.map(plan => {
      const isCurrentPlan = currentPlan === plan.id;
      const isFree = plan.id === 'free';
      const isPremium = plan.id === 'premium';
      const isBasic = plan.id === 'basic';
      const isStylist = plan.id === 'stylist';
      const isUpgrade = plan.tier > currentTier;

      return (
        <View
          key={plan.id}
          style={[
            styles.planCard,
            isCurrentPlan && styles.planCardActive,
            isPremium && styles.planCardPremium,
            isBasic && styles.planCardBasic,
            isStylist && styles.planCardStylist,
          ]}
        >
          {plan.badge && (
            <View style={[
              styles.badge,
              isPremium && styles.badgePremium,
              isBasic && styles.badgeBasic,
              isStylist && styles.badgeStylist,
            ]}>
              <Text style={styles.badgeText}>{plan.badge}</Text>
            </View>
          )}

          <Text style={styles.planName}>{plan.name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>{plan.price.UAH} ₴</Text>
            {!isFree && <Text style={styles.planPeriod}>/місяць</Text>}
          </View>

          <View style={styles.featuresContainer}>
            {plan.features.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {isCurrentPlan ? (
            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanText}>✓ Ваш поточний план</Text>
            </View>
          ) : isFree ? null : (
            <TouchableOpacity
              style={[
                styles.planButton,
                isPremium && styles.planButtonPremium,
                isBasic && styles.planButtonBasic,
                isStylist && styles.planButtonStylist,
                !isUpgrade && styles.planButtonDowngrade,
              ]}
              onPress={() => handleSubscribe(plan)}
              disabled={subscribing}
            >
              {subscribing ? (
                <ActivityIndicator color={isPremium ? '#e94560' : '#fff'} />
              ) : (
                <Text style={[
                  styles.planButtonText,
                  isPremium && styles.planButtonTextPremium,
                ]}>
                  {isUpgrade ? 'Покращити план' : 'Перейти на цей план'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      );
    });
  };

  const renderPurchases = () =>
    ONE_TIME_PURCHASES.map(product => (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.productPriceBox}>
            <Text style={styles.productPrice}>{product.price} ₴</Text>
          </View>
        </View>
        <Text style={styles.productDescription}>{product.description}</Text>
        <TouchableOpacity
          style={styles.productButton}
          onPress={() => handlePurchase(product.id)}
        >
          <Text style={styles.productButtonText}>Купити</Text>
        </TouchableOpacity>
      </View>
    ));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Підписки та покупки</Text>
        <Text style={styles.subtitle}>Обери свій план або купи разово</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subscription' && styles.tabActive]}
          onPress={() => setActiveTab('subscription')}
        >
          <Text style={[styles.tabText, activeTab === 'subscription' && styles.tabTextActive]}>
            Підписки
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'purchase' && styles.tabActive]}
          onPress={() => setActiveTab('purchase')}
        >
          <Text style={[styles.tabText, activeTab === 'purchase' && styles.tabTextActive]}>
            Разові покупки
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'subscription' ? renderPlans() : renderPurchases()}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Всі ціни вказані в гривнях (UAH). Підписка автоматично продовжується щомісяця.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 15, color: '#a0a0a0', fontWeight: '600' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a0a0a0' },

  tabs: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20, gap: 12 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  tabActive: { backgroundColor: '#e94560' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#a0a0a0' },
  tabTextActive: { color: '#fff' },

  scrollView: { flex: 1, paddingHorizontal: 24 },

  planCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    position: 'relative',
  },
  planCardActive: { borderColor: '#e94560', borderWidth: 2 },
  planCardPremium: { backgroundColor: 'rgba(233,69,96,0.1)', borderColor: '#e94560' },
  planCardBasic: { backgroundColor: 'rgba(100,149,237,0.08)', borderColor: 'rgba(100,149,237,0.4)' },
  planCardStylist: { backgroundColor: 'rgba(196,155,99,0.1)', borderColor: '#C49B63' },

  badge: {
    position: 'absolute', top: 16, right: 16,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8,
    backgroundColor: '#555',
  },
  badgePremium: { backgroundColor: '#e94560' },
  badgeBasic: { backgroundColor: '#6495ed' },
  badgeStylist: { backgroundColor: '#C49B63' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  planName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  planPrice: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  planPeriod: { fontSize: 16, color: '#a0a0a0', marginLeft: 4 },

  featuresContainer: { gap: 12, marginBottom: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { fontSize: 16, color: '#4caf50', marginRight: 12, width: 22 },
  featureText: { fontSize: 14, color: '#fff', flex: 1 },

  planButton: { backgroundColor: '#e94560', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  planButtonPremium: { backgroundColor: '#fff' },
  planButtonBasic: { backgroundColor: '#6495ed' },
  planButtonStylist: { backgroundColor: '#C49B63' },
  planButtonDowngrade: { backgroundColor: 'rgba(255,255,255,0.1)' },
  planButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  planButtonTextPremium: { color: '#e94560' },

  currentPlanBadge: { backgroundColor: 'rgba(76,175,80,0.2)', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  currentPlanText: { fontSize: 14, fontWeight: '600', color: '#4caf50' },

  productCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  productName: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1 },
  productPriceBox: { backgroundColor: '#e94560', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  productPrice: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  productDescription: { fontSize: 14, color: '#a0a0a0', marginBottom: 16 },
  productButton: { backgroundColor: '#e94560', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  productButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  loader: { marginTop: 40 },
  footer: { padding: 20, marginBottom: 40 },
  footerText: { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 18 },
});

export default SubscriptionScreen;
