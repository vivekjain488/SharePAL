import React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

const StatusBar = () => {
  const { loading } = useApp()

  // Only show the status bar when there's a loading state
  if (!loading) {
    return null
  }

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 glass-morphism border-t border-white/10 px-4 py-2"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/70">Processing...</span>
        </div>
      </div>
    </motion.div>
  )
}

export default StatusBar