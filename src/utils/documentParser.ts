import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${getDocument.version}/pdf.worker.min.js`

export async function extractTextFromDocument(file: File): Promise<string> {
  const fileType = file.type.toLowerCase()

  // Handle PDF files
  if (fileType === 'application/pdf') {
    return extractTextFromPdf(file)
  }
  
  throw new Error(`Неподдерживаемый тип файла: ${fileType}. Поддерживаются только PDF файлы.`)
}

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      fullText += pageText + '\n'
    }
    
    if (!fullText.trim()) {
      throw new Error('PDF файл не содержит текстового слоя или текст не может быть извлечен')
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Не удалось обработать PDF файл. Убедитесь, что файл не поврежден и содержит текстовый слой.')
  }
}