// Simple configuration that works with Vite's built-in env handling
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// Update URLs for Vercel deployment
const API_URL = isDevelopment 
  ? 'http://localhost:3001'
  : 'https://your-backend-domain.vercel.app'

const SOCKET_URL = isDevelopment
  ? 'http://localhost:3001' 
  : 'https://your-backend-domain.vercel.app'

export const ENV = {
  API_URL,
  SOCKET_URL
}

export const generateGuestId = () => {
  const adjectives = ['Happy', 'Coding', 'Swift', 'Bright', 'Cool', 'Smart', 'Quick', 'Sharp']
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Wolf', 'Fox', 'Bear', 'Lion', 'Hawk']
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 1000)
  
  return `${adjective}${noun}${number}`
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatTimestamp = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  
  return date.toLocaleDateString()
}