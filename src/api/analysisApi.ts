/**
 * Analysis API Service
 * Методи для роботи з аналізами через backend API
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/firebase';

export interface CreateAnalysisRequest {
  facePhotoBase64: string;
  bodyPhotoBase64?: string;
}

export interface CreateAnalysisResponse {
  analysisId: string;
  status: 'processing' | 'pending';
  estimatedTime: string;
  message: string;
}

export interface AnalysisStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface Analysis {
  _id: string;
  user: string;
  photos: {
    facePhoto: {
      url: string;
      thumbnail?: {
        url: string;
      };
    };
    bodyPhoto?: {
      url: string;
      thumbnail?: {
        url: string;
      };
    };
  } | null; // Photos can be null if not saved to storage
  larsonAnalysis?: {
    undertone?: 'warm' | 'cool' | 'neutral';
    undertoneConfidence?: string;
    undertoneIndicators?: string[];
    seasonalType?: {
      primary: string;
      confidence: string;
    };
    colorPalette?: {
      bestColors: {
        neutrals: string[];
        accents: string[];
        metals: string;
      };
    };
  };
  kibbeAnalysis?: {
    kibbeType?: {
      result: string;
      confidence: string;
    };
    styleRecommendations?: {
      silhouettes: string[];
      fabrics: string;
    };
  };
  archetypeAnalysis?: {
    primaryEssence?: {
      name: string;
      percentage: number;
    };
    blendName?: string;
    styleKeywords?: string[];
  };
  celebrityMatches?: Array<{
    name: string;
    similarity: number;
    matchReason: string;
  }>;
  recommendations?: {
    signatureStyle?: {
      description: string;
      capsuleWardrobe: Array<{
        item: string;
        color: string;
        silhouette: string;
        fabric: string;
        why: string;
      }>;
    };
    makeup?: {
      lipColors: string[];
      eyeColors: string[];
      blushColors: string[];
      application: string;
    };
    hair?: {
      colors: string[];
      styles: string;
      avoid: string;
    };
    jewelryAndAccessories?: {
      metals: string;
      size: string;
      style: string;
    };
    celebrityTwins?: Array<{
      name: string;
      larsonType: string;
      kibbeType: string;
      similarity: number;
      matchReason: string;
      bestLooks: Array<{
        description: string;
        whyItWorks: string;
        howToRecreate: string;
      }>;
    }>;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tier?: 'free' | 'premium';
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface GetAnalysisResponse {
  analysis: Analysis;
}

export interface GetUserAnalysesResponse {
  analyses: Analysis[];
  count: number;
}

/**
 * Отримати токен авторизації
 */
async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem('authToken');
}

/**
 * Створити новий аналіз
 */
export async function createAnalysis(
  request: CreateAnalysisRequest,
): Promise<CreateAnalysisResponse> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Необхідна авторизація');
  }

  const response = await axios.post<CreateAnalysisResponse>(
    `${API_CONFIG.baseURL}/api/analysis/create`,
    request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 секунд для створення
    },
  );

  return response.data;
}

/**
 * Перевірити статус аналізу
 */
export async function checkAnalysisStatus(
  analysisId: string,
): Promise<AnalysisStatusResponse> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Необхідна авторизація');
  }

  const response = await axios.get<AnalysisStatusResponse>(
    `${API_CONFIG.baseURL}/api/analysis/${analysisId}/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    },
  );

  return response.data;
}

/**
 * Отримати повний результат аналізу
 */
export async function getAnalysis(
  analysisId: string,
): Promise<GetAnalysisResponse> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Необхідна авторизація');
  }

  const response = await axios.get<GetAnalysisResponse>(
    `${API_CONFIG.baseURL}/api/analysis/${analysisId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    },
  );

  return response.data;
}

/**
 * Отримати всі аналізи користувача
 */
export async function getUserAnalyses(): Promise<GetUserAnalysesResponse> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Необхідна авторизація');
  }

  const response = await axios.get<GetUserAnalysesResponse>(
    `${API_CONFIG.baseURL}/api/analysis/user/all`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    },
  );

  return response.data;
}

/**
 * Видалити аналіз
 */
export async function deleteAnalysis(analysisId: string): Promise<void> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Необхідна авторизація');
  }

  await axios.delete(`${API_CONFIG.baseURL}/api/analysis/${analysisId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 10000,
  });
}

/**
 * Polling для перевірки статусу аналізу
 * Повертає completed аналіз або кидає помилку
 */
export async function pollAnalysisStatus(
  analysisId: string,
  onProgress?: (status: string) => void,
  maxAttempts: number = 60, // 60 спроб = 5 хвилин при інтервалі 5 секунд
  interval: number = 5000, // 5 секунд
): Promise<Analysis> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    const statusResponse = await checkAnalysisStatus(analysisId);

    if (onProgress) {
      onProgress(statusResponse.status);
    }

    if (statusResponse.status === 'completed') {
      // Отримати повні результати
      const result = await getAnalysis(analysisId);
      return result.analysis;
    }

    if (statusResponse.status === 'failed') {
      throw new Error(statusResponse.error || 'Аналіз не вдався');
    }

    // Чекаємо перед наступною спробою
    await new Promise<void>(resolve => setTimeout(() => resolve(), interval));
  }

  throw new Error('Час очікування вичерпано. Спробуйте пізніше.');
}
