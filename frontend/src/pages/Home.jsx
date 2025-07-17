import React from 'react'
import { motion } from 'framer-motion'
import CodeEditor from '../components/CodeEditor.jsx'
import FileUpload from '../components/FileUpload.jsx'
import { TextGenerateEffect } from '../components/ui/TextGenerateEffect.jsx'

const Home = () => {
  const description = "Share code snippets and files instantly with real-time collaboration. No accounts needed, just start sharing!"

  return (
    <div className="h-screen flex flex-col overflow-hidden py-4">
      {/* Hero Section with Amazing Creative Title */}
      <motion.div 
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Creative SharePAL Title with Multiple Effects */}
        <div className="relative mb-6">
          {/* Background Glow Effect */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="text-5xl md:text-7xl lg:text-8xl font-black text-blue-500/20 blur-2xl select-none">
              SharePAL
            </div>
          </motion.div>

          {/* Main Title with Letter Animation */}
          <motion.h1 
            className="relative text-5xl md:text-7xl lg:text-8xl font-black tracking-tight select-none"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {/* Individual Letter Animations */}
            <motion.span
              className="inline-block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            >
              S
            </motion.span>
            <motion.span
              className="inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent"
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            >
              h
            </motion.span>
            <motion.span
              className="inline-block bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent"
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            >
              a
            </motion.span>
            <motion.span
              className="inline-block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent"
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            >
              r
            </motion.span>
            <motion.span
              className="inline-block bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 bg-clip-text text-transparent"
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            >
              e
            </motion.span>
            
            {/* PAL with different styling */}
            <motion.span
              className="inline-block bg-gradient-to-r from-green-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent ml-2"
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            >
              P
            </motion.span>
            <motion.span
              className="inline-block bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent"
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            >
              A
            </motion.span>
            <motion.span
              className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
              initial={{ y: 50, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            >
              L
            </motion.span>
          </motion.h1>

          {/* Floating Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
              style={{
                left: `${15 + (i * 7)}%`,
                top: `${20 + Math.sin(i) * 30}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Underline Effect */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: "80%" }}
            transition={{ duration: 1.2, delay: 1.1 }}
          />

          {/* Side Decorations */}
          <motion.div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 text-4xl"
            initial={{ x: -50, opacity: 0, rotate: -180 }}
            animate={{ x: 0, opacity: 0.6, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
          </motion.div>
          <motion.div
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-4xl"
            initial={{ x: 50, opacity: 0, rotate: 180 }}
            animate={{ x: 0, opacity: 0.6, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >

          </motion.div>
        </div>
        
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <TextGenerateEffect 
            words={description}
            className="text-white/80 text-lg md:text-xl"
            duration={0.4}
            filter={true}
          />
        </motion.div>
      </motion.div>

      {/* Main Content Grid - Larger sections with more spacing */}
      <div className="flex-1 grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full px-6 mb-6">
        <CodeEditor />
        <FileUpload />
      </div>
    </div>
  )
}

export default Home