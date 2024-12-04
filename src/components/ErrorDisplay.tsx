import { AlertTriangle } from 'lucide-react'

interface ErrorDisplayProps {
  error: string
  className?: string
}

export function ErrorDisplay({ error, className = '' }: ErrorDisplayProps) {
  return (
    <div className={`flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-700 text-sm">{error}</p>
        {error.includes('текстового слоя') && (
          <p className="text-red-600 text-xs mt-1">
            Подсказка: Если файл является сканом, попробуйте сначала пересохранить его с помощью OCR-программы.
          </p>
        )}
        {error.includes('зашифрован') && (
          <p className="text-red-600 text-xs mt-1">
            Подсказка: Снимите защиту с PDF файла перед загрузкой.
          </p>
        )}
      </div>
    </div>
  )
}