import { useState } from 'react'
import { FileUploader } from '../components/FileUploader'
import { VerificationResult } from '../components/VerificationResult'
import { verifyCheck } from '../utils/verification'
import { saveCheckToHistory } from '../utils/storage'
import { VerificationReport } from '../types'
import { ErrorDisplay } from '../components/ErrorDisplay'

export default function VerificationPage() {
  const [verifications, setVerifications] = useState<Map<string, {
    report: VerificationReport | null,
    error: string | null,
    verifying: boolean
  }>>(new Map())

  const handleFilesUpload = async (newFiles: File[]) => {
    // Initialize verification status for new files
    const updatedVerifications = new Map(verifications)
    newFiles.forEach(file => {
      updatedVerifications.set(file.name, {
        report: null,
        error: null,
        verifying: true
      })
    })
    setVerifications(updatedVerifications)

    // Process each file
    for (const file of newFiles) {
      try {
        const report = await verifyCheck(file)
        updatedVerifications.set(file.name, {
          report,
          error: null,
          verifying: false
        })
        setVerifications(new Map(updatedVerifications))
        
        // Save to history
        saveCheckToHistory({
          id: report.id,
          timestamp: report.timestamp,
          fileName: report.fileName,
          fileUrl: URL.createObjectURL(file),
          report
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка при проверке файла'
        updatedVerifications.set(file.name, {
          report: null,
          error: errorMessage,
          verifying: false
        })
        setVerifications(new Map(updatedVerifications))
      }
    }
  }

  const handleRemoveFile = (file: File) => {
    const updatedVerifications = new Map(verifications)
    updatedVerifications.delete(file.name)
    setVerifications(updatedVerifications)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Проверка подлинности банковских чеков
        </h2>
        <p className="text-gray-600 mb-6">
          Загрузите PDF-файлы банковских чеков для проверки их подлинности
        </p>

        <FileUploader 
          onFilesUpload={handleFilesUpload}
          acceptedFiles={Array.from(verifications.keys()).map(filename => {
            const file = new File([], filename)
            return file
          })}
          onRemoveFile={handleRemoveFile}
          verifying={Array.from(verifications.values()).some(status => status.verifying)}
        />

        {Array.from(verifications.entries()).map(([filename, status]) => (
          <div key={filename} className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">
              Результаты проверки: {filename}
            </h3>
            
            {status.error ? (
              <ErrorDisplay error={status.error} />
            ) : (
              <VerificationResult 
                verifying={status.verifying}
                report={status.report}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}