import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { ToastProvider, ToastViewport } from './components/ui/Toast'
import VerificationPage from './pages/VerificationPage'
import HistoryPage from './pages/HistoryPage'
import ContractAnalysisPage from './pages/ContractAnalysisPage'
import { cn } from './utils/cn'

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1 
    }
  }
}

const MotionNavLink = motion(NavLink)

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <motion.nav 
            className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-gray-100"
            variants={navVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex items-center h-16 gap-8">
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                    TrueCheck
                  </span>
                </motion.div>
                
                <div className="flex gap-4">
                  <MotionNavLink 
                    to="/" 
                    className={({ isActive }) =>
                      cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Проверка
                  </MotionNavLink>
                  <MotionNavLink 
                    to="/contract" 
                    className={({ isActive }) =>
                      cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Анализ договоров
                  </MotionNavLink>
                  <MotionNavLink 
                    to="/history" 
                    className={({ isActive }) =>
                      cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    История
                  </MotionNavLink>
                </div>
              </div>
            </div>
          </motion.nav>

          <main className="max-w-5xl mx-auto p-6">
            <Routes>
              <Route path="/" element={<VerificationPage />} />
              <Route path="/contract" element={<ContractAnalysisPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>
        </div>
        <ToastViewport />
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App