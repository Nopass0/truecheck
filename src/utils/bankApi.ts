import axios from 'axios'
import { BankApiVerification, Bank } from '../types'
import { handleApiError } from './api'

const API_BASE_URL = 'https://api.truecheck.ru/v1'

export async function verifyWithBankApi(
  bank: Bank,
  operationData: {
    operationId: string
    amount?: number
    timestamp?: string
    sender?: string
    recipient?: string
  }
): Promise<BankApiVerification> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/verify/${bank}`,
      operationData,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    )

    return {
      verified: response.data.verified,
      operationId: operationData.operationId,
      timestamp: response.data.timestamp,
      amount: response.data.amount,
      sender: response.data.sender,
      recipient: response.data.recipient,
      bankReference: response.data.reference,
      additionalInfo: response.data.additionalInfo
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = {
        verified: false,
        operationId: operationData.operationId,
        timestamp: null,
        amount: null,
        sender: null,
        recipient: null,
        error: 'Ошибка при проверке операции',
        apiResponse: {
          code: error.response?.status?.toString(),
          message: error.response?.data?.message || error.message,
          details: error.response?.data
        }
      }

      if (error.response?.status === 404) {
        apiError.error = 'Операция не найдена в системе банка'
      } else if (error.response?.status === 401) {
        apiError.error = 'Ошибка авторизации при проверке в банке'
      } else if (error.response?.status === 400) {
        apiError.error = 'Неверные параметры запроса'
      } else if (error.response?.status === 500) {
        apiError.error = 'Внутренняя ошибка сервера банка'
      }

      return apiError
    }
    const error2 = handleApiError(error)
    throw new Error(`Ошибка при проверке в банке: ${error2.message}`)
  }
}