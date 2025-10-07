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
  const [activeSubscriptions, setActiveSubscriptions] = useState([])
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
    // For regular ads, get type from category
    // Regular categories (سيارات, عقارات, etc.) use type 0 or 2
    if (completeData?.cat_id) {
      const categoryId = parseInt(completeData.cat_id)
      // You can check specific category IDs here if needed
      // For now, assume regular categories use type 0
      return '0'
    }
    
    // For special/featured ads, get type from dynamicFields
    if (completeData?.dynamicFields) {
      for (const [fieldId, fieldValue] of Object.entries(completeData.dynamicFields)) {
        // Look for a field that contains "type" in its ID
        if (fieldId.includes('type') && fieldValue && !Array.isArray(fieldValue)) {
          return fieldValue
        }
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
      
      console.log('🔍 Checking subscription with type:', adType, 'Type:', typeof adType)
      
      // Handle multiple types (e.g., "0.2" or "0,2" means type 0 AND type 2)
      let queryString = ''
      const adTypeStr = String(adType).trim()
      
      if (adTypeStr.includes('.') || adTypeStr.includes(',')) {
        const types = adTypeStr.split(/[.,]/).filter(t => t.trim())
        queryString = types.map(t => `type[]=${t.trim()}`).join('&')
        console.log('📤 Multiple types detected:', types, 'Query:', queryString)
      } else {
        queryString = `type[]=${adTypeStr}`
        console.log('📤 Single type detected:', adTypeStr, 'Query:', queryString)
      }
      
      console.log('📡 Full URL:', `/api/subscription-packages?${queryString}`)
      const response = await getJson(`/api/subscription-packages?${queryString}`)
      console.log('📦 Subscription response:', response)
      
      // Check if user has active subscription
      if (response?.status && response?.data) {
        // Save active subscriptions
        const subscriptions = Array.isArray(response.data) ? response.data : []
        setActiveSubscriptions(subscriptions)
        console.log(subscriptions.length > 0 ? `✅ User has ${subscriptions.length} active subscription(s)` : '❌ No active subscription')
      } else {
        // If response fails or invalid type, assume no subscription (show button)
        console.log('⚠️ Could not verify subscription, showing subscribe button')
        setActiveSubscriptions([])
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      // On error, show the subscription button to be safe
      setActiveSubscriptions([])
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
      // Create FormData
      const formDataToSend = new FormData()
      formDataToSend.append('name', completeData.name)
      formDataToSend.append('description', completeData.description)
      formDataToSend.append('cat_id', completeData.cat_id)
      formDataToSend.append('type', adType || '')
      formDataToSend.append('area_id', formData.area_id)
      formDataToSend.append('place_id', formData.area_id) // Same as area_id
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('whatsapp', formData.phone) // Same number for both
      formDataToSend.append('price', formData.price)
      
      // Add ads_inputs as array elements
      let inputIndex = 0
      if (completeData?.dynamicFields) {
        Object.entries(completeData.dynamicFields).forEach(([fieldId, fieldValue]) => {
          if (Array.isArray(fieldValue)) {
            // Handle array values
            fieldValue.forEach(val => {
              formDataToSend.append(`ads_inputs[${inputIndex}][input_id]`, fieldId)
              formDataToSend.append(`ads_inputs[${inputIndex}][input_value]`, val)
              inputIndex++
            })
          } else {
            // Handle single values
            formDataToSend.append(`ads_inputs[${inputIndex}][input_id]`, fieldId)
            formDataToSend.append(`ads_inputs[${inputIndex}][input_value]`, fieldValue)
            inputIndex++
          }
        })
      }

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
        localStorage.removeItem('car_page_draft')
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

            {/* Active Subscriptions - Show user's active packages */}
            {!checkingSubscription && activeSubscriptions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">الباقات المشترك فيها</h3>
                <div className="grid grid-cols-1 gap-6">
                  {activeSubscriptions.map((subscription) => {
                    const pkg = subscription.package
                    return (
                      <div
                        key={subscription.id}
                        className="bg-white hover:shadow-2xl rounded-2xl shadow-lg p-6 border-2 transition-all duration-500 hover:-translate-y-2 hover:scale-105"
                        style={{ 
                          borderColor: '#00D9A5'
                        }}
                      >
                        {/* Package Image - Dynamic from API */}
                        {(pkg?.img || pkg?.image) && (
                          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <img 
                              src={pkg.img || (pkg.image?.startsWith('http') ? pkg.image : `https://lay6ofk.com/uploads/packages/${pkg.image}`)}
                              alt={pkg.name_ar || pkg.name_en}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}

                        {/* Package Name */}
                        <h3 className="text-xl font-bold text-center mb-2 text-gray-900">
                          {pkg?.name_ar || pkg?.name_en}
                        </h3>

                        {/* Package Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 transition-colors">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">عدد الإعلانات:</span>
                            <span className="font-bold text-gray-900">{pkg?.adv_num} إعلان</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">المدة:</span>
                            <span className="font-bold text-gray-900">{pkg?.period} يوم</span>
                          </div>
                        </div>

                        {/* Details */}
                        {pkg?.details && (
                          <p className="text-center text-sm mb-4 rounded-lg p-3 bg-blue-50 text-gray-600">
                            {pkg.details}
                          </p>
                        )}

                        {/* Price */}
                        <div className="text-center mb-4 py-3">
                          <span className="text-5xl font-bold text-cyan-400">
                            {pkg?.price}
                          </span>
                          <span className="text-base mr-2 text-cyan-400">شهرياً</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Subscribe Button - Show if no active subscription */}
            {!checkingSubscription && activeSubscriptions.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <button
                  type="button"
                  onClick={() => navigate('/packages')}
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