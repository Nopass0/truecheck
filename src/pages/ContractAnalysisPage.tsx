import { useState } from 'react'
import { FileUploader } from '../components/FileUploader'
import { ContractAnalysisResult } from '../components/ContractAnalysisResult'
import { ContractChat } from '../components/ContractChat'
import { ErrorDisplay } from '../components/ErrorDisplay'
import { ServerError } from '../components/ServerError'
import { ContractAnalysis, ChatMessage } from '../types'
import { analyzeContract } from '../utils/ai'
import { extractTextFromPdf } from '../utils/pdf'
import { checkServerStatus } from '../utils/api'
import { useToast } from '../hooks/useToast'

export default function ContractAnalysisPage() {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [contractText, setContractText] = useState<string>('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [serverError, setServerError] = useState<boolean>(false)
  const { addToast } = useToast()

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]

    setAnalyzing(true)
    setError(null)
    setAnalysis(null)
    setFile(file)
    
    try {
      const text = await extractTextFromPdf(file)
      setContractText(text)
      
      const analysisResult = await analyzeContract(text)
      setAnalysis(analysisResult)
      addToast('Анализ договора успешно завершен', 'success')
    } catch (error) {
      console.error('Analysis error:', error)
      const message = error instanceof Error ? error.message : 'Произошла ошибка при анализе договора'
      setError(message)
      addToast(message, 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleChatMessage = async (message: string) => {
    try {
      const newUserMessage = { role: 'user' as const, content: message }
      setChatMessages(prev => [...prev, newUserMessage])

      // Here you would typically call your AI API
      const response = await new Promise(resolve => 
        setTimeout(() => resolve("Спасибо за ваш вопрос. К сожалению, функционал чата временно недоступен."), 1000)
      )

      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: response as string }
      ])
    } catch (error) {
      addToast('Не удалось отправить сообщение', 'error')
    }
  }

  if (serverError) {
    return (
      <ServerError 
        onRetry={async () => {
          const isAvailable = await checkServerStatus()
          setServerError(!isAvailable)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            AI Анализ договоров
          </h2>
          <p className="text-gray-600 mb-6">
            Загрузите PDF файл договора для анализа его условий, рисков и получения рекомендаций по улучшению
          </p>

          <FileUploader 
            onFilesUpload={handleFileUpload}
            acceptedFiles={file ? [file] : []}
            onRemoveFile={() => {
              setFile(null)
              setAnalysis(null)
              setContractText('')
              setChatMessages([])
            }}
            verifying={analyzing}
          />
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto">
          <ErrorDisplay error={error} />
        </div>
      )}

      {(analyzing || analysis) && !error && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <ContractAnalysisResult
            analyzing={analyzing}
            analysis={analysis}
            contractText={contractText}
            onTextUpdate={setContractText}
            originalFile={file}
          />
        </div>
      )}

      {analysis && !error && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <ContractChat
            messages={chatMessages}
            onSendMessage={handleChatMessage}
            context={contractText}
          />
        </div>
      )}
    </div>
  )
}