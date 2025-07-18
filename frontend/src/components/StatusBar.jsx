import React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'

const StatusBar = () => {
  const { isConnected, connectedUsers, userName } = useApp()

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white/80 text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {isConnected && (
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <span>•</span>
              <span>{connectedUsers} users online</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-white/60 text-sm">
            {userName}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StatusBar