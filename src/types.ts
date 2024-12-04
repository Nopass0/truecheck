// Bank and check types
export type Bank = 'vtb' | 'tinkoff' | 'alfa' | 'sber' | 'unknown'
export type CheckType = 
  | 'sbp' 
  | 'tinkoffPhoneTransfer'
  | 'alfaInternalTransfer'
  | 'UnknownTransfer'

export interface ContractAnalysis {
  strengths: ContractPoint[]
  weaknesses: ContractPoint[]
  risks: ContractRisk[]
  lineComments: LineComment[]
  recommendations?: string[]
  summary?: string
}

export interface ContractPoint {
  lineNumber: number
  text: string
  comment: string
}

export interface ContractRisk {
  severity: 'high' | 'medium' | 'low'
  description: string
  recommendation?: string
}

export interface LineComment {
  lineNumber: number
  text: string
  type: 'strength' | 'weakness' | 'neutral'
  suggestion?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface VerificationReport {
  id: string
  timestamp: string
  fileName: string
  bank: Bank
  checkType: CheckType
  fileUrl: string
  results: {
    fileSize: [boolean, string]
    pageSize: [boolean, string]
    font: [boolean, string]
    metadata: string
  }
  aiVerification?: AiVerificationDetails
  visionAnalysis?: VisionAnalysis
}

export interface AiVerificationDetails {
  conclusion: string
  legitimacy: 'legitimate' | 'suspicious' | 'forged'
  confidence: number
  warnings: string[]
  checkData: {
    bank: Bank
    checkType: CheckType
    operationId?: string
    transferDate?: string
    recipient?: string
    recipientPhone?: string
  }
  technicalDetails: {
    fileWeight: string
    pageSize: string
    blocks: string
    fonts: string
    images: string
    editor: string
    metadata: string
  }
}

export interface VisionAnalysis {
  verified: boolean
  confidence: number
  extractedData: {
    amount?: string
    date?: string
    bankName?: string
    operationType?: string
    sender?: string
    recipient?: string
    recipientPhone?: string
    operationId?: string
    reference?: string
  }
  rawAnalysis: string
  warning?: string
}

export interface BankApiVerification {
  verified: boolean
  operationId?: string
  timestamp?: string | null
  amount?: number | null
  sender?: string | null
  recipient?: string | null
  bankReference?: string
  additionalInfo?: Record<string, any>
  error?: string
  apiResponse?: {
    code?: string
    message?: string
    details?: Record<string, any>
  }
}

export interface StoredCheck {
  id: string
  timestamp: string
  fileName: string
  fileUrl: string
  report: VerificationReport
}

export interface FileValidation {
  valid: boolean
  error?: string
}