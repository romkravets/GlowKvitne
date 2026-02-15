import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { checkApiStatus } from '../api/client';

type RootStackParamList = {
  Home: undefined;
  PhotoUpload: undefined;
  Results: { analysisResult: any };
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [isServerRunning, setIsServerRunning] = useState<boolean | null>(null);

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    const status = await checkApiStatus();
    setIsServerRunning(status);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>✨</Text>
        <Text style={styles.title}>GlowKvitne</Text>
        <Text style={styles.subtitle}>AI Fashion Analysis</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Отримай персональний аналіз твого колориту та типу фігури за допомогою
          штучного інтелекту
        </Text>

        <View style={styles.features}>
          <FeatureItem
            icon="🎨"
            title="Larson Color Analysis"
            description="12 сезонних колоротипів"
          />
          <FeatureItem
            icon="👗"
            title="Kibbe Body Type"
            description="13 типів фігури та стилю"
          />
          <FeatureItem
            icon="⭐"
            title="Celebrity Twins"
            description="Знаменитості з твоїм типом"
          />
        </View>

        {isServerRunning === false && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ Сервер не відповідає. Переконайся що backend запущено на порту
              3000
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            isServerRunning === false && styles.buttonDisabled,
          ]}
          onPress={() => navigation.navigate('PhotoUpload')}
          disabled={isServerRunning === false}
        >
          {isServerRunning === null ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Почати Аналіз</Text>
          )}
        </TouchableOpacity>

        {isServerRunning === false && (
          <TouchableOpacity style={styles.retryButton} onPress={checkServer}>
            <Text style={styles.retryText}>🔄 Перевірити знову</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 30,
    textAlign: 'center',
  },
  features: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  warning: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  retryText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '500',
  },
});
