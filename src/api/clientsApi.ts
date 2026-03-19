/**
 * Clients API
 * CRUD для клієнтів стиліста
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/firebase';

export interface Client {
  _id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  colorSeason?: string | null;
  styleType?: string | null;
  lastAnalysisId?: string | null;
  lastAnalysisAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getClients(): Promise<{ clients: Client[]; count: number }> {
  const headers = await authHeaders();
  const res = await axios.get(`${API_CONFIG.baseURL}/api/clients`, { headers });
  return res.data;
}

export async function createClient(data: {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}): Promise<{ client: Client }> {
  const headers = await authHeaders();
  const res = await axios.post(`${API_CONFIG.baseURL}/api/clients`, data, { headers });
  return res.data;
}

export async function getClient(
  id: string,
): Promise<{ client: Client; analyses: any[] }> {
  const headers = await authHeaders();
  const res = await axios.get(`${API_CONFIG.baseURL}/api/clients/${id}`, { headers });
  return res.data;
}

export async function updateClient(
  id: string,
  data: Partial<{ name: string; phone: string; email: string; notes: string }>,
): Promise<{ client: Client }> {
  const headers = await authHeaders();
  const res = await axios.put(`${API_CONFIG.baseURL}/api/clients/${id}`, data, { headers });
  return res.data;
}

export async function deleteClient(id: string): Promise<void> {
  const headers = await authHeaders();
  await axios.delete(`${API_CONFIG.baseURL}/api/clients/${id}`, { headers });
}

export async function linkAnalysis(
  clientId: string,
  analysisId: string,
): Promise<{ ok: boolean; client: Client }> {
  const headers = await authHeaders();
  const res = await axios.post(
    `${API_CONFIG.baseURL}/api/clients/${clientId}/link`,
    { analysisId },
    { headers },
  );
  return res.data;
}
