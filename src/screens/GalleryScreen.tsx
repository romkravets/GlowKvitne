/**
 * Gallery Screen
 * Галерея згенерованих образів
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProps } from '../navigation/types';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2; // 2 колонки з відступами

interface Outfit {
  id: string;
  imageUrl: string;
  title: string;
  occasion: string;
  createdAt: string;
}

const GalleryScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = async () => {
    try {
      // TODO: Завантажити образи з API
      // const data = await outfitService.getMyOutfits();

      // Симуляція
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      const mockOutfits: Outfit[] = [
        {
          id: '1',
          imageUrl: 'https://via.placeholder.com/300',
          title: 'Casual день',
          occasion: 'Повсякденний',
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          imageUrl: 'https://via.placeholder.com/300',
          title: 'Робочий стиль',
          occasion: 'Робота',
          createdAt: '2024-01-14',
        },
        {
          id: '3',
          imageUrl: 'https://via.placeholder.com/300',
          title: 'Вечірній вихід',
          occasion: 'Вечір',
          createdAt: '2024-01-13',
        },
      ];

      setOutfits(mockOutfits);
    } catch (error) {
      console.error('Error loading outfits:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOutfits();
  };

  const renderOutfitItem = ({ item }: { item: Outfit }) => (
    <TouchableOpacity
      style={styles.outfitItem}
      onPress={() =>
        navigation.navigate('OutfitDetails', { outfitId: item.id })
      }
    >
      <Image source={{ uri: item.imageUrl }} style={styles.outfitImage} />
      <View style={styles.outfitInfo}>
        <Text style={styles.outfitTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.outfitOccasion}>{item.occasion}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>👗</Text>
      <Text style={styles.emptyTitle}>Немає збережених образів</Text>
      <Text style={styles.emptyText}>
        Згенеруйте свій перший образ на основі вашого аналізу
      </Text>
      <TouchableOpacity
        style={styles.generateButton}
        onPress={() => navigation.navigate('GenerateOutfit')}
      >
        <Text style={styles.generateButtonText}>Згенерувати образ</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C49B63" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        data={outfits}
        renderItem={renderOutfitItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        columnWrapperStyle={styles.columnWrapper}
      />

      {/* Floating Action Button */}
      {outfits.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('GenerateOutfit')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  outfitItem: {
    width: ITEM_SIZE,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outfitImage: {
    width: '100%',
    height: ITEM_SIZE * 1.3,
    backgroundColor: '#F0F0F0',
  },
  outfitInfo: {
    padding: 12,
  },
  outfitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  outfitOccasion: {
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  generateButton: {
    backgroundColor: '#C49B63',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#C49B63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default GalleryScreen;
