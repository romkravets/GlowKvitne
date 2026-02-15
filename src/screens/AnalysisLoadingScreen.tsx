/**
 * Analysis Loading Screen
 * Екран під час обробки аналізу з реальним polling
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';
import { pollAnalysisStatus } from '../api/analysisApi';

const LOADING_STEPS = [
  { id: 1, text: 'Аналізуємо підтон шкіри...', duration: 3000 },
  { id: 2, text: 'Визначаємо колоротип...', duration: 4000 },
  { id: 3, text: 'Підбираємо палітру...', duration: 3000 },
  { id: 4, text: 'Шукаємо celebrity twins...', duration: 3000 },
];

const FUN_FACTS = [
  'Знали ви, що ваш колоротип впливає не тільки на одяг, але й на макіяж та колір волосся?',
  'Правильні кольори можуть зробити вас на 5-10 років молодшою!',
  'Теорія Kibbe базується на балансі інь та ян у вашій фігурі.',
  'Більшість людей носять кольори, які їм не підходять.',
];

interface AnalysisLoadingScreenProps extends NavigationProps {
  route: {
    params: {
      analysisId: string;
    };
  };
}

const AnalysisLoadingScreen: React.FC<AnalysisLoadingScreenProps> = ({
  navigation,
  route,
}) => {
  const { analysisId } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animation effect - runs once
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [scaleAnim]);

  // Progress steps effect - runs once
  useEffect(() => {
    let stepTimeout: ReturnType<typeof setTimeout>;

    const progressSteps = (step: number) => {
      if (step >= LOADING_STEPS.length) return;

      stepTimeout = setTimeout(() => {
        setCurrentStep(step);
        progressSteps(step + 1);
      }, LOADING_STEPS[step - 1]?.duration || 3000);
    };

    progressSteps(1);

    return () => {
      clearTimeout(stepTimeout);
    };
  }, []);

  // Fun facts rotation - runs once
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % FUN_FACTS.length);
    }, 10000);

    return () => {
      clearInterval(factInterval);
    };
  }, []);

  // Real API polling - runs ONCE on mount
  useEffect(() => {
    let isCancelled = false;

    const startPolling = async () => {
      try {
        console.log('🔄 Starting polling for analysis:', analysisId);
        const analysis = await pollAnalysisStatus(
          analysisId,
          status => {
            console.log('📊 Analysis status update:', status);
            // Можна оновлювати UI в залежності від статусу
            if (status === 'processing' && currentStep < 2) {
              setCurrentStep(2);
            }
          },
          60, // 60 спроб = 5 хвилин
          5000, // перевірка кожні 5 секунд
        );

        if (!isCancelled) {
          console.log('✅ Analysis completed, navigating to results');
          // Аналіз завершено - переходимо до результатів
          navigation.replace('AnalysisResults', {
            analysisResult: analysis,
          });
        }
      } catch (error: any) {
        if (!isCancelled) {
          console.error('❌ Polling error:', error);
          Alert.alert(
            'Помилка',
            error.message || 'Не вдалося завершити аналіз',
            [
              {
                text: 'Повернутись',
                onPress: () => navigation.goBack(),
              },
            ],
          );
        }
      }
    };

    startPolling();

    return () => {
      console.log('🛑 Stopping polling (component unmounted)');
      isCancelled = true;
    };
  }, [analysisId, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Illustration */}
        <Animated.View
          style={[
            styles.illustrationContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.illustration}>✨</Text>
        </Animated.View>

        <Text style={styles.title}>AI аналізує ваше фото</Text>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color="#C49B63" />
        </View>

        {/* Loading Steps */}
        <View style={styles.stepsContainer}>
          {LOADING_STEPS.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepIndicator,
                  index < currentStep && styles.stepIndicatorCompleted,
                  index === currentStep && styles.stepIndicatorActive,
                ]}
              >
                {index < currentStep ? (
                  <Text style={styles.stepCheck}>✓</Text>
                ) : index === currentStep ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : null}
              </View>
              <Text
                style={[
                  styles.stepText,
                  index <= currentStep && styles.stepTextActive,
                ]}
              >
                {step.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Estimated Time */}
        <Text style={styles.timeText}>Це займе 2-3 хвилини</Text>

        {/* Fun Fact */}
        <View style={styles.factContainer}>
          <Text style={styles.factTitle}>💡 Знали ви, що...</Text>
          <Text style={styles.factText}>{FUN_FACTS[currentFact]}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  illustration: {
    fontSize: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepsContainer: {
    marginBottom: 30,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIndicatorCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepIndicatorActive: {
    backgroundColor: '#C49B63',
  },
  stepCheck: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#999999',
  },
  stepTextActive: {
    color: '#1A1A1A',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 40,
  },
  factContainer: {
    backgroundColor: '#FFF9F0',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C49B63',
  },
  factTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  factText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default AnalysisLoadingScreen;
