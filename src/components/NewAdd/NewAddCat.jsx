import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowBack } from "react-icons/io"
import { getJson } from '../../api'

function NewAddCat() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch categories from API using GET method (same as ShareAdds)
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const endpoint = `/api/adv_home?country_id=1`
      const response = await getJson(endpoint)
      
      if (response?.status && response?.data?.catgories && Array.isArray(response.data.catgories)) {
        setCategories(response.data.catgories)
      } else {
        setError('فشل في جلب الفئات')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Sort categories dynamically (same as ShareAdds)
  const sortedCategories = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return []
    
    return [...categories].sort((a, b) => {
      const aAdds = Number(a?.adds) || 0
      const bAdds = Number(b?.adds) || 0
      
      // Sort by ads count if both have values
      if (aAdds > 0 || bAdds > 0) {
        return bAdds - aAdds
      }
      
      // Otherwise sort by name
      const aName = String(a?.name || '')
      const bName = String(b?.name || '')
      return aName.localeCompare(bName, 'ar')
    })
  }, [categories])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content */}
      <div className="container mx-auto px-3 py-6">
        {/* Section Title */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="text-center mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1.5">
              اختيار الفئة
            </h2>
            <div className="w-16 h-0.5 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary mx-auto mb-3"></div>
                <p className="text-gray-600 text-base">جاري تحميل الفئات...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
                <div className="text-red-600 text-3xl mb-3">⚠️</div>
                <p className="text-red-700 mb-4 text-sm">{error}</p>
                <button 
                  onClick={fetchCategories}
                  className="bg-primary text-white px-6 py-2 text-sm rounded-lg hover:bg-primary/90 transition-all font-bold shadow-md hover:shadow-lg"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          ) : sortedCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-3">📂</div>
              <p className="text-gray-500 text-base">لا توجد فئات متاحة حالياً</p>
            </div>
           ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedCategories.map((category) => {
                const hasImage = category.img && category.img.trim() !== ''
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      // Navigate to next step with category data
                      navigate(`/new-add-share?category_id=${category.id}&category_name=${encodeURIComponent(category.name)}`)
                    }}
                    className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/30 text-right"
                  >
                    {/* Card Content */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      {/* Category Image (if available) */}
                      {hasImage && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                          <img 
                            src={category.img} 
                            alt={category.name || ''}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}

                      {/* Category Info */}
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">
                          {category.name || 'غير محدد'}
                        </h3>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary transition-all duration-300 flex-shrink-0">
                        <IoIosArrowBack className="text-gray-600 group-hover:text-white transition-colors duration-300" size={16} />
                      </div>
                    </div>

                    {/* Hover Effect Line */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
       
      </div>
    </div>
  )
}

export default NewAddCat

