import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { useApp } from '../context/AppContext.jsx'
import { copyToClipboard } from '../utils/helpers.js'
import toast from 'react-hot-toast'

const TextEditor = () => {
  const { currentCode, setCurrentCode, shareText, isConnected, sharedText, copySharedText, clearSharedText, isSharing } = useApp()
  const editorRef = useRef(null)

  const handleTextChange = useCallback((value) => {
    setCurrentCode(value)
  }, [setCurrentCode])

  const handleShare = async () => {
    if (!currentCode.trim()) {
      toast.error('Please enter some text to share')
      return
    }

    if (!isConnected) {
      toast.error('Not connected to server')
      return
    }

    try {
      await shareText(currentCode)
      toast.success('Text shared successfully!', {
        icon: '🚀',
        duration: 3000
      })
    } catch (error) {
      toast.error(error.message || 'Failed to share text')
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

  const handleCopyShared = () => {
    copySharedText()
    toast.success('Shared text copied to editor!', {
      icon: '📝',
      duration: 2000
    })
  }

  const handleClearShared = () => {
    clearSharedText()
    toast.success('Shared text cleared!', {
      icon: '🗑️',
      duration: 2000
    })
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
    <div className="space-y-6">
      {/* Personal Text Editor */}
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
              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Your Text Editor
            </h2>
          </div>
          
          {/* Character Count */}
          <div className="text-sm text-white/60 px-3 py-1 bg-white/10 rounded">
            {currentCode.length} characters
          </div>
        </div>

        {/* Editor Area */}
        <div className="h-64 mb-4">
          <div className="h-full relative rounded-lg border border-white/10 overflow-hidden bg-black/20">
            <CodeMirror
              ref={editorRef}
              value={currentCode}
              height="100%"
              theme={oneDark}
              onChange={handleTextChange}
              placeholder="Start typing your text here..."
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                bracketMatching: false,
                closeBrackets: false,
                autocompletion: false,
                highlightSelectionMatches: false,
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
              {isSharing ? 'Sharing...' : 'Share Text'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Shared Text Display */}
      <AnimatePresence>
        {sharedText && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="glass-morphism rounded-lg p-6 shadow-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-green-500/20">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 animate-pulse"></div>
                  <div className="w-3 h-3 bg-teal-500 rounded-full shadow-lg shadow-teal-500/50 animate-pulse"></div>
                </div>
                <h2 className="text-xl font-semibold text-green-300">
                  Shared Text
                </h2>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm text-green-300/80 px-3 py-1 bg-green-500/20 rounded">
                  by {sharedText.userName}
                </div>
                <div className="text-sm text-green-300/60 px-3 py-1 bg-green-500/10 rounded">
                  {new Date(sharedText.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="h-64 mb-4">
              <div className="h-full relative rounded-lg border border-green-500/20 overflow-hidden bg-green-500/5">
                <CodeMirror
                  value={sharedText.content}
                  height="100%"
                  theme={oneDark}
                  editable={false}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: false,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: false,
                    bracketMatching: false,
                    closeBrackets: false,
                    autocompletion: false,
                    highlightSelectionMatches: false,
                    tabSize: 2,
                    searchKeymap: false
                  }}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-300/60 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live shared content</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyShared}
                  className="px-4 py-2 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded transition-colors"
                >
                  Copy to Editor
                </button>
                
                <button
                  onClick={handleClearShared}
                  className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
                >
                  Clear Shared
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TextEditor