import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../utils/cn'

interface FileUploaderProps {
  onFilesUpload: (files: File[]) => void
  acceptedFiles?: File[]
  onRemoveFile?: (file: File) => void
  verifying?: boolean
}

const dropzoneVariants = {
  active: {
    scale: 1.02,
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgb(239, 246, 255)'
  },
  inactive: {
    scale: 1,
    borderColor: 'rgb(209, 213, 219)',
    backgroundColor: 'white'
  }
}

const fileListVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: 'auto',
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
}

const fileItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export function FileUploader({ 
  onFilesUpload, 
  acceptedFiles = [], 
  onRemoveFile,
  verifying = false
}: FileUploaderProps) {
  const acceptedTypes = {
    'application/pdf': ['.pdf']
  }

  const onDrop = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const fileType = file.type.toLowerCase()
      return fileType === 'application/pdf'
    })
    
    if (validFiles.length > 0) {
      onFilesUpload(validFiles)
    } else if (newFiles.length > 0) {
      alert('Пожалуйста, загрузите только PDF файлы')
    }
  }, [onFilesUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    multiple: true,
    disabled: verifying
  })

  return (
    <div className="space-y-4">
      <motion.div
        {...getRootProps()}
        variants={dropzoneVariants}
        animate={isDragActive ? 'active' : 'inactive'}
        className={cn(
          'p-8 border-2 border-dashed rounded-xl transition-colors duration-200',
          verifying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'
        )}
      >
        <input {...getInputProps()} />
        <motion.div 
          className="flex flex-col items-center gap-3 text-gray-600"
          animate={verifying ? { opacity: 0.5 } : { opacity: 1 }}
        >
          {verifying ? (
            <>
              <motion.div
                animate={{ 
                  rotate: 360,
                  transition: { duration: 2, repeat: Infinity, ease: "linear" }
                }}
              >
                <Loader className="w-8 h-8 text-blue-600" />
              </motion.div>
              <p>Проверка файлов...</p>
            </>
          ) : isDragActive ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <Upload className="w-8 h-8 mb-2 mx-auto text-blue-500" />
              <p>Отпустите файлы здесь...</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="bg-blue-50 p-4 rounded-full"
              >
                <Upload className="w-8 h-8 text-blue-500" />
              </motion.div>
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  Перетащите файлы сюда или нажмите для выбора
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Поддерживаемый формат: PDF (можно загрузить несколько файлов)
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {acceptedFiles.length > 0 && (
          <motion.div
            variants={fileListVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-2"
          >
            {acceptedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                variants={fileItemVariants}
                className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm"
                whileHover={{ scale: 1.01 }}
              >
                <span className="text-sm text-gray-600">{file.name}</span>
                {onRemoveFile && !verifying && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemoveFile(file)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={verifying}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}