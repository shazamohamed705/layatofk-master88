import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { useNavigate, useLocation } from 'react-router-dom'
import { getJson, postForm, postMultipart } from '../../api'

function BrandsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [checkingSubscription, setCheckingSubscription] = useState(true)
  
  const [formData, setFormData] = useState({
    area_id: '',
    phone: '',
    price: ''
  })
  
  const [phoneError, setPhoneError] = useState('')
  const [completeData, setCompleteData] = useState(null)

  // Get dynamic ad type from completeData - Memoized for performance
  const adType = useMemo(() => {
    if (!completeData?.dynamicFields) return null
    
    // Find the first non-array value as type (typically the ad type field)
    for (const [, fieldValue] of Object.entries(completeData.dynamicFields)) {
      if (fieldValue && !Array.isArray(fieldValue)) {
        return fieldValue
      }
    }
    return null
  }, [completeData])

  // Check user subscription status - Using POST method
  const checkSubscription = useCallback(async () => {
    if (!adType) {
      setCheckingSubscription(false)
      return
    }

    try {
      setCheckingSubscription(true)
      
      // Build body string manually to support arrays (API requires array format)
      // Send as array even if single value: type[]=144
      const bodyString = `type[]=${encodeURIComponent(adType)}`
      
      console.log('🔍 Checking subscription with type:', adType)
      
      const response = await postForm('/api/subscription-packages', bodyString)
      console.log('📦 Subscription response:', response)
      
      // Check if user has active subscription
      if (response?.status && response?.data) {
        // If data is empty or no active subscriptions, user needs to subscribe
        const hasSubscription = Array.isArray(response.data) && response.data.length > 0
        setHasActiveSubscription(hasSubscription)
        console.log(hasSubscription ? '✅ User has active subscription' : '❌ No active subscription')
      } else {
        // If response fails or invalid type, assume no subscription (show button)
        console.log('⚠️ Could not verify subscription, showing subscribe button')
        setHasActiveSubscription(false)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      // On error, show the subscription button to be safe
      setHasActiveSubscription(false)
    } finally {
      setCheckingSubscription(false)
    }
  }, [adType])

  // Load saved data
  useEffect(() => {
    const savedData = localStorage.getItem('pending_ad_complete')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setCompleteData(parsed)
      console.log('✅ Loaded saved data:', parsed)
    } else {
      alert('لا توجد بيانات محفوظة')
      navigate('/share-ad')
    }
    
    // Fetch areas
    fetchAreas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check subscription when adType is available
  useEffect(() => {
    if (adType) {
      checkSubscription()
    }
  }, [adType, checkSubscription])

  // Fetch areas from API - Memoized with useCallback
  const fetchAreas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getJson('/api/areas')
      console.log('📍 Areas response:', response)
      
      if (response?.status && Array.isArray(response.data)) {
        setAreas(response.data)
        console.log('✅ Loaded', response.data.length, 'areas')
      }
    } catch (error) {
      console.error('Error fetching areas:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Validate phone number - Memoized with useCallback
  const validatePhone = useCallback((phone) => {
    if (!phone) return 'يرجى إدخال رقم الهاتف'
    if (!phone.startsWith('05')) return 'رقم الهاتف يجب أن يبدأ بـ 05'
    if (phone.length < 10) return 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'
    return ''
  }, [])

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // For phone, only allow numbers
    if (name === 'phone') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }))
        
        // Validate phone on change
        if (value) {
          const error = validatePhone(value)
          setPhoneError(error)
        } else {
          setPhoneError('')
        }
      }
    } else if (name === 'price') {
      // For price, only allow numbers and decimals
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.area_id) {
      alert('يرجى اختيار المنطقة')
      return
    }
    
    // Validate phone
    const phoneValidationError = validatePhone(formData.phone)
    if (phoneValidationError) {
      setPhoneError(phoneValidationError)
      alert(phoneValidationError)
      return
    }
    
    if (!formData.price) {
      alert('يرجى إدخال السعر')
      return
    }

    setIsSubmitting(true)

    try {
      // Use the memoized adType instead of recalculating
      const adsInputs = completeData?.dynamicFields || {}

      // Create FormData
      const formDataToSend = new FormData()
      formDataToSend.append('name', completeData.name)
      formDataToSend.append('description', completeData.description)
      formDataToSend.append('cat_id', completeData.cat_id)
      formDataToSend.append('type', adType || '')
      formDataToSend.append('area_id', formData.area_id)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('whatsapp', formData.phone) // Same number for both
      formDataToSend.append('price', formData.price)
      formDataToSend.append('ads_inputs', JSON.stringify(adsInputs))

      // Add images if available
      if (location.state?.images) {
        const images = location.state.images
        images.forEach((img, index) => {
          if (img.file) {
            formDataToSend.append(`imgs[${index}]`, img.file)
          }
        })
      }

      console.log('📤 Submitting final ad data...')

      // Send to API
      const response = await postMultipart('/api/newAdv', formDataToSend, { timeoutMs: 30000 })
      
      console.log('📦 API Response:', response)

      if (response?.status) {
        alert('✅ تم نشر الإعلان بنجاح!')
        
        // Clean up all saved data
        localStorage.removeItem('pending_ad_data')
        localStorage.removeItem('pending_ad_complete')
        sessionStorage.removeItem('pending_images_count')
        
        // Navigate to success page or ads list
        navigate('/advertising')
      } else {
        alert('❌ ' + (response?.msg || 'فشل نشر الإعلان'))
      }
    } catch (error) {
      console.error('❌ Error submitting ad:', error)
      alert('❌ حدث خطأ: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6">
      {/* Page Title with Back Button */}
      <div className="container mx-auto px-4 max-w-2xl mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="رجوع"
          >
            <IoIosArrowForward className="text-2xl text-gray-700" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {completeData?.category_name || 'سيارات'}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-2xl">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0F005B' }}></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Area Selection */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <label className="block text-right">
                <span className="text-gray-900 text-sm mb-2 block font-semibold">
                  المنطقة
                  <span className="text-red-500 mr-1">*</span>
                </span>
                <select
                  name="area_id"
                  value={formData.area_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-right text-gray-900"
                  style={{ 
                    borderColor: formData.area_id ? '#0F005B' : '#E5E7EB',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'left 0.5rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingLeft: '2.5rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0F005B'}
                  onBlur={(e) => e.target.style.borderColor = formData.area_id ? '#0F005B' : '#E5E7EB'}
                >
                  <option value="">اختر المنطقة</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Phone Number */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <label className="block text-right">
                <span className="text-gray-900 text-sm mb-2 block font-semibold">
                  رقم الهاتف
                  <span className="text-red-500 mr-1">*</span>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0512345678"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-right text-gray-900"
                  style={{ 
                    borderColor: phoneError ? '#EF4444' : (formData.phone ? '#0F005B' : '#E5E7EB')
                  }}
                  onFocus={(e) => e.target.style.borderColor = phoneError ? '#EF4444' : '#0F005B'}
                  onBlur={(e) => e.target.style.borderColor = phoneError ? '#EF4444' : (formData.phone ? '#0F005B' : '#E5E7EB')}
                />
                {phoneError && (
                  <span className="text-red-500 text-sm mt-2 block">
                    {phoneError}
                  </span>
                )}
              </label>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <label className="block text-right">
                <span className="text-gray-900 text-sm mb-2 block font-semibold">
                  السعر
                  <span className="text-red-500 mr-1">*</span>
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.000"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-right text-gray-900"
                  style={{ 
                    borderColor: formData.price ? '#0F005B' : '#E5E7EB'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0F005B'}
                  onBlur={(e) => e.target.style.borderColor = formData.price ? '#0F005B' : '#E5E7EB'}
                />
              </label>
            </div>

            {/* الاشتراك في باقة - Only show if user doesn't have active subscription */}
            {!hasActiveSubscription && !checkingSubscription && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <button
                  type="button"
                  onClick={() => navigate('/packages', { state: { adType } })}
                  className="w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg"
                  style={{ 
                    backgroundColor: '#00D9A5',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#00C292'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#00D9A5'
                  }}
                >
                  الاشتراك في باقة
                </button>
              </div>
            )}

            {/* Show subscription status badge */}
            {hasActiveSubscription && !checkingSubscription && (
              <div className="bg-green-50 border-2 border-green-500 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-green-600 text-lg">✅</span>
                  <p className="text-green-700 font-semibold text-center">
                    لديك اشتراك نشط في هذه الفئة
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 border-2 hover:scale-[1.02]"
                style={{ 
                  borderColor: '#0F005B',
                  color: '#0F005B',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F0FF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                السابق
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform text-white hover:scale-[1.02] shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: isSubmitting ? '#D1D5DB' : '#0F005B'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#0A0040'
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 0, 91, 0.3), 0 10px 10px -5px rgba(15, 0, 91, 0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#0F005B'
                    e.currentTarget.style.boxShadow = ''
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>جاري النشر...</span>
                  </>
                ) : (
                  'نشر'
                )}
              </button>
            </div>

            <p className="text-center text-sm text-gray-700">
              بنشر الإعلان، أنت توافق على شروط الاستخدام وسياسة الخصوصية
            </p>
          </form>
        )}
      </main>
    </div>
  )
}

export default BrandsPage