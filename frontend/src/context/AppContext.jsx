import React, { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { ENV, generateGuestId } from '../config/environment.js'
import toast from 'react-hot-toast'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  // State management
  const [currentCode, setCurrentCode] = useState('')
  const [recentShares, setRecentShares] = useState([])
  const [connectedUsers, setConnectedUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [socket, setSocket] = useState(null)

  // Initialize user and socket connection
  useEffect(() => {
    // Get or generate user info
    let storedUserId = localStorage.getItem('sharepal-user-id')
    let storedUserName = localStorage.getItem('sharepal-user-name')

    if (!storedUserId) {
      storedUserId = generateGuestId()
      localStorage.setItem('sharepal-user-id', storedUserId)
    }

    if (!storedUserName) {
      storedUserName = `Guest_${storedUserId.slice(-4)}`
      localStorage.setItem('sharepal-user-name', storedUserName)
    }

    setUserId(storedUserId)
    setUserName(storedUserName)

    // Initialize socket connection
    const socketInstance = io(ENV.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      query: {
        userId: storedUserId,
        userName: storedUserName
      }
    })

    setSocket(socketInstance)

    // Socket event listeners
    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to SharePAL server')
    //   toast.success('Connected to SharePAL!')
    })

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('Disconnected from server:', reason)
      if (reason === 'io server disconnect') {
        toast.error('Server disconnected')
      } else {
        toast.error('Connection lost - attempting to reconnect...')
      }
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setIsConnected(false)
    //   toast.error('Failed to connect to server')
    })

    socketInstance.on('reconnect', (attemptNumber) => {
      setIsConnected(true)
      console.log('Reconnected after', attemptNumber, 'attempts')
    //   toast.success('Reconnected to SharePAL!')
    })

    // Handle incoming shares
    socketInstance.on('code-shared', (shareData) => {
      setRecentShares(prev => [shareData, ...prev.slice(0, 99)]) // Keep last 100 shares
      if (shareData.userId !== storedUserId) {
        toast.success(`New code shared by ${shareData.userName}`)
      } else {
        toast.success('Code shared successfully!')
      }
    })

    socketInstance.on('file-shared', (shareData) => {
      setRecentShares(prev => [shareData, ...prev.slice(0, 99)]) // Keep last 100 shares
      if (shareData.userId !== storedUserId) {
        toast.success(`New file shared by ${shareData.userName}: ${shareData.fileName}`)
      } else {
        toast.success('File shared successfully!')
      }
    })

    // Handle user events
    socketInstance.on('user-joined', (userData) => {
      if (userData.userId !== storedUserId) {
        toast(`${userData.userName} joined the session`, {
          icon: '👋',
          duration: 2000
        })
      }
    })

    socketInstance.on('user-left', (userData) => {
      if (userData.userId !== storedUserId) {
        toast(`${userData.userName} left the session`, {
          icon: '👋',
          duration: 2000
        })
      }
    })

    // Handle online users list
    socketInstance.on('online-users', (users) => {
      setConnectedUsers(users)
    })

    // Handle recent shares list
    socketInstance.on('recent-shares', (shares) => {
      setRecentShares(shares)
    })

    // Handle errors
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error(error.message || 'An error occurred')
      setLoading(false)
    })

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // Share code function
  const shareCode = (content, language = 'text', fileName = 'shared-code') => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server')
      return
    }

    if (!content.trim()) {
      toast.error('Cannot share empty code')
      return
    }

    setLoading(true)
    
    socket.emit('share-code', {
      content,
      language,
      fileName
    })

    // Reset loading after a delay (in case no response)
    setTimeout(() => setLoading(false), 3000)
  }

  // Share file function
  const shareFile = (file, content) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server')
      return
    }

    if (!file || !content) {
      toast.error('Invalid file data')
      return
    }

    setLoading(true)
    
    socket.emit('share-file', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      content
    })

    // Reset loading after a delay (in case no response)
    setTimeout(() => setLoading(false), 3000)
  }

  // Get online users
  const getOnlineUsers = () => {
    if (socket && isConnected) {
      socket.emit('get-online-users')
    }
  }

  // Join room (for future features)
  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join-room', roomId)
    }
  }

  // Leave room
  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave-room', roomId)
    }
  }

  // Context value
  const value = {
    // State
    currentCode,
    setCurrentCode,
    recentShares,
    setRecentShares,
    connectedUsers,
    setConnectedUsers,
    isConnected,
    loading,
    setLoading,
    userName,
    setUserName,
    userId,
    setUserId,
    socket,

    // Actions
    shareCode,
    shareFile,
    getOnlineUsers,
    joinRoom,
    leaveRoom
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext