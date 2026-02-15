import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_CONFIG } from '../config/firebase';

interface Salon {
  _id: string;
  name: string;
  slug: string;
  description: string;
  address: {
    street: string;
    city: string;
    region: string;
  };
  phone: string;
  rating: number;
  reviewsCount: number;
  services: string[];
  photos: string[];
  workingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
}

type ExploreStackParamList = {
  Salons: undefined;
  SalonDetails: { salonId: string; slug: string };
};

type SalonsScreenProps = {
  navigation: NativeStackNavigationProp<ExploreStackParamList, 'Salons'>;
};

const SalonsScreen = ({ navigation }: SalonsScreenProps) => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchSalons();
    fetchCities();
  }, []);

  const filterSalons = useCallback(() => {
    let filtered = salons;

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(salon => salon.address.city === selectedCity);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        salon =>
          salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          salon.address.city
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          salon.services.some(service =>
            service.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    setFilteredSalons(filtered);
  }, [searchQuery, selectedCity, salons]);

  useEffect(() => {
    filterSalons();
  }, [filterSalons]);

  const fetchSalons = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/public/salons`,
      );
      setSalons(response.data.salons || []);
    } catch (error) {
      console.error('Error fetching salons:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити салони');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/public/salons/cities`,
      );
      setCities(response.data.cities || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const renderSalon = ({ item }: { item: Salon }) => {
    const isOpen = item.workingHours
      ? Object.values(item.workingHours).some(day => day.isOpen)
      : false;

    return (
      <TouchableOpacity
        style={styles.salonCard}
        onPress={() =>
          navigation.navigate('SalonDetails', {
            salonId: item._id,
            slug: item.slug,
          })
        }
      >
        <Image
          source={{
            uri: item.photos?.[0] || 'https://via.placeholder.com/150',
          }}
          style={styles.salonImage}
        />
        <View style={styles.salonInfo}>
          <View style={styles.salonHeader}>
            <Text style={styles.salonName} numberOfLines={1}>
              {item.name}
            </Text>
            {isOpen && <View style={styles.openBadge} />}
          </View>

          <Text style={styles.salonAddress} numberOfLines={1}>
            📍 {item.address.city}, {item.address.street}
          </Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
            <Text style={styles.reviewsCount}>
              ({item.reviewsCount} відгуків)
            </Text>
          </View>

          <View style={styles.servicesContainer}>
            {item.services.slice(0, 3).map((service, index) => (
              <View key={index} style={styles.serviceBadge}>
                <Text style={styles.serviceText} numberOfLines={1}>
                  {service}
                </Text>
              </View>
            ))}
            {item.services.length > 3 && (
              <Text style={styles.moreServices}>
                +{item.services.length - 3}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C49B63" />
        <Text style={styles.loadingText}>Завантаження салонів...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук салонів..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Cities Filter */}
      <View style={styles.citiesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[null, ...cities]}
          keyExtractor={(item, index) => item || `all-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.cityButton,
                selectedCity === item && styles.cityButtonActive,
              ]}
              onPress={() => setSelectedCity(item)}
            >
              <Text
                style={[
                  styles.cityButtonText,
                  selectedCity === item && styles.cityButtonTextActive,
                ]}
              >
                {item || 'Всі міста'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Salons List */}
      {filteredSalons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏪</Text>
          <Text style={styles.emptyTitle}>Салони не знайдено</Text>
          <Text style={styles.emptyText}>
            Спробуйте змінити параметри пошуку
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSalons}
          renderItem={renderSalon}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  citiesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  cityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  cityButtonActive: {
    backgroundColor: '#C49B63',
  },
  cityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cityButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  salonCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salonImage: {
    width: 120,
    height: 120,
    backgroundColor: '#E5E5E5',
  },
  salonInfo: {
    flex: 1,
    padding: 12,
  },
  salonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  salonName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  openBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  salonAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  reviewsCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  serviceBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
    marginTop: 4,
  },
  serviceText: {
    fontSize: 11,
    color: '#666',
  },
  moreServices: {
    fontSize: 11,
    color: '#C49B63',
    marginLeft: 4,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default SalonsScreen;
