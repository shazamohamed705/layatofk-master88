import React, { useState, useEffect, useMemo, useRef } from 'react'
import productImage from "../../assets/product1.jpg"
import { BiPhone } from 'react-icons/bi'
import { FaWhatsapp } from 'react-icons/fa'
import { IoIosArrowDown, IoIosArrowBack } from "react-icons/io";
import { getJson, postForm } from '../../api'
import { Link } from 'react-router-dom'

function Advertising() {
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [commercialAds, setCommercialAds] = useState([]);
    const [adsLoading, setAdsLoading] = useState(true);
    const [adsError, setAdsError] = useState(null);
    const [apiCategories, setApiCategories] = useState([]);
    const [navGroups, setNavGroups] = useState([]);
    const [dropdownPos, setDropdownPos] = useState(null);
    const [subMap, setSubMap] = useState({});
    const [subLoadingId, setSubLoadingId] = useState(null);
    const [subError, setSubError] = useState(null);
    const openTimerRef = useRef(null);
    const closeTimerRef = useRef(null);
    const navRef = useRef(null);
    const dropdownRef = useRef(null);
    
    // Brands and Models filters
    const [brands, setBrands] = useState([]);
    const [brandsLoading, setBrandsLoading] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [models, setModels] = useState([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');

    // Fetch sub-categories for a parent category id with caching (Level 3)
    const fetchSubCategoriesFor = async (parentId) => {
        if (!parentId) return
        
        if (subMap[parentId]) {
            return // already cached
        }
        
        try {
            setSubError(null)
            setSubLoadingId(parentId)
            
            const response = await postForm('/api/sub_Catgoires', { cat_id: parentId })
            
            if (response?.status && Array.isArray(response.data)) {
                const flattened = []
                for (const group of response.data) {
                    if (Array.isArray(group?.catgeory)) {
                        for (const cat of group.catgeory) {
                            if (cat && cat.id && cat.name) {
                                flattened.push({ 
                                    id: cat.id, 
                                    name: cat.name, 
                                    img: cat.img,
                                    has_sub: cat.has_sub,
                                    adds: cat.adds || 0 
                                })
                            }
                        }
                    }
                }
                
                setSubMap(prev => ({ ...prev, [parentId]: flattened }))
            } else {
                setSubMap(prev => ({ ...prev, [parentId]: [] }))
            }
        } catch (e) {
            console.error('❌ Error fetching sub-categories:', e)
            setSubMap(prev => ({ ...prev, [parentId]: [] }))
            setSubError('حدث خطأ أثناء تحميل الفئات الفرعية')
        } finally {
            setSubLoadingId(null)
        }
    }

    // Helper: get image from all possible locations
    const getImageUrl = (item) => {
        if (!item) return null;
        
        // 1. Try images array first (most common in ads)
        if (Array.isArray(item.images) && item.images.length > 0) {
            const firstImage = item.images[0]
            if (firstImage?.img) {
                const imgUrl = firstImage.img
                return imgUrl.startsWith('http') ? imgUrl : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
            }
            if (firstImage?.image) {
                const imgUrl = firstImage.image
                return imgUrl.startsWith('http') ? imgUrl : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
            }
        }
        
        // 2. Try direct image keys
        const possibleKeys = ['img', 'image', 'thumbnail', 'photo', 'picture', 'icon', 'cover', 'banner']
        for (const key of possibleKeys) {
            if (item[key] && typeof item[key] === 'string') {
                const imgUrl = item[key]
                return imgUrl.startsWith('http') ? imgUrl : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
            }
        }
        
        // 3. Try user image as fallback
        if (item.user?.img) {
            const imgUrl = item.user.img
            return imgUrl.startsWith('http') ? imgUrl : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
        }
        
        return null
    }

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getJson('/api/categories');
                if (response.status && response.data) {
                    setApiCategories(response.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Load navigation groups
    useEffect(() => {
        if (!apiCategories || apiCategories.length === 0) return
        
        let mounted = true
        const loadNav = async () => {
            try {
                const firstCategoryId = apiCategories[0]?.id
                if (!firstCategoryId) return
                
                const response = await postForm('/api/sub_Catgoires', { cat_id: firstCategoryId })
                if (mounted && response?.status && Array.isArray(response.data)) {
                    setNavGroups(response.data)
                }
            } catch (e) {
                console.error('Navigation API error:', e)
            }
        }
        loadNav()
        return () => { mounted = false }
    }, [apiCategories])
    
    // Global listeners: click outside and ESC to close dropdown
    useEffect(() => {
        const onDocClick = (e) => {
            const navEl = navRef.current
            const dropEl = dropdownRef.current
            if (!navEl || !dropEl) return
            if (!navEl.contains(e.target) && !dropEl.contains(e.target)) {
                setHoveredCategory(null)
                setDropdownPos(null)
            }
        }
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setHoveredCategory(null)
                setDropdownPos(null)
            }
        }
        document.addEventListener('click', onDocClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('click', onDocClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [])

    // Close dropdown on scroll
    useEffect(() => {
        const onScroll = () => {
            if (!hoveredCategory) return
            const navEl = navRef.current
            if (!navEl) return
            const rect = navEl.getBoundingClientRect()
            const threshold = 40
            const above = rect.bottom < -threshold
            const below = rect.top > window.innerHeight + threshold
            if (above || below) {
                setHoveredCategory(null)
                setDropdownPos(null)
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [hoveredCategory])
    
    // Fetch brands from API based on category
    const fetchBrands = async (categoryId) => {
        if (!categoryId) {
            setBrands([])
            return
        }
        try {
            setBrandsLoading(true)
            const response = await postForm('/api/getBrands', { cat_id: categoryId })
            if (response?.status && Array.isArray(response.data)) {
                setBrands(response.data)
            } else {
                setBrands([])
            }
        } catch (e) {
            console.error('❌ Error loading brands:', e)
            setBrands([])
        } finally {
            setBrandsLoading(false)
        }
    }

    // Fetch models from API based on selected brand
    const fetchModels = async (brandId) => {
        if (!brandId) {
            setModels([])
            return
        }
        try {
            setModelsLoading(true)
            const response = await postForm('/api/getModels', { brand_id: brandId })
            if (response?.status && Array.isArray(response.data)) {
                setModels(response.data)
            } else {
                setModels([])
            }
        } catch (e) {
            console.error('❌ Error loading models:', e)
            setModels([])
        } finally {
            setModelsLoading(false)
        }
    }

    // Load brands when hovering over cars category
    useEffect(() => {
        if (!hoveredCategory) {
            setSelectedBrand('')
            setSelectedModel('')
            setModels([])
            setBrands([])
        } else {
            fetchBrands(hoveredCategory)
        }
    }, [hoveredCategory])

    // Load models when brand is selected
    useEffect(() => {
        if (selectedBrand) {
            fetchModels(selectedBrand)
        } else {
            setModels([])
            setSelectedModel('')
        }
    }, [selectedBrand])
    
    // Navigate to products page when model is selected
    useEffect(() => {
        if (selectedModel && selectedBrand && hoveredCategory) {
            const queryParams = new URLSearchParams({
                cat_id: hoveredCategory,
                brand_id: selectedBrand,
                model_id: selectedModel
            })
            window.location.href = `/products?${queryParams.toString()}`
        }
    }, [selectedModel, selectedBrand, hoveredCategory])

    // Flattened fast lookup list
    const flattenedNav = useMemo(() => {
        if (!Array.isArray(navGroups) || navGroups.length === 0) return []
        
        const result = []
        for (const group of navGroups) {
            if (Array.isArray(group?.catgeory)) {
                for (const cat of group.catgeory) {
                    if (cat && cat.id && cat.name) {
                        result.push({ 
                            id: cat.id, 
                            name: cat.name, 
                            img: cat.img, 
                            has_sub: cat.has_sub,
                            adds: cat.adds || 0
                        })
                    }
                }
            }
        }
        return result
    }, [navGroups])

    // Get commercial category ID (second category from navigation)
    const commercialCategoryId = useMemo(() => {
        if (Array.isArray(flattenedNav) && flattenedNav.length >= 2) {
            return flattenedNav[1].id;
        }
        if (Array.isArray(apiCategories) && apiCategories.length >= 2) {
            return apiCategories[1]?.id;
        }
        return null;
    }, [flattenedNav, apiCategories]);

    // Fetch commercial ads from API
    useEffect(() => {
        if (!commercialCategoryId) return;

        const fetchCommercialAds = async () => {
            try {
                setAdsLoading(true);
                setAdsError(null);
                
                const response = await getJson(`/api/adv_by_cat?cat_id=${commercialCategoryId}`);
                
                if (response?.status && Array.isArray(response.data)) {
                    console.log('✅ Loaded', response.data.length, 'commercial ads');
                    setCommercialAds(response.data);
                } else {
                    console.log('⚠️ No commercial ads found');
                    setCommercialAds([]);
                }
            } catch (error) {
                console.error('❌ Error fetching commercial ads:', error);
                setAdsError('حدث خطأ في جلب الإعلانات التجارية');
            } finally {
                setAdsLoading(false);
            }
        };

        fetchCommercialAds();
    }, [commercialCategoryId]);

  return (
    <>
      <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-primary">إعلانات تجارية</h1>
            <Link to="/" className="flex items-center gap-1 text-sm border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition">
              <IoIosArrowBack />
              الرئيسية
            </Link>
          </div>

          {/* Navigation - Same as Home */}
          <nav className="relative px-2 md:px-8 pb-6" ref={navRef}>
            <div className="flex space-x-reverse gap-1 md:gap-2 overflow-x-auto whitespace-nowrap nav-scroll scroll-smooth snap-x snap-mandatory touch-pan-x overscroll-x-contain pr-6">
              {flattenedNav.length === 0 ? (
                <div className="px-3 py-4 text-gray-500">جاري تحميل الفلاتر...</div>
              ) : (
                flattenedNav.map((cat) => (
                  <div
                    key={cat.id}
                    className="relative flex-shrink-0 snap-start"
                    onMouseEnter={async (e) => {
                      if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null }
                      if (openTimerRef.current) { clearTimeout(openTimerRef.current); openTimerRef.current = null }
                      setHoveredCategory(cat.id)
                      try {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setDropdownPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + rect.width / 2 })
                      } catch (_) {}
                      fetchSubCategoriesFor(cat.id)
                    }}
                    onMouseLeave={() => {
                      if (openTimerRef.current) { clearTimeout(openTimerRef.current); openTimerRef.current = null }
                      const t = setTimeout(() => {
                        setHoveredCategory(null)
                        setDropdownPos(null)
                      }, 160)
                      closeTimerRef.current = t
                    }}
                  >
                    <div className="text-gray-700 hover:text-primary px-2 py-2 md:px-3 md:py-3 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm hover:border-primary/40 flex items-center gap-1 transition-colors duration-200 whitespace-nowrap text-[13px] md:text-sm">
                      <Link 
                        to={`/products/${cat.id}`}
                        className="whitespace-nowrap hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cat.name}
                      </Link>
                      
                      <button
                        type="button"
                        className="p-0 hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (hoveredCategory === cat.id) {
                            setHoveredCategory(null)
                            setDropdownPos(null)
                          } else {
                            try {
                              const parentDiv = e.currentTarget.closest('div[class*="rounded-full"]')
                              const rect = parentDiv.getBoundingClientRect()
                              setDropdownPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + rect.width / 2 })
                            } catch (_) {}
                            setHoveredCategory(cat.id)
                            fetchSubCategoriesFor(cat.id)
                          }
                        }}
                      >
                        <IoIosArrowDown className={`text-xs transition-transform duration-200 flex-shrink-0 ${hoveredCategory === cat.id ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Gradient overlays */}
            <div className="nav-gradient-overlay pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white/95 to-transparent" />
            <div className="nav-gradient-overlay pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white/95 to-transparent" />

            {/* Fixed dropdown */}
            {hoveredCategory && dropdownPos && (
              <div
                className="fixed z-[60] w-56 text-center bg-white border border-gray-200 rounded-lg shadow-xl"
                style={{ top: dropdownPos.top, left: dropdownPos.left, transform: 'translateX(-50%)' }}
                ref={dropdownRef}
                onMouseEnter={() => {
                  if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null }
                }}
                onMouseLeave={() => {
                  const t = setTimeout(() => {
                    setHoveredCategory(null)
                    setDropdownPos(null)
                  }, 160)
                  closeTimerRef.current = t
                }}
              >
                <div className="py-2 max-h-80 overflow-y-auto">
                  {/* Brands and Models Filters */}
                  {brands.length > 0 && (
                    <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                      <div className="mb-2">
                        <select
                          value={selectedBrand}
                          onChange={(e) => {
                            setSelectedBrand(e.target.value)
                            setSelectedModel('')
                          }}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-primary focus:outline-none"
                          disabled={brandsLoading}
                        >
                          <option value="">اختر الماركة</option>
                          {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name || brand.name_ar}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedBrand && (
                        <div>
                          <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:border-primary focus:outline-none"
                            disabled={modelsLoading}
                          >
                            <option value="">اختر الموديل</option>
                            {models.map(model => (
                              <option key={model.id} value={model.id}>
                                {model.name || model.name_ar}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Sub-categories */}
                  {subLoadingId === hoveredCategory ? (
                    <div className="px-4 py-2 text-sm text-gray-500">جاري التحميل...</div>
                  ) : subMap[hoveredCategory] && subMap[hoveredCategory].length > 0 ? (
                    subMap[hoveredCategory].map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/products/${sub.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors duration-150 text-right"
                      >
                        {sub.name}
                      </Link>
                    ))
                  ) : (
                    <>
                      {subError && (
                        <div className="px-4 py-2 text-xs text-red-600">{subError}</div>
                      )}
                      <Link
                        to={`/products/${hoveredCategory}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors duration-150"
                      >
                        عرض جميع المنتجات
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Business Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 my-12">
        {adsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الإعلانات التجارية...</p>
            </div>
          </div>
        ) : adsError ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{adsError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : commercialAds.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            لا توجد إعلانات تجارية متاحة حالياً
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commercialAds.map((ad) => {
              const adImage = getImageUrl(ad) || productImage;
              const whatsappNumber = ad.whatsapp || ad.phone;
              const phoneNumber = ad.phone;
              
              return (
                <div key={ad.id} className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 relative">
                  {/* Image - Full Card Size */}
                  <div className="relative aspect-[3/4]">
                    <img
                      src={adImage}
                      alt={ad.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = productImage;
                      }}
                    />
                    
                    {/* Price Badge - Top Right */}
                    {ad.price && (
                      <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg">
                        {ad.price.toLocaleString('en-US')} KD
                      </div>
                    )}
                    
                    {/* Text Overlay */}
                    <div className="absolute bottom-16 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-12">
                      {/* Title */}
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 text-white drop-shadow-lg">{ad.name}</h3>
                      
                      {/* Description */}
                      <p className="text-sm line-clamp-2 text-white/95 drop-shadow-md">{ad.description}</p>
                    </div>

                    {/* Action Buttons - Absolute at Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 flex gap-3 p-4 bg-white/95 backdrop-blur-sm">
                      {whatsappNumber && (
                        <a 
                          href={`https://wa.me/${whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                          <FaWhatsapp size={22} />
                        </a>
                      )}
                      {phoneNumber && (
                        <a 
                          href={`tel:${phoneNumber}`}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                          <BiPhone size={22} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
    </>
  )
}

export default Advertising