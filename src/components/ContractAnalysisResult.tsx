import { useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, Download, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeEditor from '@uiw/react-textarea-code-editor'
import { ContractAnalysis } from '../types'
import { generatePdf } from '../utils/pdf'
import { improveLine } from '../utils/ai'
import { cn } from '../utils/cn'

interface ContractAnalysisResultProps {
  analyzing: boolean
  analysis: ContractAnalysis | null
  contractText: string
  onTextUpdate: (text: string) => void
  originalFile: File | null
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1 
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export function ContractAnalysisResult({
  analyzing,
  analysis,
  contractText,
  onTextUpdate,
  originalFile
}: ContractAnalysisResultProps) {
  const [improving, setImproving] = useState(false)
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    strengths: true,
    weaknesses: true,
    risks: true,
    recommendations: true
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (analyzing) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-12 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { duration: 2, repeat: Infinity, ease: "linear" }
          }}
        >
          <Loader className="w-8 h-8 text-blue-600" />
        </motion.div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Анализируем договор</p>
          <p className="text-sm text-gray-500">Это может занять несколько минут</p>
        </div>
      </motion.div>
    )
  }

  if (!analysis) return null

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Summary Section */}
      {analysis.summary && (
        <motion.div 
          variants={itemVariants}
          className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100"
        >
          <h3 className="font-medium text-blue-900 mb-3">Общее заключение</h3>
          <p className="text-blue-800 leading-relaxed">{analysis.summary}</p>
        </motion.div>
      )}

      {/* Strengths Section */}
      <motion.div variants={itemVariants} className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => toggleSection('strengths')}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-gray-900">Сильные стороны</h3>
            <span className="text-sm text-gray-500">
              ({analysis.strengths.length})
            </span>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.strengths ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {expandedSections.strengths && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3 bg-gradient-to-br from-white to-gray-50">
                {analysis.strengths.map((strength, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Строка {strength.lineNumber}</span>
                    </div>
                    <p className="text-green-900 text-sm mb-2 font-medium">{strength.text}</p>
                    <p className="text-green-700 text-sm leading-relaxed">{strength.comment}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Contract Text Editor */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Текст договора</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Скачать PDF
          </motion.button>
        </div>

        <div className="relative rounded-xl overflow-hidden border shadow-inner">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r flex flex-col items-center pt-4 text-xs text-gray-400 select-none">
            {contractText.split('\n').map((_, i) => (
              <div key={i} className="h-[21px] leading-[21px]">{i + 1}</div>
            ))}
          </div>
          
          <div className="pl-12">
            <CodeEditor
              value={contractText}
              language="text"
              onChange={(evt) => onTextUpdate(evt.target.value)}
              padding={15}
              style={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                backgroundColor: '#ffffff',
                minHeight: '300px'
              }}
              data-color-mode="light"
            />
          </div>
          
          {analysis.lineComments.map((comment, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleImprove(comment.lineNumber, comment.text)}
              disabled={improving && selectedLine === comment.lineNumber}
              className={cn(
                "absolute right-2 transform -translate-y-1/2 px-3 py-1.5 text-xs rounded-full transition-all duration-300",
                comment.type === 'strength' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:shadow-md'
                  : comment.type === 'weakness'
                    ? 'bg-red-100 text-red-800 hover:bg-red-200 hover:shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-md',
                improving && selectedLine === comment.lineNumber ? 'opacity-50' : 'hover:scale-105'
              )}
              style={{ top: `${(comment.lineNumber * 21)}px` }}
            >
              {improving && selectedLine === comment.lineNumber ? (
                <span className="flex items-center gap-1">
                  <Loader className="w-3 h-3 animate-spin" />
                  Улучшаем...
                </span>
              ) : (
                <span>Улучшить</span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  async function handleImprove(lineNumber: number, lineText: string) {
    setImproving(true)
    setSelectedLine(lineNumber)
    setError(null)

    try {
      const improvedText = await improveLine(lineText, contractText)
      const lines = contractText.split('\n')
      lines[lineNumber - 1] = improvedText
      onTextUpdate(lines.join('\n'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось улучшить строку')
    } finally {
      setImproving(false)
      setSelectedLine(null)
    }
  }

  async function handleDownload() {
    if (!originalFile) return
    try {
      const pdfBlob = await generatePdf(contractText)
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `improved_${originalFile.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Не удалось создать PDF файл')
    }
  }
}