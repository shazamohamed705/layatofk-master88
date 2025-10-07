import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowForward } from 'react-icons/io'
import { IoRefreshOutline } from 'react-icons/io5'
import { AiOutlinePlus } from 'react-icons/ai'
import { postForm, getJson } from '../../api'
import { useDarkMode } from '../../contexts/DarkModeContext'

function Wallet() {
  const navigate = useNavigate()
  const { darkMode } = useDarkMode()
  const [walletData, setWalletData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [amount, setAmount] = useState('')
  const [isCharging, setIsCharging] = useState(false)
  const [error, setError] = useState(null)

  // Fetch wallet amount from API
  const fetchWalletAmount = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
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
      
      if (!userId) {
        setError('يرجى تسجيل الدخول أولاً')
        navigate('/login')
        return
      }
      
      console.log('💰 Fetching wallet amount for user:', userId)
      
      // Send user_id in the body
      const bodyString = `user_id=${userId}`
      const response = await postForm('/api/wallet-amount-users-wallets', bodyString)
      console.log('💰 Wallet response:', response)
      
      if (response?.status) {
        setWalletData(response)
        const displayAmount = response?.amount !== undefined ? response.amount : (response?.wallet_amount !== undefined ? response.wallet_amount : (response?.balance || 0))
        console.log('✅ Wallet data loaded')
        console.log('💰 Current balance from API:', displayAmount, 'SAR')
        console.log('📊 Full wallet data:', response)
      } else {
        const errorMsg = response?.msg || 'فشل تحميل بيانات المحفظة'
        setError(errorMsg)
        console.warn('⚠️ Failed to load wallet data:', errorMsg)
      }
    } catch (error) {
      const errorMsg = error.message || 'حدث خطأ في الاتصال بالخادم'
      setError(errorMsg)
      console.error('❌ Error fetching wallet data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchWalletAmount(false)
    
    // Check if returning from payment or if there's pending charge
    const pendingCharge = localStorage.getItem('pending_wallet_charge')
    const urlParams = new URLSearchParams(window.location.search)
    const isReturningFromPayment = urlParams.get('payment') === 'success' || pendingCharge
    
    if (isReturningFromPayment) {
      console.log('🔄 Detected return from payment, refreshing balance...')
      
      // Single refresh after return from payment
      setTimeout(() => {
        fetchWalletAmount(true)
        localStorage.removeItem('pending_wallet_charge')
        console.log('✅ Balance refreshed after payment')
      }, 1500) // Wait 1.5 seconds then refresh once
      
      // Clean URL
      window.history.replaceState({}, '', '/wallet')
    }
  }, [fetchWalletAmount])

  // Refresh wallet data
  const handleRefresh = () => {
    fetchWalletAmount(true)
  }

  // Handle charge wallet
  const handleChargeWallet = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('يرجى إدخال مبلغ صحيح')
      return
    }

    setIsCharging(true)
    setError(null)
    
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
      
      if (!userId) {
        alert('يرجى تسجيل الدخول أولاً')
        navigate('/login')
        return
      }
      
      console.log('💳 Creating payment session...')
      
      // Save charge info to localStorage for tracking
      localStorage.setItem('pending_wallet_charge', JSON.stringify({
        user_id: userId,
        amount: amount,
        timestamp: Date.now()
      }))
      
      // Call backend API to get payment URL - Using GET method
      const paymentPath = `/api/payment?user_id=${userId}&doing=charge-wallet&price=${encodeURIComponent(amount)}`
      console.log('💳 Requesting payment with user_id:', userId, 'and amount:', amount)
      
      const response = await getJson(paymentPath)
      
      console.log('💳 Payment response:', response)
      console.log('💳 Full response data:', JSON.stringify(response, null, 2))
      
      // Check all possible payment URL locations
      let paymentUrl = null
      
      if (response?.payment_url) {
        paymentUrl = response.payment_url
      } else if (response?.link) {
        paymentUrl = response.link
      } else if (response?.data?.payment_url) {
        paymentUrl = response.data.payment_url
      } else if (response?.data?.link) {
        paymentUrl = response.data.link
      } else if (response?.data?.payment_data?.link) {
        paymentUrl = response.data.payment_data.link
      } else if (response?.url) {
        paymentUrl = response.url
      }
      
      if (paymentUrl) {
        console.log('✅ Payment URL found:', paymentUrl)
        console.log('🔗 Redirecting to payment...')
        window.location.href = paymentUrl
      } else {
        const errorMsg = response?.msg || 'لم يتم العثور على رابط الدفع'
        setError(errorMsg)
        console.error('❌ Payment URL not found in response:', response)
        alert(`${errorMsg}\n\nالرجاء المحاولة مرة أخرى`)
      }
    } catch (error) {
      const errorMsg = error.message || 'حدث خطأ أثناء إنشاء جلسة الدفع'
      setError(errorMsg)
      console.error('❌ Error creating payment session:', error)
      alert(errorMsg)
      setIsCharging(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-300`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0F005B' }}></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>جاري تحميل المحفظة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`} dir="rtl">
      {/* Container */}
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 py-4 flex items-center justify-between transition-colors`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
              aria-label="رجوع"
            >
              <IoIosArrowForward className={`text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              محفظة إلكترونية
            </h1>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors disabled:opacity-50`}
            aria-label="تحديث الرصيد"
          >
            <IoRefreshOutline 
              className={`text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-700'} ${refreshing ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6">
          
          
          
          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm text-center ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                ❌ {error}
              </p>
              <button
                onClick={handleRefresh}
                className={`mt-2 text-sm underline ${darkMode ? 'text-red-300' : 'text-red-600'} hover:no-underline`}
              >
                حاول مرة أخرى
              </button>
            </div>
          )}
          
          {/* Current Balance */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 mb-6 transition-colors`}>
            <div className="text-right">
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>رصيدك الحالي</p>
              <div className="flex items-baseline gap-2 justify-end">
                <span className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {walletData?.amount !== undefined ? walletData.amount : (walletData?.wallet_amount !== undefined ? walletData.wallet_amount : (walletData?.balance || 0))}
                </span>
                <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ريال</span>
              </div>
            </div>
          </div>

          {/* Charge Section */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 transition-colors`}>
            <label className="block text-right mb-4">
              <span className={`text-sm mb-2 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                ادخل المبلغ المراد شحنه
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full px-4 py-3 border rounded-xl text-right text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </label>

            {/* Charge Button */}
            <button
              onClick={handleChargeWallet}
              disabled={isCharging || !amount}
              className="w-full py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0F005B' }}
              onMouseEnter={(e) => {
                if (!isCharging && amount) {
                  e.currentTarget.style.backgroundColor = '#0A0040'
                }
              }}
              onMouseLeave={(e) => {
                if (!isCharging) {
                  e.currentTarget.style.backgroundColor = '#0F005B'
                }
              }}
            >
              <AiOutlinePlus className="text-xl" />
              <span>{isCharging ? 'جاري التحويل...' : 'اشحن المحفظة'}</span>
            </button>
            
            {/* Important Notice */}
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-blue-900/30 border-2 border-blue-600' : 'bg-blue-50 border-2 border-blue-400'}`}>
              <p className={`text-sm text-center font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>
                📢 بعد إتمام الدفع، يرجى الضغط على زر التحديث ↻ أعلى الصفحة لرؤية الرصيد الجديد
              </p>
            </div>
          </div>

          {/* Info Messages */}
          
          {/* No Balance Warning */}
          {!loading && (walletData?.amount === 0 || walletData?.wallet_amount === 0 || walletData?.balance === 0) && (
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm text-center ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                ⚠️ رصيدك الحالي 0 ريال. يرجى شحن المحفظة للاستمرار.
              </p>
            </div>
          )}
          
          {/* Success Message after payment */}
          
        </div>
      </div>
    </div>
  )
}

export default Wallet

