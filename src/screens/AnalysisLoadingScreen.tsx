/**
 * Analysis Loading Screen
 * Покроковий прогрес аналізу з анімованим progress bar.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';
import { pollAnalysisStatus } from '../api/analysisApi';

const { width } = Dimensions.get('window');
const BAR_WIDTH = width - 48;

// ── Кроки та їх прогрес ─────────────────────────────────────────────────────
const STEPS = [
  { emoji: '👤', text: 'Визначаємо тип обличчя...', progress: 15 },
  { emoji: '🎨', text: 'Аналізуємо кольоротип...', progress: 40 },
  { emoji: '🖌️', text: 'Підбираємо палітру...', progress: 65 },
  { emoji: '✨', text: 'Формуємо рекомендації...', progress: 85 },
  { emoji: '🌟', text: 'Майже готово!', progress: 98 },
];

const FACTS = [
  'Правильні кольори можуть зробити вас на 5-10 років молодшою!',
  'Більшість людей носять кольори, що їм не підходять.',
  'Кольоротип формується з поєднання відтінку шкіри, очей та волосся.',
  'Теорія Kibbe базується на балансі контрасту у зовнішності.',
  'Палітра Autumn — найтепліша і найземляніша з усіх сезонів.',
];

// ── Пропси ───────────────────────────────────────────────────────────────────
interface AnalysisLoadingScreenProps extends NavigationProps {
  route: { params: { analysisId: string } };
}

// ── Компонент ────────────────────────────────────────────────────────────────
const AnalysisLoadingScreen: React.FC<AnalysisLoadingScreenProps> = ({
  navigation,
  route,
}) => {
  const { analysisId } = route.params;
  const [stepIndex, setStepIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  // Анімований прогрес-бар
  const progressAnim = useRef(new Animated.Value(0)).current;
  // Пульс іконки
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Fade для факту
  const factOpacity = useRef(new Animated.Value(1)).current;

  // Прогрес-бар анімація
  useEffect(() => {
    const targetProgress = STEPS[stepIndex]?.progress ?? 0;
    Animated.timing(progressAnim, {
      toValue: (targetProgress / 100) * BAR_WIDTH,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [stepIndex, progressAnim]);

  // Пульс активної іконки
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [stepIndex, pulseAnim]);

  // Автоматичне просування кроків (fallback — реальний статус від polling)
  useEffect(() => {
    const STEP_DURATIONS = [4000, 6000, 5000, 5000, 0];
    let timer: ReturnType<typeof setTimeout>;

    const advance = (idx: number) => {
      if (idx >= STEPS.length - 1) return;
      timer = setTimeout(() => {
        setStepIndex(idx + 1);
        advance(idx + 1);
      }, STEP_DURATIONS[idx]);
    };

    advance(0);
    return () => clearTimeout(timer);
  }, []);

  // Ротація фактів
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(factOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setFactIndex(i => (i + 1) % FACTS.length);
        Animated.timing(factOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 9000);
    return () => clearInterval(interval);
  }, [factOpacity]);

  // API polling
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const startPolling = async () => {
      try {
        const analysis = await pollAnalysisStatus(
          analysisId,
          status => {
            if (status === 'processing') setStepIndex(s => Math.max(s, 1));
          },
          60,
          5000,
          controller.signal,
        );

        if (!isCancelled) {
          setStepIndex(STEPS.length - 1);
          // Дати час показати 100%
          setTimeout(() => {
            navigation.replace('AnalysisResults', { analysisResult: analysis });
          }, 800);
        }
      } catch (error: any) {
        if (isCancelled || error?.message === 'Polling aborted') return;
        Alert.alert('Помилка', error.message || 'Не вдалося завершити аналіз', [
          { text: 'Повернутись', onPress: () => navigation.goBack() },
        ]);
      }
    };

    startPolling();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [analysisId, navigation]);

  const currentStep = STEPS[stepIndex];
  const progressPercent = currentStep?.progress ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Велика іконка поточного кроку */}
        <Animated.Text
          style={[styles.bigEmoji, { transform: [{ scale: pulseAnim }] }]}
        >
          {currentStep?.emoji ?? '✨'}
        </Animated.Text>

        <Text style={styles.title}>AI аналізує ваше фото</Text>

        {/* ── Progress bar ── */}
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: progressAnim }]} />
        </View>
        <Text style={styles.percent}>{progressPercent}%</Text>

        {/* ── Кроки ── */}
        <View style={styles.stepsWrap}>
          {STEPS.map((step, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            const pending = i > stepIndex;
            return (
              <View key={i} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    done && styles.dotDone,
                    active && styles.dotActive,
                    pending && styles.dotPending,
                  ]}
                >
                  {done && <Text style={styles.checkMark}>✓</Text>}
                  {active && <Text style={styles.dotEmoji}>{step.emoji}</Text>}
                </View>
                <Text
                  style={[
                    styles.stepText,
                    done && styles.textDone,
                    active && styles.textActive,
                    pending && styles.textPending,
                  ]}
                >
                  {step.text}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── Fun fact ── */}
        <Animated.View style={[styles.factBox, { opacity: factOpacity }]}>
          <Text style={styles.factLabel}>💡 Знали ви, що...</Text>
          <Text style={styles.factText}>{FACTS[factIndex]}</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },

  bigEmoji: { fontSize: 72, textAlign: 'center', marginBottom: 16 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Progress bar
  barTrack: {
    width: BAR_WIDTH,
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#C49B63',
    borderRadius: 4,
  },
  percent: {
    fontSize: 13,
    color: '#C49B63',
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 28,
  },

  // Steps
  stepsWrap: { marginBottom: 28 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dotDone: { backgroundColor: '#4CAF50' },
  dotActive: { backgroundColor: '#C49B63' },
  dotPending: { backgroundColor: '#E0E0E0' },
  checkMark: { fontSize: 15, color: '#FFF', fontWeight: '700' },
  dotEmoji: { fontSize: 15 },

  stepText: { flex: 1, fontSize: 15 },
  textDone: { color: '#4CAF50', fontWeight: '500' },
  textActive: { color: '#1A1A1A', fontWeight: '600' },
  textPending: { color: '#BBBBBB' },

  // Fact box
  factBox: {
    backgroundColor: '#FFF8EF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C49B6340',
  },
  factLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C49B63',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  factText: { fontSize: 13, color: '#666', lineHeight: 19 },
});

export default AnalysisLoadingScreen;
