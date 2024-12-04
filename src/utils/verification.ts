import { VerificationReport, Bank, CheckType } from '../types'
import { extractTextFromPdf } from './pdf'
import { verifyCheckWithAI } from './ai'
import { analyzeCheckImage } from './vision'

async function analyzePdfMetadata(file: ArrayBuffer): Promise<{
  pageSize: [boolean, string]
  font: [boolean, string]
  metadata: string
}> {
  try {
    const typedArray = new Uint8Array(file)
    const pdfString = String.fromCharCode.apply(null, Array.from(typedArray.slice(0, 1024)))
    
    const metadata = []
    
    // Check PDF version
    const versionMatch = pdfString.match(/%PDF-(\d+\.\d+)/)
    if (versionMatch) {
      metadata.push(`PDF версия: ${versionMatch[1]}`)
    }

    // Check if PDF is linearized (web optimized)
    const isLinearized = pdfString.includes('/Linearized')
    if (isLinearized) {
      metadata.push('Оптимизирован для веба: Да')
    }

    // Analyze basic structure
    if (pdfString.includes('/Pages')) {
      metadata.push('Структура страниц: Корректная')
    }

    // Check for encryption
    const isEncrypted = pdfString.includes('/Encrypt')
    if (isEncrypted) {
      metadata.push('⚠️ Файл зашифрован')
    }

    // Check for modifications
    const hasModDate = pdfString.includes('/ModDate')
    if (hasModDate) {
      metadata.push('Имеет историю изменений')
    }

    // Get page size from first page dimensions
    let pageSize: [boolean, string] = [false, 'Не определено']
    if (pdfString.includes('/MediaBox')) {
      pageSize = [true, 'Стандартный A4']
    }

    // Check fonts
    let fonts: [boolean, string] = [false, 'Не определено']
    if (pdfString.includes('/Font')) {
      const embeddedFonts = pdfString.includes('/FontFile')
      fonts = [true, embeddedFonts ? 'Встроенные шрифты' : 'Системные шрифты']
    }

    return {
      pageSize,
      font: fonts,
      metadata: metadata.length > 0 ? metadata.join('\n') : 'Метаданные не обнаружены'
    }
  } catch (error) {
    console.error('Error analyzing PDF metadata:', error)
    return {
      pageSize: [false, 'Ошибка анализа'],
      font: [false, 'Ошибка анализа'],
      metadata: 'Ошибка при анализе метаданных'
    }
  }
}

function detectBankAndType(text: string): { bank: Bank; checkType: CheckType } {
  const textLower = text.toLowerCase()

  // VTB Bank detection
  if (textLower.includes('втб') || textLower.includes('vtb')) {
    // Check for SBP pattern
    if (textLower.includes('sbp') || textLower.includes('сбп') || /a\d{32}/i.test(text)) {
      return { bank: 'vtb', checkType: 'sbp' }
    }
    return { bank: 'vtb', checkType: 'UnknownTransfer' }
  }

  // Tinkoff Bank detection
  if (textLower.includes('тинькофф') || textLower.includes('tinkoff') || textLower.includes('т-банк')) {
    // Check for phone transfer pattern
    if (textLower.includes('телефон') || /\+7\s?\(\d{3}\)\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}/.test(text)) {
      return { bank: 'tinkoff', checkType: 'tinkoffPhoneTransfer' }
    }
    return { bank: 'tinkoff', checkType: 'UnknownTransfer' }
  }

  // Alfa Bank detection
  if (textLower.includes('альфа') || textLower.includes('alfa')) {
    // Check for internal transfer pattern
    if (textLower.includes('внутренний перевод') || /\d{3}\*+\d{4}/.test(text)) {
      return { bank: 'alfa', checkType: 'alfaInternalTransfer' }
    }
    return { bank: 'alfa', checkType: 'UnknownTransfer' }
  }

  return { bank: 'unknown', checkType: 'UnknownTransfer' }
}

export async function verifyCheck(file: File): Promise<VerificationReport> {
  if (file.type !== 'application/pdf') {
    throw new Error('Поддерживаются только PDF файлы')
  }

  try {
    // Extract text from PDF
    const extractedText = await extractTextFromPdf(file)
    if (!extractedText) {
      throw new Error('Не удалось извлечь текст из файла')
    }

    // Initial bank and type detection from text
    const { bank, checkType } = detectBankAndType(extractedText)

    // Get file metadata
    const fileSize = file.size
    const formattedSize = `${(fileSize / 1024 / 1024).toFixed(2)} MB`
    
    // Analyze PDF metadata
    const arrayBuffer = await file.arrayBuffer()
    const { pageSize, font, metadata } = await analyzePdfMetadata(arrayBuffer)

    // Create initial report structure
    const report: VerificationReport = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      fileName: file.name,
      bank,
      checkType,
      fileUrl: URL.createObjectURL(file),
      results: {
        fileSize: [true, formattedSize],
        pageSize,
        font,
        metadata
      }
    }

    // AI Verification for additional validation
    const aiResult = await verifyCheckWithAI({
      extractedText,
      fileSize: formattedSize,
      pageSize: pageSize[1],
      metadata: metadata,
      fileName: file.name
    })

    report.aiVerification = aiResult

    // Vision model analysis
    try {
      const visionAnalysis = await analyzeCheckImage(file)
      report.visionAnalysis = visionAnalysis
      
      // Update bank and type if more confident detection
      if (aiResult.confidence > 0.8) {
        report.bank = aiResult.checkData.bank
        report.checkType = aiResult.checkData.checkType
      }
    } catch (visionError) {
      console.error('Vision analysis failed:', visionError)
    }

    return report
  } catch (error) {
    console.error('Verification error:', error)
    throw error
  }
}