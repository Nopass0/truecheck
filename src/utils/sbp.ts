import axios from 'axios'
import { SbpVerificationResult } from '../types'

const SBP_API_BASE_URL = 'https://api.sbp.nspk.ru'
const SBP_API_KEY = import.meta.env.VITE_SBP_API_KEY

interface SbpApiResponse {
  operationId: string
  status: string
  timestamp: string
  amount: number
  sender: {
    bank: string
    account: string
  }
  recipient: {
    bank: string
    account: string
  }
}

export function extractSbpOperationId(text: string): string | null {
  // Common SBP operation ID patterns
  const patterns = [
    /(?:ID операции|Идентификатор операции|Операция)[\s:]*([\d-]+)/i,
    /SBP(?:ID|ИД)[\s:]*([\d-]+)/i,
    /СБП(?:ID|ИД)[\s:]*([\d-]+)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].replace(/[^\d]/g, '') // Clean up the ID to only contain digits
    }
  }

  return null
}

export async function verifySbpOperation(operationId: string): Promise<SbpVerificationResult> {
  if (!SBP_API_KEY) {
    return {
      verified: false,
      operationId,
      timestamp: null,
      amount: null,
      sender: null,
      recipient: null,
      error: 'SBP API key not configured'
    }
  }

  try {
    const response = await axios.get<SbpApiResponse>(
      `${SBP_API_BASE_URL}/operations/${operationId}`,
      {
        headers: {
          'Authorization': `Bearer ${SBP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return {
      verified: true,
      operationId,
      timestamp: response.data.timestamp,
      amount: response.data.amount,
      sender: response.data.sender.bank,
      recipient: response.data.recipient.bank
    }
  } catch (error) {
    console.error('SBP verification error:', error)
    
    let errorMessage = 'Failed to verify SBP operation'
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        errorMessage = 'SBP operation not found'
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid SBP API key'
      }
    }

    return {
      verified: false,
      operationId,
      timestamp: null,
      amount: null,
      sender: null,
      recipient: null,
      error: errorMessage
    }
  }
}