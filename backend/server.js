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
      connectSrc: ["'self'", "ws:", "wss:"],
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
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
})

// In-memory storage (in production, use Redis or database)
const connectedUsers = new Map()
const recentShares = []
const MAX_SHARES = 100

// Socket rate limiting map
const socketRateLimit = new Map()

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9)

const addShare = (shareData) => {
  const share = {
    id: generateId(),
    ...shareData,
    timestamp: Date.now()
  }
  
  recentShares.unshift(share)
  
  // Keep only the most recent shares
  if (recentShares.length > MAX_SHARES) {
    recentShares.splice(MAX_SHARES)
  }
  
  return share
}

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
  const userName = socket.handshake.query.userName || userId
  
  const user = {
    id: userId,
    name: userName,
    socketId: socket.id,
    joinedAt: Date.now()
  }
  
  connectedUsers.set(socket.id, user)
  
  // Notify others about new user
  socket.broadcast.emit('user-joined', {
    userId: user.id,
    userName: user.name,
    timestamp: Date.now()
  })
  
  // Send current online users to the new user
  socket.emit('online-users', getUserList())
  
  // Send recent shares to the new user
  socket.emit('recent-shares', recentShares.slice(0, 20))

  // Handle code sharing
  socket.on('share-code', (data) => {
    try {
      // Rate limiting check
      if (!checkSocketRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' })
        return
      }

      // Validate data
      if (!data.content || typeof data.content !== 'string') {
        socket.emit('error', { message: 'Invalid code content' })
        return
      }
      
      if (data.content.length > 100000) { // 100KB limit
        socket.emit('error', { message: 'Code content too large' })
        return
      }
      
      const shareData = {
        type: 'code',
        content: data.content,
        userId: user.id,
        userName: user.name
      }
      
      const share = addShare(shareData)
      
      // Broadcast to all connected clients
      io.emit('code-shared', share)
      
      console.log(`Code shared by ${user.name}`)
    } catch (error) {
      console.error('Error sharing code:', error)
      socket.emit('error', { message: 'Failed to share code' })
    }
  })

  // Handle file sharing
  socket.on('share-file', (data) => {
    try {
      // Rate limiting check
      if (!checkSocketRateLimit(socket.id)) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' })
        return
      }

      // Validate data
      if (!data.content || !data.fileName) {
        socket.emit('error', { message: 'Invalid file data' })
        return
      }
      
      if (data.content.length > 10000000) { // 10MB limit
        socket.emit('error', { message: 'File too large' })
        return
      }
      
      const shareData = {
        type: 'file',
        fileName: data.fileName,
        fileSize: data.fileSize || 0,
        fileType: data.fileType || 'application/octet-stream',
        content: data.content,
        userId: user.id,
        userName: user.name
      }
      
      const share = addShare(shareData)
      
      // Broadcast to all connected clients
      io.emit('file-shared', share)
      
      console.log(`File shared by ${user.name}: ${data.fileName} (${data.fileSize} bytes)`)
    } catch (error) {
      console.error('Error sharing file:', error)
      socket.emit('error', { message: 'Failed to share file' })
    }
  })

  // Handle get online users request
  socket.on('get-online-users', () => {
    socket.emit('online-users', getUserList())
  })

  // Handle room joining (for future features)
  socket.on('join-room', (roomId) => {
    if (typeof roomId === 'string' && roomId.length <= 50) {
      socket.join(roomId)
      socket.emit('joined-room', { roomId })
      console.log(`User ${user.name} joined room: ${roomId}`)
    }
  })

  // Handle room leaving
  socket.on('leave-room', (roomId) => {
    if (typeof roomId === 'string') {
      socket.leave(roomId)
      socket.emit('left-room', { roomId })
      console.log(`User ${user.name} left room: ${roomId}`)
    }
  })

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id} (${reason})`)
    
    const disconnectedUser = connectedUsers.get(socket.id)
    if (disconnectedUser) {
      connectedUsers.delete(socket.id)
      
      // Clean up rate limit data
      socketRateLimit.delete(socket.id)
      
      // Notify others about user leaving
      socket.broadcast.emit('user-left', {
        userId: disconnectedUser.id,
        userName: disconnectedUser.name,
        timestamp: Date.now()
      })
      
      // Update online users list for all clients
      io.emit('online-users', getUserList())
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
    totalShares: recentShares.length
  })
})

// API endpoints
app.get('/api/stats', (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    totalShares: recentShares.length,
    recentShares: recentShares.slice(0, 10).map(share => ({
      type: share.type,
      fileName: share.fileName,
      userName: share.userName,
      timestamp: share.timestamp
    }))
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