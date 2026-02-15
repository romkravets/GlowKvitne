import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_PLANS, ONE_TIME_PURCHASES } from '../config/firebase';

const SubscriptionScreen = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscription' | 'purchase'>(
    'subscription',
  );

  const currentPlan = user?.subscription?.plan || 'free';

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      // TODO: Implement payment integration (Stripe, LiqPay, etc.)
      Alert.alert(
        'Підписка',
        `Оплата ${planId} плану буде реалізована в наступному оновленні`,
      );
    } catch (error: any) {
      Alert.alert('Помилка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    setLoading(true);
    try {
      // TODO: Implement payment integration
      Alert.alert(
        'Покупка',
        `Оплата ${productId} буде реалізована в наступному оновленні`,
      );
    } catch (error: any) {
      Alert.alert('Помилка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSubscriptionPlans = () => {
    return Object.values(SUBSCRIPTION_PLANS).map(plan => {
      const isCurrentPlan = currentPlan === plan.id;
      const isFree = plan.id === 'free';

      return (
        <View
          key={plan.id}
          style={[
            styles.planCard,
            isCurrentPlan && styles.planCardActive,
            plan.id === 'premium' && styles.planCardPremium,
          ]}
        >
          {plan.id === 'premium' && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Найпопулярніше</Text>
            </View>
          )}

          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>{plan.price.UAH} ₴</Text>
            {!isFree && <Text style={styles.planPeriod}>/місяць</Text>}
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem
              text={
                plan.features.analysesPerMonth === -1
                  ? 'Необмежено аналізів'
                  : `${plan.features.analysesPerMonth} ${
                      plan.features.analysesPerMonth === 1
                        ? 'аналіз'
                        : 'аналізи'
                    } на місяць`
              }
              included
            />
            <FeatureItem
              text={
                plan.features.outfitsPerMonth === -1
                  ? 'Необмежено образів'
                  : `${plan.features.outfitsPerMonth} образів на місяць`
              }
              included
            />
            <FeatureItem
              text="Детальний аналіз"
              included={plan.features.detailedAnalysis}
            />
            <FeatureItem
              text="Celebrity Twins"
              included={plan.features.celebrityTwins}
            />
            <FeatureItem
              text="PDF експорт"
              included={plan.features.pdfExport}
            />
            {plan.features.prioritySupport && (
              <FeatureItem text="Пріоритетна підтримка" included />
            )}
          </View>

          {!isCurrentPlan && (
            <TouchableOpacity
              style={[
                styles.planButton,
                plan.id === 'premium' && styles.planButtonPremium,
              ]}
              onPress={() => handleSubscribe(plan.id)}
              disabled={loading || isFree}
            >
              <Text
                style={[
                  styles.planButtonText,
                  plan.id === 'premium' && styles.planButtonTextPremium,
                ]}
              >
                {isFree ? 'Поточний план' : 'Обрати план'}
              </Text>
            </TouchableOpacity>
          )}

          {isCurrentPlan && (
            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanText}>✓ Ваш поточний план</Text>
            </View>
          )}
        </View>
      );
    });
  };

  const renderOneTimePurchases = () => {
    return Object.values(ONE_TIME_PURCHASES).map(product => (
      <View key={product.id} style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.productPriceBox}>
            <Text style={styles.productPrice}>{product.price.UAH} ₴</Text>
          </View>
        </View>

        <Text style={styles.productDescription}>{product.description}</Text>

        <TouchableOpacity
          style={styles.productButton}
          onPress={() => handlePurchase(product.id)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.productButtonText}>Купити</Text>
          )}
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Підписки та покупки</Text>
        <Text style={styles.subtitle}>Обери свій план або купи разово</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subscription' && styles.tabActive]}
          onPress={() => setActiveTab('subscription')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'subscription' && styles.tabTextActive,
            ]}
          >
            Підписки
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'purchase' && styles.tabActive]}
          onPress={() => setActiveTab('purchase')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'purchase' && styles.tabTextActive,
            ]}
          >
            Разові покупки
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {activeTab === 'subscription'
          ? renderSubscriptionPlans()
          : renderOneTimePurchases()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Всі ціни вказані в гривнях (UAH). Підписка автоматично продовжується
            щомісяця.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const FeatureItem = ({
  text,
  included,
}: {
  text: string;
  included: boolean;
}) => (
  <View style={styles.featureItem}>
    <Text style={[styles.featureIcon, !included && styles.featureIconDisabled]}>
      {included ? '✓' : '✗'}
    </Text>
    <Text style={[styles.featureText, !included && styles.featureTextDisabled]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#e94560',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0a0a0',
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    position: 'relative',
  },
  planCardActive: {
    borderColor: '#e94560',
    borderWidth: 2,
  },
  planCardPremium: {
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    borderColor: '#e94560',
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#e94560',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  planPeriod: {
    fontSize: 16,
    color: '#a0a0a0',
    marginLeft: 4,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 18,
    color: '#4caf50',
    marginRight: 12,
    width: 24,
  },
  featureIconDisabled: {
    color: '#666',
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
  },
  featureTextDisabled: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  planButton: {
    backgroundColor: '#e94560',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  planButtonPremium: {
    backgroundColor: '#fff',
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  planButtonTextPremium: {
    color: '#e94560',
  },
  currentPlanBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4caf50',
  },
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  productPriceBox: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  productDescription: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 16,
  },
  productButton: {
    backgroundColor: '#e94560',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  productButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    padding: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;
