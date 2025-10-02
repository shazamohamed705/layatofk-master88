import React, { useMemo } from 'react'
import { BiShield, BiPhone, BiEnvelope, BiLock, BiUser } from 'react-icons/bi'
import { FaWhatsapp } from 'react-icons/fa'
import { useAppSettings } from '../../contexts/AppSettingsContext'

function Privacy() {
  const { privacyPolicy, contactInfo, loading, error } = useAppSettings()

  // Process privacy policy text - must be called before any conditional returns
  const policyContent = useMemo(() => {
    if (!privacyPolicy || privacyPolicy.length === 0) return { title: '', content: [] }
    
    // Filter out empty lines
    const filtered = privacyPolicy.filter(line => line && line.trim() !== '')
    
    // First line is the main title
    const title = filtered[0] || ''
    // Rest is content
    const content = filtered.slice(1)
    
    return { title, content }
  }, [privacyPolicy])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !privacyPolicy) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-10 flex items-center justify-center">
        <div className="text-center bg-gray-50 rounded-lg shadow-lg p-8 max-w-md">
          <BiShield className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ في التحميل</h2>
          <p className="text-gray-600">{error || 'حدث خطأ في تحميل البيانات'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header - Dynamic from API */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BiShield className="text-5xl text-primary ml-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              {policyContent.title}
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            نحن نلتزم بحماية خصوصيتك وضمان أمان بياناتك الشخصية. يرجى قراءة الشروط والأحكام بعناية.
          </p>
        </div>

        {/* Privacy Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow border-t-4 border-blue-500">
            <div className="text-blue-500 mb-4 flex justify-center">
              <BiShield className="text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">حماية البيانات</h3>
            <p className="text-gray-600 leading-relaxed">
              نحن نلتزم بحماية خصوصية بياناتك الشخصية وضمان أمانها بأعلى المعايير.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow border-t-4 border-green-500">
            <div className="text-green-500 mb-4 flex justify-center">
              <BiLock className="text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">تشفير البيانات</h3>
            <p className="text-gray-600 leading-relaxed">
              جميع البيانات مشفرة باستخدام أحدث تقنيات الأمان لضمان سلامة معلوماتك.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow border-t-4 border-purple-500">
            <div className="text-purple-500 mb-4 flex justify-center">
              <BiUser className="text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">الخصوصية الشخصية</h3>
            <p className="text-gray-600 leading-relaxed">
              نحترم خصوصيتك ولن نشارك معلوماتك مع أي طرف ثالث دون موافقتك.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Privacy Policy Content - All from API */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <div className="prose prose-lg max-w-none" dir="rtl">
                {policyContent.content.map((paragraph, index) => {
                  // Skip very short lines
                  if (paragraph.trim().length < 3) {
                    return null
                  }

                  // Check if it's a heading (contains numbers like "1-" or ends with ":-")
                  const isHeading = /^\d+[-\.)]/.test(paragraph) || paragraph.endsWith(':-')
                  
                  // Check if it's a bullet point
                  const isBullet = paragraph.startsWith('\t') || paragraph.startsWith('- ')

                  return (
                    <div key={index} className="mb-4">
                      {isHeading ? (
                        <h3 className="text-lg md:text-xl font-bold text-primary mb-3 mt-6 border-r-4 border-primary pr-4">
                          {paragraph}
                        </h3>
                      ) : isBullet ? (
                        <div className="flex items-start gap-3 mr-6 mb-2">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                            {paragraph.replace(/^[\t\-]\s*/, '')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed text-justify text-sm md:text-base">
                          {paragraph}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Contact Info from API */}
          <div className="space-y-6">
            {/* Contact Information - All from API */}
            {contactInfo && (
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow sticky top-24 border-t-4 border-primary">
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <BiPhone className="text-2xl" />
                  تواصل معنا
                </h3>
                <div className="space-y-4">
                  {contactInfo.phone && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <BiPhone className="text-primary text-xl flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">الهاتف</p>
                        <a 
                          href={`tel:${contactInfo.phone}`} 
                          className="text-gray-700 hover:text-primary transition-colors font-medium"
                        >
                          {contactInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contactInfo.whatsapp && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                      <FaWhatsapp className="text-green-600 text-xl flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">واتساب</p>
                        <a 
                          href={`https://wa.me/${contactInfo.whatsapp}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                        >
                          {contactInfo.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contactInfo.email && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <BiEnvelope className="text-primary text-xl flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                        <a 
                          href={`mailto:${contactInfo.email}`}
                          className="text-gray-700 hover:text-primary transition-colors font-medium break-all text-sm"
                        >
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Important Note */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                <BiShield className="text-xl" />
                ملاحظة مهمة
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. نوصي بمراجعة هذه السياسة بانتظام للبقاء على اطلاع بأحدث الممارسات.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright Footer - Dynamic from last line of API */}
        {policyContent.content.length > 0 && (
          <div className="mt-16">
            <div className="border-t-2 border-gray-300 pt-8">
              <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-xl p-6 shadow-lg text-center">
                <p className="text-gray-800 font-bold text-lg">
                  {policyContent.content[policyContent.content.length - 1]}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Privacy