import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import toast from 'react-hot-toast'

const InlineEditor = () => {
  const { currentCode, setCurrentCode, shareCode } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState('')
  const editorRef = useRef(null)

  const handleStartEdit = () => {
    setIsEditing(true)
    setLocalContent(currentCode)
    setTimeout(() => editorRef.current?.focus(), 100)
  }

  const handleSave = async () => {
    if (localContent.trim()) {
      setCurrentCode(localContent)
      await shareCode(localContent, 'text', 'inline-edit')
      toast.success('Changes saved & shared!')
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLocalContent(currentCode)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <motion.div
      className="glass-morphism rounded-lg p-4 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">Quick Editor</h3>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleStartEdit}
              className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        {isEditing ? (
          <textarea
            ref={editorRef}
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-32 bg-black/20 text-white p-3 rounded border border-white/10 focus:border-white/30 outline-none resize-none font-mono text-sm"
            placeholder="Start typing your code or text..."
          />
        ) : (
          <div
            onClick={handleStartEdit}
            className="w-full h-32 bg-black/20 text-white/70 p-3 rounded border border-white/10 hover:border-white/20 cursor-pointer font-mono text-sm overflow-auto"
          >
            {currentCode || (
              <span className="text-white/50 italic">Click to start editing...</span>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mt-2 text-xs text-white/50">
          Press <kbd className="bg-white/10 px-1 rounded">Ctrl+Enter</kbd> to save, <kbd className="bg-white/10 px-1 rounded">Esc</kbd> to cancel
        </div>
      )}
    </motion.div>
  )
}

export default InlineEditor