/**
 * Configuração da API
 * Define URLs e configurações padrão para requisições ao backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiConfig = {
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};
