import { VerificationReport } from '../types'
import { VisionAnalysisResult } from './VisionAnalysisResult'
import { Loader, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '../utils/cn'

interface VerificationResultProps {
  verifying: boolean
  report: VerificationReport | null
}

function getStatusColor(result: [boolean, string]) {
  if (!result[0]) return 'bg-yellow-50 border-yellow-200 text-yellow-700'
  return 'bg-green-50 border-green-200 text-green-700'
}

function getAiVerificationColor(conclusion: string | undefined) {
  if (!conclusion) return 'bg-gray-50 border-gray-200'
  if (conclusion.toLowerCase().includes('подозрительн') || conclusion.toLowerCase().includes('предупрежден'))
    return 'bg-yellow-50 border-yellow-200'
  if (conclusion.toLowerCase().includes('недействительн') || conclusion.toLowerCase().includes('поддельн'))
    return 'bg-red-50 border-red-200'
  return 'bg-green-50 border-green-200'
}

export function VerificationResult({ verifying, report }: VerificationResultProps) {
  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Проверяем документ</p>
          <p className="text-sm text-gray-500">Это может занять некоторое время</p>
        </div>
      </div>
    )
  }

  if (!report) return null

  const hasWarnings = 
    !report.results.pageSize[0] || 
    !report.results.font[0] || 
    !report.results.metadata ||
    report.aiVerification?.warnings.length > 0

  return (
    <div className="space-y-6">
      {/* Vision Analysis */}
      {report.visionAnalysis && (
        <div className="p-4 rounded-lg border bg-white">
          <h3 className="font-medium text-gray-900 mb-4">Анализ изображения</h3>
          <VisionAnalysisResult analysis={report.visionAnalysis} />
        </div>
      )}

      {/* AI Analysis */}
      {report.aiVerification && (
        <div className={cn(
          "p-4 rounded-lg border",
          getAiVerificationColor(report.aiVerification.conclusion)
        )}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-medium text-gray-900">Анализ ИИ</h3>
            {report.aiVerification.warnings.length > 0 && (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-800">{report.aiVerification.conclusion}</p>
            </div>

            {report.aiVerification.warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-medium text-yellow-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Предупреждения:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {report.aiVerification.warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-600 ml-2">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basic File Information */}
      <div className="p-4 rounded-lg border bg-white">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-medium text-gray-900">Информация о файле</h3>
          {hasWarnings && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
        </div>

        <div className="space-y-3">
          {/* File Size */}
          <div className={cn(
            "p-3 rounded-lg border",
            getStatusColor(report.results.fileSize)
          )}>
            <div className="flex justify-between items-center">
              <span className="font-medium">Размер файла:</span>
              <div className="flex items-center gap-2">
                <span>{report.results.fileSize[1]}</span>
                {report.results.fileSize[0] ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>

          {/* Page Size */}
          <div className={cn(
            "p-3 rounded-lg border",
            getStatusColor(report.results.pageSize)
          )}>
            <div className="flex justify-between items-center">
              <span className="font-medium">Размер страницы:</span>
              <div className="flex items-center gap-2">
                <span>{report.results.pageSize[1]}</span>
                {report.results.pageSize[0] ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>

          {/* Fonts */}
          <div className={cn(
            "p-3 rounded-lg border",
            getStatusColor(report.results.font)
          )}>
            <div className="flex justify-between items-center">
              <span className="font-medium">Шрифты:</span>
              <div className="flex items-center gap-2">
                <span>{report.results.font[1]}</span>
                {report.results.font[0] ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className={cn(
            "p-3 rounded-lg border",
            report.results.metadata === 'Анализ...' 
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
          )}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Метаданные:</span>
                {report.results.metadata === 'Анализ...' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <pre className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                {report.results.metadata}
              </pre>
            </div>
          </div>
        </div>

        {hasWarnings && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Обнаружены предупреждения
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-yellow-600">
              {!report.results.pageSize[0] && (
                <li>Не определен размер страницы</li>
              )}
              {!report.results.font[0] && (
                <li>Не определены шрифты документа</li>
              )}
              {report.results.metadata === 'Анализ...' && (
                <li>Метаданные не проанализированы</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}