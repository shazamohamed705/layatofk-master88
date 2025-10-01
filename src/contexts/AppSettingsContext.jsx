import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { getJson } from '../api'

// Create context for app settings
const AppSettingsContext = createContext(null)

// Custom hook to use app settings
export const useAppSettings = () => {
  const context = useContext(AppSettingsContext)
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider')
  }
  return context
}

// Provider component
export const AppSettingsProvider = ({ children }) => {
  const [appSettings, setAppSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch app settings once when provider mounts
  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        setLoading(true)
        const response = await getJson('/api/appSettings', { includeToken: false })
        
        if (response?.status && response?.app_settings) {
          setAppSettings(response.app_settings)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch app settings')
        console.error('Error fetching app settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAppSettings()
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    appSettings,
    loading,
    error,
    // Utility functions for common data access
    contactInfo: appSettings?.callus || null,
    privacyPolicy: appSettings?.usingPolicy || null,
    aboutApp: appSettings?.aboutApp || null
  }), [appSettings, loading, error])

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  )
}

export default AppSettingsContext

