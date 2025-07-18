import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { useApp } from '../context/AppContext.jsx'
import { copyToClipboard } from '../utils/helpers.js'
import toast from 'react-hot-toast'

const TextEditor = () => {
  const { currentCode, setCurrentCode, shareText, isConnected, sharedText, copySharedText, clearSharedText, isSharing } = useApp()
  const [isViewingShared, setIsViewingShared] = useState(false)
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false)
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
      // Switch to viewing shared content after sharing
      setIsViewingShared(true)
      setHasAutoSwitched(true)
    } catch (error) {
      toast.error(error.message || 'Failed to share text')
    }
  }

  const handleCopy = async () => {
    const textToCopy = sharedText ? sharedText.content : currentCode
    if (!textToCopy.trim()) {
      toast.error('Nothing to copy')
      return
    }

    const success = await copyToClipboard(textToCopy)
    if (success) {
      toast.success('Copied to clipboard!')
    } else {
      toast.error('Failed to copy')
    }
  }

  const handleClear = () => {
    if (sharedText) {
      clearSharedText()
      toast.success('Shared text cleared!', {
        icon: '🗑️',
        duration: 2000
      })
    } else {
      setCurrentCode('')
      toast.success('Editor cleared')
    }
  }

  const handleCopySharedToEditor = () => {
    if (sharedText) {
      setCurrentCode(sharedText.content)
      toast.success('Shared text copied to your editor!', {
        icon: '📝',
        duration: 2000
      })
    }
  }

  const handleBackToEditor = () => {
    setIsViewingShared(false)
    setHasAutoSwitched(true) // Prevent auto-switching back
  }

  const handleViewShared = () => {
    if (sharedText) {
      setIsViewingShared(true)
    }
  }

  // Auto-switch to shared view when new content is shared by others (only once)
  useEffect(() => {
    if (sharedText && !isViewingShared && !hasAutoSwitched) {
      // Only auto-switch if we're not the one who shared
      const currentUser = localStorage.getItem('sharepal-username') || 'User'
      if (sharedText.userName !== currentUser) {
        setIsViewingShared(true)
        setHasAutoSwitched(true)
      }
    }
  }, [sharedText])

  // Switch back to editor when shared content is cleared
  useEffect(() => {
    if (!sharedText) {
      setIsViewingShared(false)
      setHasAutoSwitched(false) // Reset auto-switch flag
    }
  }, [sharedText])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            if (!isViewingShared) handleShare()
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
          case '1':
            e.preventDefault()
            handleBackToEditor()
            break
          case '2':
            e.preventDefault()
            if (sharedText) handleViewShared()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentCode, isConnected, sharedText, isViewingShared])

  // Determine what to show - prioritize shared content when available
  const showSharedContent = isViewingShared && sharedText

  return (
    <motion.div 
      className={`glass-morphism rounded-lg p-6 shadow-2xl border transition-all duration-300 ${
        showSharedContent 
          ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10' 
          : 'border-white/20 hover:border-white/30'
      }`}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full shadow-lg ${
              showSharedContent 
                ? 'bg-green-500 shadow-green-500/50 animate-pulse' 
                : 'bg-blue-500 shadow-blue-500/50'
            }`}></div>
            <div className={`w-3 h-3 rounded-full shadow-lg ${
              showSharedContent 
                ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' 
                : 'bg-purple-500 shadow-purple-500/50'
            }`}></div>
            <div className={`w-3 h-3 rounded-full shadow-lg ${
              showSharedContent 
                ? 'bg-teal-500 shadow-teal-500/50 animate-pulse' 
                : 'bg-green-500 shadow-green-500/50'
            }`}></div>
          </div>
          <h2 className={`text-xl font-semibold ${
            showSharedContent ? 'text-green-300' : 'text-white'
          }`}>
            {showSharedContent ? 'Shared Text' : 'Text Editor'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Toggle Buttons - Same as FileUpload */}
          <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={handleBackToEditor}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                !isViewingShared 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Editor
            </button>
            {sharedText && (
              <button
                onClick={handleViewShared}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  isViewingShared 
                    ? 'bg-green-500/30 text-green-300' 
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Shared
              </button>
            )}
          </div>
          
          {/* Content Info */}
          <div className="text-sm text-white/60 px-3 py-1 bg-white/10 rounded">
            {showSharedContent ? (
              <>
                <span>by {sharedText.userName}</span>
                <span className="mx-2">•</span>
                <span>{new Date(sharedText.timestamp).toLocaleTimeString()}</span>
              </>
            ) : (
              `${currentCode.length} characters`
            )}
          </div>
        </div>
      </div>

      {/* Content Area - Shows Either Editor or Shared Content */}
      <div className="h-64 mb-4">
        <div className={`h-full relative rounded-lg border overflow-hidden ${
          showSharedContent 
            ? 'border-green-500/20 bg-green-500/5' 
            : 'border-white/10 bg-black/20'
        }`}>
          <AnimatePresence mode="wait">
            {showSharedContent ? (
              <motion.div
                key="shared-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
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
              </motion.div>
            ) : (
              <motion.div
                key="editor-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white/60 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          {showSharedContent && (
            <>
              <span className="mx-2">•</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-300/80">Live shared content</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {showSharedContent ? (
            <>
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded transition-colors"
              >
                Copy
              </button>
              
              <button
                onClick={handleCopySharedToEditor}
                className="px-4 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded transition-colors"
              >
                Copy to Editor
              </button>
              
              <button
                onClick={handleClear}
                className="px-6 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
              >
                Clear Shared
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCopy}
                disabled={!currentCode.trim()}
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded transition-colors disabled:opacity-50"
              >
                Copy
              </button>
              
              <button
                onClick={() => {
                  setCurrentCode('')
                  toast.success('Editor cleared')
                }}
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
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TextEditor