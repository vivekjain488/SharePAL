import React, { createContext, useContext, useReducer, useEffect } from 'react'
import io from 'socket.io-client'
import { ENV, generateGuestId } from '../config/environment.js'
import toast from 'react-hot-toast'

const AppContext = createContext()

const initialState = {
  currentCode: '',
  isConnected: false,
  connectedUsers: 0,
  userName: generateGuestId(),
  socket: null,
  loading: false,
  // Persistent shared content
  sharedText: null,
  sharedFile: null,
  isSharing: false
}

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CODE':
      return { ...state, currentCode: action.payload }
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'SET_USERS':
      return { ...state, connectedUsers: action.payload }
    case 'SET_SOCKET':
      return { ...state, socket: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_SHARED_TEXT':
      return { ...state, sharedText: action.payload }
    case 'SET_SHARED_FILE':
      return { ...state, sharedFile: action.payload }
    case 'SET_IS_SHARING':
      return { ...state, isSharing: action.payload }
    case 'CLEAR_SHARED_TEXT':
      return { ...state, sharedText: null }
    case 'CLEAR_SHARED_FILE':
      return { ...state, sharedFile: null }
    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    console.log('Creating socket connection...')
    const socket = io(ENV.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      query: {
        userName: state.userName
      }
    })

    dispatch({ type: 'SET_SOCKET', payload: socket })

    socket.on('connect', () => {
      console.log('Socket connected successfully')
      dispatch({ type: 'SET_CONNECTED', payload: true })
      socket.emit('get-current-content')
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      dispatch({ type: 'SET_CONNECTED', payload: false })
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      dispatch({ type: 'SET_CONNECTED', payload: false })
    })

    socket.on('user-count', (count) => {
      dispatch({ type: 'SET_USERS', payload: count })
    })

    // Handle current shared content when joining
    socket.on('current-content', (content) => {
      if (content.sharedText) {
        dispatch({ type: 'SET_SHARED_TEXT', payload: content.sharedText })
      }
      if (content.sharedFile) {
        dispatch({ type: 'SET_SHARED_FILE', payload: content.sharedFile })
      }
    })

    // Handle current shared text on join
    socket.on('current-shared-text', (sharedText) => {
      dispatch({ type: 'SET_SHARED_TEXT', payload: sharedText })
    })

    // Handle current shared file on join
    socket.on('current-shared-file', (sharedFile) => {
      dispatch({ type: 'SET_SHARED_FILE', payload: sharedFile })
    })

    // Handle text updates from other users
    socket.on('shared-text-updated', (sharedText) => {
      dispatch({ type: 'SET_SHARED_TEXT', payload: sharedText })
      if (sharedText.userName !== state.userName) {
        toast.success(`${sharedText.userName} shared new text`, {
          duration: 3000,
          icon: '📝',
        })
      }
    })

    // Handle file updates from other users
    socket.on('shared-file-updated', (sharedFile) => {
      dispatch({ type: 'SET_SHARED_FILE', payload: sharedFile })
      if (sharedFile.userName !== state.userName) {
        toast.success(`${sharedFile.userName} shared: ${sharedFile.fileName}`, {
          duration: 3000,
          icon: '📁',
        })
      }
    })

    // Handle text clearing
    socket.on('shared-text-cleared', (data) => {
      dispatch({ type: 'CLEAR_SHARED_TEXT' })
      if (data.clearedBy !== state.userName) {
        toast.info(`${data.clearedBy} cleared the shared text`, {
          duration: 2000,
          icon: '🗑️',
        })
      }
    })

    // Handle file clearing
    socket.on('shared-file-cleared', (data) => {
      dispatch({ type: 'CLEAR_SHARED_FILE' })
      if (data.clearedBy !== state.userName) {
        toast.info(`${data.clearedBy} cleared the shared file`, {
          duration: 2000,
          icon: '🗑️',
        })
      }
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error(error.message || 'An error occurred')
    })

    return () => {
      console.log('Cleaning up socket connection...')
      socket.disconnect()
    }
  }, []) // Remove state.userName from dependencies to prevent re-creation

  const shareText = async (content) => {
    if (!state.socket || !state.isConnected) {
      throw new Error('Not connected to server')
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        dispatch({ type: 'SET_IS_SHARING', payload: false })
        reject(new Error('Share timeout'))
      }, 10000)

      dispatch({ type: 'SET_IS_SHARING', payload: true })

      state.socket.emit('share-text', {
        content,
        userName: state.userName
      }, (response) => {
        clearTimeout(timeout)
        dispatch({ type: 'SET_IS_SHARING', payload: false })
        
        if (response && response.success) {
          resolve(response)
        } else {
          reject(new Error(response?.error || 'Failed to share text'))
        }
      })
    })
  }

  // Legacy shareCode function for backward compatibility
  const shareCode = async (content, language, fileName) => {
    if (!state.socket || !state.isConnected) {
      throw new Error('Not connected to server')
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        dispatch({ type: 'SET_IS_SHARING', payload: false })
        reject(new Error('Share timeout'))
      }, 10000)

      dispatch({ type: 'SET_IS_SHARING', payload: true })

      state.socket.emit('share-code', {
        content,
        language,
        fileName,
        userName: state.userName
      }, (response) => {
        clearTimeout(timeout)
        dispatch({ type: 'SET_IS_SHARING', payload: false })
        
        if (response && response.success) {
          resolve(response)
        } else {
          reject(new Error(response?.error || 'Failed to share code'))
        }
      })
    })
  }

  const shareFile = async (file) => {
    if (!state.socket || !state.isConnected) {
      throw new Error('Not connected to server')
    }

    return new Promise((resolve, reject) => {
      dispatch({ type: 'SET_IS_SHARING', payload: true })
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        
        const timeout = setTimeout(() => {
          dispatch({ type: 'SET_IS_SHARING', payload: false })
          reject(new Error('Share timeout'))
        }, 30000) // Longer timeout for files
        
        state.socket.emit('share-file', {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          content,
          userName: state.userName
        }, (response) => {
          clearTimeout(timeout)
          dispatch({ type: 'SET_IS_SHARING', payload: false })
          
          if (response && response.success) {
            resolve(response)
          } else {
            reject(new Error(response?.error || 'Failed to share file'))
          }
        })
      }
      
      reader.onerror = () => {
        dispatch({ type: 'SET_IS_SHARING', payload: false })
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  const clearSharedText = () => {
    if (state.socket && state.isConnected) {
      state.socket.emit('clear-shared-text')
    }
  }

  const clearSharedFile = () => {
    if (state.socket && state.isConnected) {
      state.socket.emit('clear-shared-file')
    }
  }

  const copySharedText = () => {
    if (state.sharedText) {
      dispatch({ type: 'SET_CODE', payload: state.sharedText.content })
    }
  }

  const value = {
    ...state,
    setCurrentCode: (code) => dispatch({ type: 'SET_CODE', payload: code }),
    shareText,
    shareCode, // Keep for backward compatibility
    shareFile,
    clearSharedText,
    clearSharedFile,
    copySharedText
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}