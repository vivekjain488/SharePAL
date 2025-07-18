import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { useApp } from '../context/AppContext.jsx'
import { copyToClipboard } from '../utils/helpers.js'
import toast from 'react-hot-toast'

const CodeEditor = () => {
  const { currentCode, setCurrentCode, shareCode, isConnected, isSharing } = useApp()
  const [language, setLanguage] = useState('javascript')
  const editorRef = useRef(null)

  const languages = {
    javascript: { name: 'JavaScript', ext: javascript() },
    python: { name: 'Python', ext: python() },
    html: { name: 'HTML', ext: html() },
    css: { name: 'CSS', ext: css() },
    text: { name: 'Plain Text', ext: [] }
  }

  const handleCodeChange = useCallback((value) => {
    setCurrentCode(value)
  }, [setCurrentCode])

  const handleShare = async () => {
    if (!currentCode.trim()) {
      toast.error('Please enter some code to share')
      return
    }

    if (!isConnected) {
      toast.error('Not connected to server')
      return
    }

    try {
      await shareCode(currentCode, language, `shared-${language}`)
      toast.success('Code shared successfully!', {
        icon: '🚀',
        duration: 3000
      })
    } catch (error) {
      console.error('Share error:', error)
      toast.error(error.message || 'Failed to share code')
    }
  }

  const handleCopy = async () => {
    if (!currentCode.trim()) {
      toast.error('Nothing to copy')
      return
    }

    const success = await copyToClipboard(currentCode)
    if (success) {
      toast.success('Copied to clipboard!')
    } else {
      toast.error('Failed to copy')
    }
  }

  const handleClear = () => {
    setCurrentCode('')
    toast.success('Editor cleared')
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleShare()
            break
          case 'c':
            if (e.shiftKey) {
              e.preventDefault()
              handleCopy()
            }
            break
          case 'k':
            e.preventDefault()
            handleClear()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentCode, isConnected])

  return (
    <motion.div 
      className="glass-morphism rounded-lg p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300"
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
          </div>
          <h2 className="text-xl font-semibold text-white">
            Code Editor
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/10 text-white text-sm px-3 py-1 rounded border border-white/20 focus:border-white/50 outline-none"
          >
            {Object.entries(languages).map(([key, lang]) => (
              <option key={key} value={key} className="bg-gray-800">
                {lang.name}
              </option>
            ))}
          </select>
          
          {/* Line Count */}
          <div className="text-sm text-white/60 px-3 py-1 bg-white/10 rounded">
            {currentCode.split('\n').length} lines
          </div>
        </div>
      </div>

      {/* Editor Area - Same height as FileUpload */}
      <div className="h-64 mb-4">
        <div className="h-full relative rounded-lg border border-white/10 overflow-hidden bg-black/20">
          <CodeMirror
            ref={editorRef}
            value={currentCode}
            height="100%"
            theme={oneDark}
            extensions={[languages[language].ext]}
            onChange={handleCodeChange}
            placeholder={`// Start typing your ${languages[language].name.toLowerCase()} code here...`}
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
              tabSize: 2,
              searchKeymap: true
            }}
            className="text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white/60 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            disabled={!currentCode.trim()}
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded transition-colors disabled:opacity-50"
          >
            Copy
          </button>
          
          <button
            onClick={handleClear}
            disabled={!currentCode.trim()}
            className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors disabled:opacity-50"
          >
            Clear
          </button>
          
          <button
            onClick={handleShare}
            disabled={!currentCode.trim() || !isConnected || isSharing}
            className="px-6 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isSharing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sharing...</span>
              </div>
            ) : (
              'Share Code'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default CodeEditor