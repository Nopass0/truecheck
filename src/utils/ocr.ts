import { createWorker } from 'tesseract.js'

export async function extractTextFromImage(file: File): Promise<string> {
  const worker = await createWorker('rus')
  
  try {
    const imageUrl = URL.createObjectURL(file)
    const { data: { text } } = await worker.recognize(imageUrl)
    URL.revokeObjectURL(imageUrl)
    return text
  } finally {
    await worker.terminate()
  }
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

interface ExtractedCheckData {
  amount?: string
  date?: string
  sender?: string
  recipient?: string
  phone?: string
  bank?: string
}

export function parseCheckText(text: string): ExtractedCheckData {
  const data: ExtractedCheckData = {}
  
  // Amount
  const amountMatch = text.match(/(\d{1,3}(?:\s?\d{3})*)\s*₽/)
  if (amountMatch) {
    data.amount = amountMatch[1].replace(/\s/g, '')
  }

  // Date
  const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/)
  if (dateMatch) {
    data.date = dateMatch[1]
  }

  // Phone
  const phoneMatch = text.match(/(?:\+7|8)[\s(]*\d{3}[)\s]*\d{3}[-\s]*\d{2}[-\s]*\d{2}/)
  if (phoneMatch) {
    data.phone = phoneMatch[0].replace(/\D/g, '')
  }

  // Bank detection (in this case, looking for Tinkoff/T-Bank indicators)
  if (text.includes('ТИНЬКОФФ') || text.includes('Т-БАНК') || text.includes('T-BANK')) {
    data.bank = 'tinkoff'
  }

  return data
}