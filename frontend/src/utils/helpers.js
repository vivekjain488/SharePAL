export const debounce = (func, wait, immediate) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  if (!file) return { valid: false, error: 'No file provided' }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size must be less than ${formatFileSize(maxSize)}` 
    }
  }
  
  return { valid: true }
}

export const detectLanguage = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'javascript',
    'tsx': 'javascript',
    'py': 'python',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'css',
    'sass': 'css',
    'json': 'json',
    'md': 'text',
    'txt': 'text'
  }
  
  return languageMap[extension] || 'text'
}

export const isTextFile = (fileName, fileType) => {
  return fileType?.startsWith('text/') || 
         fileName?.match(/\.(js|jsx|ts|tsx|py|html|css|json|md|txt|xml|yaml|yml|toml|ini|cfg|conf)$/i)
}

export const compressString = (str) => {
  // Simple compression for large strings
  return str.replace(/\s+/g, ' ').trim()
}

export const safeParseJSON = (str) => {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

export const generateShareLink = (shareId) => {
  return `${window.location.origin}/share/${shareId}`
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch (err) {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}