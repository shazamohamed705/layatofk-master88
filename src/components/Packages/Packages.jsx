import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { useNavigate, useLocation } from 'react-router-dom'
import { postForm } from '../../api'

function Packages() {
  const navigate = useNavigate()
  const location = useLocation()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  // Get ad type from location state or localStorage
  const adType = useMemo(() => {
    // Try to get from location state first
    if (location.state?.adType) {
      return location.state.adType
    }
    
    // Try to get from localStorage
    try {
      const savedData = localStorage.getItem('pending_ad_complete')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed?.dynamicFields) {
          // Find the first non-array value as type
          for (const [, fieldValue] of Object.entries(parsed.dynamicFields)) {
            if (fieldValue && !Array.isArray(fieldValue)) {
              return fieldValue
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting ad type:', error)
    }
    
    return null
  }, [location.state])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Fetch packages from API - Memoized with useCallback - Using POST method
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build body string manually to support arrays (API requires array format)
      let bodyString = ''
      
      if (adType) {
        // Send as array even if single value: type[]=144
        bodyString = `type[]=${encodeURIComponent(adType)}`
        console.log('📦 Fetching packages with type filter:', adType)
      } else {
        console.log('📦 Fetching all packages (no filter)')
      }
      
      const response = await postForm('/api/packages', bodyString)
      console.log('📦 Packages response:', response)
      
      if (response?.status && Array.isArray(response.data)) {
        setPackages(response.data)
        console.log('✅ Loaded', response.data.length, 'packages')
      } else if (response?.status === false && adType) {
        // If filtered request fails, try without filter (get all packages)
        console.log('⚠️ Type filter failed, fetching all packages...')
        const fallbackResponse = await postForm('/api/packages', '')
        if (fallbackResponse?.status && Array.isArray(fallbackResponse.data)) {
          setPackages(fallbackResponse.data)
          console.log('✅ Loaded', fallbackResponse.data.length, 'packages (all)')
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }, [adType])

  // Fetch packages when component mounts or adType changes
  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  const handleSubscribe = (packageId) => {
    console.log('🎯 Subscribe to package:', packageId)
    // TODO: Implement payment/subscription logic
    alert(`سيتم توجيهك لصفحة الدفع للباقة رقم ${packageId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="sticky top-20 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoIosArrowForward className="text-2xl" style={{ color: '#0F005B' }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: '#0F005B' }}>
            الباقات
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-6">
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: '#0F005B' }}></div>
            <p className="text-gray-600">جاري تحميل الباقات...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد باقات متاحة حاليًا</p>
          </div>
        ) : (
          <div className="space-y-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl"
                style={{ borderColor: pkg.color || '#00D9A5' }}
              >
                {/* Package Image - Dynamic from API */}
                {pkg.img && (
                  <div className="w-20 h-20 mx-auto mb-4">
                    <img 
                      src={pkg.img} 
                      alt={pkg.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback: hide image if failed to load
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Package Name - Dynamic from API */}
                <h3 className="text-xl font-bold text-center mb-2 text-gray-900">
                  {pkg.name}
                </h3>

                {/* Package Info - Dynamic from API */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                  {/* Number of Ads */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">عدد الإعلانات:</span>
                    <span className="font-bold text-gray-900">{pkg.adv_number} إعلان</span>
                  </div>
                  
                  {/* Period */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">المدة:</span>
                    <span className="font-bold text-gray-900">{pkg.period} {pkg.period === 1 ? 'يوم' : 'يوم'}</span>
                  </div>
                </div>

                {/* Details - Dynamic from API */}
                {pkg.details && (
                  <p className="text-center text-gray-600 text-sm mb-4 bg-blue-50 rounded-lg p-3">
                    {pkg.details}
                  </p>
                )}

                {/* Price - Dynamic from API */}
                <div className="text-center mb-4 py-3">
                  <span className="text-4xl font-bold" style={{ color: pkg.color || '#00D9A5' }}>
                    {pkg.price}
                  </span>
                  <span className="text-gray-600 text-sm mr-2">ريال سعودي</span>
                </div>

                {/* Subscribe Button - Dynamic color from API */}
                <button
                  onClick={() => handleSubscribe(pkg.id)}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg"
                  style={{ backgroundColor: pkg.color || '#00D9A5' }}
                  onMouseEnter={(e) => {
                    // Darken the color slightly on hover
                    e.currentTarget.style.filter = 'brightness(0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'brightness(1)'
                  }}
                >
                  اشترك الان
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Packages
