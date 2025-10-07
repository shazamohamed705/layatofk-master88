import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { IoIosArrowBack } from 'react-icons/io'
import { FiImage } from 'react-icons/fi'
import { postJson, getJson, postMultipart } from '../../api'

function Verification() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('individuals')
  
  // Form states - using object to reduce state variables
  const [formData, setFormData] = useState({
    // Individuals
    civilId: '',
    civilIdImage: null,
    civilIdImageBase64: '',
    // Companies
    licenseNumber: '',
    commercialRegistration: '',
    authorizedCivilId: '',
    licenseImage: null,
    licenseImageBase64: '',
    fieldCardImage: null,
    fieldCardImageBase64: ''
  })

  // API states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Packages states
  const [packages, setPackages] = useState([])
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState(null)
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('wallet')

  // Get current verification key based on active tab
  const verificationKey = useMemo(() => {
    return activeTab === 'individuals' ? 'user' : 'company'
  }, [activeTab])

  // Fetch packages based on verification type and national ID
  const fetchPackages = useCallback(async (key, nationalId) => {
    try {
      setLoadingPackages(true)
      setError('')
      console.log(`📦 Fetching verification packages for: ${key}, ID: ${nationalId}`)
      
      const response = await getJson(`/api/verifications/packages?key=${key}`)
      console.log('📦 Full Response:', response)
      console.log('📦 Response.data:', response?.data)
      console.log('📦 Response.msg:', response?.msg)
      
      // Check multiple possible response structures
      let packagesData = null
      
      if (response?.status && Array.isArray(response.data)) {
        packagesData = response.data
      } else if (Array.isArray(response?.msg)) {
        // Some APIs return data in msg field
        packagesData = response.msg
      } else if (Array.isArray(response)) {
        packagesData = response
      }
      
      if (packagesData && packagesData.length > 0) {
        setPackages(packagesData)
        console.log(`✅ Loaded ${packagesData.length} packages for ${key}`)
        
        // Auto-select first package if none selected
        if (!selectedPackageId) {
          setSelectedPackageId(packagesData[0].id)
        }
      } else {
        setPackages([])
        console.warn('⚠️ No packages found in response')
      }
    } catch (err) {
      console.error('❌ Error fetching packages:', err)
      setError('فشل في تحميل الباقات')
      setPackages([])
    } finally {
      setLoadingPackages(false)
    }
  }, [selectedPackageId])

  // Don't fetch packages on mount - wait for data completion
  useEffect(() => {
    setSelectedPackageId(null)
    setPackages([])
  }, [verificationKey])

  // Check if all required data is complete and fetch packages
  useEffect(() => {
    const isIndividual = activeTab === 'individuals'
    let isDataComplete = false

    if (isIndividual) {
      // For individuals: need civil ID (16 digits)
      const cleanCivilId = formData.civilId.replace(/\s/g, '')
      isDataComplete = cleanCivilId.length === 16
    } else {
      // For companies: need all 3 fields
      const cleanAuthorizedCivilId = formData.authorizedCivilId.replace(/\s/g, '')
      isDataComplete = 
        formData.licenseNumber.length > 0 &&
        formData.commercialRegistration.length > 0 &&
        cleanAuthorizedCivilId.length === 16
    }

    // Fetch packages when data is complete
    if (isDataComplete && packages.length === 0) {
      console.log('✅ All required data complete, fetching packages...')
      const nationalId = isIndividual 
        ? formData.civilId.replace(/\s/g, '')
        : formData.authorizedCivilId.replace(/\s/g, '')
      fetchPackages(verificationKey, nationalId)
    } else if (!isDataComplete && packages.length > 0) {
      // Clear packages if data becomes incomplete
      console.log('⚠️ Data incomplete, clearing packages')
      setPackages([])
      setSelectedPackageId(null)
    }
  }, [
    activeTab, 
    formData.civilId, 
    formData.licenseNumber, 
    formData.commercialRegistration, 
    formData.authorizedCivilId,
    verificationKey,
    fetchPackages,
    packages.length
  ])

  // Compress and convert image to base64 - optimized for performance
  const convertToBase64 = useCallback((file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve('')
        return
      }

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target.result
        img.onload = () => {
          // Only compress if image is larger than maxWidth
          if (img.width <= maxWidth) {
            resolve(e.target.result)
            return
          }

          const canvas = document.createElement('canvas')
          const ratio = maxWidth / img.width
          canvas.width = maxWidth
          canvas.height = img.height * ratio

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          canvas.toBlob(
            (blob) => {
              const compressedReader = new FileReader()
              compressedReader.readAsDataURL(blob)
              compressedReader.onloadend = () => resolve(compressedReader.result)
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }, [])

  // Optimized image upload handler
  const handleImageUpload = useCallback(async (file, imageKey, base64Key) => {
    if (!file || !file.type.startsWith('image/')) return

    setFormData(prev => ({ ...prev, [imageKey]: file }))
    
    try {
      const base64 = await convertToBase64(file)
      setFormData(prev => ({ ...prev, [base64Key]: base64 }))
    } catch (err) {
      console.error('Error converting image:', err)
      setError('فشل تحويل الصورة')
    }
  }, [convertToBase64])

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Format civil ID number (only digits, grouped by 4)
  const formatCivilId = useCallback((value) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '')
    
    // Limit to 16 digits
    const limited = digitsOnly.slice(0, 16)
    
    // Split into groups of 4: 4-4-4-4
    const groups = []
    for (let i = 0; i < limited.length; i += 4) {
      groups.push(limited.slice(i, i + 4))
    }
    
    return groups.join(' ')
  }, [])

  // Handle civil ID input with formatting
  const handleCivilIdChange = useCallback((e) => {
    const formatted = formatCivilId(e.target.value)
    updateField('civilId', formatted)
  }, [formatCivilId, updateField])

  // Handle company number inputs (digits only)
  const handleNumberInput = useCallback((field, value) => {
    const digitsOnly = value.replace(/\D/g, '')
    updateField(field, digitsOnly)
  }, [updateField])

  const handleSubmit = useCallback(async () => {
    setError('')
    setSuccess('')

    // Validation
    if (!selectedPackageId) {
      setError('يرجى اختيار باقة أولاً')
      return
    }

    try {
      setLoading(true)

      const isIndividual = activeTab === 'individuals'
      const verificationType = isIndividual ? 'user' : 'company'

      // Prepare FormData for multipart request
      const formDataToSend = new FormData()
      
      // Add basic fields
      formDataToSend.append('verification_type', verificationType)
      formDataToSend.append('payment_method', paymentMethod)
      formDataToSend.append('package_id', parseInt(selectedPackageId, 10))
      
      if (isIndividual) {
        const { civilId, civilIdImage } = formData
        
        // Remove spaces and validate
        const cleanCivilId = civilId.replace(/\s/g, '')
        
        if (!cleanCivilId || cleanCivilId.length < 16) {
          setError('يرجى إدخال الرقم المدني كاملاً (16 رقم)')
          setLoading(false)
          return
        }

        // Add input fields
        formDataToSend.append('inputs[0][input_name]', 'national_id')
        formDataToSend.append('inputs[0][input_value]', cleanCivilId)
        
        // Add image file if exists
        if (civilIdImage && civilIdImage instanceof File) {
          formDataToSend.append('inputs[0][image]', civilIdImage)
          console.log('✅ Including image file:', civilIdImage.name)
        } else {
          console.log('⚠️ No image file to upload')
        }
      } else {
        const { 
          licenseNumber, 
          commercialRegistration, 
          authorizedCivilId,
          licenseImage,
          fieldCardImage
        } = formData
        
        // Clean authorized civil ID
        const cleanAuthorizedCivilId = authorizedCivilId.replace(/\s/g, '')
        
        if (!licenseNumber.trim() || !commercialRegistration.trim() || !cleanAuthorizedCivilId) {
          setError('يرجى ملء جميع الحقول المطلوبة')
          setLoading(false)
          return
        }

        if (cleanAuthorizedCivilId.length < 16) {
          setError('يرجى إدخال الرقم المدني كاملاً (16 رقم)')
          setLoading(false)
          return
        }

        // Add input fields for company
        formDataToSend.append('inputs[0][input_name]', 'license_number')
        formDataToSend.append('inputs[0][input_value]', licenseNumber.trim())
        if (licenseImage && licenseImage instanceof File) {
          formDataToSend.append('inputs[0][image]', licenseImage)
        }
        
        formDataToSend.append('inputs[1][input_name]', 'commercial_registration')
        formDataToSend.append('inputs[1][input_value]', commercialRegistration.trim())
        
        formDataToSend.append('inputs[2][input_name]', 'authorized_civil_id')
        formDataToSend.append('inputs[2][input_value]', cleanAuthorizedCivilId)
        if (fieldCardImage && fieldCardImage instanceof File) {
          formDataToSend.append('inputs[2][image]', fieldCardImage)
        }
      }

      console.log('📤 Sending verification request with FormData')

      const response = await postMultipart('/api/verifications', formDataToSend)

      console.log('✅ Verification response:', response)

      if (response?.status) {
        setSuccess(response.msg || 'تم إرسال طلب التوثيق بنجاح')
        setTimeout(() => navigate('/profile'), 2000)
      } else {
        setError(response?.msg || 'فشل في إرسال طلب التوثيق')
      }
    } catch (err) {
      console.error('❌ Verification error:', err)
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب')
    } finally {
      setLoading(false)
    }
  }, [selectedPackageId, paymentMethod, activeTab, formData, navigate])

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Container with max width for large screens */}
      <div className="max-w-2xl mx-auto">
        {/* Header with clean gradient */}
        <div className="relative bg-gradient-to-b from-indigo-800 to-indigo-700 px-6 py-8">
          {/* Simple starry effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-2 right-8 w-1 h-1 bg-white rounded-full opacity-60"></div>
            <div className="absolute top-4 left-16 w-1 h-1 bg-white rounded-full opacity-40"></div>
            <div className="absolute top-6 right-20 w-1 h-1 bg-white rounded-full opacity-50"></div>
            <div className="absolute top-8 left-12 w-1 h-1 bg-white rounded-full opacity-30"></div>
            <div className="absolute top-10 right-12 w-1 h-1 bg-white rounded-full opacity-60"></div>
            <div className="absolute top-12 left-20 w-1 h-1 bg-white rounded-full opacity-40"></div>
          </div>
          
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 text-white text-lg z-10"
          >
            <IoIosArrowBack />
          </button>
          
          {/* Title */}
          <div className="text-center mt-6 relative z-10">
            <h1 className="text-xl font-bold text-white mb-1">
              وثق حسابك الان
            </h1>
            <p className="text-indigo-100 text-xs">
              تأكيد هويتك لضمان أمان حسابك
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white mx-4 mt-2 rounded-t-xl overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('individuals')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors rounded-t-r-xl ${
                activeTab === 'individuals'
                  ? 'bg-indigo-800 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              افراد
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors rounded-t-l-xl ${
                activeTab === 'companies'
                  ? 'bg-indigo-800 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              شركات
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white mx-4 px-6 pb-8 pt-6">
        
        {activeTab === 'individuals' ? (
          // Individuals Form
          <div className="space-y-6">
            {/* Civil ID Field */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3 text-right">
                الرقم المدني
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.civilId}
                  onChange={handleCivilIdChange}
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl text-right placeholder-gray-400 focus:outline-none focus:border-indigo-800 text-gray-700 tracking-wider"
                  style={{ fontSize: '16px' }}
                  maxLength="19"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 bg-indigo-800 rounded-full"></div>
                </div>
              </div>
              {formData.civilId && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {formData.civilId.replace(/\s/g, '').length} / 16 رقم
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3 text-right">
                صورة البطاقة المدنية
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'civilIdImage', 'civilIdImageBase64')}
                  className="hidden"
                  id="civil-id-upload"
                />
                <label htmlFor="civil-id-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <FiImage className="text-3xl text-indigo-800" />
                    </div>
                    <p className="text-gray-700 font-medium text-base">
                      ارفع صور البطاقة الميدنيه
                    </p>
                    {formData.civilIdImage && (
                      <p className="text-sm text-gray-500 mt-2">
                        تم رفع: {formData.civilIdImage.name}
                      </p>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        ) : (
          // Companies Form
          <div className="space-y-6">
            {/* License Number */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3 text-right">
                رقم الترخيص
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.licenseNumber}
                onChange={(e) => handleNumberInput('licenseNumber', e.target.value)}
                placeholder="أدخل رقم الترخيص"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-right placeholder-gray-400 focus:outline-none focus:border-indigo-800 text-gray-700"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Commercial Registration */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3 text-right">
                رقم السجل التجاري
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.commercialRegistration}
                onChange={(e) => handleNumberInput('commercialRegistration', e.target.value)}
                placeholder="أدخل رقم السجل التجاري"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-right placeholder-gray-400 focus:outline-none focus:border-indigo-800 text-gray-700"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Authorized Civil ID */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3 text-right">
                الرقم المدني المفوض بالتوقيع
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.authorizedCivilId}
                onChange={(e) => {
                  const formatted = formatCivilId(e.target.value)
                  updateField('authorizedCivilId', formatted)
                }}
                placeholder="0000 0000 0000 0000"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-right placeholder-gray-400 focus:outline-none focus:border-indigo-800 text-gray-700 tracking-wider"
                style={{ fontSize: '16px' }}
                maxLength="19"
              />
              {formData.authorizedCivilId && (
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {formData.authorizedCivilId.replace(/\s/g, '').length} / 16 رقم
                </p>
              )}
            </div>

            {/* Field Card Image Upload */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3 text-right">
                صورة البطاقة الميدنيه
              </label>
              <button
                onClick={() => document.getElementById('field-card-upload').click()}
                className="w-full px-4 py-4 bg-gray-100 text-gray-600 rounded-xl text-right hover:bg-gray-200 transition-colors font-medium"
                style={{ fontSize: '16px' }}
              >
                ارفع صوره
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0], 'fieldCardImage', 'fieldCardImageBase64')}
                className="hidden"
                id="field-card-upload"
              />
              {formData.fieldCardImage && (
                <p className="text-sm text-gray-500 mt-2 text-right">
                  تم رفع: {formData.fieldCardImage.name}
                </p>
              )}
            </div>

            {/* License Image Upload */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-3 text-right">
                صورة الرخصة
              </label>
              <button
                onClick={() => document.getElementById('license-upload').click()}
                className="w-full px-4 py-4 bg-gray-100 text-gray-600 rounded-xl text-right hover:bg-gray-200 transition-colors font-medium"
                style={{ fontSize: '16px' }}
              >
                ارفع صوره
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0], 'licenseImage', 'licenseImageBase64')}
                className="hidden"
                id="license-upload"
              />
              {formData.licenseImage && (
                <p className="text-sm text-gray-500 mt-2 text-right">
                  تم رفع: {formData.licenseImage.name}
                </p>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Packages Selection - Shows after data completion */}
        <div className="bg-white mx-4 px-6 pt-2 pb-6">
          <h3 className="text-gray-800 font-bold text-base mb-4 text-right flex items-center gap-2">
            <span>💳</span>
            <span>اختر باقة التوثيق والدفع</span>
          </h3>
          
          {loadingPackages ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-800 mb-3"></div>
              <p className="text-gray-600 text-sm font-medium">جاري تحميل الباقات المتاحة...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-10 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border-2 border-dashed border-indigo-200">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-gray-800 font-bold text-base mb-2">
                {activeTab === 'individuals' ? 'أكمل البيانات أعلاه لعرض الباقات' : 'أكمل بيانات الشركة أعلاه'}
              </p>
              <p className="text-gray-600 text-sm mb-3">
                {activeTab === 'individuals' 
                  ? 'أدخل الرقم المدني (16 رقم) لعرض باقات التوثيق والدفع'
                  : 'أدخل كافة البيانات المطلوبة أعلاه'}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-indigo-700 bg-indigo-100 rounded-lg px-4 py-2 w-fit mx-auto">
                <span>💡</span>
                <span>ستظهر الباقات تلقائياً عند اكتمال البيانات</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all bg-white ${
                    selectedPackageId === pkg.id
                      ? 'border-indigo-800 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 text-right">
                      <h4 className="font-bold text-gray-800 text-base mb-1">
                        {pkg.name || pkg.title || `باقة ${pkg.id}`}
                      </h4>
                      {pkg.description && (
                        <p className="text-gray-600 text-xs mb-2">
                          {pkg.description}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-indigo-800 font-bold text-lg">
                          {pkg.price} د.ك
                        </span>
                        {pkg.duration && (
                          <span className="text-gray-500 text-xs">
                            / {pkg.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPackageId === pkg.id
                        ? 'border-indigo-800 bg-indigo-800'
                        : 'border-gray-300'
                    }`}>
                      {selectedPackageId === pkg.id && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Selection - Shows only when package is selected */}
        {selectedPackageId && packages.length > 0 && (
          <div className="bg-white mx-4 px-6 pt-2 pb-6">
            <h3 className="text-gray-800 font-bold text-base mb-4 text-right flex items-center gap-2">
              <span>💰</span>
              <span>اختر طريقة الدفع</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Wallet Payment */}
              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`relative p-4 border-2 rounded-xl transition-all bg-white ${
                  paymentMethod === 'wallet'
                    ? 'border-indigo-800 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    paymentMethod === 'wallet' ? 'bg-indigo-800' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-6 h-6 ${paymentMethod === 'wallet' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className={`font-bold text-sm ${
                    paymentMethod === 'wallet' ? 'text-indigo-800' : 'text-gray-700'
                  }`}>
                    المحفظة
                  </span>
                  <span className="text-xs text-gray-500 mt-1">خصم فوري</span>
                </div>
                {paymentMethod === 'wallet' && (
                  <div className="absolute top-2 left-2">
                    <svg className="w-5 h-5 text-indigo-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Online Payment (Visa/Knet) */}
              <button
                onClick={() => setPaymentMethod('online')}
                className={`relative p-4 border-2 rounded-xl transition-all bg-white ${
                  paymentMethod === 'online'
                    ? 'border-indigo-800 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    paymentMethod === 'online' ? 'bg-indigo-800' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-6 h-6 ${paymentMethod === 'online' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className={`font-bold text-sm ${
                    paymentMethod === 'online' ? 'text-indigo-800' : 'text-gray-700'
                  }`}>
                    فيزا
                  </span>
                  <span className="text-xs text-gray-500 mt-1">دفع آمن</span>
                </div>
                {paymentMethod === 'online' && (
                  <div className="absolute top-2 left-2">
                    <svg className="w-5 h-5 text-indigo-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            </div>

            {/* Payment Method Info */}
            <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-gray-600 text-lg">ℹ️</span>
                <div className="flex-1">
                  <p className="text-gray-800 text-xs font-medium mb-1">
                    {paymentMethod === 'wallet' ? 'الدفع من المحفظة' : 'الدفع الإلكتروني'}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {paymentMethod === 'wallet' 
                      ? 'سيتم خصم المبلغ مباشرة من رصيد محفظتك'
                      : 'سيتم تحويلك إلى بوابة الدفع الآمنة لإتمام العملية'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Section */}
        <div className="bg-white mx-4 px-6 pb-8">
          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-green-600 text-sm font-medium">{success}</p>
          </div>
        )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full mt-8 text-white font-semibold py-4 rounded-xl transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-800 hover:bg-indigo-900'
            }`}
            style={{ fontSize: '16px' }}
          >
            {loading ? 'جاري الإرسال...' : 'وثق الان'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Verification
