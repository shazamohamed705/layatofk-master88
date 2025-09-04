import React, { useState } from 'react'
import { BsEye } from 'react-icons/bs'
import { FiEyeOff } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import loginImage from '../../assets/login photo.png'
function Register() {
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

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle registration logic here
        console.log("Registration attempt:", formData)
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
                            />
                            <label className="text-sm text-gray-600 leading-relaxed">
                                أوافق على{" "}
                                <Link to="/terms" className="text-blue-600 hover:text-blue-800">
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
                            disabled={!formData.agreeToTerms}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            إنشاء حساب
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