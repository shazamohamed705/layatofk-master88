import React, { useState, useEffect } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { postForm, getJson } from '../../api';

function BusinessPackages() {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [checkingWallet, setCheckingWallet] = useState(false);

    // Fetch commercial packages from API
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('📤 Fetching commercial packages with types 1 & 4...');
                
                // Send POST request with type[] query string format
                const response = await postForm('/api/packages', 'type[]=1&type[]=4');

                console.log('📦 Packages response:', response);

                if (response?.status && Array.isArray(response.data)) {
                    console.log('✅ Loaded', response.data.length, 'commercial packages');
                    setPackages(response.data);
                } else {
                    console.log('❌ Invalid response');
                    setError('فشل في جلب الباقات');
                }
            } catch (err) {
                console.error('❌ Error fetching packages:', err);
                setError('حدث خطأ في جلب الباقات');
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    // Fetch wallet balance
    const fetchWalletBalance = async () => {
        try {
            // Get user ID
            let userId = null;
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const parsed = JSON.parse(userData);
                    userId = parsed.id;
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }

            if (!userId) {
                console.log('⚠️ No user ID found');
                setWalletBalance(0);
                return;
            }

            // Send user_id in the body
            const bodyString = `user_id=${userId}`;
            const response = await postForm('/api/wallet-amount-users-wallets', bodyString);
            console.log('💰 Wallet response:', response);
            
            if (response?.status) {
                const displayAmount = response?.amount !== undefined ? response.amount : 
                                    (response?.wallet_amount !== undefined ? response.wallet_amount : 
                                    (response?.balance !== undefined ? response.balance : 0));
                const balance = parseFloat(displayAmount) || 0;
                setWalletBalance(balance);
                console.log('💰 Wallet balance:', balance, 'KD');
            } else {
                setWalletBalance(0);
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
            setWalletBalance(0);
        }
    };

    // Handle subscribe button
    const handleSubscribe = async (pkg) => {
        console.log('🎯 Attempting to subscribe to package:', pkg.id, pkg.name);
        
        setCheckingWallet(true);
        
        try {
            // Check wallet balance
            await fetchWalletBalance();
            
            // Show payment modal
            setSelectedPackage(pkg);
            setShowPaymentModal(true);
            setCheckingWallet(false);
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ. يرجى المحاولة مرة أخرى');
            setCheckingWallet(false);
        }
    };

    // Handle payment method selection
    const handlePaymentMethod = async (method) => {
        setShowPaymentModal(false);
        setCheckingWallet(true);
        
        try {
            console.log(`✅ User selected ${method} payment`);
            
            // If wallet payment, check balance first
            if (method === 'wallet') {
                const packagePrice = parseFloat(selectedPackage.price) || 0;
                console.log('💰 Checking wallet balance:', walletBalance, 'vs package price:', packagePrice);
                
                if (walletBalance < packagePrice) {
                    setCheckingWallet(false);
                    const confirm = window.confirm(
                        `رصيدك الحالي: ${walletBalance} د.ك\n` +
                        `سعر الباقة: ${packagePrice} د.ك\n\n` +
                        `رصيدك غير كافٍ. هل تريد الذهاب للمحفظة لشحنها؟`
                    );
                    
                    if (confirm) {
                        navigate('/wallet');
                    }
                    return;
                }
            }
            
            // Get user ID
            let userId = null;
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const parsed = JSON.parse(userData);
                    userId = parsed.id;
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
            
            // Send subscription request
            const pkgType = selectedPackage.type !== undefined ? selectedPackage.type : 0;
            const requestBody = `package_id=${selectedPackage.id}&type=${pkgType}&payment_method=${method}${userId ? `&user_id=${userId}` : ''}`;
            console.log('📤 Sending subscription request:', requestBody);
            
            const subscribeResponse = await postForm('/api/subscription-packages', requestBody);
            
            console.log('📦 Subscription API Response:', subscribeResponse);
            console.log('💳 Payment method used:', method);
            console.log('💰 Wallet balance before:', walletBalance);
            
            if (subscribeResponse?.status) {
                // Check if online payment (visa/online)
                if (method === 'online' && subscribeResponse?.data?.payment_data?.link) {
                    console.log('🌐 Opening online payment link:', subscribeResponse.data.payment_data.link);
                    
                    // Save pending subscription info
                    localStorage.setItem('pending_subscription_payment', JSON.stringify({
                        packageId: selectedPackage.id,
                        packageName: selectedPackage.name,
                        advNumber: selectedPackage.adv_number,
                        period: selectedPackage.period,
                        orderId: subscribeResponse.data.payment_data.order_id,
                        timestamp: Date.now()
                    }));
                    
                    // Redirect to payment page
                    window.location.href = subscribeResponse.data.payment_data.link;
                } else if (method === 'wallet') {
                    // Wallet payment completed
                    console.log('✅ Wallet payment successful from API');
                    console.log('📦 Full response:', subscribeResponse);
                    
                    // Wait a moment for API to process
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Refresh wallet balance to show updated amount
                    console.log('🔄 Refreshing wallet balance...');
                    await fetchWalletBalance();
                    console.log('💰 New wallet balance:', walletBalance);
                    
                    // Show success message with details
                    alert(
                        `✅ تم الاشتراك في باقة "${selectedPackage.name}" بنجاح!\n\n` +
                        `عدد الإعلانات: ${selectedPackage.adv_number} إعلان\n` +
                        `المدة: ${selectedPackage.period} يوم\n` +
                        `تم الخصم من المحفظة: ${selectedPackage.price} د.ك\n\n` +
                        `يمكنك الآن نشر إعلاناتك التجارية!`
                    );
                    
                    // Return to previous page (NewAddCer will auto-refresh subscription)
                    navigate(-1);
                }
            } else {
                console.log('❌ Subscription failed:', subscribeResponse);
                alert(subscribeResponse?.msg || subscribeResponse?.message || 'فشل الاشتراك. يرجى المحاولة مرة أخرى');
            }
        } catch (subscribeError) {
            console.error('Subscription API error:', subscribeError);
            alert(subscribeError.message || 'حدث خطأ أثناء الاشتراك');
        } finally {
            setCheckingWallet(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6" dir="rtl">
            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4">
                {/* Page Title with Back Button */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="رجوع"
                    >
                        <IoIosArrowForward className="text-2xl text-gray-700" />
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        الباقات التجارية
                    </h1>
                </div>
                
                {loading ? (
                    <div className="flex flex-col justify-center items-center min-h-[500px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: '#0F005B' }}></div>
                        <p className="text-gray-600">جاري تحميل الباقات...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-lg text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                ) : packages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-lg text-gray-500">لا توجد باقات متاحة حاليًا</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {packages.map((pkg, index) => (
                            <div
                                key={pkg.id}
                                className="bg-white hover:shadow-2xl rounded-2xl shadow-lg p-6 border-2 transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-fade-in-up"
                                style={{ 
                                    borderColor: '#00D9A5',
                                    animationDelay: `${index * 100}ms`
                                }}
                            >
                                {/* Package Image - Dynamic from API */}
                                {pkg.img && pkg.img.trim() !== '' && (
                                    <div className="w-20 h-20 mx-auto mb-4">
                                        <img 
                                            src={pkg.img} 
                                            alt={pkg.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Package Name - Dynamic from API */}
                                <h3 className="text-xl font-bold text-center mb-2 text-gray-900">
                                    {pkg.name}
                                </h3>

                                {/* Package Info - Dynamic from API */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 transition-colors">
                                    {/* Number of Ads */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">عدد الإعلانات:</span>
                                        <span className="font-bold text-gray-900">{pkg.adv_number} إعلان</span>
                                    </div>
                                    
                                    {/* Period */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">المدة:</span>
                                        <span className="font-bold text-gray-900">{pkg.period} يوم</span>
                                    </div>
                                </div>

                                {/* Details - Dynamic from API */}
                                {pkg.details && pkg.details.trim() !== '' && (
                                    <p className="text-center text-sm mb-4 rounded-lg p-3 bg-blue-50 text-gray-600">
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
                                            e.currentTarget.style.backgroundColor = '#00C292';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!checkingWallet) {
                                            e.currentTarget.style.backgroundColor = '#00D9A5';
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
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                            اختر طريقة الدفع
                        </h2>

                        {/* Package Info */}
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">الباقة:</span>
                                <span className="font-bold text-gray-900">{selectedPackage.name}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">السعر:</span>
                                <span className="font-bold text-[#00D9A5]">{selectedPackage.price} د.ك</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">الرصيد المتبقي:</span>
                                <span className="font-bold text-gray-900">
                                    {(walletBalance - parseFloat(selectedPackage.price || 0)).toFixed(3)} د.ك
                                </span>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="space-y-3 mb-6">
                            {/* Wallet Option */}
                            <button
                                onClick={() => handlePaymentMethod('wallet')}
                                className="w-full bg-white hover:bg-gray-50 border-2 border-[#00D9A5] rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#00D9A5] bg-opacity-20 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-[#00D9A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-lg text-gray-800">محفظة الكترونية</span>
                                </div>
                                <svg className="w-6 h-6 text-[#00D9A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Visa/MasterCard Option */}
                            <button
                                onClick={() => handlePaymentMethod('online')}
                                className="w-full bg-white hover:bg-gray-50 border-2 border-blue-500 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-lg text-gray-800">فيزا</span>
                                </div>
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Cancel Button */}
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BusinessPackages;
