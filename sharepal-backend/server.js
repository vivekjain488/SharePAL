import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Express app
const app = express()
const server = createServer(app)

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:3001", "https://localhost:3001"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}))

app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Apply rate limiting
app.use(limiter)

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e8
})

// In-memory storage for persistent sharing
const connectedUsers = new Map()
const socketRateLimit = new Map()

// PERSISTENT STORAGE - This is what stays until replaced
let currentSharedText = null
let currentSharedFile = null

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9)

const getUserList = () => {
  return Array.from(connectedUsers.values())
}

// Simple socket rate limiting
const checkSocketRateLimit = (socketId) => {
  const now = Date.now()
  const userLimit = socketRateLimit.get(socketId) || []
  
  // Remove old entries (older than 1 minute)
  const recentRequests = userLimit.filter(time => now - time < 60000)
  
  if (recentRequests.length >= 50) { // 50 requests per minute
    return false
  }
  
  recentRequests.push(now)
  socketRateLimit.set(socketId, recentRequests)
  return true
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // User registration
  const userId = socket.handshake.query.userId || generateId()
  const userName = socket.handshake.query.userName || `User${Math.floor(Math.random() * 1000)}`
  
  const user = {
    id: userId,
    name: userName,
    socketId: socket.id,
    joinedAt: Date.now()
  }
  
  connectedUsers.set(socket.id, user)
  
  // Send current online users count to all clients
  io.emit('user-count', connectedUsers.size)
  
  // Send current persistent shared content to the new user
  if (currentSharedText) {
    socket.emit('current-shared-text', currentSharedText)
  }
  
  if (currentSharedFile) {
    socket.emit('current-shared-file', currentSharedFile)
  }
  
  console.log(`${userName} joined. Total users: ${connectedUsers.size}`)

  // Handle text sharing - REPLACES current shared text
  socket.on('share-text', (data, callback) => {
    try {
      console.log('Received share-text event:', data)
      
      // Rate limiting check
      if (!checkSocketRateLimit(socket.id)) {
        const error = { success: false, error: 'Rate limit exceeded. Please slow down.' }
        callback?.(error)
        return
      }

      // Validate data
      if (!data.content || typeof data.content !== 'string') {
        const error = { success: false, error: 'Invalid text content' }
        callback?.(error)
        return
      }
      
      if (data.content.length > 100000) { // 100KB limit
        const error = { success: false, error: 'Text content too large' }
        callback?.(error)
        return
      }
      
      // REPLACE the current shared text
      currentSharedText = {
        id: generateId(),
        content: data.content,
        userId: user.id,
        userName: user.name,
        timestamp: Date.now()
      }
      
      // Broadcast the new shared text to ALL connected clients
      io.emit('shared-text-updated', currentSharedText)
      
      // Send success response
      const response = { success: true, shareId: currentSharedText.id }
      callback?.(response)
      
      console.log(`Text shared by ${user.name} - replacing previous content`)
    } catch (error) {
      console.error('Error sharing text:', error)
      const errorResponse = { success: false, error: 'Failed to share text' }
      callback?.(errorResponse)
    }
  })

  // Handle legacy share-code event for backward compatibility
  socket.on('share-code', (data, callback) => {
    try {
      console.log('Received share-code event (legacy):', data)
      
      // Rate limiting check
      if (!checkSocketRateLimit(socket.id)) {
        const error = { success: false, error: 'Rate limit exceeded. Please slow down.' }
        callback?.(error)
        return
      }

      // Validate data
      if (!data.content || typeof data.content !== 'string') {
        const error = { success: false, error: 'Invalid text content' }
        callback?.(error)
        return
      }
      
      if (data.content.length > 100000) { // 100KB limit
        const error = { success: false, error: 'Text content too large' }
        callback?.(error)
        return
      }
      
      // REPLACE the current shared text
      currentSharedText = {
        id: generateId(),
        content: data.content,
        userId: user.id,
        userName: user.name,
        timestamp: Date.now()
      }
      
      // Broadcast the new shared text to ALL connected clients
      io.emit('shared-text-updated', currentSharedText)
      
      // Send success response
      const response = { success: true, shareId: currentSharedText.id }
      callback?.(response)
      
      console.log(`Code shared by ${user.name} - replacing previous content`)
    } catch (error) {
      console.error('Error sharing code:', error)
      const errorResponse = { success: false, error: 'Failed to share code' }
      callback?.(errorResponse)
    }
  })

  // Handle file sharing - REPLACES current shared file
  socket.on('share-file', (data, callback) => {
    try {
      console.log('Received share-file event:', data.fileName)
      
      // Rate limiting check
      if (!checkSocketRateLimit(socket.id)) {
        const error = { success: false, error: 'Rate limit exceeded. Please slow down.' }
        callback?.(error)
        return
      }

      // Validate data
      if (!data.content || !data.fileName) {
        const error = { success: false, error: 'Invalid file data' }
        callback?.(error)
        return
      }
      
      if (data.content.length > 10000000) { // 10MB limit
        const error = { success: false, error: 'File too large' }
        callback?.(error)
        return
      }
      
      // REPLACE the current shared file
      currentSharedFile = {
        id: generateId(),
        fileName: data.fileName,
        fileSize: data.fileSize || 0,
        fileType: data.fileType || 'application/octet-stream',
        content: data.content,
        userId: user.id,
        userName: user.name,
        timestamp: Date.now()
      }
      
      // Broadcast the new shared file to ALL connected clients
      io.emit('shared-file-updated', currentSharedFile)
      
      // Send success response
      const response = { success: true, shareId: currentSharedFile.id }
      callback?.(response)
      
      console.log(`File shared by ${user.name}: ${data.fileName} - replacing previous file`)
    } catch (error) {
      console.error('Error sharing file:', error)
      const errorResponse = { success: false, error: 'Failed to share file' }
      callback?.(errorResponse)
    }
  })

  // Handle clearing shared text
  socket.on('clear-shared-text', () => {
    currentSharedText = null
    io.emit('shared-text-cleared', { clearedBy: user.name })
    console.log(`Shared text cleared by ${user.name}`)
  })

  // Handle clearing shared file
  socket.on('clear-shared-file', () => {
    currentSharedFile = null
    io.emit('shared-file-cleared', { clearedBy: user.name })
    console.log(`Shared file cleared by ${user.name}`)
  })

  // Handle get current shared content
  socket.on('get-current-content', () => {
    const response = {
      sharedText: currentSharedText,
      sharedFile: currentSharedFile,
      connectedUsers: connectedUsers.size
    }
    socket.emit('current-content', response)
  })

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id} (${reason})`)
    
    const disconnectedUser = connectedUsers.get(socket.id)
    if (disconnectedUser) {
      connectedUsers.delete(socket.id)
      
      // Clean up rate limit data
      socketRateLimit.delete(socket.id)
      
      // Update online users count for all clients
      io.emit('user-count', connectedUsers.size)
      
      console.log(`${disconnectedUser.name} left. Total users: ${connectedUsers.size}`)
    }
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connectedUsers: connectedUsers.size,
    hasSharedText: !!currentSharedText,
    hasSharedFile: !!currentSharedFile
  })
})

// API endpoints
app.get('/api/stats', (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    currentSharedText: currentSharedText ? {
      userName: currentSharedText.userName,
      timestamp: currentSharedText.timestamp,
      contentLength: currentSharedText.content.length
    } : null,
    currentSharedFile: currentSharedFile ? {
      fileName: currentSharedFile.fileName,
      userName: currentSharedFile.userName,
      timestamp: currentSharedFile.timestamp,
      fileSize: currentSharedFile.fileSize
    } : null
  })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'public')))
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

// Start server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`SharePAL server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app