import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { formatFileSize } from '../config/environment.js'
import toast from 'react-hot-toast'

const FileUpload = () => {
  const { shareFile, setCurrentCode } = useApp()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')

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
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setUploadedFile(file)
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target.result
      setFileContent(content)
      
      if (file.type.startsWith('text/') || 
          file.name.match(/\.(js|jsx|ts|tsx|py|html|css|json|md|txt)$/i)) {
        setCurrentCode(content)
      }
    }
    
    reader.onerror = () => {
      toast.error('Error reading file')
    }
    
    if (file.type.startsWith('text/') || 
        file.name.match(/\.(js|jsx|ts|tsx|py|html|css|json|md|txt)$/i)) {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleShare = () => {
    if (!uploadedFile || !fileContent) {
      toast.error('Please select a file first')
      return
    }

    shareFile(uploadedFile, fileContent)
    setUploadedFile(null)
    setFileContent('')
  }

  const clearFile = () => {
    setUploadedFile(null)
    setFileContent('')
  }

  const getFileIcon = (file) => {
    if (!file) return '📄'
    
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type.startsWith('video/')) return '🎥'
    if (file.type.startsWith('audio/')) return '🎵'
    if (file.type.includes('pdf')) return '📕'
    if (file.type.includes('zip') || file.type.includes('rar')) return '📦'
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
      className="glass-morphism rounded-lg p-5 h-[28rem] flex flex-col shadow-lg border border-white/20 hover:border-white/30 transition-all duration-300"
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-white ml-3 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            File Upload
          </h2>
        </div>
        {uploadedFile && (
          <motion.button
            onClick={clearFile}
            className="px-3 py-1.5 text-sm rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear
          </motion.button>
        )}
      </div>
      
      {/* Upload Area */}
      <div className="flex-1 mb-4 min-h-0">
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
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 h-full flex flex-col items-center justify-center ${
                  isDragging 
                    ? 'border-blue-400 bg-blue-500/10 scale-105' 
                    : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-6xl mb-6 filter drop-shadow-lg">
                    {isDragging ? '⬇️' : '📁'}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {isDragging ? 'Drop your file here!' : 'Drag & drop or click to browse'}
                  </h3>
                  <div className="text-sm text-white/50 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                    Maximum file size: 10MB
                  </div>
                </motion.div>
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
              className="h-full flex flex-col space-y-4"
            >
              {/* File Info */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-lg border border-white/30">
                <div className="text-4xl">
                  {getFileIcon(uploadedFile)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-lg truncate mb-1">
                    {uploadedFile.name}
                  </h4>
                  <p className="text-white/60 text-base">
                    {formatFileSize(uploadedFile.size)} • {uploadedFile.type?.split('/')[0] || 'Unknown type'}
                  </p>
                </div>
              </div>

              {/* File Preview */}
              <div className="flex-1 bg-black/20 rounded-lg border border-white/10 overflow-hidden min-h-0">
                {uploadedFile.type.startsWith('text/') || 
                 uploadedFile.name.match(/\.(js|jsx|ts|tsx|py|html|css|json|md|txt)$/i) ? (
                  <div className="h-full p-4">
                    <h5 className="text-white/80 text-base mb-3 font-medium">File Preview:</h5>
                    <pre className="text-white/70 text-sm overflow-auto h-full bg-black/30 p-4 rounded leading-relaxed font-mono">
                      {fileContent.substring(0, 800)}
                      {fileContent.length > 800 && '\n\n... (showing first 800 characters)'}
                    </pre>
                  </div>
                ) : uploadedFile.type.startsWith('image/') ? (
                  <div className="h-full p-4 flex flex-col">
                    <h5 className="text-white/80 text-base mb-3 font-medium">Image Preview:</h5>
                    <div className="flex-1 flex items-center justify-center bg-black/30 rounded min-h-0">
                      <img 
                        src={fileContent} 
                        alt="Preview" 
                        className="max-w-full max-h-full rounded object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-4">📦</div>
                      <p className="text-white/60 text-xl font-medium">Binary file ready to share</p>
                      <p className="text-white/50 text-base mt-2">File content will be preserved when shared</p>
                      <p className="text-white/40 text-sm mt-1">Click share to make it available to others</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20">
        <div className="flex items-center space-x-3 text-white/60 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${uploadedFile ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <span>{uploadedFile ? `Selected: ${uploadedFile.name}` : 'No file selected'}</span>
          </div>
          {uploadedFile && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-green-400 font-medium">{formatFileSize(uploadedFile.size)}</span>
            </>
          )}
        </div>
        
        <motion.button
          onClick={handleShare}
          disabled={!uploadedFile || !fileContent}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold text-sm
                     hover:from-green-600 hover:to-blue-700 transition-all duration-300 
                     shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: uploadedFile ? 1.03 : 1 }}
          whileTap={{ scale: uploadedFile ? 0.97 : 1 }}
        >
          Share File
        </motion.button>
      </div>
    </motion.div>
  )
}

export default FileUpload