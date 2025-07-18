import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { validateFile, formatFileSize } from '../utils/helpers.js'
import toast from 'react-hot-toast'

const FileUpload = () => {
  const { shareFile, isConnected, sharedFile, clearSharedFile, isSharing } = useApp()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = (file) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setUploadedFile(file)
  }

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleShare = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first')
      return
    }

    if (!isConnected) {
      toast.error('Not connected to server')
      return
    }

    try {
      await shareFile(uploadedFile)
      toast.success('File shared successfully!', {
        icon: '🚀',
        duration: 3000
      })
      setUploadedFile(null)
    } catch (error) {
      console.error('Share error:', error)
      toast.error(error.message || 'Failed to share file')
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
  }

  const handleClearShared = () => {
    clearSharedFile()
    toast.success('Shared file cleared!', {
      icon: '🗑️',
      duration: 2000
    })
  }

  const handleDownloadShared = () => {
    if (!sharedFile) return
    
    try {
      const link = document.createElement('a')
      link.href = sharedFile.content
      link.download = sharedFile.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Download started!', {
        icon: '⬇️',
        duration: 2000
      })
    } catch (error) {
      toast.error('Failed to download file')
    }
  }

  const getFileIcon = (file) => {
    if (!file) return '📄'
    
    const type = file.type || ''
    const name = file.name ? file.name.toLowerCase() : ''
    
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('audio/')) return '🎵'
    if (type.includes('pdf')) return '📕'
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦'
    if (name.match(/\.(js|jsx|ts|tsx)$/i)) return '⚡'
    if (name.match(/\.(py)$/i)) return '🐍'
    if (name.match(/\.(html|htm)$/i)) return '🌐'
    if (name.match(/\.(css|scss|sass)$/i)) return '🎨'
    if (name.match(/\.(json)$/i)) return '📋'
    if (name.match(/\.(md|markdown)$/i)) return '📝'
    if (name.match(/\.(txt|log)$/i)) return '📄'
    if (name.match(/\.(doc|docx)$/i)) return '📄'
    if (name.match(/\.(xls|xlsx)$/i)) return '📊'
    if (name.match(/\.(ppt|pptx)$/i)) return '📽️'
    
    return '📄'
  }

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <motion.div 
        className="glass-morphism rounded-lg p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
            </div>
            <h2 className="text-xl font-semibold text-white">
              File Upload
            </h2>
          </div>
          
          {uploadedFile && (
            <button
              onClick={clearFile}
              className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        {/* Upload Area */}
        <div className="h-64 mb-4">
          <AnimatePresence mode="wait">
            {!uploadedFile ? (
              <motion.div
                key="upload-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 h-full flex flex-col items-center justify-center cursor-pointer ${
                    isDragging 
                      ? 'border-blue-400 bg-blue-500/10' 
                      : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-5xl mb-4">
                    {isDragging ? '⬇️' : '📁'}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isDragging ? 'Drop your file here!' : 'Upload File'}
                  </h3>
                  <p className="text-white/60 mb-4">
                    Drag & drop or click to browse
                  </p>
                  <div className="text-sm text-white/50 bg-white/5 px-4 py-2 rounded">
                    Maximum file size: 10MB
                  </div>
                  <input
                    type="file"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="*/*"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="file-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg mb-4">
                  <div className="text-4xl">
                    {getFileIcon(uploadedFile)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">
                      {uploadedFile.name}
                    </h4>
                    <p className="text-white/60 text-sm">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 bg-white/5 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-white/80">File ready to share</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white/60 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <button
            onClick={handleShare}
            disabled={!uploadedFile || !isConnected || isSharing}
            className="px-6 py-2 text-sm bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isSharing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sharing...</span>
              </div>
            ) : (
              'Share File'
            )}
          </button>
        </div>
      </motion.div>

      {/* Shared File Display */}
      <AnimatePresence>
        {sharedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="glass-morphism rounded-lg p-6 shadow-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-500/20">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
                  <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse"></div>
                  <div className="w-3 h-3 bg-teal-500 rounded-full shadow-lg shadow-teal-500/50 animate-pulse"></div>
                </div>
                <h2 className="text-xl font-semibold text-blue-300">
                  Shared File
                </h2>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm text-blue-300/80 px-3 py-1 bg-blue-500/20 rounded">
                  by {sharedFile.userName}
                </div>
                <div className="text-sm text-blue-300/60 px-3 py-1 bg-blue-500/10 rounded">
                  {new Date(sharedFile.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="h-64 mb-4">
              <div className="h-full bg-blue-500/5 rounded-lg border border-blue-500/20 p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {getFileIcon(sharedFile)}
                  </div>
                  <h3 className="text-xl font-semibold text-blue-300 mb-2">
                    {sharedFile.fileName}
                  </h3>
                  <p className="text-blue-300/60 text-sm mb-4">
                    {formatFileSize(sharedFile.fileSize)}
                  </p>
                  <div className="text-blue-300/80 text-sm bg-blue-500/20 px-3 py-1 rounded">
                    {sharedFile.fileType}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-300/60 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Live shared file</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadShared}
                  className="px-4 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded transition-colors"
                >
                  Download
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

export default FileUpload