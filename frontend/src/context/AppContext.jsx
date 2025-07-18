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
  loading: false
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
    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    const socket = io(ENV.SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    dispatch({ type: 'SET_SOCKET', payload: socket })

    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: true })
      socket.emit('user-join', { userName: state.userName })
    })

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false })
    })

    socket.on('user-count', (count) => {
      dispatch({ type: 'SET_USERS', payload: count })
    })

    socket.on('code-shared', (share) => {
      toast.success(`New code shared by ${share.userName}`)
    })

    socket.on('file-shared', (share) => {
      toast.success(`New file shared by ${share.userName}`)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error(error.message || 'An error occurred')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const shareCode = async (content, language, fileName) => {
    if (!state.socket || !state.isConnected) {
      throw new Error('Not connected to server')
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Share timeout'))
      }, 5000)

      state.socket.emit('share-code', {
        content,
        language,
        fileName,
        userName: state.userName
      }, (response) => {
        clearTimeout(timeout)
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  const shareFile = async (file, onProgress) => {
    if (!state.socket || !state.isConnected) {
      throw new Error('Not connected to server')
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        
        state.socket.emit('share-file', {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          content,
          userName: state.userName
        }, (response) => {
          if (response.success) {
            resolve(response)
          } else {
            reject(new Error(response.error))
          }
        })
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  const value = {
    ...state,
    setCurrentCode: (code) => dispatch({ type: 'SET_CODE', payload: code }),
    shareCode,
    shareFile
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