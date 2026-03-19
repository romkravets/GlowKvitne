/**
 * ClientDetailScreen
 * Деталі клієнта: інформація + список прикріплених аналізів
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getClient, deleteClient, Client } from '../api/clientsApi';
import { NavigationProps } from '../navigation/types';

const ClientDetailScreen: React.FC<NavigationProps> = ({ navigation, route }) => {
  const { clientId } = route.params as { clientId: string; clientName: string };

  const [client, setClient] = useState<Client | null>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClient(clientId);
      setClient(data.client);
      setAnalyses(data.analyses);
    } catch (err: any) {
      Alert.alert('Помилка', err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = () => {
    Alert.alert(
      'Видалити клієнта',
      `Видалити "${client?.name}"? Аналізи залишаться у вашому акаунті.`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClient(clientId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Помилка', err?.response?.data?.error || err.message);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color="#C49B63" size="large" />
      </View>
    );
  }

  if (!client) return null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {client.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.clientName}>{client.name}</Text>

          {client.colorSeason && (
            <View style={styles.seasonPill}>
              <Text style={styles.seasonText}>🎨 {client.colorSeason}</Text>
            </View>
          )}
          {client.styleType && (
            <Text style={styles.styleType}>{client.styleType}</Text>
          )}
        </View>

        {/* Contact info */}
        {(client.phone || client.email || client.notes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Контакти</Text>
            {client.phone && <InfoRow icon="📞" value={client.phone} />}
            {client.email && <InfoRow icon="✉️" value={client.email} />}
            {client.notes && <InfoRow icon="📝" value={client.notes} />}
          </View>
        )}

        {/* Analyses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Аналізи ({analyses.length})
          </Text>

          {analyses.length === 0 ? (
            <Text style={styles.noAnalyses}>
              Ще немає прикріплених аналізів.{'\n'}Зробіть аналіз та прикріпіть його до цього клієнта.
            </Text>
          ) : (
            analyses.map(a => (
              <View key={a._id} style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisSeason}>
                    {a.colorSeason?.primary || '—'}
                  </Text>
                  <Text style={styles.analysisTier}>
                    {a.tier?.toUpperCase()}
                  </Text>
                </View>
                {a.larsonAnalysis?.styleType?.blendName && (
                  <Text style={styles.analysisStyle}>
                    {a.larsonAnalysis.styleType.blendName}
                  </Text>
                )}
                <Text style={styles.analysisDate}>
                  {a.createdAt
                    ? new Date(a.createdAt).toLocaleDateString('uk-UA')
                    : ''}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
        >
          <Text style={styles.deleteBtnText}>Видалити клієнта</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, value }: { icon: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  content: { padding: 16, gap: 16 },

  headerCard: {
    backgroundColor: 'rgba(196,155,99,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196,155,99,0.3)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  clientName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  seasonPill: {
    backgroundColor: 'rgba(196,155,99,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 6,
  },
  seasonText: { fontSize: 14, fontWeight: '600', color: '#C49B63' },
  styleType: { fontSize: 13, color: '#a0a0a0' },

  section: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a0a0a0',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoIcon: { fontSize: 16, width: 22 },
  infoValue: { flex: 1, fontSize: 15, color: '#fff', lineHeight: 20 },

  noAnalyses: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 8,
  },

  analysisCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  analysisSeason: { fontSize: 15, fontWeight: '600', color: '#fff' },
  analysisTier: { fontSize: 12, fontWeight: '600', color: '#C49B63' },
  analysisStyle: { fontSize: 13, color: '#a0a0a0', marginBottom: 4 },
  analysisDate: { fontSize: 12, color: '#555' },

  deleteBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
    marginTop: 4,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: '#FF3B30' },
});

export default ClientDetailScreen;
