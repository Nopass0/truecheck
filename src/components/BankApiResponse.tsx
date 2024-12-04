import { BankApiVerification } from '../types'
import { CheckCircle, AlertTriangle } from 'lucide-react'

interface BankApiResponseProps {
  response: BankApiVerification
}

export function BankApiResponse({ response }: BankApiResponseProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {response.verified ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        )}
        <span className={`font-medium ${response.verified ? 'text-green-700' : 'text-red-700'}`}>
          {response.verified ? 'Подтверждено банком' : 'Не удалось подтвердить'}
        </span>
      </div>

      {/* Detailed API Response */}
      {response.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium mb-2">Ошибка:</p>
          <p className="text-sm text-red-600">{response.error}</p>

          {response.apiResponse && (
            <div className="mt-3 space-y-2">
              {response.apiResponse.code && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Код ошибки:</span> {response.apiResponse.code}
                </p>
              )}
              {response.apiResponse.message && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Сообщение:</span> {response.apiResponse.message}
                </p>
              )}
              {response.apiResponse.details && Object.keys(response.apiResponse.details).length > 0 && (
                <div className="text-sm text-red-600">
                  <p className="font-medium mb-1">Детали:</p>
                  <pre className="bg-red-100 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(response.apiResponse.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Operation Details */}
      <div className="space-y-2 text-sm">
        {response.operationId && (
          <div className="flex justify-between">
            <span className="text-gray-600">ID операции:</span>
            <span className="font-medium">{response.operationId}</span>
          </div>
        )}
        {response.timestamp && (
          <div className="flex justify-between">
            <span className="text-gray-600">Время операции:</span>
            <span className="font-medium">
              {new Date(response.timestamp).toLocaleString()}
            </span>
          </div>
        )}
        {response.amount && (
          <div className="flex justify-between">
            <span className="text-gray-600">Сумма:</span>
            <span className="font-medium">
              {response.amount.toLocaleString()} ₽
            </span>
          </div>
        )}
        {response.sender && (
          <div className="flex justify-between">
            <span className="text-gray-600">Отправитель:</span>
            <span className="font-medium">{response.sender}</span>
          </div>
        )}
        {response.recipient && (
          <div className="flex justify-between">
            <span className="text-gray-600">Получатель:</span>
            <span className="font-medium">{response.recipient}</span>
          </div>
        )}
        {response.bankReference && (
          <div className="flex justify-between">
            <span className="text-gray-600">Референс банка:</span>
            <span className="font-medium">{response.bankReference}</span>
          </div>
        )}
      </div>
    </div>
  )
}