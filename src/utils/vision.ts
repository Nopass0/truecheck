import { VisionAnalysis } from '../types'
import { api } from './api'
import { renderPdfPageToCanvas } from './pdf'

export async function analyzeCheckImage(file: File): Promise<VisionAnalysis> {
  try {
    // Convert PDF to image
    const pdfArrayBuffer = await file.arrayBuffer()
    const base64Image = await renderPdfPageToCanvas(pdfArrayBuffer)

    const prompt = `Analyze this bank check image and extract the following information:
1. Amount
2. Date
3. Bank name
4. Operation type
5. Sender (if available)
6. Recipient (if available)
7. Reference number or operation ID

Also verify if this appears to be a legitimate bank check and note any suspicious elements.
Include any specific details about VTB Bank (ВТБ) if present.

Format your response as:
Amount: [amount]
Date: [date]
Bank: [bank name]
Operation: [type]
Sender: [name]
Recipient: [name]
Reference: [number]
Legitimate: [yes/no]
Confidence: [0-100]
Warning: [any suspicious elements]`

    const response = await api.post('/chat/completions', {
      model: 'hf:meta-llama/Llama-3.2-90B-Vision-Instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', url: base64Image }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const analysis = response.data.choices[0].message.content
    
    // Parse the response
    const lines = analysis.split('\n')
    const extractedData: VisionAnalysis['extractedData'] = {}
    let verified = false
    let confidence = 0
    let warning = undefined

    lines.forEach(line => {
      const [key, value] = line.split(': ').map(s => s.trim())
      switch (key.toLowerCase()) {
        case 'amount':
          extractedData.amount = value.replace(/[^\d.,]/g, '')
          break
        case 'date':
          extractedData.date = value
          break
        case 'bank':
          extractedData.bankName = value
          break
        case 'operation':
          extractedData.operationType = value
          break
        case 'sender':
          if (value && value !== 'N/A') extractedData.sender = value
          break
        case 'recipient':
          if (value && value !== 'N/A') extractedData.recipient = value
          break
        case 'reference':
          if (value && value !== 'N/A') extractedData.reference = value
          break
        case 'legitimate':
          verified = value.toLowerCase() === 'yes'
          break
        case 'confidence':
          confidence = parseInt(value) / 100
          break
        case 'warning':
          if (value && value !== 'N/A' && value !== 'None') warning = value
          break
      }
    })

    return {
      verified,
      confidence,
      extractedData,
      rawAnalysis: analysis,
      warning
    }
  } catch (error) {
    console.error('Vision analysis error:', error)
    throw new Error('Failed to analyze check image. Please try again.')
  }
}