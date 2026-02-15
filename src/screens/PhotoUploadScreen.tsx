import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createAnalysis } from '../api/analysisApi';

type RootStackParamList = {
  Home: undefined;
  PhotoUpload: undefined;
  AnalysisLoading: { analysisId: string };
};

type PhotoUploadScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PhotoUpload'>;
};

export default function PhotoUploadScreen({
  navigation,
}: PhotoUploadScreenProps) {
  const [facePhoto, setFacePhoto] = useState<Asset | null>(null);
  const [bodyPhoto, setBodyPhoto] = useState<Asset | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const pickImage = async (type: 'face' | 'body') => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    });

    if (result.assets && result.assets[0]) {
      if (type === 'face') {
        setFacePhoto(result.assets[0]);
      } else {
        setBodyPhoto(result.assets[0]);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!facePhoto?.base64) {
      Alert.alert('Помилка', 'Будь ласка, додай фото обличчя');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Створюємо аналіз на backend (зберігається в MongoDB)
      const response = await createAnalysis({
        facePhotoBase64: facePhoto.base64,
        bodyPhotoBase64: bodyPhoto?.base64,
      });

      // Переходимо на екран завантаження з analysisId
      navigation.navigate('AnalysisLoading', {
        analysisId: response.analysisId,
      });
    } catch (error: any) {
      Alert.alert(
        'Помилка',
        error.response?.data?.message ||
          error.message ||
          'Не вдалося створити аналіз. Перевір підключення до інтернету.',
      );
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Завантаж Фото</Text>
      <Text style={styles.subtitle}>Для найточнішого аналізу додай 2 фото</Text>

      {/* Face Photo */}
      <View style={styles.photoSection}>
        <Text style={styles.photoLabel}>
          1️⃣ Фото обличчя <Text style={styles.required}>(обов'язково)</Text>
        </Text>
        <Text style={styles.photoHint}>
          Обличчя має бути добре освітлене, природний макіяж або без нього
        </Text>

        {facePhoto ? (
          <View style={styles.photoPreview}>
            <Image
              source={{ uri: facePhoto.uri }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => pickImage('face')}
            >
              <Text style={styles.changeButtonText}>Змінити фото</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickImage('face')}
          >
            <Text style={styles.uploadIcon}>📸</Text>
            <Text style={styles.uploadText}>Вибрати фото обличчя</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Body Photo */}
      <View style={styles.photoSection}>
        <Text style={styles.photoLabel}>
          2️⃣ Фото в повний ріст{' '}
          <Text style={styles.optional}>(опціонально)</Text>
        </Text>
        <Text style={styles.photoHint}>
          Для точного Kibbe аналізу. Облягаючий одяг або купальник
        </Text>

        {bodyPhoto ? (
          <View style={styles.photoPreview}>
            <Image
              source={{ uri: bodyPhoto.uri }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => pickImage('body')}
            >
              <Text style={styles.changeButtonText}>Змінити фото</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.uploadButton, styles.uploadButtonSecondary]}
            onPress={() => pickImage('body')}
          >
            <Text style={styles.uploadIcon}>🧍</Text>
            <Text style={styles.uploadText}>Вибрати фото тіла</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      {!bodyPhoto && facePhoto && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Без фото в повний ріст Kibbe аналіз буде попереднім (~50%
            точність)
          </Text>
        </View>
      )}

      {/* Analyze Button */}
      <TouchableOpacity
        style={[
          styles.analyzeButton,
          (!facePhoto || isAnalyzing) && styles.analyzeButtonDisabled,
        ]}
        onPress={handleAnalyze}
        disabled={!facePhoto || isAnalyzing}
      >
        {isAnalyzing ? (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.analyzeButtonText}>
              Аналіз... (це може зайняти 1-3 хв)
            </Text>
          </View>
        ) : (
          <Text style={styles.analyzeButtonText}>🔬 Розпочати AI Аналіз</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={isAnalyzing}
      >
        <Text style={styles.backButtonText}>← Назад</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  photoSection: {
    marginBottom: 30,
  },
  photoLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  required: {
    color: '#dc3545',
    fontSize: 14,
  },
  optional: {
    color: '#6c757d',
    fontSize: 14,
  },
  photoHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  uploadButtonSecondary: {
    borderColor: '#ccc',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  photoPreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 15,
  },
  changeButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  changeButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  infoText: {
    fontSize: 14,
    color: '#004085',
    lineHeight: 20,
  },
  analyzeButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
  },
});
