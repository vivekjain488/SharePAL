import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { useApp } from '../context/AppContext.jsx'
import toast from 'react-hot-toast'

const CodeEditor = () => {
  const { currentCode, setCurrentCode, shareCode } = useApp()

  const handleCodeChange = useCallback((value) => {
    setCurrentCode(value)
  }, [setCurrentCode])

  const handleShare = () => {
    if (!currentCode.trim()) {
      toast.error('Please enter some code to share')
      return
    }

    shareCode(currentCode, 'text', 'shared-code')
    setCurrentCode('')
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleShare()
    }
  }

  return (
    <motion.div 
      className="glass-morphism rounded-xl p-4"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Code Editor</h2>
      </div>

      <div className="relative mb-4">
        <CodeMirror
          value={currentCode}
          height="250px"
          theme={oneDark}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          placeholder={`Start typing and share with everyone...\n\nTip: Press Ctrl+Enter to share quickly!`}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: true,
            searchKeymap: true
          }}
        />
      </div>

      {/* Bottom Info & Button Section */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center space-x-2 text-white/60 text-xs">
          <span>Lines: {currentCode.split('\n').length}</span>
          <span>•</span>
          <span>Chars: {currentCode.length}</span>
          <span>•</span>
          <span>Ctrl+Enter to share</span>
        </div>
        
        <motion.button
          onClick={handleShare}
          disabled={!currentCode.trim()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium 
                     hover:from-blue-600 hover:to-purple-700 transition-all duration-200 
                     shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Share Code
        </motion.button>
      </div>
    </motion.div>
  )
}

export default CodeEditor