import React from 'react'
import { motion } from 'framer-motion'
import TextEditor from '../components/TextEditor.jsx'
import FileUpload from '../components/FileUpload.jsx'
import StatusBar from '../components/StatusBar.jsx'
import { TextGenerateEffect } from '../components/ui/TextGenerateEffect.jsx'

const Home = () => {
  const description = "Share text and files instantly with real-time collaboration. Content stays visible until someone replaces it. No accounts needed, just start sharing!"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      {/* Status Bar */}
      <StatusBar />

      {/* Hero Section */}
      <motion.div 
        className="text-center py-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight select-none bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent mb-6"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          SharePAL
        </motion.h1>
        
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <TextGenerateEffect 
            words={description}
            className="text-white/90 text-lg md:text-xl font-medium"
            duration={0.3}
            filter={true}
          />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Text Editor */}
          <div>
            <TextEditor />
          </div>
          
          {/* Right Column - File Upload */}
          <div>
            <FileUpload />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home