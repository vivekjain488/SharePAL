import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { validateFile, formatFileSize } from '../utils/helpers.js'
import toast from 'react-hot-toast'

const FileUpload = () => {
  const { shareFile, isConnected } = useApp()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

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
    setUploadProgress(0)
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

    setIsUploading(true)
    try {
      await shareFile(uploadedFile, (progress) => {
        setUploadProgress(progress)
      })
      toast.success('File shared successfully!')
      setUploadedFile(null)
      setUploadProgress(0)
    } catch (error) {
      toast.error('Failed to share file')
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
  }

  const getFileIcon = (file) => {
    if (!file) return '📄'
    
    const type = file.type
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('audio/')) return '🎵'
    if (type.includes('pdf')) return '📕'
    if (type.includes('zip') || type.includes('rar')) return '📦'
    if (file.name.match(/\.(js|jsx|ts|tsx)$/i)) return '⚡'
    if (file.name.match(/\.(py)$/i)) return '🐍'
    if (file.name.match(/\.(html|htm)$/i)) return '🌐'
    if (file.name.match(/\.(css)$/i)) return '🎨'
    if (file.name.match(/\.(json)$/i)) return '📋'
    if (file.name.match(/\.(md)$/i)) return '📝'
    
    return '📄'
  }

  return (
    <motion.div 
      className="glass-morphism rounded-lg p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300"
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
        <h2 className="text-xl font-semibold text-white">
          File Upload
        </h2>
        {uploadedFile && (
          <button
            onClick={clearFile}
            className="text-red-400 hover:text-red-300 text-sm"
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

              {/* Progress Bar */}
              {isUploading && (
                <div className="mb-4">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-center text-white/60 text-sm mt-2">
                    {uploadProgress}% uploaded
                  </div>
                </div>
              )}

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
          disabled={!uploadedFile || !isConnected || isUploading}
          className="px-6 py-2 text-sm bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Share File'}
        </button>
      </div>
    </motion.div>
  )
}

export default FileUpload