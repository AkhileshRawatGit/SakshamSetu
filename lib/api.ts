import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, clearTokens } from './auth'

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local mobile testing on LAN
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return `http://${hostname}:4000/api`;
    }
    // Localhost dev
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    }
    // Production on Vercel (same-origin /api)
    return process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
};

/**
 * Create axios instance with base configuration
 */
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// Log baseURL in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', api.defaults.baseURL)
}

/**
 * Request interceptor - Add authorization token to requests & dynamic host
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getBaseURL();

    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // For FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Handle errors and token expiration
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear tokens and redirect to login
      // But don't redirect for login/register endpoints
      const url = error.config?.url || ''
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

/**
 * API helper functions
 */
export const apiGet = async <T = any>(url: string, config?: any): Promise<T> => {
  try {
    const response = await api.get<T>(url, config)
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

export const apiPost = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
  try {
    const response = await api.post<T>(url, data, config)
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

export const apiPatch = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
  try {
    const response = await api.patch<T>(url, data, config)
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

export const apiDelete = async <T = any>(url: string, config?: any): Promise<T> => {
  try {
    const response = await api.delete<T>(url, config)
    return response.data
  } catch (error) {
    throw handleError(error)
  }
}

/**
 * Handle API errors
 */
const handleError = (error: any): Error => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred'
    const err = new Error(message)
    ;(err as any).status = error.response.status
    ;(err as any).data = error.response.data
    ;(err as any).response = error.response
    return err
  } else if (error.request) {
    // Request made but no response received
    return new Error('Server not responding. Please check your connection and try again.')
  } else {
    // Something else happened
    return new Error(error.message || 'An unexpected error occurred')
  }
}

export default api
