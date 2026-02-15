import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { API_CONFIG } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

interface Salon {
  _id: string;
  name: string;
  slug: string;
  description: string;
  address: {
    street: string;
    city: string;
    region: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  phone: string;
  website?: string;
  email?: string;
  rating: number;
  reviewsCount: number;
  services: Array<{
    name: string;
    price: number;
    duration: number;
  }>;
  photos: string[];
  workingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
  reviews: Array<{
    _id: string;
    user: { name: string; avatar?: string };
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

type ExploreStackParamList = {
  Salons: undefined;
  SalonDetails: { salonId: string; slug: string };
};

type SalonDetailsScreenProps = {
  navigation: NativeStackNavigationProp<ExploreStackParamList, 'SalonDetails'>;
  route: RouteProp<ExploreStackParamList, 'SalonDetails'>;
};

const SalonDetailsScreen = ({ navigation, route }: SalonDetailsScreenProps) => {
  const { slug } = route.params;
  const { user } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    fetchSalonDetails();
  }, [slug]);

  const fetchSalonDetails = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/public/salons/${slug}`,
      );
      setSalon(response.data.salon);
    } catch (error) {
      console.error('Error fetching salon:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити деталі салону');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (salon?.phone) {
      Linking.openURL(`tel:${salon.phone}`);
    }
  };

  const handleWebsite = () => {
    if (salon?.website) {
      Linking.openURL(salon.website);
    }
  };

  const handleDirections = () => {
    if (salon?.address.coordinates) {
      const { lat, lng } = salon.address.coordinates;
      Linking.openURL(`maps://app?daddr=${lat},${lng}`);
    }
  };

  const getDayName = (index: number) => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    return days[index];
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C49B63" />
      </View>
    );
  }

  if (!salon) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Photos Gallery */}
      <View style={styles.photosContainer}>
        <Image
          source={{
            uri:
              salon.photos[activePhotoIndex] ||
              'https://via.placeholder.com/400',
          }}
          style={styles.mainPhoto}
        />
        {salon.photos.length > 1 && (
          <View style={styles.photosIndicator}>
            {salon.photos.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.photosDot,
                  activePhotoIndex === index && styles.photosDotActive,
                ]}
                onPress={() => setActivePhotoIndex(index)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{salon.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {salon.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.reviewsCount}>{salon.reviewsCount} відгуків</Text>

        {/* Description */}
        {salon.description && (
          <Text style={styles.description}>{salon.description}</Text>
        )}

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Контакти</Text>

          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <Text style={styles.contactLabel}>Телефон:</Text>
            <Text style={styles.contactValue}>{salon.phone}</Text>
          </TouchableOpacity>

          {salon.email && (
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>{salon.email}</Text>
            </View>
          )}

          {salon.website && (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleWebsite}
            >
              <Text style={styles.contactLabel}>Вебсайт:</Text>
              <Text style={[styles.contactValue, styles.link]}>
                {salon.website}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Адреса</Text>
          <Text style={styles.address}>
            {salon.address.street}, {salon.address.city}
          </Text>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleDirections}
          >
            <Text style={styles.directionsButtonText}>Як дістатися</Text>
          </TouchableOpacity>
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Графік роботи</Text>
          {Object.entries(salon.workingHours).map(([day, hours], index) => (
            <View key={day} style={styles.workingHoursRow}>
              <Text style={styles.dayName}>{getDayName(index)}</Text>
              <Text style={styles.workingHoursTime}>
                {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Вихідний'}
              </Text>
            </View>
          ))}
        </View>

        {/* Services */}
        {salon.services && salon.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Послуги</Text>
            {salon.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDuration}>
                    {service.duration} хв
                  </Text>
                </View>
                <Text style={styles.servicePrice}>{service.price} грн</Text>
              </View>
            ))}
          </View>
        )}

        {/* Reviews */}
        {salon.reviews && salon.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 Відгуки</Text>
            {salon.reviews.map(review => (
              <View key={review._id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUser}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {review.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.reviewUserName}>
                        {review.user.name}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('uk-UA')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCall}>
            <Text style={styles.primaryButtonText}>📞 Зателефонувати</Text>
          </TouchableOpacity>

          {user && (
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>✍️ Залишити відгук</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
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
  photosContainer: {
    position: 'relative',
  },
  mainPhoto: {
    width: '100%',
    height: 280,
    backgroundColor: '#E5E5E5',
  },
  photosIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photosDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  photosDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginRight: 12,
  },
  ratingBadge: {
    backgroundColor: '#C49B63',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsCount: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  contactLabel: {
    fontSize: 15,
    color: '#666',
  },
  contactValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  link: {
    color: '#C49B63',
  },
  address: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  directionsButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  directionsButtonText: {
    fontSize: 15,
    color: '#C49B63',
    fontWeight: '500',
  },
  workingHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dayName: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  workingHoursTime: {
    fontSize: 15,
    color: '#666',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 13,
    color: '#999',
  },
  servicePrice: {
    fontSize: 16,
    color: '#C49B63',
    fontWeight: '600',
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  reviewUserName: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  reviewRating: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#C49B63',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SalonDetailsScreen;
