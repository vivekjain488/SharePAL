import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { formatTimestamp, formatFileSize } from '../config/environment.js'
import toast from 'react-hot-toast'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'

const RecentShares = () => {
  const { recentShares, setCurrentCode } = useApp()
  const [selectedShare, setSelectedShare] = useState(null)
  const [filter, setFilter] = useState('all')

  const getFileIcon = (fileName, fileType) => {
    if (fileType?.startsWith('image/')) return '🖼️'
    if (fileType?.startsWith('video/')) return '🎥'
    if (fileType?.startsWith('audio/')) return '🎵'
    if (fileType?.includes('pdf')) return '📕'
    if (fileType?.includes('zip') || fileType?.includes('rar')) return '📦'
    if (fileName?.match(/\.(js|jsx|ts|tsx)$/i)) return '⚡'
    if (fileName?.match(/\.(py)$/i)) return '🐍'
    if (fileName?.match(/\.(html|htm)$/i)) return '🌐'
    if (fileName?.match(/\.(css)$/i)) return '🎨'
    return '📄'
  }

  const copyToEditor = (share) => {
    if (share.type === 'code') {
      setCurrentCode(share.content)
      toast.success('Code copied to editor!')
    } else if (share.type === 'file' && share.fileType?.startsWith('text/')) {
      setCurrentCode(share.content)
      toast.success('File content copied to editor!')
    }
  }

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('Copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const downloadFile = (share) => {
    const blob = new Blob([share.content], { type: share.fileType || 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = share.fileName || 'download.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredShares = recentShares.filter(share => {
    if (filter === 'all') return true
    if (filter === 'code') return share.type === 'code'
    if (filter === 'files') return share.type === 'file'
    if (filter === 'mine') return share.userId === localStorage.getItem('sharepal-user-id')
    return true
  })

  return (
    <motion.div 
      className="glass-morphism rounded-xl p-6"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Recent Shares</h2>
        <div className="flex items-center space-x-2">
          {['all', 'code', 'files', 'mine'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-all ${
                filter === filterType 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredShares.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-white/50"
            >
              <div className="text-4xl mb-2">📭</div>
              <p>No shares yet. Be the first to share something!</p>
            </motion.div>
          ) : (
            filteredShares.map((share, index) => (
              <motion.div
                key={share.timestamp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => setSelectedShare(selectedShare?.timestamp === share.timestamp ? null : share)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {share.type === 'code' 
                        ? '📝' 
                        : getFileIcon(share.fileName, share.fileType)
                      }
                    </div>
                    <div>
                      <h4 className="text-white font-medium">
                        {share.type === 'code' ? 'Code Share' : share.fileName}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-white/60">
                        <span>{share.userName}</span>
                        <span>•</span>
                        <span>{formatTimestamp(share.timestamp)}</span>
                        {share.type === 'file' && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(share.fileSize)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(share.type === 'code' || share.fileType?.startsWith('text/')) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToEditor(share)
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Copy to editor"
                      >
                        📝
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(share.content)
                      }}
                      className="text-green-400 hover:text-green-300 p-1"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadFile(share)
                      }}
                      className="text-purple-400 hover:text-purple-300 p-1"
                      title="Download"
                    >
                      💾
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedShare?.timestamp === share.timestamp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      {share.type === 'code' ? (
                        <CodeMirror
                          value={share.content}
                          height="200px"
                          theme={oneDark}
                          editable={false}
                          basicSetup={{
                            lineNumbers: true,
                            foldGutter: false,
                            dropCursor: false,
                            allowMultipleSelections: false
                          }}
                        />
                      ) : share.fileType?.startsWith('image/') ? (
                        <img 
                          src={share.content} 
                          alt="Shared file" 
                          className="max-w-full max-h-48 rounded object-contain bg-black/20"
                        />
                      ) : share.fileType?.startsWith('text/') || 
                           share.fileName?.match(/\.(js|jsx|ts|tsx|py|html|css|json|md|txt)$/i) ? (
                        <pre className="bg-black/20 p-4 rounded-lg text-white/80 text-sm overflow-x-auto max-h-48">
                          {share.content}
                        </pre>
                      ) : (
                        <div className="bg-black/20 p-4 rounded-lg text-white/60 text-center">
                          <p>Binary file - download to view content</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default RecentShares