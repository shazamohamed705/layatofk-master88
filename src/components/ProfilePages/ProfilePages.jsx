import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowForward } from 'react-icons/io'
import { BsPatchCheckFill } from 'react-icons/bs'
import { FiUser, FiMail, FiPhone, FiSettings, FiLogOut, FiPackage, FiShoppingBag } from 'react-icons/fi'
import { MdVerifiedUser, MdLanguage, MdDarkMode, MdNotifications, MdPrivacyTip } from 'react-icons/md'
import { postForm } from '../../api'
import { useDarkMode } from '../../contexts/DarkModeContext'
import { IoKeyOutline } from "react-icons/io5";
import { LuFileSpreadsheet } from "react-icons/lu";

function ProfilePages() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { darkMode, toggleDarkMode } = useDarkMode()
  const [notifications, setNotifications] = useState(true)

  // Helper: normalize verified flag from API
  const isUserVerified = (u) => {
    if (!u) return false
    return (
      u.is_verified === 1 || u.is_verified === '1' || u.is_verified === true ||
      u.verified === 1 || u.verified === '1' || u.verified === true ||
      u.verification === 1 || u.verification === '1' ||
      String(u.verification_status || '').toLowerCase() === 'verified'
    )
  }

  // Fetch user profile from API - Using POST method
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true)
      // Use POST method with empty body
      const response = await postForm('/api/userProfile', '')
      console.log('👤 User profile response:', response)
      
      if (response?.status && response?.user) {
        setUser(response.user)
        console.log('✅ User profile loaded')
      } else {
        console.warn('⚠️ Failed to load user profile:', response?.msg)
        // If not logged in or failed, redirect to login
        navigate('/login')
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      // If not logged in, redirect to login
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // Handle logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('api_token')
      localStorage.removeItem('user')
      navigate('/')
      window.location.reload()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  // Profile menu items
  const menuItems = [
    {
      icon: <FiUser className="text-xl" />,
      label: 'الملف الشخصي',
      onClick: () => navigate('/'),
      arrow: true
    },
    {
      icon: <IoKeyOutline  className="text-xl" />,
      label:  'الامان وكلمه المرور',
      badge: user?.adv_numbers || 0,
      onClick: () => navigate('/advertising'),
      arrow: true
    },
    {
      icon: <FiShoppingBag className="text-xl" />,
      label: 'الباقات ',
      onClick: () => navigate('/all-packages'),
      arrow: true
    },
    {
      icon: <FiPackage className="text-xl" />,
      label: 'اشتركاتي',
      badge: user?.adv_numbers || 0,
      onClick: () => navigate('/my-ads'),
      arrow: true
    },
    {
      icon: <FiSettings className="text-xl" />,
      label: 'المحفظه الاكترونيه ',
      onClick: () => navigate('/wallet'),
      arrow: true
    },
    {
      icon: <LuFileSpreadsheet className="text-xl" />,
      label: 'فواتيري',
      onClick: () => navigate('/favorites'),
      arrow: true
    },
    {
      icon: <MdLanguage className="text-xl" />,
      label: 'اللغة',
      value: 'العربية',
      onClick: () => {},
      arrow: true
    },
    {
      icon: <MdDarkMode className="text-xl" />,
      label: 'الوضع المظلم',
      toggle: true,
      value: darkMode,
      onChange: toggleDarkMode,
      arrow: false
    },
    {
      icon: <MdNotifications className="text-xl" />,
      label: 'الاشعارات',
      toggle: true,
      value: notifications,
      badge: user?.unread_messages || 0,
      onChange: () => setNotifications(prev => !prev),
      arrow: false
    },
    {
      icon: <MdPrivacyTip className="text-xl" />,
      label: 'السياسة الشائعة',
      onClick: () => navigate('/privacy'),
      arrow: true
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0F005B' }}></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`} dir="rtl">
      {/* Container with max width for large screens */}
      <div className="max-w-2xl mx-auto">
        
        {/* Profile Header */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 py-6 transition-colors duration-300`}>
          {/* User Image, Name and Verified Badge */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                <img 
                  src={user?.image || 'https://via.placeholder.com/150'} 
                  alt={user?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150'
                  }}
                />
              </div>
              <div className="text-right">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {user?.name || 'المستخدم'}
                </h2>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
            </div>
            {isUserVerified(user) && (
              <div className="flex items-center gap-1 text-blue-600">
                <BsPatchCheckFill className="text-base" />
                <span className="text-sm font-semibold">بائع موثق</span>
              </div>
            )}
          </div>

          {/* Verify Account Button */}
          {user?.is_verified !== 1 && (
            <button
              onClick={() => navigate('/verify-account')}
              className="w-full bg-blue-50 text-blue-600 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <MdVerifiedUser className="text-xl" />
              <span>وثّق حسابك الآن</span>
            </button>
          )}
        </div>

        {/* Menu Items */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} mt-4 transition-colors duration-300`}>
          {menuItems.map((item, index) => (
            <div key={index}>
              <button
                onClick={item.toggle ? undefined : item.onClick}
                className={`w-full px-4 py-4 flex items-center justify-between ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item.icon}</div>
                  <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}

                  {/* Value or Toggle */}
                  {item.toggle ? (
                    <label className="relative inline-block w-11 h-6">
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={() => item.onChange()}
                        className="sr-only peer"
                      />
                      <div className={`w-full h-full rounded-full transition-colors ${item.value ? 'bg-blue-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                      <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-[-22px]"></div>
                    </label>
                  ) : item.value ? (
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{item.value}</span>
                  ) : null}

                  {/* Arrow */}
                  {item.arrow && (
                    <IoIosArrowForward className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </div>
              </button>
              
              {/* Divider */}
              {index < menuItems.length - 1 && (
                <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="px-4 py-6">
          <button
            onClick={handleLogout}
            className={`w-full ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors`}
          >
            <FiLogOut className="text-lg" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePages

