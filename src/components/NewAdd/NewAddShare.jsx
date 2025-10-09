import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { MdImage } from 'react-icons/md'
import { useNavigate, useSearchParams } from 'react-router-dom'

function NewAddShare() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Get category info from URL params
  const categoryId = searchParams.get('category_id') || ''
  const categoryName = searchParams.get('category_name') || 'إعلان'
  
  // Helper function to get user-specific localStorage key
  const getUserStorageKey = useCallback((baseKey) => {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsed = JSON.parse(userData)
        const userId = parsed.id
        return `${baseKey}_user_${userId}`
      }
    } catch (e) {
      console.error('Error getting user ID:', e)
    }
    return baseKey // Fallback to base key if no user
  }, [])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    whatsapp: '',
    images: [],
    categoryId: categoryId
  })
  const [previewImages, setPreviewImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [titleError, setTitleError] = useState('')

  // Scroll to top on component mount
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Validate title - exactly 30 characters, no numbers
  const validateTitle = useCallback((value) => {
    if (!value.trim()) {
      return 'يرجى إدخال اسم الإعلان'
    }
    // Check if title contains numbers
    const hasNumbers = /[0-9]/.test(value)
    if (hasNumbers) {
      return 'اسم الإعلان لا يجب أن يحتوي على أرقام'
    }
    // Check if title contains at least one letter (Arabic or English)
    const hasLetters = /[a-zA-Zأ-ي]/.test(value)
    if (!hasLetters) {
      return 'اسم الإعلان يجب أن يحتوي على حروف'
    }
    // Check exactly 30 characters
    const length = value.trim().length
    if (length !== 30) {
      if (length < 30) {
        return `اسم الإعلان يجب أن يكون 30 حرف بالضبط (باقي ${30 - length} حرف)`
      } else {
        return `اسم الإعلان يجب أن يكون 30 حرف بالضبط (زيادة ${length - 30} حرف)`
      }
    }
    return ''
  }, [])

  // Handle input changes - optimized with useCallback
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validate title field
    if (name === 'title') {
      const error = validateTitle(value)
      setTitleError(error)
    }
  }, [validateTitle])

  // Handle image selection - optimized with useCallback
  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Limit to 5 images max
    const maxImages = 5
    const totalImages = previewImages.length + files.length
    
    if (totalImages > maxImages) {
      alert(`يمكنك رفع ${maxImages} صور كحد أقصى`)
      return
    }

    // Create preview URLs
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setPreviewImages(prev => [...prev, ...newPreviews])
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }, [previewImages.length])

  // Remove image - optimized with useCallback
  const removeImage = useCallback((index) => {
    setPreviewImages(prev => {
      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }, [])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )

    if (files.length === 0) return

    // Limit to 5 images max
    const maxImages = 5
    const totalImages = previewImages.length + files.length
    
    if (totalImages > maxImages) {
      alert(`يمكنك رفع ${maxImages} صور كحد أقصى`)
      return
    }

    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setPreviewImages(prev => [...prev, ...newPreviews])
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }, [previewImages.length])

  // Check if form is valid - memoized
  const isFormValid = useMemo(() => {
    const titleValid = formData.title.trim() !== '' && 
                       validateTitle(formData.title) === '' &&
                       formData.title.trim().length === 30
    return titleValid && 
           formData.description.trim() !== '' && 
           formData.price.trim() !== '' &&
           formData.whatsapp.trim() !== '' &&
           formData.images.length > 0
  }, [formData, validateTitle])
  
  // Save form data to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (formData.title || formData.description || formData.images.length > 0) {
      const dataToSave = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        whatsapp: formData.whatsapp,
        images_count: formData.images.length,
        categoryId: formData.categoryId,
        categoryName: categoryName
      }
      const storageKey = getUserStorageKey('new_add_draft')
      localStorage.setItem(storageKey, JSON.stringify(dataToSave))
    }
  }, [formData, categoryName, getUserStorageKey])
  
  // Load saved data on mount (user-specific)
  useEffect(() => {
    const storageKey = getUserStorageKey('new_add_draft')
    const savedDraft = localStorage.getItem(storageKey)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        setFormData(prev => ({
          ...prev,
          title: parsed.title || '',
          description: parsed.description || '',
          price: parsed.price || '',
          whatsapp: parsed.whatsapp || ''
        }))
      } catch (e) {
        console.error('Error loading saved draft:', e)
      }
    }
  }, [getUserStorageKey])

  // Handle form submission - Save data and navigate to next step
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    
    // Validate title before submission
    const titleValidationError = validateTitle(formData.title)
    if (titleValidationError) {
      setTitleError(titleValidationError)
      alert(titleValidationError)
      return
    }
    
    if (!isFormValid) {
      alert('يرجى ملء جميع الحقول ورفع صورة واحدة على الأقل')
      return
    }

    try {
      // Save complete data for final step (user-specific)
      const completeData = {
        name: formData.title,
        description: formData.description,
        price: formData.price,
        whatsapp: formData.whatsapp,
        cat_id: categoryId,
        category_name: categoryName,
        images_count: formData.images.length,
        timestamp: new Date().toISOString()
      }
      
      const storageKey = getUserStorageKey('new_add_complete')
      localStorage.setItem(storageKey, JSON.stringify(completeData))
      console.log('✅ Data saved (user-specific):', completeData)
      
      // Navigate to final step with all required data
      navigate('/new-add-cer', { 
        state: { 
          formData: formData,
          selectedCategory: {
            id: categoryId,
            name: categoryName
          },
          previewImages: previewImages
        } 
      })
      
    } catch (error) {
      console.error('❌ Error saving data:', error)
      alert('حدث خطأ أثناء حفظ البيانات')
    }
  }, [formData, isFormValid, validateTitle, categoryId, categoryName, previewImages, navigate])

  // Cleanup preview URLs on unmount
  React.useEffect(() => {
    return () => {
      previewImages.forEach(img => URL.revokeObjectURL(img.preview))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6">
      {/* Page Title with Back Button */}
      <div className="container mx-auto px-4 max-w-2xl mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="رجوع"
          >
            <IoIosArrowForward className="text-2xl text-gray-700" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{categoryName}</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ad Title Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <label className="block text-right">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-900 text-sm font-semibold">اسم الاعلان (30 حرف بالضبط)</span>
                <span className={`text-xs font-bold ${
                  formData.title.trim().length === 30 ? 'text-green-600' : 
                  formData.title.trim().length > 30 ? 'text-red-500' : 
                  'text-orange-500'
                }`}>
                  {formData.title.trim().length}/30
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={`${categoryName} للبيع (30 حرف بالضبط)`}
                maxLength={30}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-right text-gray-900 ${
                  titleError && formData.title ? 'border-red-500' : 'border-gray-200'
                }`}
                style={{ 
                  '--tw-ring-color': titleError && formData.title ? '#EF444433' : '#0F005B33',
                  borderColor: titleError && formData.title ? '#EF4444' : (formData.title ? '#0F005B' : '')
                }}
                onFocus={(e) => {
                  if (titleError && formData.title) {
                    e.target.style.borderColor = '#EF4444'
                  } else {
                    e.target.style.borderColor = '#0F005B'
                  }
                }}
                onBlur={(e) => {
                  if (titleError && formData.title) {
                    e.target.style.borderColor = '#EF4444'
                  } else {
                    e.target.style.borderColor = formData.title ? '#0F005B' : '#E5E7EB'
                  }
                }}
                required
              />
              {/* Show error or warning */}
              {titleError && formData.title && (
                <p className="text-red-500 text-xs mt-2 text-right font-semibold">
                  ⚠️ {titleError}
                </p>
              )}
              
              {/* Show success if exactly 30 */}
              {formData.title && formData.title.trim().length === 30 && !titleError && (
                <p className="text-green-600 text-xs mt-2 text-right font-semibold">
                  ✅ تم إدخال العدد المطلوب من الأحرف (30 حرف بالضبط)
                </p>
              )}
            </label>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <label className="block text-right">
              <span className="text-gray-900 text-sm mb-2 block font-semibold">الوصف</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="اكتب الوصف"
                rows="6"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none text-right text-gray-900"
                style={{ 
                  '--tw-ring-color': '#0F005B33',
                  borderColor: formData.description ? '#0F005B' : ''
                }}
                onFocus={(e) => e.target.style.borderColor = '#0F005B'}
                onBlur={(e) => e.target.style.borderColor = formData.description ? '#0F005B' : '#E5E7EB'}
                required
              />
            </label>
          </div>

          {/* Price Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <label className="block text-right">
              <span className="text-gray-900 text-sm mb-2 block font-semibold">السعر (د.ك)</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="أدخل السعر"
                min="0"
                step="0.001"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-right text-gray-900"
                style={{ 
                  '--tw-ring-color': '#0F005B33',
                  borderColor: formData.price ? '#0F005B' : ''
                }}
                onFocus={(e) => e.target.style.borderColor = '#0F005B'}
                onBlur={(e) => e.target.style.borderColor = formData.price ? '#0F005B' : '#E5E7EB'}
                required
              />
            </label>
          </div>

          {/* WhatsApp Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <label className="block text-right">
              <span className="text-gray-900 text-sm mb-2 block font-semibold">رقم الواتساب</span>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="مثال: +96512345678"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-right text-gray-900"
                style={{ 
                  '--tw-ring-color': '#0F005B33',
                  borderColor: formData.whatsapp ? '#0F005B' : ''
                }}
                onFocus={(e) => e.target.style.borderColor = '#0F005B'}
                onBlur={(e) => e.target.style.borderColor = formData.whatsapp ? '#0F005B' : '#E5E7EB'}
                required
              />
            </label>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-gray-900 text-sm text-right font-semibold">الصور</h3>
            
            {/* Upload Area */}
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer hover:bg-gray-50 ${
                isDragging ? 'bg-purple-50' : ''
              }`}
              style={{ 
                borderColor: isDragging ? '#0F005B' : '#D1D5DB',
                ':hover': { borderColor: '#0F005B80' }
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0F005B80'}
              onMouseLeave={(e) => {
                if (!isDragging) e.currentTarget.style.borderColor = '#D1D5DB'
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0F005B' }}>
                    <MdImage className="text-3xl text-white" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">ارفع صور</p>
                  <p className="text-sm text-gray-700">اسحب الصور هنا أو اضغط للاختيار</p>
                  <p className="text-xs text-gray-600">الحد الأقصى: 5 صور</p>
                </div>
              </label>
            </div>

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {previewImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 transition-all"
                    style={{ ':hover': { borderColor: '#0F005B' }}}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0F005B'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                  >
                    <img
                      src={img.preview}
                      alt={`معاينة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                      aria-label="حذف الصورة"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
              isFormValid
                ? 'text-white hover:scale-[1.02] shadow-lg hover:shadow-2xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={{ 
              backgroundColor: isFormValid ? '#0F005B' : '#D1D5DB'
            }}
            onMouseEnter={(e) => {
              if (isFormValid) {
                e.currentTarget.style.backgroundColor = '#0A0040'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 0, 91, 0.3), 0 10px 10px -5px rgba(15, 0, 91, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid) {
                e.currentTarget.style.backgroundColor = '#0F005B'
                e.currentTarget.style.boxShadow = ''
              }
            }}
          >
            التالي
          </button>

          {/* Info Text */}
          <p className="text-center text-sm text-gray-700">
            انتقل للخطوة التالية لإكمال نشر الإعلان
          </p>
        </form>
      </main>
    </div>
  )
}

export default NewAddShare

