import { useState, useEffect } from 'react'
import { getCheckHistory, clearHistory } from '../utils/storage'
import { StoredCheck } from '../types'
import { Check, AlertTriangle, Trash2 } from 'lucide-react'

export default function HistoryPage() {
  const [checks, setChecks] = useState<StoredCheck[]>([])

  useEffect(() => {
    setChecks(getCheckHistory())
  }, [])

  const handleClearHistory = () => {
    if (confirm('Вы уверены, что хотите очистить историю проверок?')) {
      clearHistory()
      setChecks([])
    }
  }

  if (checks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">История проверок пуста</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">История проверок</h2>
        <button
          onClick={handleClearHistory}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
          Очистить историю
        </button>
      </div>

      <div className="space-y-4">
        {checks.map(check => (
          <div 
            key={check.id}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {check.report.checkType === 'UnknownTransfer' ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <Check className="w-5 h-5 text-green-500" />
                )}
                <span className="font-medium">{check.fileName}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(check.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="text-sm text-gray-600">
              <div>Тип: {check.report.checkType}</div>
              <div>Банк: {check.report.bank || 'Неизвестно'}</div>
              
              {check.report.checkType !== 'UnknownTransfer' && (
                <div className="mt-2 space-y-1">
                  <div>Размер страницы: {check.report.results.pageSize[1]}</div>
                  <div>Размер файла: {check.report.results.fileSize[1]}</div>
                  <div>Шрифты: {check.report.results.font[1]}</div>
                  <div className="whitespace-pre-line">{check.report.results.metadata}</div>
                </div>
              )}
            </div>

            <a
              href={check.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Открыть чек
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}