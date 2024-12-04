import axios, { AxiosError } from 'axios'
import { ContractAnalysis, AiVerificationDetails } from '../types'

const api = axios.create({
  baseURL: 'https://glhf.chat/api/openai/v1',
  headers: {
    'Authorization': `Bearer glhf_2e143d85b5600a314f520e06e106a966`,
    'Content-Type': 'application/json',
  }
})

export async function analyzeContract(text: string): Promise<ContractAnalysis> {
  const prompt = `Проанализируй следующий договор и дай подробный анализ:

${text}

Анализ должен включать:
1. Сильные стороны договора (с указанием номеров строк)
2. Слабые стороны и потенциальные риски (с указанием номеров строк)
3. Рекомендации по улучшению

Ответ должен быть в формате JSON:
{
  "strengths": [{"lineNumber": number, "text": string, "comment": string}],
  "weaknesses": [{"lineNumber": number, "text": string, "comment": string}],
  "risks": [{"severity": "high"|"medium"|"low", "description": string}],
  "lineComments": [{"lineNumber": number, "text": string, "type": "strength"|"weakness"|"neutral"}]
}`

  try {
    const response = await api.post('/chat/completions', {
      model: 'hf:meta-llama/Meta-Llama-3.1-405B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const content = response.data.choices[0].message.content
    
    try {
      return JSON.parse(content) as ContractAnalysis
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      throw new Error('Некорректный ответ от AI. Пожалуйста, попробуйте еще раз.')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 502) {
        throw new Error('Сервер временно недоступен (502 Bad Gateway). Пожалуйста, попробуйте позже.')
      }
      if (axiosError.response?.status === 429) {
        throw new Error('Превышен лимит запросов. Пожалуйста, подождите немного.')
      }
      throw new Error(axiosError.response?.data?.message || 'Произошла ошибка при обращении к серверу')
    }
    throw new Error('Неизвестная ошибка при обращении к серверу')
  }
}

export async function improveLine(lineText: string, context: string): Promise<string> {
  const prompt = `Улучши следующую строку договора, учитывая контекст всего документа.

Строка для улучшения:
"${lineText}"

Контекст документа:
${context}

Предложи улучшенную версию строки, которая:
1. Более четко выражает суть
2. Устраняет возможные юридические неточности
3. Защищает интересы сторон
4. Соответствует деловому стилю

Верни ТОЛЬКО улучшенную версию строки, без дополнительных пояснений.`

  try {
    const response = await api.post('/chat/completions', {
      model: 'hf:meta-llama/Meta-Llama-3.1-405B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const improvedLine = response.data.choices[0].message.content.trim()
    return improvedLine
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 502) {
        throw new Error('Сервер временно недоступен. Пожалуйста, попробуйте позже.')
      }
      if (axiosError.response?.status === 429) {
        throw new Error('Превышен лимит запросов. Пожалуйста, подождите немного.')
      }
      throw new Error(axiosError.response?.data?.message || 'Произошла ошибка при обращении к серверу')
    }
    throw new Error('Не удалось улучшить строку. Пожалуйста, попробуйте еще раз.')
  }
}

export async function verifyCheckWithAI(checkData: {
  extractedText: string,
  fileSize: string,
  pageSize: string,
  metadata: any,
  fileName: string
}): Promise<AiVerificationDetails> {
  const prompt = `Проанализируй следующий банковский чек и определи его подлинность.

Данные чека:
${checkData.extractedText}

Технические характеристики:
- Размер файла: ${checkData.fileSize}
- Размер страницы: ${checkData.pageSize}
- Имя файла: ${checkData.fileName}
- Метаданные: ${JSON.stringify(checkData.metadata)}

Проверь следующие аспекты:
1. Соответствие формата чека банковским стандартам
2. Корректность метаданных
3. Признаки редактирования
4. Структуру и расположение элементов
5. Наличие необходимых реквизитов

Ответ должен быть в следующем формате JSON:
{
  "conclusion": "краткий вывод о подлинности",
  "legitimacy": "legitimate|suspicious|forged",
  "confidence": число от 0 до 1,
  "warnings": ["список предупреждений"],
  "checkData": {
    "bank": "название банка",
    "checkType": "тип операции",
    "operationId": "ID операции если есть",
    "transferDate": "дата перевода если есть",
    "recipient": "получатель если есть"
  },
  "technicalDetails": {
    "fileWeight": "вес файла",
    "pageSize": "размер страницы",
    "blocks": "статус блоков",
    "fonts": "статус шрифтов",
    "images": "статус изображений",
    "editor": "признаки редактирования",
    "metadata": "статус метаданных"
  }
}`

  try {
    const response = await api.post('/chat/completions', {
      model: 'hf:meta-llama/Meta-Llama-3.1-405B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const content = response.data.choices[0].message.content
    
    try {
      const analysis = JSON.parse(content) as AiVerificationDetails
      return analysis
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      throw new Error('Некорректный ответ от AI. Пожалуйста, попробуйте еще раз.')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 502) {
        throw new Error('Сервер временно недоступен (502 Bad Gateway). Пожалуйста, попробуйте позже.')
      }
      if (axiosError.response?.status === 429) {
        throw new Error('Превышен лимит запросов. Пожалуйста, подождите немного.')
      }
      throw new Error(axiosError.response?.data?.message || 'Произошла ошибка при обращении к серверу')
    }
    throw new Error('Неизвестная ошибка при обращении к серверу')
  }
}