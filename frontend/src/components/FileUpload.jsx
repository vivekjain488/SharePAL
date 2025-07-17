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
      className="glass-morphism rounded-xl p-4 h-full flex flex-col"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">File Upload</h2>
      </div>
      
      {/* Main Upload Area */}
      <div className="flex-1 mb-4">
        <AnimatePresence mode="wait">
          {!uploadedFile ? (
            <motion.div
              key="upload-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-[220px]"
            >
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 h-full flex flex-col justify-center items-center ${
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
                  <div className="text-5xl mb-4">
                    {isDragging ? '⬇️' : '📁'}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {isDragging ? 'Drop your file here' : 'Drag & drop your file'}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    Or click to browse files
                  </p>
                  <div className="text-xs text-white/50 bg-white/5 px-3 py-1 rounded-full">
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
              className="h-full min-h-[220px] flex flex-col space-y-4"
            >
              {/* File Info Card */}
              <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl border border-white/20">
                <div className="text-3xl">
                  {getFileIcon(uploadedFile)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-base truncate mb-1">
                    {uploadedFile.name}
                  </h4>
                  <p className="text-white/60 text-sm">
                    {formatFileSize(uploadedFile.size)} • {uploadedFile.type || 'Unknown type'}
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="text-white/60 hover:text-white hover:bg-white/10 transition-all p-2 rounded-lg"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>

              {/* File Preview */}
              <div className="flex-1 bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                {uploadedFile.type.startsWith('text/') || 
                 uploadedFile.name.match(/\.(js|jsx|ts|tsx|py|html|css|json|md|txt)$/i) ? (
                  <div className="h-full p-4">
                    <h5 className="text-white/80 text-sm mb-3 font-medium">Preview:</h5>
                    <pre className="text-white/70 text-xs overflow-auto h-full max-h-32 bg-black/30 p-3 rounded-lg">
                      {fileContent.substring(0, 500)}
                      {fileContent.length > 500 && '\n...'}
                    </pre>
                  </div>
                ) : uploadedFile.type.startsWith('image/') ? (
                  <div className="h-full p-4 flex flex-col">
                    <h5 className="text-white/80 text-sm mb-3 font-medium">Preview:</h5>
                    <div className="flex-1 flex items-center justify-center bg-black/30 rounded-lg">
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
                      <div className="text-3xl mb-2">📦</div>
                      <p className="text-white/60 text-sm">Binary file ready to share</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Info & Button Section */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center space-x-2 text-white/60 text-xs">
          {uploadedFile ? (
            <>
              <span className="font-medium">File:</span>
              <span className="truncate max-w-32">{uploadedFile.name}</span>
              <span>•</span>
              <span>{formatFileSize(uploadedFile.size)}</span>
            </>
          ) : (
            <>
              <span>No file selected</span>
              <span>•</span>
              <span>Max: 10MB</span>
            </>
          )}
        </div>
        
        <motion.button
          onClick={handleShare}
          disabled={!uploadedFile || !fileContent}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium 
                     hover:from-blue-600 hover:to-purple-700 transition-all duration-200 
                     shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:scale-100 disabled:hover:shadow-lg"
          whileHover={{ scale: uploadedFile ? 1.05 : 1 }}
          whileTap={{ scale: uploadedFile ? 0.95 : 1 }}
        >
          Share File
        </motion.button>
      </div>
    </motion.div>
  )
}

export default FileUpload