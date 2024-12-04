import { StoredCheck } from '../types'

const STORAGE_KEY = 'check-history'

export function saveCheckToHistory(check: StoredCheck) {
  const history = getCheckHistory()
  const newHistory = [check, ...history].slice(0, 50) // Keep last 50 checks
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
}

export function getCheckHistory(): StoredCheck[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  return JSON.parse(stored)
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}