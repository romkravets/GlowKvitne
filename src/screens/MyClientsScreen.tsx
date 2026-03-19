/**
 * MyClientsScreen
 * Список клієнтів стиліста
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getClients, Client } from '../api/clientsApi';
import { NavigationProps } from '../navigation/types';

const MyClientsScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data.clients);
    } catch (err: any) {
      Alert.alert('Помилка', err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ClientDetail', {
          clientId: item._id,
          clientName: item.name,
        })
      }
    >
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        {item.colorSeason ? (
          <Text style={styles.cardMeta}>🎨 {item.colorSeason}</Text>
        ) : item.phone ? (
          <Text style={styles.cardMeta}>{item.phone}</Text>
        ) : (
          <Text style={[styles.cardMeta, styles.cardMetaDim]}>
            Аналіз ще не прикріплено
          </Text>
        )}
      </View>

      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {loading ? (
        <ActivityIndicator style={styles.loader} color="#C49B63" size="large" />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={c => c._id}
          renderItem={renderItem}
          contentContainerStyle={
            clients.length === 0 ? styles.emptyContainer : styles.list
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>Ще немає клієнтів</Text>
              <Text style={styles.emptySubtitle}>
                Додайте першого клієнта та прикріпіть до нього аналіз
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddClient')}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  loader: { flex: 1 },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardAvatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  cardBody: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 3 },
  cardMeta: { fontSize: 13, color: '#a0a0a0' },
  cardMetaDim: { fontStyle: 'italic' },
  cardArrow: { fontSize: 24, color: '#555' },

  empty: { alignItems: 'center' },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptySubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 20,
  },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
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
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});

export default MyClientsScreen;
