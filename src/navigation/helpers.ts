/**
 * navigation/helpers.ts
 * Хелпери для навігації між різними стеками/табами
 */

import { NavigationProp } from '@react-navigation/native';

/**
 * Перехід на екран Subscription який знаходиться в ProfileStackNavigator
 * Використовується з будь-якого іншого таба (HomeTab, GalleryTab тощо)
 *
 * Структура:
 *   RootStack → Main → MainNavigator (Tabs)
 *     ├─ HomeTab   → HomeStackNavigator   (тут НЕ МА Subscription)
 *     └─ ProfileTab → ProfileStackNavigator (тут Subscription)
 *
 * navigation.navigate('Subscription') — НЕ ПРАЦЮЄ з HomeStack
 * Треба: getParent (tabs) → navigate до ProfileTab → screen Subscription
 */
export function navigateToSubscription(navigation: NavigationProp<any>) {
  // Піднімаємось до TabNavigator і переходимо на ProfileTab → Subscription
  navigation.navigate('ProfileTab', {
    screen: 'Subscription',
  });
}

/**
 * Перехід до результатів аналізу з будь-якого місця
 */
export function navigateToAnalysisResults(
  navigation: NavigationProp<any>,
  analysisId: string,
) {
  navigation.navigate('AnalysisResults', {
    analysisResult: { _id: analysisId },
  });
}
