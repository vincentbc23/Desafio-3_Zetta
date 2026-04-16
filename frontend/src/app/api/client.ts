/**
 * Serviço de API
 * Centraliza todas as requisições HTTP para o backend
 */

import { apiConfig } from './config';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

class ApiService {
  private baseURL: string;
  private defaultTimeout: number;

  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.defaultTimeout = apiConfig.timeout;
  }

  /**
   * Faz uma requisição HTTP com timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * GET Request
   */
  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: apiConfig.headers,
    });

    return response.json() as Promise<T>;
  }

  /**
   * POST Request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: apiConfig.headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return response.json() as Promise<T>;
  }

  /**
   * PUT Request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await this.fetchWithTimeout(url, {
      method: 'PUT',
      headers: apiConfig.headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return response.json() as Promise<T>;
  }

  /**
   * DELETE Request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: apiConfig.headers,
    });

    return response.json() as Promise<T>;
  }
}

export const api = new ApiService();
