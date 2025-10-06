import React, { useState, useEffect } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { useNavigate, useLocation } from 'react-router-dom'
import { postForm, getJson } from '../../api'

function ModelsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get saved data from localStorage
  const [basicData, setBasicData] = useState(null)
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [categoryComponents, setCategoryComponents] = useState([])
  const [carTypes, setCarTypes] = useState([]) // Types based on selected brand
  const [helper, setHelper] = useState(null) // Helper object from API response
  const [loadingCarTypes, setLoadingCarTypes] = useState(false) // Track car types loading
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    brand_id: '',
    model_id: ''
  })

  // Load basic data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('pending_ad_data')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setBasicData(parsed)
      
      // Check if there are images from previous step
      const imagesCount = sessionStorage.getItem('pending_images_count')
      if (imagesCount) {
        console.log(`ℹ️ ${imagesCount} صور محفوظة من الخطوة السابقة`)
      }
      
      // Fetch brands and category components for this category
      fetchBrands(parsed.cat_id)
      fetchCategoryComponents(parsed.cat_id)
    } else {
      // No basic data, redirect back
      navigate('/share-ad')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // Fetch brands
  const fetchBrands = async (catId) => {
    try {
      setLoading(true)
      const response = await postForm('/api/getBrands', { cat_id: catId })
      if (response?.status && Array.isArray(response.data)) {
        setBrands(response.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  // Fetch category items with their components (dynamic fields structure)
  const fetchCategoryComponents = async (catId) => {
    try {
      const response = await postForm('/api/category_items', { cat_id: catId })
      console.log('📦 Category items response:', response)
      
      if (response?.status && response?.data?.data && Array.isArray(response.data.data)) {
        const normalized = response.data.data.map(item => ({
          ...item,
          can_skip: item.can_skip === true || item.can_skip === 1 || item.can_skip === '1' ? true : false
        }))
        setCategoryComponents(normalized)
        console.log('✅ Category items loaded:', normalized.length)
        console.log('📋 Items with can_skip status:', normalized.map(i => ({ 
          id: i.id, 
          name: i.name_ar, 
          can_skip: i.can_skip 
        })))
        
        // Save helper object if exists
        if (response?.data?.helper) {
          setHelper(response.data.helper)
          console.log('✅ Helper config:', response.data.helper)
        }
      }
    } catch (error) {
      console.error('Error fetching category items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch models when brand is selected
  const fetchModels = async (brandId) => {
    try {
      const response = await postForm('/api/getModels', { brand_id: brandId })
      if (response?.status && Array.isArray(response.data)) {
        setModels(response.data)
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

  // Fetch car types based on selected brand component
  const fetchCarTypes = async (brandComponentId) => {
    if (!brandComponentId) {
      setCarTypes([])
      setLoadingCarTypes(false)
      return
    }
    try {
      setLoadingCarTypes(true)
      console.log('🚗 Fetching types for brand component:', brandComponentId)
      const response = await getJson(`/api/types/${brandComponentId}`)
      console.log('📦 Types response:', response)
      if (response?.status && Array.isArray(response.data)) {
        setCarTypes(response.data)
        console.log('✅ Loaded', response.data.length, 'types')
      } else {
        setCarTypes([])
      }
    } catch (error) {
      console.error('Error fetching car types:', error)
      setCarTypes([])
    } finally {
      setLoadingCarTypes(false)
    }
  }

  // Handle brand change
  const handleBrandChange = (e) => {
    const selectedBrandComponentId = e.target.value
    setFormData(prev => ({ ...prev, brand_id: selectedBrandComponentId, model_id: '' }))
    
    if (selectedBrandComponentId) {
      fetchModels(selectedBrandComponentId)
      
      // If there's a helper config for car types, fetch them
      if (helper?.cars === true) {
        fetchCarTypes(selectedBrandComponentId)
      }
    } else {
      setModels([])
      setCarTypes([])
    }
  }


  // Handle form submission - Save data for next step
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields (can_skip === false)
    const requiredFields = categoryComponents.filter(item => !item.can_skip)
    const missingFields = []
    
    for (const field of requiredFields) {
      if (!dynamicFields[field.id] || 
          (Array.isArray(dynamicFields[field.id]) && dynamicFields[field.id].length === 0)) {
        missingFields.push(field.name_ar)
      }
    }
    
    if (missingFields.length > 0) {
      alert(`يرجى ملء الحقول المطلوبة:\n${missingFields.join('\n')}`)
      return
    }

    try {
      // Prepare all collected data
      const completeData = {
        ...basicData,
        dynamicFields: dynamicFields,
        timestamp: new Date().toISOString()
      }
      
      // Save to localStorage for next step
      localStorage.setItem('pending_ad_complete', JSON.stringify(completeData))
      
      console.log('✅ Data saved for next step:', completeData)
      
      // Navigate to final step
      navigate('/share-car-final', { 
        state: { 
          completeData: completeData, 
          images: location.state?.adData?.images 
        } 
      })
      
    } catch (error) {
      console.error('Error:', error)
      alert('❌ حدث خطأ: ' + error.message)
    }
  }

  // Selected values for dynamic fields
  const [dynamicFields, setDynamicFields] = useState({})

  // Check if ALL fields are filled
  const areAllFieldsFilled = React.useMemo(() => {
    console.log('📋 Checking all fields...')
    console.log('dynamicFields', dynamicFields)
    console.log('categoryComponents', categoryComponents)
    console.log('loadingCarTypes', loadingCarTypes)
    
    // If car types are loading, disable button
    if (loadingCarTypes) {
      console.log('⏳ Car types loading, button disabled')
      return false
    }
    
    // Get visible fields (exclude car type field if it's hidden)
    const visibleFields = categoryComponents.filter(item => {
      // Check if this is the car type field (ID: 57)
      if (item.id === 57 && helper?.input_id === 57) {
        const brandField = categoryComponents.find(f => f.id === 56) // Assuming brand is ID 56
        const brandSelected = dynamicFields[brandField?.id]
        const typesAvailable = carTypes && carTypes.length > 0
        const shouldShow = brandSelected && typesAvailable
        
        console.log(`🚗 Car type field check: brandSelected=${!!brandSelected}, typesAvailable=${typesAvailable}, shouldShow=${shouldShow}`)
        return shouldShow // Only include if should be visible
      }
      return true // Include all other fields
    })
    
    console.log(`✅ Visible fields count: ${visibleFields.length}`)
    
    // Check each visible field
    for (const field of visibleFields) {
      const value = dynamicFields[field.id]
      
      // For checkbox fields (arrays), check if at least one is selected
      if (field.check_box === 1) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          console.log(`❌ Missing checkbox field: ${field.name_ar} (ID: ${field.id})`)
          return false
        }
      } else {
        // For regular fields, check if value exists
        if (!value || value === '') {
          console.log(`❌ Missing field: ${field.name_ar} (ID: ${field.id})`)
          return false
        }
      }
      
      console.log(`✅ Field filled: ${field.name_ar} (ID: ${field.id})`, value)
    }
    
    console.log('✅✅✅ All fields filled, button enabled')
    return true
  }, [dynamicFields, categoryComponents, helper, carTypes, loadingCarTypes])

  // Handle dropdown/input change
  const handleDynamicFieldChange = (itemId, value) => {
    setDynamicFields(prev => ({
      ...prev,
      [itemId]: value
    }))
  }

  // Handle checkbox toggle
  const handleCheckboxToggle = (itemId, componentId) => {
    setDynamicFields(prev => {
      const current = prev[itemId] || []
      if (Array.isArray(current)) {
        // It's already an array (checkboxes)
        if (current.includes(componentId)) {
          return { ...prev, [itemId]: current.filter(id => id !== componentId) }
        } else {
          return { ...prev, [itemId]: [...current, componentId] }
        }
      } else {
        // Convert to array
        return { ...prev, [itemId]: [componentId] }
      }
    })
  }

  // Initialize checkbox arrays for checkbox items
  const initializeCheckboxField = (itemId) => {
    if (!dynamicFields[itemId]) {
      setDynamicFields(prev => ({
        ...prev,
        [itemId]: []
      }))
    }
  }

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {basicData?.category_name || 'تفاصيل السيارة'}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-2xl">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Dynamic Category Items */}
            {categoryComponents.map(item => {
              const isCheckbox = item.check_box === 1
              const isDropdown = item.type === 1
              const isInputField = item.type === 3 || (item.type === 2 && !item.components?.length)
              const isBrandField = item.name_en?.toLowerCase().includes('brand') || item.name_ar?.includes('ماركة')
              
              // Check if this item is the helper field (car types field)
              const isCarHelperField = helper?.cars === true && item.id === helper?.input_id
              
              // Skip car helper field if brand is not selected or no types available
              if (isCarHelperField) {
                // Find the brand field ID (item before the helper field or search by name)
                const brandField = categoryComponents.find(f => 
                  f.name_en?.toLowerCase().includes('brand') || f.name_ar?.includes('ماركة')
                )
                const brandFieldId = brandField?.id
                
                console.log(`🔍 Car helper field "${item.name_ar}" (ID: ${item.id})`, {
                  brand_field_id: brandFieldId,
                  brand_selected: dynamicFields[brandFieldId],
                  types_count: carTypes.length,
                  will_show: !!(dynamicFields[brandFieldId] && carTypes.length > 0)
                })
                
                // Hide if brand not selected or no types loaded
                if (!dynamicFields[brandFieldId] || carTypes.length === 0) {
                  return null
                }
              }
              
              // Initialize checkbox field
              if (isCheckbox && !dynamicFields[item.id]) {
                initializeCheckboxField(item.id)
              }

              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6">
                  <label className="block text-right">
                    <span className="text-gray-900 text-sm mb-2 block font-semibold">
                      {item.name_ar}
                      {!item.can_skip && <span className="text-red-500 mr-1">*</span>}
                    </span>
                    
                    {/* Render as dropdown */}
                    {isDropdown && (
                      <div className="relative">
                        {item.icon && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                            <img 
                              src={item.icon} 
                              alt="" 
                              className="w-6 h-6 opacity-70"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                        <select
                          value={dynamicFields[item.id] || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            handleDynamicFieldChange(item.id, value)
                            
                            // If this is brand field, fetch types and models
                            if (isBrandField && value) {
                              fetchCarTypes(value)
                              fetchModels(value)
                            }
                          }}
                          required={!item.can_skip}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-right text-gray-900"
                          style={{ 
                            borderColor: dynamicFields[item.id] ? '#0F005B' : '#E5E7EB',
                            paddingRight: item.icon ? '3rem' : '1rem',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'left 0.5rem center',
                            backgroundSize: '1.5em 1.5em',
                            paddingLeft: '2.5rem'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#0F005B'}
                          onBlur={(e) => e.target.style.borderColor = dynamicFields[item.id] ? '#0F005B' : '#E5E7EB'}
                        >
                          <option value="">اختر {item.name_ar}</option>
                          {/* Use carTypes if this is car helper field, otherwise use item.components */}
                          {isCarHelperField && carTypes.length > 0 ? (
                            carTypes.map(type => (
                              <option key={type.id} value={type.id}>
                                {type.name_ar}
                              </option>
                            ))
                          ) : (
                            item.components && item.components.map(component => (
                              <option key={component.id} value={component.id}>
                                {component.name_ar}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    )}
                    
                    {/* Render as input field (type 3 or empty components) */}
                    {isInputField && (
                      <div className="relative">
                        {item.icon && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <img 
                              src={item.icon} 
                              alt="" 
                              className="w-6 h-6 opacity-70"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                        <input
                          type="text"
                          inputMode={item.name_ar?.includes('كيلومتر') || item.name_en?.toLowerCase().includes('mileage') || item.name_en?.toLowerCase().includes('kilometer') ? 'numeric' : 'text'}
                          value={dynamicFields[item.id] || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            // Check if this field should only accept numbers
                            const isNumberField = item.name_ar?.includes('كيلومتر') || 
                                                  item.name_en?.toLowerCase().includes('mileage') || 
                                                  item.name_en?.toLowerCase().includes('kilometer')
                            
                            if (isNumberField) {
                              // Allow only numbers (no letters or symbols)
                              if (value === '' || /^\d+$/.test(value)) {
                                handleDynamicFieldChange(item.id, value)
                              }
                            } else {
                              handleDynamicFieldChange(item.id, value)
                            }
                          }}
                          required={!item.can_skip}
                          placeholder={item.name_ar}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-right text-gray-900"
                          style={{ 
                            borderColor: dynamicFields[item.id] ? '#0F005B' : '#E5E7EB',
                            paddingRight: item.icon ? '3rem' : '1rem'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#0F005B'}
                          onBlur={(e) => e.target.style.borderColor = dynamicFields[item.id] ? '#0F005B' : '#E5E7EB'}
                        />
                      </div>
                    )}
                    
                    {/* Render as checkboxes */}
                    {isCheckbox && item.components && item.components.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {item.components.map(component => {
                          const selected = (dynamicFields[item.id] || []).includes(component.id)
                          return (
                            <label
                              key={component.id}
                              className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl transition-all"
                              style={{
                                borderColor: selected ? '#0F005B' : '#E5E7EB',
                                backgroundColor: selected ? '#F3F0FF' : 'white'
                              }}
                              onMouseEnter={(e) => {
                                if (!selected) e.currentTarget.style.borderColor = '#0F005B80'
                              }}
                              onMouseLeave={(e) => {
                                if (!selected) e.currentTarget.style.borderColor = '#E5E7EB'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => handleCheckboxToggle(item.id, component.id)}
                                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#0F005B' }}
                              />
                              <span className="text-gray-800 text-sm flex-1 text-right">
                                {component.name_ar}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </label>
                </div>
              )
            })}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!areAllFieldsFilled}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform flex items-center justify-center gap-2 ${
                areAllFieldsFilled
                  ? 'text-white hover:scale-[1.02] shadow-lg hover:shadow-2xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={{ 
                backgroundColor: areAllFieldsFilled ? '#0F005B' : '#D1D5DB'
              }}
              onMouseEnter={(e) => {
                if (areAllFieldsFilled) {
                  e.currentTarget.style.backgroundColor = '#0A0040'
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 0, 91, 0.3), 0 10px 10px -5px rgba(15, 0, 91, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                if (areAllFieldsFilled) {
                  e.currentTarget.style.backgroundColor = '#0F005B'
                  e.currentTarget.style.boxShadow = ''
                }
              }}
            >
              <span>التالي</span>
            </button>

            <p className="text-center text-sm text-gray-700">
            </p>
          </form>
        )}
      </main>
    </div>
  )
}

export default ModelsPage
