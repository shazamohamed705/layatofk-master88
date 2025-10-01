import React, { useState, useCallback, useMemo } from 'react'
import {  BiEnvelope, BiMap, BiTime, BiPhone } from 'react-icons/bi'
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'
import { useAppSettings } from '../../contexts/AppSettingsContext'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  
  // Use app settings from context (shared across the app)
  const { appSettings, loading, error } = useAppSettings()

  // Optimized change handler using useCallback
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  // Optimized submit handler using useCallback
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
  }, [formData])

  // Memoized contact info based on API data
  const contactInfo = useMemo(() => {
    const defaultInfo = [
      {
        icon: <BiPhone className="text-2xl" />,
        title: "اتصل بنا",
        details: ["22209724"],
        color: "bg-blue-500"
      },
      {
        icon: <BiEnvelope className="text-2xl" />,
        title: "راسلنا عبر البريد الإلكتروني",
        details: ["e2.a@hotmail.com"],
        color: "bg-green-500"
      },
      {
        icon: <BiMap className="text-2xl" />,
        title: "موقعنا",
        details: ["دولة الكويت"],
        color: "bg-purple-500"
      },
      {
        icon: <BiTime className="text-2xl" />,
        title: "ساعات العمل",
        details: ["الأحد - الخميس: 8:00 ص - 6:00 م", "الجمعة - السبت: 9:00 ص - 4:00 م"],
        color: "bg-orange-500"
      }
    ]

    if (!appSettings?.callus) return defaultInfo

    const { phone, email } = appSettings.callus
    
    return [
      phone && {
        icon: <BiPhone className="text-2xl" />,
        title: "اتصل بنا",
        details: [phone],
        color: "bg-blue-500"
      },
      email && {
        icon: <BiEnvelope className="text-2xl" />,
        title: "راسلنا عبر البريد الإلكتروني",
        details: [email],
        color: "bg-green-500"
      },
      {
        icon: <BiMap className="text-2xl" />,
        title: "موقعنا",
        details: ["دولة الكويت"],
        color: "bg-purple-500"
      },
      {
        icon: <BiTime className="text-2xl" />,
        title: "ساعات العمل",
        details: ["الأحد - الخميس: 8:00 ص - 6:00 م", "الجمعة - السبت: 9:00 ص - 4:00 م"],
        color: "bg-orange-500"
      }
    ].filter(Boolean)
  }, [appSettings])

  // Memoized social links based on API data
  const socialLinks = useMemo(() => {
    const defaultLinks = [
      { icon: <FaWhatsapp />, href: "#", color: "bg-green-500 hover:bg-green-600", label: "واتساب" },
      { icon: <FaFacebook />, href: "#", color: "bg-blue-600 hover:bg-blue-700", label: "فيسبوك" },
      { icon: <FaTwitter />, href: "#", color: "bg-blue-400 hover:bg-blue-500", label: "تويتر" },
      { icon: <FaInstagram />, href: "#", color: "bg-pink-500 hover:bg-pink-600", label: "انستغرام" }
    ]

    if (!appSettings?.callus) return defaultLinks

    const { whatsapp, faceBook, twitter, instgram, youtube } = appSettings.callus

    return [
      whatsapp && {
        icon: <FaWhatsapp />,
        href: `https://wa.me/${whatsapp}`,
        color: "bg-green-500 hover:bg-green-600",
        label: "واتساب"
      },
      faceBook && {
        icon: <FaFacebook />,
        href: faceBook,
        color: "bg-blue-600 hover:bg-blue-700",
        label: "فيسبوك"
      },
      twitter && {
        icon: <FaTwitter />,
        href: twitter,
        color: "bg-blue-400 hover:bg-blue-500",
        label: "تويتر"
      },
      instgram && {
        icon: <FaInstagram />,
        href: instgram,
        color: "bg-pink-500 hover:bg-pink-600",
        label: "انستغرام"
      },
      youtube && {
        icon: <FaYoutube />,
        href: youtube,
        color: "bg-red-500 hover:bg-red-600",
        label: "يوتيوب"
      }
    ].filter(Boolean)
  }, [appSettings])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">تواصل معنا</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            نحن هنا لمساعدتك! لا تتردد في التواصل معنا لأي استفسار أو مساعدة تحتاجها
          </p>
          {error && (
            <div className="mt-4 bg-yellow-100 border-r-4 border-yellow-500 text-yellow-700 p-4 rounded max-w-2xl mx-auto" role="alert">
              <p className="text-sm">تم استخدام البيانات الافتراضية بسبب: {error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">أرسل لنا رسالة</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div>
              </div>

              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  الرسالة *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 resize-none"
                  placeholder="اكتب رسالتك هنا..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-bold hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <BiEnvelope />
                إرسال الرسالة
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Image */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src="https://img.freepik.com/free-vector/flat-design-illustration-customer-support_23-2148887720.jpg?w=800&t=st=1703123456~exp=1703124056~hmac=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                alt="Customer Support"
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className={`${info.color} text-white p-3 rounded-lg`}>
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 text-sm mb-1">{detail}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media Links */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">تابعنا على وسائل التواصل الاجتماعي</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`${social.color} text-white p-3 rounded-lg transition-all duration-300 hover:scale-110 transform`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-6">موقعنا على الخريطة</h2>
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BiMap className="text-6xl mx-auto mb-4" />
                <p className="text-lg">خريطة تفاعلية ستظهر هنا</p>
                <p className="text-sm">يمكن إضافة خريطة Google Maps أو أي خدمة خرائط أخرى</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact