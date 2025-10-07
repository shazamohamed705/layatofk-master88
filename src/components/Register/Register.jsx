import React, { useState } from 'react'
import { BsEye } from 'react-icons/bs'
import { FiEyeOff } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import loginImage from '../../assets/login photo.png'
import { postForm } from '../../api'
function Register() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    })
    // Add UI state: loading and error
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage("")
        setSuccessMessage("")

        // Basic validation: password match
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match')
            return
        }
        if (!formData.agreeToTerms) {
            setErrorMessage('You must agree to terms')
            return
        }

        // Prepare payload matching backend expectations
        const normalizedPhone = formData.phoneNumber.trim()
        
        const formParams = new URLSearchParams()
        formParams.append('name', `${formData.firstName} ${formData.lastName}`.trim())
        formParams.append('email', formData.email.trim())
        formParams.append('password', formData.password)
        formParams.append('phone', normalizedPhone)

        try {
            setIsSubmitting(true)
            // Use fetch with minimal overhead for performance
            const apiBase = process.env.NODE_ENV === 'development' ? '' : 'https://lay6ofk.com'
            const data = await postForm('/api/signup', formParams)
            if (process.env.NODE_ENV === 'development') {
                console.log('Register response data:', data)
            }
            // Expecting structure with status, msg, user, api_token
            if (data && data.status) {
                const token = data.user?.api_token || data.api_token
                if (token) {
                    // Store token securely (localStorage here; consider httpOnly cookie server-side)
                    localStorage.setItem('api_token', token)
                }
                if (data.user) {
                    try { localStorage.setItem('user', JSON.stringify(data.user)) } catch (_) {}
                }
                
                // Dispatch custom event to notify other components of successful registration
                window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                    detail: { user: data.user, token } 
                }))
                
                setSuccessMessage('تم إنشاء الحساب بنجاح! جاري التوجيه لصفحة تسجيل الدخول...')
                // Redirect to login page after short delay
                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            } else {
                let details = ''
                if (data?.errors && typeof data.errors === 'object') {
                    details = Object.values(data.errors).flat().join(' | ')
                }
                throw new Error(data?.msg || data?.message || details || 'Signup failed')
            }
        } catch (err) {
            // Log full error for debugging
            console.error('Register error details:', err)
            // Normalize error message
            const message = (err && err.message ? err.message : 'Network error').slice(0, 300)
            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }


    return (
        <>
            <div className=" w-11/12 mx-auto grid grid-cols-1 md:grid-cols-3 my-8">
                <div className="md:col-span-1">
                    <img src={loginImage} alt="" className='w-full h-full object-cover' />
                </div>
                <div className="md:col-span-2 space-y-6 p-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h1>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            انضم إلى 45sale واستمتع بتجربة تسوق مميزة
                            <br />
                            وابحث عن كل ما تحتاجه بسهولة
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Inline feedback */}
                        {errorMessage && (
                            <div className="text-red-600 text-sm text-right">{errorMessage}</div>
                        )}
                        {successMessage && (
                            <div className="text-green-600 text-sm text-right">{successMessage}</div>
                        )}
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="اسم العائلة"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                required
                            />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="الاسم الأول"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                required
                            />
                        </div>

                        {/* Phone Number Input */}
                        <div className="relative">

                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="xxxxxxxx"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="البريد الإلكتروني"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            required
                        />

                        {/* Password Input */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="كلمة المرور"
                                className="w-full pr-4 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isSubmitting}
                            >
                                {showPassword ? <FiEyeOff size={20} /> : <BsEye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="تأكيد كلمة المرور"
                                className="w-full pr-4 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isSubmitting}
                            >
                                {showConfirmPassword ? <FiEyeOff size={20} /> : <BsEye size={20} />}
                            </button>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start space-x-2 space-x-reverse">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleInputChange}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                required
                                disabled={isSubmitting}
                            />
                            <label className="text-sm text-gray-600 leading-relaxed">
                                أوافق على{" "}
                                <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                                    الشروط والأحكام
                                </Link>{" "}
                                و{" "}
                                <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                                    سياسة الخصوصية
                                </Link>
                            </label>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={!formData.agreeToTerms || isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            {isSubmitting ? 'جارٍ الإنشاء...' : 'إنشاء حساب'}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="text-center text-sm">
                        <span className="text-gray-600">لديك حساب بالفعل؟ </span>
                        <Link to="/login" className="text-blue-600 hover:text-blue-800">
                            تسجيل الدخول
                        </Link>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Register