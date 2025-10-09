import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { useNavigate, useLocation } from 'react-router-dom'
import { getJson, postForm, postMultipart } from '../../api'

function NewAddCer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { formData: stepData, selectedCategory, previewImages } = location.state || {}
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeSubscriptions, setActiveSubscriptions] = useState([])
  const [checkingSubscription, setCheckingSubscription] = useState(true)
  const [walletBalance, setWalletBalance] = useState(0)
  const [checkingWallet, setCheckingWallet] = useState(true)
  
  const [formData, setFormData] = useState({
    area_id: '',
    phone: ''
  })
  
  const [phoneError, setPhoneError] = useState('')

  // Helper function to get user-specific localStorage key
  const getUserStorageKey = useCallback((baseKey) => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsed = JSON.parse(userData)
        const userId = parsed.id
        return `${baseKey}_user_${userId}`
      }
    } catch (e) {
      console.error('Error getting user ID:', e)
    }
    return baseKey // Fallback to base key if no user
  }, [])

  // Redirect if no data
  useEffect(() => {
    if (!stepData || !selectedCategory) {
      navigate('/new-add-cat')
      return
    }
  }, [stepData, selectedCategory, navigate])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Ad type for commercial ads - Type 1.4 (commercial ads need both types 1 and 4)
  const adType = '1.4'

  // Check user subscription status
  const checkSubscription = useCallback(async () => {
    try {
      setCheckingSubscription(true)
      
      console.log('🔍 Checking subscription for commercial ad...')
      
      // Build query string for subscription check - type[] is an array parameter
      // Supports single type: "1" -> type[]=1
      // Or multiple types: "1,4" or "1.4" -> type[]=1&type[]=4
      let queryString = ''
      const adTypeStr = String(adType).trim()
      
      if (adTypeStr.includes('.') || adTypeStr.includes(',')) {
        // Multiple types
        const types = adTypeStr.split(/[.,]/).filter(t => t.trim())
        queryString = types.map(t => `type[]=${t.trim()}`).join('&')
        console.log('📤 Multiple types detected:', types, 'Query:', queryString)
      } else {
        // Single type
        queryString = `type[]=${adTypeStr}`
        console.log('📤 Single type detected:', adTypeStr, 'Query:', queryString)
      }
      
      console.log('📡 Full URL:', `/api/subscription-packages?${queryString}`)
      
      const response = await getJson(`/api/subscription-packages?${queryString}`)
      console.log('📦 Subscription response:', response)
      
      if (response?.status && response?.data) {
        const subscriptions = Array.isArray(response.data) ? response.data : []
        setActiveSubscriptions(subscriptions)
        console.log(subscriptions.length > 0 ? `✅ User has ${subscriptions.length} active subscription(s)` : '❌ No active subscription')
      } else {
        console.log('⚠️ Could not verify subscription')
        setActiveSubscriptions([])
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      setActiveSubscriptions([])
    } finally {
      setCheckingSubscription(false)
    }
  }, [adType])

  // Check wallet balance
  const checkWalletBalance = useCallback(async () => {
    try {
      setCheckingWallet(true)
      
      // Get user ID
      let userId = null
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsed = JSON.parse(userData)
          userId = parsed.id
        }
      } catch (e) {
        console.error('Error parsing user data:', e)
      }

      if (!userId) {
        console.log('⚠️ No user ID found')
        setWalletBalance(0)
        setCheckingWallet(false)
        return
      }

      // Send user_id in the body
      const bodyString = `user_id=${userId}`
      const response = await postForm('/api/wallet-amount-users-wallets', bodyString)
      console.log('💰 Wallet response:', response)
      
      if (response?.status) {
        const displayAmount = response?.amount !== undefined ? response.amount : 
                            (response?.wallet_amount !== undefined ? response.wallet_amount : 
                            (response?.balance !== undefined ? response.balance : 0))
        const balance = parseFloat(displayAmount) || 0
        setWalletBalance(balance)
        console.log('💰 Wallet balance:', balance, 'KD')
      } else {
        setWalletBalance(0)
      }
    } catch (error) {
      console.error('Error checking wallet:', error)
      setWalletBalance(0)
    } finally {
      setCheckingWallet(false)
    }
  }, [])

  // Fetch areas from API
  const [areas, setAreas] = useState([])
  const fetchAreas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getJson('/api/areas')
      
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

  useEffect(() => {
    checkSubscription()
    checkWalletBalance()
    fetchAreas()
  }, [checkSubscription, checkWalletBalance, fetchAreas])

  // Re-check subscription when user returns to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Page is visible again, re-checking subscription...')
        checkSubscription()
        checkWalletBalance()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkSubscription, checkWalletBalance])

  // Validate phone number
  const validatePhone = useCallback((phone) => {
    if (!phone) return 'يرجى إدخال رقم الهاتف'
    if (!phone.startsWith('05')) return 'رقم الهاتف يجب أن يبدأ بـ 05'
    if (phone.length < 10) return 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'
    return ''
  }, [])

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'phone') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }))
        if (value) {
          const error = validatePhone(value)
          setPhoneError(error)
        } else {
          setPhoneError('')
        }
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
    
    const phoneValidationError = validatePhone(formData.phone)
    if (phoneValidationError) {
      setPhoneError(phoneValidationError)
      alert(phoneValidationError)
      return
    }

    setIsSubmitting(true)

    try {
      // Get subscription type from active subscription
      // The ad type must match the user's subscription type
      let adTypeToSend = '1' // Default to type 1
      if (activeSubscriptions.length > 0 && activeSubscriptions[0]?.package?.type !== undefined) {
        adTypeToSend = String(activeSubscriptions[0].package.type)
        console.log('🎯 Using subscription type:', adTypeToSend, 'from active subscription')
      } else {
        console.log('⚠️ No active subscription found, using default type:', adTypeToSend)
      }

      // Create FormData
      const apiFormData = new FormData()
      
      apiFormData.append('name', stepData.title)
      apiFormData.append('description', stepData.description)
      apiFormData.append('price', stepData.price)
      apiFormData.append('whatsapp', stepData.whatsapp)
      apiFormData.append('cat_id', selectedCategory.id)
      apiFormData.append('type', adTypeToSend) // Use type from active subscription
      apiFormData.append('area_id', formData.area_id)
      apiFormData.append('place_id', formData.area_id)
      apiFormData.append('phone', formData.phone)
      
      // Add images
      if (previewImages && previewImages.length > 0) {
        previewImages.forEach((img, index) => {
          if (img.file) {
            apiFormData.append(`imgs[${index}]`, img.file)
          }
        })
      }

      console.log(`📤 Sending commercial ad (type ${adTypeToSend}) to /api/newAdd...`)
      console.log('Data:', {
        name: stepData.title,
        description: stepData.description,
        price: stepData.price,
        whatsapp: stepData.whatsapp,
        cat_id: selectedCategory.id,
        type: adTypeToSend,
        area_id: formData.area_id,
        phone: formData.phone,
        images_count: previewImages?.length || 0
      })

      // Send to API
      const response = await postMultipart('/api/newAdd', apiFormData, { timeoutMs: 30000 })
      
      console.log('📦 API Response:', response)

      if (response?.status) {
        alert('🎉 تم نشر الإعلان بنجاح!')
        
        // Clear localStorage (user-specific keys)
        const draftKey = getUserStorageKey('new_add_draft')
        const completeKey = getUserStorageKey('new_add_complete')
        localStorage.removeItem(draftKey)
        localStorage.removeItem(completeKey)
        
        // Navigate to products page filtered by this category
        navigate(`/products?cat_id=${selectedCategory.id}`)
      } else {
        alert('❌ ' + (response?.message || response?.msg || 'فشل نشر الإعلان'))
      }
    } catch (error) {
      console.error('❌ Error submitting ad:', error)
      alert('❌ حدث خطأ: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!stepData || !selectedCategory) {
    return null
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
            {selectedCategory?.name || 'إعلان'}
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
                        {/* Package Image */}
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
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
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

            {/* Subscribe Button - Always visible */}
            {!checkingSubscription && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="text-center mb-4">
                  <p className="text-gray-700 mb-4">
                    {activeSubscriptions.length > 0 
                      ? 'يمكنك الاشتراك في المزيد من الباقات التجارية'
                      : 'لنشر إعلان تجاري، تحتاج إلى الاشتراك في باقة'
                    }
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/business-packages')}
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
                    {activeSubscriptions.length > 0 
                      ? 'الاشتراك في باقة أخرى'
                      : 'الاشتراك في باقة تجارية'
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Wallet Balance Display */}
            {!checkingWallet && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-semibold">رصيد المحفظة:</span>
                  <span className={`text-xl font-bold ${walletBalance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {walletBalance.toFixed(3)} د.ك
                  </span>
                </div>
                {walletBalance > 0 && (
                  <p className="text-sm text-green-600 mt-2 text-center">
                    ✅ يمكنك الدفع من المحفظة
                  </p>
                )}
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

export default NewAddCer
