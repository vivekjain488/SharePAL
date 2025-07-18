import React from 'react'
import { motion } from 'framer-motion'

const ProgressIndicator = ({ progress, fileName, isVisible }) => {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50 glass-morphism p-4 rounded-lg border border-white/20 min-w-[300px]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium text-sm">Uploading...</span>
        <span className="text-white/70 text-sm">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="text-white/60 text-xs truncate">
        {fileName}
      </div>
    </motion.div>
  )
}

export default ProgressIndicator