/**
 * Configuração da API
 * Define URLs e configurações padrão para requisições ao backend
 */

const API_URL = import.meta.env.VITE_API_URL || '';
const API_REFRESH_MS = Number(import.meta.env.VITE_API_REFRESH_MS || 30000);

const normalizeRefreshInterval = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return 30000;
  }

  return Math.floor(value);
};

export const apiConfig = {
  baseURL: API_URL,
  timeout: 10000,
  refreshIntervalMs: normalizeRefreshInterval(API_REFRESH_MS),
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};
