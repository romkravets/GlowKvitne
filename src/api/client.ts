import axios from 'axios';
import { AnalysisResponse } from '../types/analysis';

// Використовуй localhost для iOS симулятора
const API_URL = 'http://localhost:3000';

export const analyzePhotos = async (
  facePhotoBase64: string,
  bodyPhotoBase64?: string,
): Promise<AnalysisResponse> => {
  try {
    const response = await axios.post<AnalysisResponse>(
      `${API_URL}/api/analysis/test-with-photo`,
      {
        facePhotoBase64,
        bodyPhotoBase64,
      },
      {
        timeout: 300000, // 5 хвилин
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Помилка підключення до сервера',
      );
    }
    throw error;
  }
};

export const checkApiStatus = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/`, { timeout: 5000 });
    return response.data.status === 'running';
  } catch (error) {
    return false;
  }
};
