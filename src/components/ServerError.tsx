import { AlertCircle, RefreshCcw, Loader } from 'lucide-react'

interface ServerErrorProps {
  onRetry?: () => void
  error?: string
  subtext?: string
  retryCount?: number
  isRetrying?: boolean
}

export function ServerError({ onRetry, error, subtext, retryCount, isRetrying }: ServerErrorProps) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-red-100">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-red-50 p-3 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error || '502 Bad Gateway'}
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md">
          {subtext || 'Сервер временно недоступен. Возможно, он перегружен или проводятся технические работы.'}
          {retryCount !== undefined && retryCount > 0 && (
            <span className="block mt-2 text-sm text-gray-500">
              Попыток переподключения: {retryCount}
            </span>
          )}
        </p>

        {onRetry && (
          <div className="space-y-3">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Подключение...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  Повторить попытку
                </>
              )}
            </button>
            <p className="text-sm text-gray-500">
              Если проблема сохраняется, пожалуйста, попробуйте позже
            </p>
          </div>
        )}
      </div>
    </div>
  )
}