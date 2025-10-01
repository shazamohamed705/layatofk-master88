import React, { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import loginImage from '../../assets/login photo.png'
import { postForm } from '../../api'

function Login() {
    // Form state
    const [phoneNumber, setPhoneNumber] = useState("")
    const [otp, setOtp] = useState("")
    
    // UI state
    const [step, setStep] = useState(1) // 1: Enter phone, 2: Enter OTP
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [countdown, setCountdown] = useState(0)

    // Normalize phone number (remove non-digits)
    const normalizedPhone = useMemo(() => phoneNumber.replace(/\D+/g, ''), [phoneNumber])

    // Send OTP code to phone
    const handleSendOTP = useCallback(async (e) => {
        e.preventDefault()
        setErrorMessage("")

        // Validate phone number (minimum 8 digits)
        if (!normalizedPhone || normalizedPhone.length < 8) {
            setErrorMessage('الرجاء إدخال رقم هاتف صحيح')
            return
        }

        const formParams = new URLSearchParams()
        formParams.append('phone', normalizedPhone)

        try {
            setIsSubmitting(true)
            const data = await postForm('/api/send-login-code', formParams, { skipToken: true })
            
            if (data && data.status) {
                setStep(2)
                setCountdown(60) // Start 60 second countdown
                
                // Countdown timer
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            } else {
                throw new Error(data?.msg || data?.message || 'فشل إرسال الكود')
            }
        } catch (err) {
            console.error('Send OTP error:', err)
            setErrorMessage(err?.message || 'خطأ في الاتصال')
        } finally {
            setIsSubmitting(false)
        }
    }, [normalizedPhone])

    // Login with OTP
    const handleLogin = useCallback(async (e) => {
        e.preventDefault()
        setErrorMessage("")

        // Validate OTP
        if (!otp || otp.length < 4) {
            setErrorMessage('الرجاء إدخال كود التحقق')
            return
        }

        const formParams = new URLSearchParams()
        formParams.append('emailorphone', normalizedPhone)
        formParams.append('otp', otp)

        try {
            setIsSubmitting(true)
            const data = await postForm('/api/login', formParams, { skipToken: true })
            
            if (data && data.status) {
                const token = data.user?.api_token || data.api_token
                if (token) {
                    localStorage.setItem('api_token', token)
                }
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user))
                }
                
                // Dispatch custom event to notify other components of login
                window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                    detail: { user: data.user, token } 
                }))
                
                // Redirect on success
                window.location.href = '/'
            } else {
                const details = data?.errors && typeof data.errors === 'object' 
                    ? Object.values(data.errors).flat().join(' | ')
                    : ''
                throw new Error(data?.msg || data?.message || details || 'فشل تسجيل الدخول')
            }
        } catch (err) {
            console.error('Login error:', err)
            setErrorMessage(err?.message || 'خطأ في تسجيل الدخول')
        } finally {
            setIsSubmitting(false)
        }
    }, [normalizedPhone, otp])


    return (
        <div className="w-11/12 mx-auto grid grid-cols-1 md:grid-cols-3 my-8">
            <div className="md:col-span-1">
                <img src={loginImage} alt="تسجيل الدخول" className='w-full h-full object-cover' />
            </div>
            <div className="md:col-span-2 space-y-6 p-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 my-5">تسجيل الدخول</h1>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {step === 1 
                            ? 'أدخل رقم هاتفك لتسجيل الدخول' 
                            : 'أدخل كود التحقق المرسل لهاتفك'}
                    </p>
                </div>

                {/* Error message */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-right text-sm">
                        {errorMessage}
                    </div>
                )}

                {/* Step 1: Phone Number */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium text-sm text-right">رقم الهاتف</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="مثال: 9665XXXXXXXX"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                                disabled={isSubmitting}
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال كود التحقق'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Input */}
                {step === 2 && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium text-sm text-right">كود التحقق</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="أدخل الكود"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
                                disabled={isSubmitting}
                                required
                                autoFocus
                                maxLength="6"
                            />
                            <p className="text-xs text-gray-500 text-right">
                                تم الإرسال إلى {phoneNumber}
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
                        </button>

                        {/* Resend OTP */}
                        <div className="text-center">
                            {countdown > 0 ? (
                                <p className="text-gray-600 text-sm">
                                    إعادة الإرسال بعد {countdown} ثانية
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-primary hover:text-primary/90 text-sm"
                                >
                                    إعادة إرسال الكود
                                </button>
                            )}
                        </div>

                        {/* Back button */}
                        <button
                            type="button"
                            onClick={() => { setStep(1); setOtp(""); setErrorMessage(""); }}
                            className="w-full text-gray-600 hover:text-gray-800 text-sm"
                        >
                            تغيير رقم الهاتف
                        </button>
                    </form>
                )}

                {/* Footer Links */}
                <div className="text-center space-y-2 text-sm pt-4">
                    <div>
                        <span className="text-gray-600">ليس لديك حساب؟ </span>
                        <Link to="/register" className="text-primary hover:text-primary/90 font-medium">
                            قم بإنشاء حساب جديد
                        </Link>
                    </div>
                    <div>
                        <Link to="/contact" className="text-primary hover:text-primary/90">
                            هل تواجه مشكلة في تسجيل الدخول؟
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login