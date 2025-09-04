import React, { useState } from 'react'
import { BsEye } from 'react-icons/bs'
import { FiEyeOff } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import loginImage from '../../assets/login photo.png'
function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle login logic here
        console.log("Login attempt:", { phoneNumber, password })
    }


    return (
        <>
            <div className=" w-11/12 mx-auto grid grid-cols-1 md:grid-cols-3 my-8">
                <div className="md:col-span-1">
                    <img src={loginImage} alt="" className='w-full h-full object-cover' />
                </div>
                <div className="md:col-span-2 space-y-6  p-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 my-5">تسجيل الدخول</h1>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            مرحباً بك مرة أخرى   . استمر في استخدام ميزاتنا الرائعة والبحث
                            <br />
                            عما تحتاج إليه.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Phone Number Input */}
                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium text-sm">رقم الهاتف</label>
                            <div className="relative">
                                 
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="xxxxxxxx"
                                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="block text-gray-700 font-medium text-sm">كلمة المرور</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        </div>


                        {/* Forgot Password */}
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-primary hover:text-primary/90 text-sm">
                                نسيت كلمة المرور؟
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 my-5 rounded-lg transition-colors"
                        >
                            تسجيل الدخول
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="text-center space-y-2 text-sm">
                        <div>
                            <span className="text-gray-600">ليس لديك حساب؟ </span>
                            <Link to="/register" className="text-primary hover:text-primary/90">
                                قم بإنشاء حساب جديد
                            </Link>
                        </div>
                        <div>
                            <Link to="/login-issues" className="text-primary hover:text-primary/90">
                                هل تواجه مشكلة في تسجيل الدخول؟ قم بإطلاعنا هنا
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Login