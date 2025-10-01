import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {  IoIosSearch } from "react-icons/io"
import phone from '../../assets/phone.png'
import { getJson, postForm } from '../../api'

function useQuery() {
  // Parse query string once
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function Products() {
  const { subCatId } = useParams() // Get sub_category ID from URL parameter
  const query = useQuery()
  const categoryIdFromQuery = query.get('cat_id') || query.get('category') || subCatId // numeric id from navigation or URL param
  const typeFromQuery = query.get('type') || '' // optional: new | used (ensure always string)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryIdFromQuery || '')
  const [sortBy, setSortBy] = useState('newest')
  const [apiItems, setApiItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [itemsError, setItemsError] = useState(null)
  const [apiCategories, setApiCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  
  // Helper function to remove duplicates from products array
  const removeDuplicateProducts = (products) => {
    const seen = new Set()
    let duplicateCount = 0
    const unique = products.filter(product => {
      if (seen.has(product.id)) {
        duplicateCount++
        return false
      }
      seen.add(product.id)
      return true
    })
    
    if (duplicateCount > 0) {
      console.warn(`🔄 تم إزالة ${duplicateCount} منتج مكرر في مرحلة الفلترة`)
    }
    
    return unique
  }

  // Fetch sub-categories from API for filter dropdown
  useEffect(() => {
    let mounted = true
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        // Load all sub-categories from main category (cat_id=1 for example)
        const response = await postForm('/api/sub_Catgoires', { cat_id: 1 })
        if (mounted && response?.status && Array.isArray(response.data)) {
          // Flatten the categories from groups
          const flatCategories = []
          for (const group of response.data) {
            if (Array.isArray(group?.catgeory)) {
              flatCategories.push(...group.catgeory)
            } else if (group?.id && group?.name) {
              // Direct category without nesting
              flatCategories.push(group)
            }
          }
          setApiCategories(flatCategories)
        }
      } catch (e) {
        console.error('Error loading categories:', e)
      } finally {
        if (mounted) setCategoriesLoading(false)
      }
    }
    loadCategories()
    return () => { mounted = false }
  }, [])

  // Update selected category when URL changes
  useEffect(() => {
    if (categoryIdFromQuery) {
      setSelectedCategory(categoryIdFromQuery)
    }
  }, [categoryIdFromQuery])

  // No fallback categories - only use API data

  // Load products from API based on category filter
  useEffect(() => {
    // Don't load products if no category is selected
    if (!selectedCategory || selectedCategory === '') {
      setItemsLoading(false)
      setApiItems([])
      return
    }

    let mounted = true
    
    // Try multiple endpoints in order and return first successful response
    const tryEndpoints = async (endpoints) => {
      for (const { name, request } of endpoints) {
        try {
          const response = await request()
          console.log(`🔍 Response من ${name}:`, response)
          
          // Handle pagination structure: data.data contains the actual array
          if (response?.status && response?.data?.data && Array.isArray(response.data.data)) {
            return { status: response.status, msg: response.msg, data: response.data.data }
          }
          
          // Handle direct array response
          if (response?.status && Array.isArray(response.data)) {
            return response
          }
        } catch (e) {
          console.warn(`${name} endpoint failed:`, e.message)
        }
      }
      return null
    }
    
    const loadProducts = async () => {
      try {
        setItemsLoading(true)
        setItemsError(null)
        
        const catId = selectedCategory
        console.log('🎯 Selected Category:', catId, '| Type:', typeFromQuery)
        
        // Define endpoints to try in order
        const endpoints = catId ? [
          { name: '/api/adv_by_cat', request: () => getJson(`/api/adv_by_cat?cat_id=${catId}`) },
          { name: '/api/category_items', request: () => postForm('/api/category_items', { cat_id: catId, type: typeFromQuery || '' }) },
          { name: '/api/ads (with category)', request: () => getJson(`/api/ads?category=${catId}${typeFromQuery ? `&type=${typeFromQuery}` : ''}`) }
        ] : [
          { name: 'POST /api/ads', request: () => postForm('/api/ads', { type: typeFromQuery || '' }) },
          { name: 'GET /api/ads', request: () => getJson('/api/ads') }
        ]
        
        const resp = await tryEndpoints(endpoints)
        
        if (mounted && resp?.status && Array.isArray(resp.data)) {
          console.log('✅ عدد العناصر قبل إزالة التكرار:', resp.data.length)
          
          if (resp.data.length > 0) {
            // Remove duplicates based on ID before transformation (using Set for better performance)
            const seenIds = new Set()
            const uniqueData = resp.data.filter(item => {
              if (!item.id || seenIds.has(item.id)) return false
              seenIds.add(item.id)
              return true
            })
            
            console.log('✅ عدد العناصر بعد إزالة التكرار:', uniqueData.length)
            if (resp.data.length !== uniqueData.length) {
              console.log('⚠️ تم إزالة', resp.data.length - uniqueData.length, 'عنصر مكرر')
            }
            
            // Transform API data to match component format
            const transformedData = uniqueData.map((item) => {
              // Extract image URL from all possible sources with priority order
              const extractImageUrl = (item) => {
                // Priority 1: images array
                if (Array.isArray(item.images) && item.images.length > 0) {
                  const img = item.images[0]
                  return img?.img || img?.image || img?.url || img?.src || (typeof img === 'string' ? img : null)
                }
                
                // Priority 2: Direct image properties
                const directImage = item.img || item.image || item.thumbnail || item.photo || item.picture || item.image_url || item.img_url || item.src
                if (directImage) return directImage
                
                // Priority 3: Nested structures (banner, media, attachments, category)
                const nestedArrays = [
                  item.catgeory, item.banner, item.media, item.attachments
                ].find(arr => Array.isArray(arr) && arr.length > 0)
                
                if (nestedArrays) {
                  const first = nestedArrays[0]
                  return first?.img || first?.image || first?.url || first?.path || (typeof first === 'string' ? first : null)
                }
                
                return null
              }
              
              const imageUrl = extractImageUrl(item)
              
              // Build full image URL if needed
              const fullImageUrl = imageUrl && !imageUrl.startsWith('http') 
                ? `https://lay6ofk.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}` 
                : imageUrl
              
              return {
                id: item.id,
                title: item.title || item.name,
                price: `د.ك ${item.price || item.price_value || 0}`,
                location: item.location || item.area || 'الكويت',
                time: item.created_at || item.time || 'منذ ساعة',
                category: item.category_id || item.cat_id,
                image: fullImageUrl,
                condition: item.condition || item.type,
                img: fullImageUrl
              }
            })
            setApiItems(transformedData)
          } else {
            setApiItems([])
            setItemsError('لا توجد منتجات في هذه الفئة')
          }
        } else if (mounted) {
          setApiItems([])
          setItemsError('فشل في تحميل المنتجات')
        }
      } catch (e) {
        console.error('💥 Error loading products:', e.message)
        if (mounted) {
          setApiItems([])
          setItemsError('حدث خطأ أثناء تحميل المنتجات')
        }
      } finally {
        if (mounted) setItemsLoading(false)
      }
    }
    
    loadProducts()
    return () => { mounted = false }
  }, [selectedCategory, typeFromQuery])

  // Filter and search products - Use API data only with duplicate protection
  const filteredProducts = useMemo(() => {
    const filtered = apiItems.filter(product => {
      const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.location?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
    
    // Extra safety: remove any duplicates that might have slipped through
    return removeDuplicateProducts(filtered)
  }, [apiItems, searchTerm])

  // Sort products - Optimized with useMemo
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-low': {
          const priceA = parseFloat(a.price?.replace(/[^\d.]/g, '') || 0)
          const priceB = parseFloat(b.price?.replace(/[^\d.]/g, '') || 0)
          return priceA - priceB
        }
        case 'price-high': {
          const priceA = parseFloat(a.price?.replace(/[^\d.]/g, '') || 0)
          const priceB = parseFloat(b.price?.replace(/[^\d.]/g, '') || 0)
          return priceB - priceA
        }
        case 'newest':
          return new Date(b.time || 0) - new Date(a.time || 0)
        case 'oldest':
          return new Date(a.time || 0) - new Date(b.time || 0)
        default:
          return 0
      }
    })
  }, [filteredProducts, sortBy])

  // Get category name for page heading
  const pageHeading = useMemo(() => {
    if (!selectedCategory) return 'المنتجات'
    
    const category = apiCategories.find(cat => cat.id?.toString() === selectedCategory.toString())
    return category ? (category.name || category.name_ar) : 'المنتجات'
  }, [selectedCategory, apiCategories])

  return (
    <div className="min-h-screen pt-10 pb-10">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">{pageHeading}</h1>
          {selectedCategory ? (
            <p className="text-gray-600 text-lg">تصفية حسب الفئة المحددة • {typeFromQuery === 'new' ? 'جديدة' : typeFromQuery === 'used' ? 'مستعملة' : 'كل الحالات'}</p>
          ) : (
            <p className="text-gray-600 text-lg">اختر فئة من القائمة أدناه لعرض المنتجات المتاحة</p>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <IoIosSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={categoriesLoading}
              >
                <option value="">اختر الفئة</option>
                {apiCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name || category.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center">
              <span className="text-gray-600">
                {sortedProducts.length} منتج
              </span>
            </div>
          </div>
        </div>

        {/* Loading/Error */}
        {itemsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse h-72" />
            ))}
          </div>
        )}
        {itemsError && (
          <div className="text-center text-red-600 mb-4">{itemsError}</div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Link key={product.id} to={`/product-details`}>
              <article className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105">
                {/* Product Image */}
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-100">
                  <img
                    src={product.image || product.img || phone}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder on error
                      e.target.onerror = null;
                      e.target.src = phone;
                    }}
                  />
                  {/* Condition Badge */}
                {product.condition && (
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.condition === 'جديد' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                      {product.condition}
                    </span>
                  </div>
                )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {product.price && (
                    <p className="text-primary font-bold text-lg mb-2">
                      {product.price}
                    </p>
                  )}

                  <h3 className="text-sm font-medium text-gray-900 leading-6 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  <div className="text-xs text-gray-500 space-y-1">
                    {product.location && <p>{product.location}</p>}
                    {product.time && <p>{product.time}</p>}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* No Results or No Category Selected */}
        {!itemsLoading && sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {!selectedCategory ? '🏷️' : '🔍'}
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {!selectedCategory 
                ? 'اختر فئة لعرض المنتجات' 
                : 'لا توجد منتجات في هذه الفئة'}
            </h3>
            <p className="text-gray-500 mb-4">
              {!selectedCategory 
                ? 'الرجاء اختيار فئة من القائمة أعلاه لعرض المنتجات المتاحة' 
                : 'جرب اختيار فئة أخرى من القائمة أعلاه'}
            </p>
          </div>
        )}

        
      </div>
    </div>
  )
}

export default Products 