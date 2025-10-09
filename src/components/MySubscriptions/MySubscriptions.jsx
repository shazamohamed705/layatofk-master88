import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJson } from '../../api';
import { IoIosArrowForward } from 'react-icons/io';
import { useDarkMode } from '../../contexts/DarkModeContext';

function MySubscriptions() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      const token = localStorage.getItem('api_token');
      if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('📤 Fetching subscriptions for current user...');
      console.log('  - Token exists:', !!token);
      console.log('  - API Endpoint: /api/subscription-packages?type[]=0');

      // Fetch normal subscriptions only (type=0)
      // The API will return subscriptions for the logged-in user based on token
      const response = await getJson('/api/subscription-packages?type[]=0');
      
      console.log('📦 Subscriptions response:', response);
      console.log('  - Status:', response?.status);
      console.log('  - Data type:', Array.isArray(response?.data) ? 'Array' : typeof response?.data);
      console.log('  - Count:', response?.data?.length || 0);

      if (response?.status && Array.isArray(response.data)) {
        setSubscriptions(response.data);
        console.log('✅ Loaded', response.data.length, 'subscriptions for current user');
      } else {
        // User has no subscriptions - this is normal, not an error
        setSubscriptions([]);
        console.log('ℹ️ User has no active subscriptions');
      }
    } catch (err) {
      console.log('ℹ️ User has no subscriptions or API returned error:', err.message);
      // Treat "no subscription" as normal case, not error
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'} flex items-center justify-center`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0F005B' }}></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>جاري تحميل اشتراكاتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'} py-6`} dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Page Title with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/profile')}
            className={`p-2 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full transition-colors`}
          >
            <IoIosArrowForward className={`text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
          </button>
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            اشتراكاتي
          </h1>
        </div>

        {/* Error State - Removed to show clean UI when user has no subscriptions */}

        {/* No subscriptions */}
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              لا توجد اشتراكات حالياً
            </p>
            <button
              onClick={() => navigate('/all-packages')}
              className="mt-4 px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#0F005B' }}
            >
              تصفح الباقات المتاحة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscriptions.map((subscription, index) => {
              // Extract package info from subscription
              const pkg = subscription.package || subscription;
              const packageName = pkg.name_ar || pkg.name || 'باقة';
              const packageImage = pkg.img || pkg.image;
              const advNumber = subscription.limit || subscription.ads_count || pkg.adv_number || 0;
              const period = subscription.duration || pkg.period || 0;
              const price = subscription.price || pkg.price || 0;
              const details = subscription.description || pkg.details;
              const isActive = subscription.status === 'active' || subscription.is_active === 1;
              const used = subscription.used || 0;
              const remaining = advNumber - used;

              return (
                <div
                  key={subscription.id}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 border-2 transition-all duration-500 animate-fade-in-up relative`}
                  style={{ 
                    borderColor: isActive ? '#00D9A5' : '#9CA3AF',
                    animationDelay: `${index * 100}ms`,
                    opacity: isActive ? 1 : 0.7
                  }}
                >
                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        نشط
                      </span>
                    </div>
                  )}

                  {/* Package Image */}
                  {packageImage && (
                    <div className="w-20 h-20 mx-auto mb-4">
                      <img 
                        src={packageImage} 
                        alt={packageName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Package Name */}
                  <h3 className={`text-xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {packageName}
                  </h3>

                  {/* Package Info */}
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-4 space-y-2`}>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>عدد الإعلانات:</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {advNumber} إعلان
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>المدة:</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {period} يوم
                      </span>
                    </div>

                    {isActive && (
                      <>
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>المستخدم:</span>
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {used} إعلان
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>المتبقي:</span>
                          <span className="font-bold text-green-600">
                            {remaining} إعلان
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Details */}
                  {details && (
                    <p className={`text-center text-sm mb-4 rounded-lg p-3 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-gray-600'}`}>
                      {details}
                    </p>
                  )}

                  {/* Price */}
                  <div className="text-center mb-4 py-3">
                    <span className="text-4xl font-bold" style={{ color: '#00D9A5' }}>
                      {price}
                    </span>
                    <span className={`text-sm mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>د.ك</span>
                  </div>

                  {/* Renew Button */}
                  <button
                    onClick={() => navigate('/all-packages')}
                    disabled={isActive}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isActive
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'text-white hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: isActive ? undefined : '#0F005B'
                    }}
                  >
                    {isActive ? 'اشتراك نشط' : 'تجديد الاشتراك'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      
      </div>
    </div>
  );
}

export default MySubscriptions;

