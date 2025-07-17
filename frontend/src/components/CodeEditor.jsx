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

  const clearCode = () => {
    setCurrentCode('')
  }

  return (
    <motion.div 
      className="glass-morphism rounded-lg p-5 h-[28rem] flex flex-col shadow-lg border border-white/20 hover:border-white/30 transition-all duration-300"
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-white ml-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Code Editor
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-white/50 px-3 py-1 bg-white/5 rounded-full">
            {currentCode.split('\n').length} lines
          </div>
          <motion.button
            onClick={clearCode}
            disabled={!currentCode.trim()}
            className="px-3 py-1.5 text-sm rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear
          </motion.button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 mb-4 relative overflow-hidden rounded border border-white/10 min-h-0">
        <CodeMirror
          value={currentCode}
          height="100%"
          theme={oneDark}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          placeholder={`// Write your code here...`}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
            searchKeymap: false,
            tabSize: 2
          }}
          extensions={[]}
        />
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20">
        <div className="flex items-center space-x-4 text-white/60 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${currentCode.trim() ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <span>{currentCode.trim() ? 'Ready to share' : 'Start typing...'}</span>
          </div>
          <span className="text-white/30">•</span>
          <div className="flex items-center space-x-1">
            <span className="text-blue-400 font-medium">Ctrl+Enter</span>
            <span>to share</span>
          </div>
        </div>
        
        <motion.button
          onClick={handleShare}
          disabled={!currentCode.trim()}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm
                     hover:from-blue-600 hover:to-purple-700 transition-all duration-300 
                     shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: currentCode.trim() ? 1.03 : 1 }}
          whileTap={{ scale: currentCode.trim() ? 0.97 : 1 }}
        >
          Share Code ✨
        </motion.button>
      </div>
    </motion.div>
  )
}

export default CodeEditor