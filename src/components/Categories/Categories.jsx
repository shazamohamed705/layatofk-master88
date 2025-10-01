import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { IoIosArrowBack } from "react-icons/io"
import { postForm, getJson } from '../../api'

function Categories() {
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all categories dynamically from API (3 levels deep)
  useEffect(() => {
    let mounted = true
    
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Step 1: Fetch main categories (Level 1)
        const mainCategoriesResponse = await getJson('/api/categories')
        
        if (!mainCategoriesResponse?.status || !Array.isArray(mainCategoriesResponse.data)) {
          if (mounted) setError('فشل في جلب الفئات الرئيسية')
          return
        }
        
        const mainCategories = mainCategoriesResponse.data
        
        // Step 2: Fetch Level 2 categories for all main categories in parallel
        const level2Promises = mainCategories.map(async (mainCat) => {
          try {
            const response = await postForm('/api/sub_Catgoires', { cat_id: mainCat.id })
            if (response?.status && Array.isArray(response.data)) {
              // Flatten groups to get individual categories
              const categories = []
              for (const group of response.data) {
                if (Array.isArray(group?.catgeory)) {
                  categories.push(...group.catgeory)
                }
              }
              return categories
            }
            return []
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Error loading level 2 for cat_id ${mainCat.id}:`, err.message)
            }
            return []
          }
        })
        
        const level2Results = await Promise.all(level2Promises)
        const level2Categories = level2Results.flat()
        
        // Take only the first category from level 2
        const firstLevel2Category = level2Categories[0]
        
        if (!firstLevel2Category) {
          if (mounted) {
            setError('لا توجد فئات فرعية متاحة')
          }
          return
        }
        
        // Step 3: Fetch Level 3 categories for the first category only
        try {
          // Use correct endpoint: /api/sub_Catgoires (with underscore)
          const response = await postForm('/api/sub_Catgoires', { cat_id: firstLevel2Category.id })
          const level3Categories = []
          
          if (response?.status && Array.isArray(response.data)) {
            // Extract categories from groups structure
            for (const group of response.data) {
              if (Array.isArray(group?.catgeory)) {
                level3Categories.push(...group.catgeory)
              }
            }
          }
        
          if (mounted) {
            setCategoriesData(level3Categories)
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Error loading level 3 for cat_id ${firstLevel2Category.id}:`, err.message)
          }
          if (mounted) setError('حدث خطأ أثناء جلب الفئات الفرعية')
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading categories:', e)
        }
        if (mounted) setError('حدث خطأ أثناء جلب الفئات')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    loadCategories()
    return () => { mounted = false }
  }, [])

  // Sort categories by ads count (categoriesData is already flattened)
  const allCategories = useMemo(() => {
    return [...categoriesData].sort((a, b) => (b.adds || 0) - (a.adds || 0))
  }, [categoriesData])

  // Statistics calculation - Optimized with single loop
  const statistics = useMemo(() => {
    let totalAds = 0, categoriesWithSub = 0, totalAuctions = 0
    
    for (const cat of allCategories) {
      totalAds += cat.adds || 0
      totalAuctions += cat.Auctionscount || 0
      if (cat.has_sub === 1) categoriesWithSub++
    }
    
    return {
      totalAds,
      totalCategories: allCategories.length,
      categoriesWithSub,
      totalAuctions
    }
  }, [allCategories])

  // Render category card component - extracted to avoid duplication and optimized
  const CategoryCard = React.memo(({ category, showAuctions = false }) => (
    <Link
      to={`/products/${category.id}`}
      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="p-6">
        {/* Category Image */}
        <div className="mb-6 flex justify-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shadow-md">
            {category.img ? (
              <img 
                src={category.img} 
                alt={category.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none'
                  const fallback = e.target.parentElement.querySelector('.fallback-icon')
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
            ) : null}
            <div 
              className="fallback-icon w-full h-full bg-primary text-white flex items-center justify-center text-4xl font-bold"
              style={{ display: category.img ? 'none' : 'flex' }}
            >
              {category.name?.[0] || '؟'}
            </div>
          </div>
        </div>
        
        {/* Category Info */}
        <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors duration-300">
          {category.name}
        </h3>
        
        {showAuctions ? (
          <div className="flex items-center justify-between mb-3">
            <span className="text-primary font-bold text-base md:text-lg">
              {category.adds || 0} إعلان
            </span>
            <span className="text-gray-500 text-sm">
              {category.Auctionscount || 0} مزاد
            </span>
          </div>
        ) : (
          <>
            <p className="text-sm md:text-base text-gray-500 mb-3">
              {category.has_sub ? 'يحتوي على فئات فرعية' : 'فئة مباشرة'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-primary font-bold text-lg md:text-xl">
                {category.adds || 0}
              </span>
              <span className="text-gray-500 text-sm">إعلان</span>
            </div>
          </>
        )}
      </div>
    </Link>
  ))

  return (
    <div className="min-h-screen pt-10 pb-10">
      <div className="w-full mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">الفئات</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            تصفح جميع الفئات المتاحة واختر ما يناسبك
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-gray-600">جاري تحميل الفئات...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : allCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد فئات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}

        {/* Top Categories Section - Most popular subcategories */}
        {allCategories.length > 0 && (
          <section className="py-12 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-4">أكثر الفئات شعبية</h2>
              <p className="text-gray-600">اكتشف أكثر الفئات طلباً وشعبية</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCategories.slice(0, 6).map((category) => (
                <CategoryCard key={category.id} category={category} showAuctions />
              ))}
            </div>
          </section>
        )}

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">إحصائيات الفئات</h2>
            <p className="text-gray-600">أرقام وإحصائيات تعكس نشاط الفئات</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { value: statistics.totalAds, label: 'إجمالي الإعلانات', format: true },
              { value: statistics.totalCategories, label: 'إجمالي الفئات' },
              { value: statistics.categoriesWithSub, label: 'فئات تحتوي على فئات فرعية' },
              { value: statistics.totalAuctions, label: 'إجمالي المزادات', format: true }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.format ? stat.value.toLocaleString() : stat.value}
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories 