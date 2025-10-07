import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowForward } from 'react-icons/io'
import { postForm, getJson } from '../../api'
import { useDarkMode } from '../../contexts/DarkModeContext'

function AllPackages() {
  const navigate = useNavigate()
  const { darkMode } = useDarkMode()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState(0)
  const [checkingWallet, setCheckingWallet] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)

  // Fetch regular packages from API - type 0 and 2
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true)
      console.log('📦 Fetching regular packages (type 0 & 2)...')
      
      // Send both types for regular ads
      const response = await postForm('/api/packages', 'type[]=0&type[]=2')
      console.log('📦 Packages response:', response)
      
      if (response?.status && Array.isArray(response.data)) {
        setPackages(response.data)
        console.log('✅ Loaded', response.data.length, 'regular packages')
      } else {
        console.warn('⚠️ Failed to load packages:', response?.msg)
      }
    } catch (error) {
      console.error('❌ Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch wallet balance
  const fetchWalletBalance = useCallback(async () => {
    try {
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
      const response = await postForm('/api/wallet-amount-users-wallets', bodyString, { timeoutMs: 15000 })
      
      if (response?.status && response?.amount !== undefined) {
        setWalletBalance(response.amount)
        console.log('💰 Wallet balance loaded:', response.amount, 'SAR')
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    fetchPackages()
    fetchWalletBalance()
    
    // Check if returning from online payment
    const pendingSubscription = localStorage.getItem('pending_subscription_payment')
    const urlParams = new URLSearchParams(window.location.search)
    const isReturningFromPayment = urlParams.get('payment') === 'success' || urlParams.get('status') === 'success' || pendingSubscription
    
    if (isReturningFromPayment) {
      console.log('🔄 Detected return from online payment...')
      
      // Wait a moment then check subscription and show success
      setTimeout(() => {
        const savedData = pendingSubscription ? JSON.parse(pendingSubscription) : null
        if (savedData?.packageName) {
          alert(`✅ تم الاشتراك في باقة "${savedData.packageName}" بنجاح!\n\nيمكنك الآن نشر ${savedData.advNumber} إعلان لمدة ${savedData.period} يوم`)
        } else {
          alert('✅ تمت عملية الدفع بنجاح!\n\nتم تفعيل اشتراكك.')
        }
        localStorage.removeItem('pending_subscription_payment')
        console.log('✅ Subscription activated after payment')
      }, 1000)
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [fetchPackages, fetchWalletBalance])

  // Handle subscribe to package
  const handleSubscribe = async (pkg) => {
    console.log('🎯 Attempting to subscribe to package:', pkg.id, pkg.name)
    
    setCheckingWallet(true)
    
    try {
      // 1. Check for active subscription of same type
      console.log('🔍 Checking for active subscription...')
      const packageType = pkg.type || 0
      
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
      
      // Check if wallet has enough balance
      if (walletBalance < packagePrice) {
        // Not enough balance - redirect to wallet
        const confirm = window.confirm(
          `رصيدك الحالي: ${walletBalance} ريال\n` +
          `سعر الباقة: ${packagePrice} ريال\n\n` +
          `رصيدك غير كافٍ. هل تريد الذهاب للمحفظة لشحنها؟`
        )
        
        if (confirm) {
          navigate('/wallet')
        }
      } else {
        // Has enough balance - show payment modal
        setSelectedPackage(pkg)
        setShowPaymentModal(true)
        setCheckingWallet(false)
      }
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
      
      // Regular packages use type 0 or 2
      const packageType = selectedPackage.type || 0
      const requestBody = `package_id=${selectedPackage.id}&type=${packageType}&payment_method=${method}${userId ? `&user_id=${userId}` : ''}`
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

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'} flex items-center justify-center transition-colors duration-300`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0F005B' }}></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>جاري تحميل أنواع الباقات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'} py-6 transition-colors duration-300`} dir="rtl">
      {/* Container */}
      <div className="max-w-4xl mx-auto px-4">
        
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
            الباقات العادية
          </h1>
        </div>

        {/* No data */}
        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>لا توجد باقات متاحة حاليًا</p>
          </div>
        ) : (
          /* Packages Grid */
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
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pkg.period} يوم</span>
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
                  <span className={`text-sm mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>شهرياً</span>
                </div>

                {/* Subscribe Button - Dark navy color */}
                <button
                  onClick={() => handleSubscribe(pkg)}
                  disabled={checkingWallet}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0F005B' }}
                  onMouseEnter={(e) => {
                    if (!checkingWallet) {
                      e.currentTarget.style.backgroundColor = '#0A0040'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!checkingWallet) {
                      e.currentTarget.style.backgroundColor = '#0F005B'
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
      </div>

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
                <span className="font-bold text-[#00D9A5]">{selectedPackage.price} شهريا </span>
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

export default AllPackages

