import { getDocument, PDFDocumentProxy, GlobalWorkerOptions, version } from 'pdfjs-dist'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs'
import { jsPDF } from 'jspdf'

// Configure worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  const workerBlob = new Blob([pdfjsWorker.default], { type: 'text/javascript' })
  const workerUrl = URL.createObjectURL(workerBlob)
  GlobalWorkerOptions.workerSrc = workerUrl
}

export async function extractTextFromPdf(file: File): Promise<string> {
  let pdf: PDFDocumentProxy | null = null

  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load the PDF document
    pdf = await getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      isEvalSupported: false,
      disableFontFace: true
    }).promise
    
    let fullText = ''
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        
        if (!textContent.items || textContent.items.length === 0) {
          console.warn(`Page ${i}: No text content found`)
          continue
        }

        const pageText = textContent.items
          .filter((item: any) => item.str && typeof item.str === 'string')
          .map((item: any) => item.str)
          .join(' ')
        
        fullText += pageText + '\n'
      } catch (pageError) {
        console.error(`Error extracting text from page ${i}:`, pageError)
        continue // Continue with next page even if current fails
      }
    }
    
    // Validate extracted text
    if (!fullText.trim()) {
      throw new Error('PDF файл не содержит текстового слоя или текст не может быть извлечен. Возможно, файл является сканированным документом.')
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF structure')) {
        throw new Error('Файл PDF поврежден или имеет неверную структуру')
      }
      if (error.message.includes('Decrypt')) {
        throw new Error('PDF файл зашифрован. Пожалуйста, предоставьте незашифрованную версию')
      }
      throw error
    }
    
    throw new Error('Не удалось извлечь текст из PDF файла. Убедитесь, что файл не поврежден и содержит текстовый слой')
  } finally {
    // Cleanup
    if (pdf) {
      try {
        await pdf.destroy()
      } catch (e) {
        console.error('Error destroying PDF document:', e)
      }
    }
  }
}

export async function generatePdf(text: string): Promise<Blob> {
  try {
    // Create new PDF document
    const doc = new jsPDF()
    
    // Configure font
    doc.setFont('helvetica')
    doc.setFontSize(11)
    
    // Split text into lines
    const lines = text.split('\n')
    
    // Add text to PDF
    let y = 20 // Starting y position
    lines.forEach((line) => {
      // Check if we need a new page
      if (y > 280) {
        doc.addPage()
        y = 20
      }
      
      // Ensure line is not too long for page width
      const maxWidth = 170 // Maximum width in mm
      const wrappedText = doc.splitTextToSize(line, maxWidth)
      
      // Add each wrapped line
      wrappedText.forEach((wrappedLine: string) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        doc.text(wrappedLine, 20, y)
        y += 7 // Move down for next line
      })
    })
    
    // Convert to blob
    return doc.output('blob')
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Не удалось сгенерировать PDF файл')
  }
}

// Helper function to render PDF page to canvas
export async function renderPdfPageToCanvas(
  pdfArrayBuffer: ArrayBuffer, 
  pageNumber = 1, 
  scale = 2.0
): Promise<string> {
  let pdf: PDFDocumentProxy | null = null
  
  try {
    // Load the PDF
    pdf = await getDocument({ 
      data: pdfArrayBuffer,
      isEvalSupported: false,
      disableFontFace: true
    }).promise
    
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale })
    
    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get canvas context')
    }
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport
    }).promise
    
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error rendering PDF page:', error)
    throw new Error('Failed to render PDF page')
  } finally {
    // Cleanup
    if (pdf) {
      try {
        await pdf.destroy()
      } catch (e) {
        console.error('Error destroying PDF document:', e)
      }
    }
  }
}