import axios, { AxiosError } from 'axios'
import { ApiError } from '../types'

export const api = axios.create({
  baseURL: 'https://glhf.chat/api/openai/v1',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

export class ApiException extends Error {
  constructor(public error: ApiError) {
    super(error.message)
    this.name = 'ApiException'
  }
}

export function handleApiError(error: unknown): Error {
  if (error instanceof ApiException) {
    return error
  }
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>
    if (axiosError.code === 'ECONNABORTED') {
      return new Error('Превышено время ожидания')
    }
    if (axiosError.response?.status === 502) {
      return new Error('Сервер временно недоступен (502 Bad Gateway)')
    }
    if (axiosError.response?.data) {
      return new ApiException(axiosError.response.data)
    }
    return new Error(axiosError.message)
  }
  if (error instanceof Error) {
    return error
  }
  return new Error('Произошла неизвестная ошибка')
}

export async function checkServerStatus(): Promise<boolean> {
  try {
    // Attempt a HEAD request to check server availability
    await api.head('/')
    return true
  } catch (error) {
    console.error('Server check failed:', error)
    return false
  }
}