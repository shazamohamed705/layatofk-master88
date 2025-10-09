import React, { useState, useEffect, useMemo, useRef } from 'react'
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
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAds, setTotalAds] = useState(0);
    
    // Filter states
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
    
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

    // Helper: Build image URL from API data
    const getImageUrl = (ad) => {
        if (!ad) return null;
        
        // Get image from images array (main source for ads)
        if (Array.isArray(ad.images) && ad.images.length > 0) {
            const firstImage = ad.images[0];
            if (firstImage?.img) {
                const imgFileName = firstImage.img;
                // If already full URL, return as is
                if (imgFileName.startsWith('http')) {
                    return imgFileName;
                }
                // Build full URL - assuming images are in /uploads/ads/ directory
                return `https://lay6ofk.com/uploads/ads/${imgFileName}`;
            }
        }
        
        return null;
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

    // Fetch commercial ads from API
    useEffect(() => {
        const fetchCommercialAds = async () => {
            try {
                setAdsLoading(true);
                setAdsError(null);
                
                // Build dynamic URL with filters
                const params = new URLSearchParams();
                
                if (selectedCategoryFilter) {
                    // When filter is active, get total count first
                    params.append('cat_id', selectedCategoryFilter);
                    
                    // First request to get total count
                    const initialUrl = `/api/ads?${params.toString()}`;
                    console.log('🔍 Getting total count from:', initialUrl);
                    const initialResponse = await getJson(initialUrl);
                    
                    if (initialResponse?.status && initialResponse?.ads?.total) {
                        const totalCount = initialResponse.ads.total;
                        console.log('📊 Total ads in category:', totalCount);
                        
                        // Second request with per_page = total to get all ads
                        params.append('per_page', totalCount.toString());
                        const fullUrl = `/api/ads?${params.toString()}`;
                        console.log('🔍 Fetching all ads from:', fullUrl);
                        const fullResponse = await getJson(fullUrl);
                        
                        if (fullResponse?.status && fullResponse?.ads?.data && Array.isArray(fullResponse.ads.data)) {
                            console.log('✅ Loaded', fullResponse.ads.data.length, 'ads');
                            setCommercialAds(fullResponse.ads.data);
                            setTotalPages(fullResponse.ads.last_page || 1);
                            setTotalAds(fullResponse.ads.total || 0);
                        } else {
                            setCommercialAds([]);
                        }
                    } else {
                        console.log('⚠️ No ads found in category');
                        setCommercialAds([]);
                    }
                } else {
                    // When no filter, use pagination
                    params.append('page', currentPage);
                    const apiUrl = `/api/ads?${params.toString()}`;
                    
                    console.log('🔍 Fetching ads from:', apiUrl);
                    const response = await getJson(apiUrl);
                    
                    if (response?.status && response?.ads?.data && Array.isArray(response.ads.data)) {
                        console.log('✅ Loaded', response.ads.data.length, 'ads');
                        setCommercialAds(response.ads.data);
                        setTotalPages(response.ads.last_page || 1);
                        setTotalAds(response.ads.total || 0);
                    } else {
                        console.log('⚠️ No ads found');
                        setCommercialAds([]);
                    }
                }
            } catch (error) {
                console.error('❌ Error fetching commercial ads:', error);
                setAdsError('حدث خطأ في جلب الإعلانات التجارية');
            } finally {
                setAdsLoading(false);
            }
        };

        fetchCommercialAds();
        
        // Scroll to top when page or filter changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, selectedCategoryFilter]);

  return (
    <>
      <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-primary">إعلانات تجارية</h1>
              {selectedCategoryFilter && (
                <button
                  onClick={() => {
                    setSelectedCategoryFilter(null);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition flex items-center gap-1"
                >
                  إزالة التصفية ✕
                </button>
              )}
            </div>
            <Link 
              to="/new-add-cat" 
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              أنشر إعلانك الآن
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
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
                    <div className={`px-2 py-2 md:px-3 md:py-3 rounded-full border bg-white/80 backdrop-blur-sm flex items-center gap-1 transition-colors duration-200 whitespace-nowrap text-[13px] md:text-sm ${
                      selectedCategoryFilter === cat.id 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'text-gray-700 hover:text-primary border-gray-200 hover:border-primary/40'
                    }`}>
                      <button
                        type="button"
                        className="whitespace-nowrap hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategoryFilter(cat.id);
                          setCurrentPage(1);
                          setHoveredCategory(null);
                          setDropdownPos(null);
                        }}
                      >
                        {cat.name}
                      </button>
                      
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
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryFilter(sub.id);
                          setCurrentPage(1);
                          setHoveredCategory(null);
                          setDropdownPos(null);
                        }}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors duration-150 text-right"
                      >
                        {sub.name}
                      </button>
                    ))
                  ) : (
                    <>
                      {subError && (
                        <div className="px-4 py-2 text-xs text-red-600">{subError}</div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategoryFilter(hoveredCategory);
                          setCurrentPage(1);
                          setHoveredCategory(null);
                          setDropdownPos(null);
                        }}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors duration-150"
                      >
                        عرض جميع المنتجات
                      </button>
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
              const adImage = getImageUrl(ad);
              const whatsappNumber = ad.whatsapp || ad.phone;
              const phoneNumber = ad.phone;
              
              return (
                <Link to={`/product-details/${ad.id}`} key={ad.id}>
                  <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 relative">
                    {/* Image - Full Card Size */}
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {adImage ? (
                        <img
                          src={adImage}
                          alt={ad.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Placeholder for missing or failed images */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                        style={{ display: adImage ? 'none' : 'flex' }}
                      >
                        <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
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
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
                          >
                            <FaWhatsapp size={22} />
                          </a>
                        )}
                        {phoneNumber && (
                          <a 
                            href={`tel:${phoneNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
                          >
                            <BiPhone size={22} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination - Only show when no filter is active */}
        {!adsLoading && !adsError && commercialAds.length > 0 && totalPages > 1 && !selectedCategoryFilter && (
          <div className="flex justify-center items-center gap-2 mt-12 pb-8">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              <IoIosArrowBack className="rotate-180" />
              السابق
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                // Show first page, last page, current page, and adjacent pages
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        pageNum === currentPage
                          ? 'bg-primary text-white scale-110'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                // Show dots for skipped pages
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              التالي
              <IoIosArrowBack />
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {!adsLoading && !adsError && commercialAds.length > 0 && (
          <div className="text-center text-sm text-gray-500 pb-4">
            {selectedCategoryFilter ? (
              <span>تم العثور على {commercialAds.length} إعلان تجاري في هذه الفئة</span>
            ) : (
              <span>عرض {commercialAds.length} من أصل {totalAds} إعلان تجاري</span>
            )}
          </div>
        )}
      </main>
    </div>
    </>
  )
}

export default Advertising