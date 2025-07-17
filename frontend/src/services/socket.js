import { io } from 'socket.io-client'
import { ENV } from '../config/environment.js'
import toast from 'react-hot-toast'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(ENV.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      query: { userId }
    })

    this.setupEventListeners()
    return this.socket
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      this.connected = true
      this.reconnectAttempts = 0
      console.log('Connected to server')
    //   toast.success('Connected to SharePAL!')
    })

    this.socket.on('disconnect', (reason) => {
      this.connected = false
      console.log('Disconnected:', reason)
      
      if (reason === 'io server disconnect') {
        toast.error('Server disconnected')
      } else {
        this.handleReconnection()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      this.handleReconnection()
    })

    this.socket.on('reconnect', (attemptNumber) => {
      this.connected = true
      this.reconnectAttempts = 0
      console.log('Reconnected after', attemptNumber, 'attempts')
    //   toast.success('Reconnected to SharePAL!')
    })

    this.socket.on('reconnect_failed', () => {
      toast.error('Failed to reconnect. Please refresh the page.')
    })
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      toast.loading(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    }
  }

  // Share code
  shareCode(data) {
    if (this.socket && this.connected) {
      this.socket.emit('share-code', data)
    } else {
      toast.error('Not connected to server')
    }
  }

  // Share file
  shareFile(data) {
    if (this.socket && this.connected) {
      this.socket.emit('share-file', data)
    } else {
      toast.error('Not connected to server')
    }
  }

  // Join room (for future room-based sharing)
  joinRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('join-room', roomId)
    }
  }

  // Leave room
  leaveRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave-room', roomId)
    }
  }

  // Get online users
  getOnlineUsers() {
    if (this.socket && this.connected) {
      this.socket.emit('get-online-users')
    }
  }

  // Event listeners
  onCodeShared(callback) {
    if (this.socket) {
      this.socket.on('code-shared', callback)
    }
  }

  onFileShared(callback) {
    if (this.socket) {
      this.socket.on('file-shared', callback)
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback)
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback)
    }
  }

  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.on('online-users', callback)
    }
  }

  // Remove listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  isConnected() {
    return this.connected
  }
}

export default new SocketService()