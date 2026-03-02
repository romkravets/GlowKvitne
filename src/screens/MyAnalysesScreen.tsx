/**
 * My Analyses Screen
 * Список всіх збережених аналізів користувача
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';
import {
  getUserAnalyses,
  deleteAnalysis,
  type Analysis,
} from '../api/analysisApi';

const MyAnalysesScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyses = async () => {
    try {
      const response = await getUserAnalyses();
      console.log('Loaded analyses:', response);
      // API may return { analyses: [...] } or an array directly
      setAnalyses(response.analyses || response || []);
    } catch (error: any) {
      console.error('Load analyses error:', error);
      Alert.alert('Помилка', error.message || 'Не вдалося завантажити аналізи');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalyses();
  }, []);

  const handleDelete = (analysisId: string) => {
    Alert.alert('Видалити аналіз?', 'Ця дія незворотна', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAnalysis(analysisId);
            setAnalyses(prev =>
              prev.filter(a => {
                const aa: any = a;
                const aid =
                  typeof aa._id === 'string' ? aa._id : aa._id?.$oid || aa._id;
                return aid !== analysisId;
              }),
            );
            Alert.alert('Успіх', 'Аналіз видалено');
          } catch (error: any) {
            Alert.alert('Помилка', error.message);
          }
        },
      },
    ]);
  };

  const renderAnalysis = ({ item }: { item: any }) => {
    console.log(item);
    // normalize id (could be string or object {$oid: ...})
    const id =
      typeof item._id === 'string'
        ? item._id
        : item._id?.$oid || item._id || '';

    const styleName =
      item.larsonAnalysis?.styleType?.blendName ||
      item.larsonAnalysis?.styleType?.primaryType ||
      '';

    const season = item.colorSeason?.primary || '';

    const rawDate =
      item.createdAt?.$date || item.createdAt || new Date().toISOString();
    const date = new Date(rawDate).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const status = item.status || '';
    const statusEmoji = (
      {
        pending: '⏳',
        processing: '🔄',
        completed: '✅',
        failed: '❌',
      } as any
    )[status];

    return (
      <TouchableOpacity
        style={styles.analysisCard}
        onPress={() => {
          if (item.status === 'completed') {
            navigation.navigate('AnalysisResults', {
              analysisResult: item,
            });
          } else if (
            item.status === 'processing' ||
            item.status === 'pending'
          ) {
            navigation.navigate('AnalysisLoading', {
              analysisId: item._id,
            });
          }
        }}
        disabled={item.status === 'failed'}
      >
        {/* Placeholder icon if no photo saved */}
        {item.photos?.facePhoto?.url ? (
          <Image
            source={{
              uri:
                item.photos.facePhoto.thumbnail?.url ||
                item.photos.facePhoto.url,
            }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.thumbnailEmoji}>🎨</Text>
          </View>
        )}

        <View style={styles.analysisInfo}>
          <View style={styles.header}>
            <Text style={styles.colorType}>
              {statusEmoji} {styleName || season || 'Аналіз'}
            </Text>
            {item.tier && (
              <View
                style={[
                  styles.tierBadge,
                  item.tier === 'premium' && styles.premiumBadge,
                ]}
              >
                <Text style={styles.tierText}>
                  {item.tier === 'premium' ? '👑 Premium' : '🆓 Free'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.date}>{date}</Text>

          {item.status === 'failed' && item.error && (
            <Text style={styles.errorText}>Помилка: {item.error}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(id)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C49B63" />
          <Text style={styles.loadingText}>Завантаження...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (analyses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>Поки немає аналізів</Text>
          <Text style={styles.emptyText}>
            Створіть свій перший AI аналіз, щоб дізнатися свій колоротип
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('StartAnalysis')}
          >
            <Text style={styles.createButtonText}>🔬 Створити аналіз</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        data={analyses}
        renderItem={renderAnalysis}
        keyExtractor={(item: any) =>
          typeof item._id === 'string'
            ? item._id
            : item._id?.$oid || String(item._id)
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C49B63"
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.title}>Мої аналізи</Text>
            <Text style={styles.subtitle}>Всього: {analyses.length}</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('StartAnalysis')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#C49B63',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  analysisCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailEmoji: {
    fontSize: 40,
  },
  analysisInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  tierBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default MyAnalysesScreen;
