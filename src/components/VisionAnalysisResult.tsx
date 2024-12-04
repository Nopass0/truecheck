import { VisionAnalysis } from '../types'
import { CheckCircle, AlertTriangle, Search } from 'lucide-react'

interface VisionAnalysisResultProps {
  analysis: VisionAnalysis
}

export function VisionAnalysisResult({ analysis }: VisionAnalysisResultProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-blue-500" />
        <span className="font-medium text-blue-700">
          Анализ изображения чека
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {analysis.verified ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        )}
        <span className={`font-medium ${
          analysis.verified ? 'text-green-700' : 'text-yellow-700'
        }`}>
          {analysis.verified ? 'Подтверждено' : 'Требует проверки'}
        </span>
        <span className="text-sm text-gray-500">
          (уверенность: {Math.round(analysis.confidence * 100)}%)
        </span>
      </div>

      {analysis.warning && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">Предупреждение:</span> {analysis.warning}
          </p>
        </div>
      )}

      <div className="space-y-2 text-sm">
        {Object.entries(analysis.extractedData).map(([key, value]) => {
          if (!value) return null
          const label = {
            amount: 'Сумма',
            date: 'Дата',
            bankName: 'Банк',
            operationType: 'Тип операции',
            sender: 'Отправитель',
            recipient: 'Получатель',
            reference: 'Референс'
          }[key]
          
          return (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{label}:</span>
              <span className="font-medium">{value}</span>
            </div>
          )
        })}
      </div>

      <details className="mt-4">
        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
          Показать исходный анализ
        </summary>
        <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
          {analysis.rawAnalysis}
        </pre>
      </details>
    </div>
  )
}