import React, { useState, useEffect, useCallback } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { useNavigate, useLocation } from 'react-router-dom'
import { postForm, getJson } from '../../api'
import { useDarkMode } from '../../contexts/DarkModeContext'

function Packages() {
  const navigate = useNavigate()
  const location = useLocation()
  const { darkMode } = useDarkMode()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState(0)
  const [checkingWallet, setCheckingWallet] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  
  // Get package type from location state
  const packageType = location.state?.packageType || null

  // Fetch wallet balance
  const fetchWalletBalance = useCallback(async () => {
    try {
      // Get user ID from localStorage
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
      
      if (!userId) return
      
      const bodyString = `user_id=${userId}`
      const response = await postForm('/api/wallet-amount-users-wallets', bodyString)
      
      if (response?.status && response?.amount !== undefined) {
        setWalletBalance(response.amount)
        console.log('💰 Wallet balance loaded:', response.amount, 'SAR')
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }, [])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    fetchWalletBalance()
    
    // Check if returning from online payment
    const pendingSubscription = localStorage.getItem('pending_subscription_payment')
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment') || urlParams.get('status')
    
    // Only show success if explicitly successful
    if (paymentStatus === 'success' && pendingSubscription) {
      console.log('✅ Payment successful, activating subscription...')
      
      setTimeout(() => {
        const savedData = JSON.parse(pendingSubscription)
        if (savedData?.packageName) {
          alert(`✅ تم الاشتراك في باقة "${savedData.packageName}" بنجاح!\n\nيمكنك الآن نشر ${savedData.advNumber} إعلان لمدة ${savedData.period} يوم`)
        } else {
          alert('✅ تمت عملية الدفع بنجاح!\n\nتم تفعيل اشتراكك.')
        }
        localStorage.removeItem('pending_subscription_payment')
      }, 1000)
    } 
    // Handle failed/cancelled payments
    else if ((paymentStatus === 'failed' || paymentStatus === 'cancel' || paymentStatus === 'error') && pendingSubscription) {
      console.log('❌ Payment failed or cancelled')
      alert('⚠️ لم تكتمل عملية الدفع.\n\nيمكنك المحاولة مرة أخرى.')
      localStorage.removeItem('pending_subscription_payment')
    }
    // Handle return without payment status (user just went back)
    else if (pendingSubscription && !paymentStatus) {
      console.log('⚠️ Returned without payment confirmation')
      // Don't show alert, just clean up
      localStorage.removeItem('pending_subscription_payment')
    }
    
    // Clean URL parameters
    if (paymentStatus) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [fetchWalletBalance])

  // Fetch packages from API - Memoized with useCallback - Using POST method
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true)
      
      let bodyString = ''
      
      // If packageType is provided, filter by it
      if (packageType) {
        bodyString = `type[]=${encodeURIComponent(packageType.type)}`
        console.log('📦 Fetching packages for type:', packageType.name_ar, `(type: ${packageType.type})`)
      } else {
        // Try to get all packages
        console.log('📦 Fetching all packages...')
      }
      
      let response = await postForm('/api/packages', bodyString)
      console.log('📦 Packages response:', response)
      
      // If empty request fails, API might require type[] parameter
      if (!response?.status && !packageType) {
        console.log('⚠️ Empty request failed, trying with all types...')
        // Try with all common types: 0, 1, 2, 4
        response = await postForm('/api/packages', 'type[]=0&type[]=1&type[]=2&type[]=4')
        console.log('📦 Packages response (with all types):', response)
      }
      
      if (response?.status && Array.isArray(response.data)) {
        setPackages(response.data)
        console.log('✅ Loaded', response.data.length, 'packages')
      } else {
        console.warn('⚠️ Failed to fetch packages:', response?.msg || 'Unknown error')
      }
    } catch (error) {
      console.error('❌ Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }, [packageType])

  // Fetch packages when component mounts or adType changes
  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  const handleSubscribe = async (pkg) => {
    console.log('🎯 Attempting to subscribe to package:', pkg.id, pkg.name)
    
    setCheckingWallet(true)
    
    try {
      // 1. Check for active subscription of same type
      console.log('🔍 Checking for active subscription...')
      const packageType = pkg.type !== undefined ? pkg.type : 0
      
      try {
        const subscriptionCheck = await getJson(`/api/subscription-packages?type[]=${packageType}`)
        
        if (subscriptionCheck?.status && Array.isArray(subscriptionCheck.data) && subscriptionCheck.data.length > 0) {
          const activeSub = subscriptionCheck.data.find(sub => sub.status === 'active' && sub.used < sub.limit)
          
          if (activeSub) {
            const remaining = activeSub.limit - activeSub.used
            alert(
              `✅ لديك اشتراك نشط!\n\n` +
              `الباقة: ${activeSub.package?.name_ar || activeSub.package?.name || 'باقة نشطة'}\n` +
              `المتبقي: ${remaining} إعلان\n` +
              `تنتهي في: ${new Date(activeSub.end_date).toLocaleDateString('ar')}\n\n` +
              `لا يمكن الاشتراك في أكثر من باقة من نفس النوع.\n` +
              `استخدم اشتراكك الحالي أو انتظر حتى ينتهي.`
            )
            setCheckingWallet(false)
            return
          }
        }
      } catch (subCheckError) {
        // No active subscription (403 or other error) - this is OK, continue with purchase
        console.log('ℹ️ No active subscription found (expected for new users):', subCheckError.message)
      }
      
      // 2. Check wallet balance
      console.log('💰 Checking wallet balance...')
      await fetchWalletBalance()
      
      const packagePrice = parseFloat(pkg.price) || 0
      
      console.log('💰 Wallet balance:', walletBalance, 'SAR')
      console.log('💵 Package price:', packagePrice, 'SAR')
      
      // Always show payment modal - let user choose payment method
      // If wallet balance is low, they can still pay with visa/online
      setSelectedPackage(pkg)
      setShowPaymentModal(true)
      setCheckingWallet(false)
    } catch (error) {
      console.error('Error during subscription:', error)
      alert('حدث خطأ. يرجى المحاولة مرة أخرى')
    } finally {
      setCheckingWallet(false)
    }
  }

  // Handle payment method selection
  const handlePaymentMethod = async (method) => {
    setShowPaymentModal(false)
    setCheckingWallet(true)
    
    try {
      console.log(`✅ User selected ${method} payment, proceeding...`)
      
      // If wallet payment, check balance first
      if (method === 'wallet') {
        const packagePrice = parseFloat(selectedPackage.price) || 0
        console.log('💰 Checking wallet balance:', walletBalance, 'vs package price:', packagePrice)
        
        if (walletBalance < packagePrice) {
          setCheckingWallet(false)
          const confirm = window.confirm(
            `رصيدك الحالي: ${walletBalance} ريال\n` +
            `سعر الباقة: ${packagePrice} ريال\n\n` +
            `رصيدك غير كافٍ. هل تريد الذهاب للمحفظة لشحنها؟`
          )
          
          if (confirm) {
            navigate('/wallet')
          }
          return
        }
      }
      
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
      
      // Get package type from pkg object or use default
      const pkgType = selectedPackage.type !== undefined ? selectedPackage.type : 0
      const requestBody = `package_id=${selectedPackage.id}&type=${pkgType}&payment_method=${method}${userId ? `&user_id=${userId}` : ''}`
      console.log('📤 Sending subscription request:', requestBody)
      
      const subscribeResponse = await postForm('/api/subscription-packages', requestBody)
      
      if (subscribeResponse?.status) {
        // Check if online payment (visa/online)
        if (method === 'online' && subscribeResponse?.data?.payment_data?.link) {
          console.log('🌐 Opening online payment link:', subscribeResponse.data.payment_data.link)
          
          // Save pending subscription info for when user returns
          localStorage.setItem('pending_subscription_payment', JSON.stringify({
            packageId: selectedPackage.id,
            packageName: selectedPackage.name,
            advNumber: selectedPackage.adv_number,
            period: selectedPackage.period,
            orderId: subscribeResponse.data.payment_data.order_id,
            timestamp: Date.now()
          }))
          
          // Redirect to payment page (same window for better callback handling)
          window.location.href = subscribeResponse.data.payment_data.link
        } else if (method === 'wallet') {
          // Wallet payment completed
          alert(`✅ تم الاشتراك في باقة "${selectedPackage.name}" بنجاح!\n\nيمكنك الآن نشر ${selectedPackage.adv_number} إعلان لمدة ${selectedPackage.period} يوم`)
          // Refresh wallet balance after purchase
          await fetchWalletBalance()
        }
      } else {
        alert(subscribeResponse?.msg || 'فشل الاشتراك. يرجى المحاولة مرة أخرى')
      }
    } catch (subscribeError) {
      console.error('Subscription API error:', subscribeError)
      alert(subscribeError.message || 'حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى')
    } finally {
      setCheckingWallet(false)
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'} py-6 transition-colors duration-300`} dir="rtl">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4">
        {/* Page Title with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full transition-colors`}
            aria-label="رجوع"
          >
            <IoIosArrowForward className={`text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
          </button>
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {packageType ? `باقات ${packageType.name_ar}` : 'الباقات'}
          </h1>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: '#0F005B' }}></div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>جاري تحميل الباقات...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>لا توجد باقات متاحة حاليًا</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'} rounded-2xl shadow-lg p-6 border-2 transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-fade-in-up`}
                style={{ 
                  borderColor: '#00D9A5',
                  animationDelay: `${index * 100}ms`
                }}
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
                <h3 className={`text-xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {pkg.name}
                </h3>

                {/* Package Info - Dynamic from API */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-4 space-y-2 transition-colors`}>
                  {/* Number of Ads */}
                  <div className="flex items-center justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>عدد الإعلانات:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pkg.adv_number} إعلان</span>
                  </div>
                  
                  {/* Period */}
                  <div className="flex items-center justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>المدة:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pkg.period} {pkg.period === 1 ? 'يوم' : 'يوم'}</span>
                  </div>
                </div>

                {/* Details - Dynamic from API */}
                {pkg.details && (
                  <p className={`text-center text-sm mb-4 rounded-lg p-3 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-gray-600'}`}>
                    {pkg.details}
                  </p>
                )}

                {/* Price - Dynamic from API */}
                <div className="text-center mb-4 py-3">
                  <span className="text-4xl font-bold" style={{ color: '#00D9A5' }}>
                    {pkg.price}
                  </span>
                  <span className="text-gray-600 text-sm mr-2">شهرياً</span>
                </div>

                {/* Subscribe Button - Green color */}
                <button
                  onClick={() => handleSubscribe(pkg)}
                  disabled={checkingWallet}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#00D9A5' }}
                  onMouseEnter={(e) => {
                    if (!checkingWallet) {
                      e.currentTarget.style.backgroundColor = '#00C292'
                      e.currentTarget.style.filter = 'brightness(1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!checkingWallet) {
                      e.currentTarget.style.backgroundColor = '#00D9A5'
                      e.currentTarget.style.filter = 'brightness(1)'
                    }
                  }}
                >
                  {checkingWallet ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>جاري التحقق...</span>
                    </div>
                  ) : (
                    'اشترك الان'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Payment Method Modal */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPaymentModal(false)}>
          <div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl max-w-md w-full p-6 transform transition-all`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <h2 className={`text-2xl font-bold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              اختر طريقة الدفع
            </h2>

            {/* Package Info */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl p-4 mb-6`}>
              <div className="flex items-center justify-between mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>الباقة:</span>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPackage.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>السعر:</span>
                <span className="font-bold text-[#00D9A5]">{selectedPackage.price} ريال</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>الرصيد المتبقي:</span>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {(walletBalance - parseFloat(selectedPackage.price || 0)).toFixed(2)} ريال
                </span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3 mb-6">
              {/* Wallet Option */}
              <button
                onClick={() => handlePaymentMethod('wallet')}
                className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border-2 border-[#00D9A5] rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#00D9A5] bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#00D9A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>محفظة الكترونية</span>
                </div>
                <svg className="w-6 h-6 text-[#00D9A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Visa/MasterCard Option */}
              <button
                onClick={() => handlePaymentMethod('online')}
                className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border-2 border-blue-500 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>فيزا</span>
                </div>
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className={`w-full py-3 rounded-xl font-semibold ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Packages
