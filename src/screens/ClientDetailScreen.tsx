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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getClient, deleteClient, linkAnalysis, Client } from '../api/clientsApi';
import { getUserAnalyses, Analysis } from '../api/analysisApi';
import { NavigationProps } from '../navigation/types';

const ClientDetailScreen: React.FC<NavigationProps> = ({ navigation, route }) => {
  const { clientId } = route.params as { clientId: string; clientName: string };

  const [client, setClient] = useState<Client | null>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [userAnalyses, setUserAnalyses] = useState<Analysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [linking, setLinking] = useState<string | null>(null);

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

  const openLinkModal = async () => {
    setLinkModalVisible(true);
    try {
      setLoadingAnalyses(true);
      const data = await getUserAnalyses();
      const completed = data.analyses.filter(a => a.status === 'completed');
      setUserAnalyses(completed);
    } catch (err: any) {
      Alert.alert('Помилка', err?.response?.data?.error || err.message);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const handleLinkAnalysis = async (analysisId: string) => {
    try {
      setLinking(analysisId);
      await linkAnalysis(clientId, analysisId);
      setLinkModalVisible(false);
      await load();
    } catch (err: any) {
      Alert.alert('Помилка', err?.response?.data?.error || err.message);
    } finally {
      setLinking(null);
    }
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
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              Аналізи ({analyses.length})
            </Text>
            <TouchableOpacity style={styles.linkBtn} onPress={openLinkModal}>
              <Text style={styles.linkBtnText}>＋ Прикріпити</Text>
            </TouchableOpacity>
          </View>

          {analyses.length === 0 ? (
            <Text style={styles.noAnalyses}>
              Ще немає прикріплених аналізів.{'\n'}Натисніть "Прикріпити", щоб додати.
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

        {/* Link Analysis Modal */}
        <Modal
          visible={linkModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setLinkModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Вибрати аналіз</Text>
                <TouchableOpacity onPress={() => setLinkModalVisible(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {loadingAnalyses ? (
                <ActivityIndicator color="#C49B63" style={styles.modalLoader} />
              ) : userAnalyses.length === 0 ? (
                <Text style={styles.modalEmpty}>
                  Немає завершених аналізів.{'\n'}Спочатку зробіть аналіз.
                </Text>
              ) : (
                <FlatList
                  data={userAnalyses}
                  keyExtractor={a => a._id}
                  contentContainerStyle={styles.modalList}
                  renderItem={({ item }) => {
                    const isLinking = linking === item._id;
                    const alreadyLinked = analyses.some(a => a._id === item._id);
                    return (
                      <TouchableOpacity
                        style={[
                          styles.modalCard,
                          alreadyLinked && styles.modalCardLinked,
                        ]}
                        onPress={() => !alreadyLinked && handleLinkAnalysis(item._id)}
                        disabled={alreadyLinked || isLinking}
                      >
                        <View style={styles.modalCardBody}>
                          <Text style={styles.modalCardSeason}>
                            {item.larsonAnalysis?.seasonalType?.primary ||
                              item.kibbeAnalysis?.kibbeType?.result ||
                              '—'}
                          </Text>
                          {item.archetypeAnalysis?.blendName && (
                            <Text style={styles.modalCardStyle}>
                              {item.archetypeAnalysis.blendName}
                            </Text>
                          )}
                          <Text style={styles.modalCardDate}>
                            {new Date(item.createdAt).toLocaleDateString('uk-UA')}
                          </Text>
                        </View>
                        {isLinking ? (
                          <ActivityIndicator color="#C49B63" size="small" />
                        ) : alreadyLinked ? (
                          <Text style={styles.modalCardDone}>✓</Text>
                        ) : (
                          <Text style={styles.modalCardArrow}>＋</Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </Modal>

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
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a0a0a0',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  linkBtn: {
    backgroundColor: 'rgba(196,155,99,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(196,155,99,0.4)',
  },
  linkBtnText: { fontSize: 12, fontWeight: '600', color: '#C49B63' },

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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  modalClose: { fontSize: 18, color: '#a0a0a0', padding: 4 },
  modalLoader: { margin: 32 },
  modalEmpty: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    margin: 32,
  },
  modalList: { padding: 16, gap: 10 },
  modalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalCardLinked: {
    borderColor: 'rgba(196,155,99,0.4)',
    backgroundColor: 'rgba(196,155,99,0.08)',
  },
  modalCardBody: { flex: 1 },
  modalCardSeason: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  modalCardStyle: { fontSize: 13, color: '#a0a0a0', marginBottom: 2 },
  modalCardDate: { fontSize: 12, color: '#555' },
  modalCardArrow: { fontSize: 20, color: '#C49B63', fontWeight: '700' },
  modalCardDone: { fontSize: 18, color: '#C49B63', fontWeight: '700' },

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
