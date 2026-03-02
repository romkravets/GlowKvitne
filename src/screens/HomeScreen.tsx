import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { checkApiStatus } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { navigateToSubscription } from '../navigation/helpers';
import { HomeStackParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
};

// Дзеркалює canUserAnalyze з billing.js
function canUserAnalyze(user: any): boolean {
  if (!user?.subscription) return false;
  const plan = user.subscription.plan || 'free';
  const limits: Record<string, number> = { free: 1, basic: 5, premium: -1 };
  const limit = limits[plan] ?? 1;
  if (limit === -1) return true;
  const used = user.subscription.usage?.analysesThisMonth || 0;
  if (used < limit) return true;
  const singles = (user.purchases || []).filter(
    (p: any) => p.productId === 'single_analysis' && p.status === 'completed',
  );
  const bought = singles.reduce(
    (s: number, p: any) => s + (p.quantity || 1),
    0,
  );
  const usedP = singles.reduce((s: number, p: any) => s + (p.used || 0), 0);
  return usedP < bought;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const [isServerRunning, setIsServerRunning] = useState<boolean | null>(null);

  const limitReached = user ? !canUserAnalyze(user) : false;
  const hasResult = !!user?.latestAnalysis?.analysisId;
  const plan = user?.subscription?.plan || 'free';
  const analysesUsed = user?.subscription?.usage?.analysesThisMonth || 0;
  const limits: Record<string, number> = { free: 1, basic: 5, premium: -1 };
  const analysesLimit = limits[plan] ?? 1;

  useEffect(() => {
    checkServer();
  }, []);

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>✨</Text>
        <Text style={styles.title}>GlowKvitne</Text>
        <Text style={styles.subtitle}>Fashion Analysis</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Отримай персональний аналіз свого колориту та типу фігури
        </Text>

        {/* Статус аналізів */}
        {user && (
          <View
            style={[styles.statusBar, limitReached && styles.statusBarWarning]}
          >
            {analysesLimit === -1 ? (
              <Text style={styles.statusText}>
                ✅ Безліміт аналізів (Premium)
              </Text>
            ) : limitReached ? (
              <Text style={[styles.statusText, styles.statusTextWarning]}>
                ⚠️ Ліміт вичерпано: {analysesUsed}/{analysesLimit} аналізів
                цього місяця
              </Text>
            ) : (
              <Text style={styles.statusText}>
                📊 {analysesUsed}/{analysesLimit} аналізів використано
              </Text>
            )}
          </View>
        )}

        <View style={styles.features}>
          <FeatureItem
            icon="🎨"
            title="Larson Color Analysis"
            description="12 сезонних колоротипів"
          />
          <FeatureItem
            icon="⭐"
            title="Celebrity Twins"
            description="Знаменитості з твоїм типом"
          />
        </View>

        {isServerRunning === false && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ Сервер не відповідає. Спробуйте знову або перевірте підключення
              до інтернету.
            </Text>
          </View>
        )}

        {/* Головна кнопка */}
        {limitReached ? (
          // Ліміт вичерпано → показуємо upsell кнопку
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigateToSubscription(navigation)}
          >
            <Text style={styles.upgradeButtonText}>
              🚀 Отримати більше аналізів
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              isServerRunning === false && styles.buttonDisabled,
            ]}
            onPress={handleStartAnalysis}
            disabled={isServerRunning === false}
          >
            {isServerRunning === null ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Почати Аналіз</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Кнопка переглянути попередній результат */}
        {hasResult && (
          <TouchableOpacity
            style={styles.resultButton}
            onPress={handleViewResult}
          >
            <Text style={styles.resultButtonText}>
              📋 Переглянути{' '}
              {limitReached ? 'результат' : 'попередній результат'}
            </Text>
          </TouchableOpacity>
        )}

        {isServerRunning === false && (
          <TouchableOpacity style={styles.retryButton} onPress={checkServer}>
            <Text style={styles.retryText}>🔄 Перевірити знову</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  logo: { fontSize: 60, marginBottom: 10 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: '#666' },

  content: { flex: 1, padding: 20 },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
  },

  statusBar: {
    backgroundColor: '#e7f3ff',
    borderWidth: 1,
    borderColor: '#b3d9ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  statusBarWarning: { backgroundColor: '#fff3cd', borderColor: '#ffc107' },
  statusText: { fontSize: 13, color: '#004085', textAlign: 'center' },
  statusTextWarning: { color: '#856404' },

  features: { marginBottom: 28 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  featureIcon: { fontSize: 32, marginRight: 15 },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: { fontSize: 14, color: '#666' },

  button: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: { backgroundColor: '#ccc', shadowOpacity: 0 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },

  upgradeButton: {
    backgroundColor: '#e94560',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },

  resultButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultButtonText: { color: '#667eea', fontSize: 15, fontWeight: '500' },

  warning: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  warningText: { color: '#856404', fontSize: 14, textAlign: 'center' },

  retryButton: { padding: 15, alignItems: 'center', marginTop: 10 },
  retryText: { color: '#667eea', fontSize: 16, fontWeight: '500' },
});
