import React from 'react'
import { motion } from 'framer-motion'
import CodeEditor from '../components/CodeEditor.jsx'
import FileUpload from '../components/FileUpload.jsx'
import { TextGenerateEffect } from '../components/ui/TextGenerateEffect.jsx'

const Home = () => {
  const description = "Share code snippets and files instantly with real-time collaboration. No accounts needed, just start sharing!"

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          className="text-3xl md:text-5xl font-bold text-gradient mt-6 mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Welcome to SharePAL
        </motion.h1>
        
        <motion.div
          className="max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <TextGenerateEffect 
            words={description}
            className="text-white/70"
            duration={0.8}
            filter={true}
          />
        </motion.div>
      </motion.div>

      {/* Main Content Grid - Code Editor and File Upload side by side */}
      <div className="grid lg:grid-cols-2 gap-4">
        <CodeEditor />
        <FileUpload />
      </div>
    </div>
  )
}

export default Home