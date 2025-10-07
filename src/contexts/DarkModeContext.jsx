import React, { createContext, useContext, useState, useEffect } from 'react'

// Create Dark Mode Context
const DarkModeContext = createContext(null)

// Custom hook to use Dark Mode
export const useDarkMode = () => {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider')
  }
  return context
}

// Provider component
export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('darkMode')
    return saved === 'true'
  })

  // Apply dark mode to document and save to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
    
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export default DarkModeContext

