import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import toast from 'react-hot-toast'

const QuickActions = () => {
  const { currentCode, setCurrentCode, shareCode, isConnected } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Quick save with Ctrl+S
  const handleQuickSave = async () => {
    if (!currentCode.trim()) {
      toast.error('Nothing to save')
      return
    }

    setIsSaving(true)
    
    try {
      await shareCode(currentCode, 'text', 'quick-save')
      toast.success('Code saved & shared!')
      
      // Visual feedback
      setTimeout(() => setIsSaving(false), 1000)
    } catch (error) {
      toast.error('Failed to save')
      setIsSaving(false)
    }
  }

  // Quick copy functionality
  const handleQuickCopy = async () => {
    if (!currentCode.trim()) {
      toast.error('Nothing to copy')
      return
    }

    try {
      await navigator.clipboard.writeText(currentCode)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleQuickSave()
            break
          case 'c':
            if (e.shiftKey) {
              e.preventDefault()
              handleQuickCopy()
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentCode])

  return (
    <motion.div
      className="fixed top-4 right-4 z-50 flex items-center space-x-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Connection Status */}
      <div className="flex items-center space-x-2 glass-morphism px-3 py-2 rounded-lg">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-white/70 text-sm">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-1 glass-morphism px-2 py-2 rounded-lg">
        {/* Save Button */}
        <motion.button
          onClick={handleQuickSave}
          disabled={!currentCode.trim() || !isConnected}
          className="p-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Save & Share (Ctrl+S)"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </motion.button>

        {/* Copy Button */}
        <motion.button
          onClick={handleQuickCopy}
          disabled={!currentCode.trim()}
          className="p-2 rounded text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Copy to Clipboard (Ctrl+Shift+C)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </motion.button>

        {/* Clear Button */}
        <motion.button
          onClick={() => {
            setCurrentCode('')
            toast.success('Editor cleared')
          }}
          disabled={!currentCode.trim()}
          className="p-2 rounded text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Clear Editor"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </motion.button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="hidden lg:block glass-morphism px-3 py-2 rounded-lg text-xs text-white/50">
        <div>Ctrl+S: Save</div>
        <div>Ctrl+Shift+C: Copy</div>
      </div>
    </motion.div>
  )
}

export default QuickActions