import React, { useMemo, useState, useEffect, useRef } from 'react'
import Slider from 'react-slick'
import car from '../../assets/car.png'
import logo from '../../assets/logo.png'
import image1 from '../../assets/Image1.png'
import image2 from '../../assets/Image2.png'
import image3 from '../../assets/Image3.png'
import image4 from '../../assets/Image4.png'
import image5 from '../../assets/Image5.png'
import image6 from '../../assets/Image6.png'
import phone from '../../assets/phone.png'
import { IoIosArrowBack, IoIosArrowDown } from "react-icons/io";
import { Link } from 'react-router-dom'
import Stories from '../Stories/Stories'
import productImage from "../../assets/product1.jpg"
import { BiPhone } from "react-icons/bi";
import { FaWhatsapp } from "react-icons/fa";
import googlePlay from "../../assets/googleplay.png"
import appstore from "../../assets/appstore.jpg"
import huawei from "../../assets/huawel.webp"
import { getJson, postForm } from '../../api'

function Home() {
    const [user, setUser] = useState(null);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [dropdownPos, setDropdownPos] = useState(null); // fixed-position dropdown anchor
    const [subMap, setSubMap] = useState({}); // cache: { [parentCatId]: SubCategory[] }
    const [subLoadingId, setSubLoadingId] = useState(null);
    const [subError, setSubError] = useState(null);
    const openTimerRef = useRef(null)
    const closeTimerRef = useRef(null)
    const navRef = useRef(null)
    const dropdownRef = useRef(null)

    // Check if user is logged in
    useEffect(() => {
        const readUser = () => {
            try {
                const raw = localStorage.getItem('user');
                setUser(raw ? JSON.parse(raw) : null);
            } catch (_) {
                setUser(null);
            }
        };
        readUser();
        const onStorage = (e) => {
            if (e.key === 'user' || e.key === 'api_token') readUser();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // Fetch sub-categories for a parent category id with caching (Level 3)
    const fetchSubCategoriesFor = async (parentId) => {
        if (!parentId) {
            console.log('⚠️ No parent ID provided for sub-categories')
            return
        }
        
        if (subMap[parentId]) {
            console.log('✅ Using cached sub-categories for cat_id:', parentId)
            return // already cached
        }
        
        try {
            setSubError(null)
            setSubLoadingId(parentId)
            
            console.log('🔄 Fetching Level 3 sub-categories for cat_id:', parentId)
            console.log('📡 Calling: POST /api/sub_Catgoires with { cat_id:', parentId, '}')
            
            // Use correct endpoint: /api/sub_Catgoires (with underscore) - DYNAMIC cat_id
            const response = await postForm('/api/sub_Catgoires', { cat_id: parentId })
            
            console.log('📦 Level 3 response:', response)
            console.log('📊 Response data type:', Array.isArray(response?.data) ? 'Array' : typeof response?.data)
            
            if (response?.status && Array.isArray(response.data)) {
                console.log('✅ Response has', response.data.length, 'groups')
                
                // response.data is array of groups, each with catgeory[] array
                const flattened = []
                for (const group of response.data) {
                    // Extract categories from catgeory array
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
                
                console.log('✨ Extracted', flattened.length, 'Level 3 categories')
                if (flattened.length > 0) {
                    console.log('📋 Sample Level 3 categories:', flattened.slice(0, 3).map(c => c.name))
                }
                
                setSubMap(prev => ({ ...prev, [parentId]: flattened }))
            } else {
                console.log('❌ Invalid response structure')
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
    const [banners, setBanners] = useState([]);
    const [bannersLoading, setBannersLoading] = useState(true);
    const [bannersError, setBannersError] = useState(null);
    const [bannersImagesLoaded, setBannersImagesLoaded] = useState(false);
    const [apiCategories, setApiCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState(null);
    const [navGroups, setNavGroups] = useState([]);
    const [navLoading, setNavLoading] = useState(true);
    const [navError, setNavError] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [subCategoriesLoading, setSubCategoriesLoading] = useState(true);
    const [subCategoriesError, setSubCategoriesError] = useState(null);
    const [secondBanners, setSecondBanners] = useState([]);
    const [secondBannersLoading, setSecondBannersLoading] = useState(true);
    const [secondBannersError, setSecondBannersError] = useState(null);
    const [secondBannersImagesLoaded, setSecondBannersImagesLoaded] = useState(false);
    
    // Brands and Models filters (for cars category only)
    const [brands, setBrands] = useState([]);
    const [brandsLoading, setBrandsLoading] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [models, setModels] = useState([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');

    // Separate ads from different categories
    const [regularAds, setRegularAds] = useState([]);
    const [commercialAds, setCommercialAds] = useState([]);
    const [mobileAds, setMobileAds] = useState([]);
    const [adsLoading, setAdsLoading] = useState(true);
    const [adsError, setAdsError] = useState(null);
    
    // Dynamic page for commercial ads (can be changed if needed)
    const [commercialAdsPage, setCommercialAdsPage] = useState(1);
    const [adsPerPage] = useState(4);

    // Display limited ads from each category
    const regularAdsStart = 0;
    const regularAdsEnd = 4;
    const mobileAdsCount = 4;
    
    const displayedRegularAds = useMemo(() => regularAds.slice(regularAdsStart, regularAdsEnd), [regularAds]);
    const displayedCommercialAds = useMemo(() => commercialAds.slice(0, adsPerPage), [commercialAds, adsPerPage]);
    const displayedMobileAds = useMemo(() => mobileAds.slice(0, mobileAdsCount), [mobileAds]);

    // Helper: normalize banners payload (accept array or wrapped object)
    const normalizeBanners = (payload) => {
        if (!payload) return null
        if (Array.isArray(payload)) return payload
        if (Array.isArray(payload?.data)) return payload.data
        if (Array.isArray(payload?.banners)) return payload.banners
        return null
    }

    // Helper: get image from all possible locations
    const getImageUrl = (item) => {
        if (!item) {
            console.log('⚠️ getImageUrl: item is null/undefined');
            return null;
        }
        
        // 1. Try images array first (most common in ads)
        if (Array.isArray(item.images) && item.images.length > 0) {
            const firstImage = item.images[0]
            if (firstImage?.img) {
                const imgUrl = firstImage.img
                const fullUrl = imgUrl.startsWith('http') ? imgUrl : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
                console.log('✅ Found image in images[0].img:', fullUrl);
                return fullUrl
            }
            if (firstImage?.image) {
                const imgUrl = firstImage.image
                const fullUrl = imgUrl.startsWith('http') ? imgUrl : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
                console.log('✅ Found image in images[0].image:', fullUrl);
                return fullUrl
            }
        }
        
        // 2. Try direct image keys
        const possibleKeys = ['img', 'image', 'thumbnail', 'photo', 'picture', 'icon', 'cover', 'banner']
        for (const key of possibleKeys) {
            if (item[key] && typeof item[key] === 'string') {
                const imgUrl = item[key]
                const fullUrl = imgUrl.startsWith('http') ? imgUrl : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
                console.log(`✅ Found image in ${key}:`, fullUrl);
                return fullUrl
            }
        }
        
        // 3. Try user image as fallback
        if (item.user?.img) {
            const imgUrl = item.user.img
            const fullUrl = imgUrl.startsWith('http') ? imgUrl : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
            console.log('✅ Found image in user.img:', fullUrl);
            return fullUrl
        }
        
        // 4. Try brand image
        if (item.brand?.img) {
            const imgUrl = item.brand.img
            const fullUrl = imgUrl.startsWith('http') ? imgUrl : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
            console.log('✅ Found image in brand.img:', fullUrl);
            return fullUrl
        }
        
        console.log('❌ No image found for item:', item.id, item.name);
        return null
    }

    // Fetch banners from API
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setBannersLoading(true);
                setBannersError(null);
                setBannersImagesLoaded(false);
                const response = await getJson('/api/banners', { timeoutMs: 20000 });
                const data = normalizeBanners(response)
                if (data) {
                    setBanners(data);
                    // Preload ALL banner images for instant display
                    if (data.length > 0) {
                        const imagePromises = data.map((banner) => {
                            return new Promise((resolve) => {
                                const imgUrl = getImageUrl(banner) || car;
                                const img = new Image();
                                img.onload = () => resolve(true);
                                img.onerror = () => resolve(false);
                                img.src = imgUrl;
                            });
                        });
                        // Wait for all images to load
                        Promise.all(imagePromises).then(() => {
                            setBannersImagesLoaded(true);
                        });
                    } else {
                        setBannersImagesLoaded(true);
                    }
                } else if (response?.status && response?.data) {
                    // دعم الشكل القديم
                    setBanners(response.data)
                    if (response.data.length > 0) {
                        const imagePromises = response.data.map((banner) => {
                            return new Promise((resolve) => {
                                const imgUrl = getImageUrl(banner) || car;
                                const img = new Image();
                                img.onload = () => resolve(true);
                                img.onerror = () => resolve(false);
                                img.src = imgUrl;
                            });
                        });
                        Promise.all(imagePromises).then(() => {
                            setBannersImagesLoaded(true);
                        });
                    } else {
                        setBannersImagesLoaded(true);
                    }
                } else {
                    setBannersError('فشل في جلب بيانات البانرات');
                }
            } catch (error) {
                console.error('Error fetching banners:', error);
                setBannersError('حدث خطأ في جلب بيانات البانرات');
            } finally {
                setBannersLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                setCategoriesError(null);
                console.log('🏁 Fetching main categories from /api/categories...')
                const response = await getJson('/api/categories');
                console.log('📦 Main categories response:', response)
                if (response.status && response.data) {
                    console.log('✅ Main categories loaded:', response.data.length, 'categories')
                    console.log('🎯 First category:', response.data[0])
                    setApiCategories(response.data);
                } else {
                    setCategoriesError('فشل في جلب بيانات الفئات');
                }
            } catch (error) {
                console.error('❌ Error fetching categories:', error);
                setCategoriesError('حدث خطأ في جلب بيانات الفئات');
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    

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

    // Close dropdown on scroll when we get far from the nav area
    useEffect(() => {
        const onScroll = () => {
            if (!hoveredCategory) return
            const navEl = navRef.current
            if (!navEl) return
            const rect = navEl.getBoundingClientRect()
            const threshold = 40// px away from nav area
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

    // Fetch second banners from API
    useEffect(() => {
        const fetchSecondBanners = async () => {
            try {
                setSecondBannersLoading(true);
                setSecondBannersError(null);
                setSecondBannersImagesLoaded(false);
                const response = await getJson('/api/banners', { timeoutMs: 20000 });
                const data = normalizeBanners(response)
                if (data) {
                    setSecondBanners(data);
                    // Preload ALL banner images for instant display
                    if (data.length > 0) {
                        const imagePromises = data.map((banner) => {
                            return new Promise((resolve) => {
                                const imgUrl = getImageUrl(banner) || car;
                                const img = new Image();
                                img.onload = () => resolve(true);
                                img.onerror = () => resolve(false);
                                img.src = imgUrl;
                            });
                        });
                        Promise.all(imagePromises).then(() => {
                            setSecondBannersImagesLoaded(true);
                        });
                    } else {
                        setSecondBannersImagesLoaded(true);
                    }
                } else if (response?.status && response?.data) {
                    setSecondBanners(response.data)
                    if (response.data.length > 0) {
                        const imagePromises = response.data.map((banner) => {
                            return new Promise((resolve) => {
                                const imgUrl = getImageUrl(banner) || car;
                                const img = new Image();
                                img.onload = () => resolve(true);
                                img.onerror = () => resolve(false);
                                img.src = imgUrl;
                            });
                        });
                        Promise.all(imagePromises).then(() => {
                            setSecondBannersImagesLoaded(true);
                        });
                    } else {
                        setSecondBannersImagesLoaded(true);
                    }
                } else {
                    setSecondBannersError('فشل في جلب بيانات البانرات');
                }
            } catch (error) {
                console.error('Error fetching second banners:', error);
                setSecondBannersError('حدث خطأ في جلب بيانات البانرات');
            } finally {
                setSecondBannersLoading(false);
            }
        };

        fetchSecondBanners();
    }, []);

    // Fetch navigation categories/groups for filter from API (sub_Catgoires)
    // Load after we have main categories
    useEffect(() => {
        // Wait for apiCategories to load
        if (!apiCategories || apiCategories.length === 0) {
            return
        }
        
        let mounted = true
        const loadNav = async () => {
            try {
                setNavLoading(true)
                setNavError(null)
                
                // Use first main category dynamically
                const firstCategoryId = apiCategories[0]?.id
                
                if (!firstCategoryId) {
                    console.error('❌ No main category ID found')
                    if (mounted) setNavError('لا توجد فئات رئيسية متاحة')
                    return
                }
                
                console.log('🔍 Loading navigation for category ID:', firstCategoryId)
                console.log('📂 Main category name:', apiCategories[0]?.name)
                
                // Use correct endpoint with underscore: /api/sub_Catgoires
                const response = await postForm('/api/sub_Catgoires', { cat_id: firstCategoryId })
                console.log('📦 Navigation response:', response)
                console.log('📊 Response data length:', response?.data?.length)
                
                if (mounted && response?.status && Array.isArray(response.data)) {
                    setNavGroups(response.data)
                    console.log('✅ Loaded navigation groups:', response.data.length)
                    if (response.data.length > 0) {
                        console.log('🎯 First group structure:', response.data[0])
                        if (response.data[0]?.catgeory) {
                            console.log('📋 First group categories count:', response.data[0].catgeory.length)
                        }
                    }
                } else if (mounted) {
                    console.error('❌ Invalid response structure:', response)
                    setNavError('فشل في جلب بيانات الفلاتر')
                }
            } catch (e) {
                console.error('❌ Navigation API error:', e)
                if (mounted) setNavError('حدث خطأ أثناء جلب بيانات الفلاتر')
            } finally {
                if (mounted) setNavLoading(false)
            }
        }
        loadNav()
        return () => { mounted = false }
    }, [apiCategories])

    // Flattened fast lookup list (performance-friendly memoization)
    const flattenedNav = useMemo(() => {
        if (!Array.isArray(navGroups) || navGroups.length === 0) {
            return []
        }
        
        const result = []
        // Extract categories from groups structure: data is array of {banner, catgeory}
        for (const group of navGroups) {
            // Each group has catgeory array
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
            // Fallback: if data is already flat (not grouped)
            else if (group && group.id && group.name) {
                result.push({ 
                    id: group.id, 
                    name: group.name, 
                    img: group.img, 
                    has_sub: group.has_sub,
                    adds: group.adds || 0
                })
            }
        }
        
        console.log('✨ Flattened navigation categories:', result.length, 'items')
        if (result.length > 0) {
            console.log('📋 Sample categories:', result.slice(0, 3).map(c => c.name))
        }
        return result
    }, [navGroups])

    // Dynamically get 3 different category IDs (must be AFTER flattenedNav)
    const categoryIds = useMemo(() => {
        const ids = { regular: null, commercial: null, mobile: null };
        
        // Try to get three different categories from navigation
        if (Array.isArray(flattenedNav) && flattenedNav.length >= 3) {
            ids.regular = flattenedNav[0].id;
            ids.commercial = flattenedNav[1].id;
            ids.mobile = flattenedNav[2].id;
            console.log('🎯 Using 3 category IDs:', ids);
        }
        // Fallback to main categories
        else if (Array.isArray(apiCategories) && apiCategories.length >= 3) {
            ids.regular = apiCategories[0]?.id;
            ids.commercial = apiCategories[1]?.id;
            ids.mobile = apiCategories[2]?.id;
            console.log('🎯 Using category IDs from apiCategories:', ids);
        }
        // If less than 3 categories, use what's available
        else if (Array.isArray(flattenedNav) && flattenedNav.length > 0) {
            ids.regular = flattenedNav[0]?.id;
            ids.commercial = flattenedNav[Math.min(1, flattenedNav.length - 1)]?.id;
            ids.mobile = flattenedNav[flattenedNav.length - 1]?.id;
            console.log('🎯 Using available category IDs:', ids);
        }
        
        if (!ids.regular && !ids.commercial && !ids.mobile) {
            console.log('⚠️ No category IDs found!');
        }
        
        return ids;
    }, [flattenedNav, apiCategories]);

    // Fetch ads from 3 different categories
    useEffect(() => {
        // Wait until we have valid category IDs
        if (!categoryIds.regular && !categoryIds.commercial && !categoryIds.mobile) {
            return;
        }

        const fetchAllAds = async () => {
            try {
                setAdsLoading(true);
                setAdsError(null);
                
                // Fetch from 3 different categories in parallel
                const promises = [];
                
                if (categoryIds.regular) {
                    console.log('📢 Fetching regular ads from category:', categoryIds.regular);
                    promises.push(getJson(`/api/adv_by_cat?cat_id=${categoryIds.regular}`));
                } else {
                    promises.push(Promise.resolve({ status: false, data: [] }));
                }
                
                if (categoryIds.commercial) {
                    console.log(`💼 Fetching commercial ads from /api/ads?page=${commercialAdsPage}`);
                    promises.push(getJson(`/api/ads?page=${commercialAdsPage}`).then(response => {
                        // Transform response to match expected format
                        if (response?.status && response?.ads?.data) {
                            // Filter only commercial ads
                            const commercialOnly = response.ads.data.filter(ad => ad.show_on_commercial === 1);
                            return { status: true, data: commercialOnly };
                        }
                        return { status: false, data: [] };
                    }));
                } else {
                    promises.push(Promise.resolve({ status: false, data: [] }));
                }
                
                if (categoryIds.mobile) {
                    console.log('📱 Fetching mobile ads from category:', categoryIds.mobile);
                    promises.push(getJson(`/api/adv_by_cat?cat_id=${categoryIds.mobile}`));
                } else {
                    promises.push(Promise.resolve({ status: false, data: [] }));
                }
                
                const [regularResponse, commercialResponse, mobileResponse] = await Promise.all(promises);
                
                // Set regular ads
                if (regularResponse?.status && Array.isArray(regularResponse.data)) {
                    console.log('✅ Loaded', regularResponse.data.length, 'regular ads');
                    setRegularAds(regularResponse.data);
                } else {
                    console.log('⚠️ No regular ads found');
                    setRegularAds([]);
                }
                
                // Set commercial ads
                if (commercialResponse?.status && Array.isArray(commercialResponse.data)) {
                    console.log('✅ Loaded', commercialResponse.data.length, 'commercial ads');
                    setCommercialAds(commercialResponse.data);
                } else {
                    console.log('⚠️ No commercial ads found');
                    setCommercialAds([]);
                }
                
                // Set mobile ads
                if (mobileResponse?.status && Array.isArray(mobileResponse.data)) {
                    console.log('✅ Loaded', mobileResponse.data.length, 'mobile ads');
                    setMobileAds(mobileResponse.data);
                } else {
                    console.log('⚠️ No mobile ads found');
                    setMobileAds([]);
                }
                
            } catch (error) {
                console.error('❌ Error fetching ads:', error);
                setAdsError('حدث خطأ في جلب بيانات الإعلانات');
            } finally {
                setAdsLoading(false);
            }
        };

        fetchAllAds();
    }, [categoryIds.regular, categoryIds.commercial, categoryIds.mobile, commercialAdsPage]);

    // Fetch brands from API based on category (for cars category) - Using POST with cat_id
    const fetchBrands = async (categoryId) => {
        if (!categoryId) {
            setBrands([])
            return
        }
        try {
            setBrandsLoading(true)
            const response = await postForm('/api/getBrands', { cat_id: categoryId })
            console.log('🚗 Brands Response for cat_id', categoryId, ':', response)
            if (response?.status && Array.isArray(response.data)) {
                console.log('✅ Loaded', response.data.length, 'brands')
                setBrands(response.data)
            } else {
                console.log('⚠️ No brands data found')
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
            console.log('🚙 Models Response for brand', brandId, ':', response)
            if (response?.status && Array.isArray(response.data)) {
                console.log('✅ Loaded', response.data.length, 'models')
                setModels(response.data)
            } else {
                console.log('⚠️ No models data found')
                setModels([])
            }
        } catch (e) {
            console.error('❌ Error loading models:', e)
            setModels([])
        } finally {
            setModelsLoading(false)
        }
    }

    // Load brands when hovering over cars category and reset filters when category changes
    useEffect(() => {
        // Reset filters when closing dropdown or changing category
        if (!hoveredCategory) {
            setSelectedBrand('')
            setSelectedModel('')
            setModels([])
            setBrands([])
        } else {
            // Load brands when hovering cars category, passing the cat_id
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
            // Navigate to products with filters including cat_id
            const queryParams = new URLSearchParams({
                cat_id: hoveredCategory,
                brand_id: selectedBrand,
                model_id: selectedModel
            })
            window.location.href = `/products?${queryParams.toString()}`
        }
    }, [selectedModel, selectedBrand, hoveredCategory])

    // اختر معرّف فئة أب افتراضي ديناميكياً بدل رقم ثابت
    const defaultSubParentId = useMemo(() => {
        if (Array.isArray(flattenedNav) && flattenedNav.length > 0) {
            return flattenedNav[0].id
        }
        if (Array.isArray(apiCategories) && apiCategories.length > 0) {
            return apiCategories[0]?.id
        }
        return null
    }, [flattenedNav, apiCategories])

    // Fetch subcategories from API for dynamic parent id
    useEffect(() => {
        if (!defaultSubParentId) return
        let isMounted = true
        const fetchSubCategories = async () => {
            try {
                setSubCategoriesLoading(true);
                setSubCategoriesError(null);
                // Use correct endpoint: /api/sub_Catgoires (with underscore)
                const response = await postForm('/api/sub_Catgoires', { cat_id: defaultSubParentId });
                
                if (isMounted && response?.status && Array.isArray(response.data)) {
                    // Extract and flatten all categories from groups
                    const flattenedCategories = [];
                    for (const group of response.data) {
                        if (Array.isArray(group?.catgeory)) {
                            flattenedCategories.push(...group.catgeory);
                        }
                    }
                    setSubCategories(flattenedCategories);
                } else if (isMounted) {
                    setSubCategoriesError('فشل في جلب بيانات الفئات الفرعية');
                }
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                if (isMounted) setSubCategoriesError('حدث خطأ في جلب بيانات الفئات الفرعية');
            } finally {
                if (isMounted) setSubCategoriesLoading(false);
            }
        };

        fetchSubCategories();
        return () => { isMounted = false }
    }, [defaultSubParentId])

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        accessibility: true,
        adaptiveHeight: false,
        swipeToSlide: true,
        touchMove: true,
        cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pauseOnHover: true,
        pauseOnFocus: true,
        pauseOnDotsHover: true,
        waitForAnimate: false,
    }

    // Use banners from API or fallback to default slides
    const slides = banners.length > 0 ? banners.map((banner, index) => ({
        id: index + 1,
        image: getImageUrl(banner),
        title: `بانر ${index + 1}`,
        link: banner.link
    })) : [
        {
            id: 1,
            image: car,
            title: "بيع سيارتك القديمة",
        },
        {
            id: 2,
            image: car,
            title: "أفضل العروض",
        },
        {
            id: 3,
            image: car,
            title: "خدمة متميزة",
        },
    ]

    // Use second banners from API or fallback to default slides
    const secondSlides = secondBanners.length > 0 ? secondBanners.map((banner, index) => ({
        id: index + 1,
        image: getImageUrl(banner),
        title: `بانر إعلاني ${index + 1}`,
        link: banner.link
    })) : [
        {
            id: 1,
            image: car,
            title: "بانر إعلاني",
        },
    ]

    const categories = [
        { id: 1, name: "Earbuds", icon: <img src={image1} alt="image1" className="w-36 h-36" />, items: 150 },
        { id: 2, name: "Laptops", icon: <img src={image2} alt="image2" className="w-36 h-36" />, items: 150 },
        { id: 3, name: "Headphones", icon: <img src={image3} alt="image3" className="w-36 h-36" />, items: 150 },
        { id: 4, name: "Smart Watches", icon: <img src={image4} alt="image4" className="w-36 h-36" />, items: 150 },
        { id: 5, name: "Mobiles", icon: <img src={image5} alt="image5" className="w-36 h-36" />, items: 150 },
        { id: 6, name: "Monitors", icon: <img src={image6} alt="image6" className="w-36 h-36" />, items: 150 },
        { id: 7, name: "Earbuds 2", icon: <img src={image1} alt="image1" className="w-36 h-36" />, items: 150 },
    ];

    const items = [
        {
            id: 1,
            img: phone,
            price: "د.ك 12.000",
            title: "ايفون 16 برو ماكس 2 شريحه",
            location: "الكويت",
            time: "منذ 12 ساعة",
        },
        {
            id: 2,
            img: phone,
            price: "د.ك 12.000",
            title: "ايفون 16 برو ماكس 2 شريحه",
            location: "الكويت",
            time: "منذ 12 ساعة",
        },
        {
            id: 3,
            img: phone,
            price: "د.ك 12.000",
            title: "ايفون 16 برو ماكس 2 شريحه",
            location: "الكويت",
            time: "منذ 12 ساعة",
        },
        {
            id: 4,
            img: phone,
            price: "د.ك 12.000",
            title: "ايفون 16 برو ماكس 2 شريحه",
            location: "الكويت",
            time: "منذ 12 ساعة",
        },
    ];

    return (
        <>

            {/* Navigation */}
            <nav className="  relative px-2 md:px-8 pb-6" ref={navRef}>
                {/* Scrollable strip */}
                <div className="flex space-x-reverse gap-1 md:gap-2 overflow-x-auto whitespace-nowrap nav-scroll scroll-smooth snap-x snap-mandatory touch-pan-x overscroll-x-contain pr-6">
                {navLoading ? (
                    <div className="px-3 py-4 text-gray-500">جاري تحميل الفلاتر...</div>
                ) : navError ? (
                    <div className="px-3 py-4 text-red-600">{navError}</div>
                ) : flattenedNav.length === 0 ? (
                    <div className="px-3 py-4 text-gray-500">لا توجد فئات متاحة</div>
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
                                // Prefetch subcategories for hovered parent
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
                                {/* Category name - Navigate to products page */}
                                <Link 
                                    to={`/products/${cat.id}`}
                                    className="whitespace-nowrap hover:underline"
                                    onClick={(e) => {
                                        e.stopPropagation() // Prevent triggering hover effects
                                    }}
                                >
                                    {cat.name}
                                </Link>
                                
                                {/* Arrow - Toggle dropdown */}
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

                {/* Left/Right gradient masks for a pro look */}
                <div className="nav-gradient-overlay pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white/95 to-transparent" />
                <div className="nav-gradient-overlay pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white/95 to-transparent" />

                {/* Fixed dropdown rendered outside the scroll container to avoid clipping */}
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
                            {/* Brands and Models Filters - Show ONLY for cars category */}
                            {brands.length > 0 && (
                                <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                                    {/* Brand Filter */}
                                    <div className="mb-2">
                                        <select
                                            value={selectedBrand}
                                            onChange={(e) => {
                                                setSelectedBrand(e.target.value)
                                                setSelectedModel('') // Reset model when brand changes
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
                                    
                                    {/* Model Filter - Show only when brand is selected */}
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
                                    {/* Fallback actions */}
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

            <div className="stories-wrapper">
                {!user ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 text-center my-8 shadow-lg max-w-2xl mx-auto">
                        <div className="text-green-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">سجل دخول لعرض الاستوريز</h3>
                        <p className="text-gray-600 mb-6">يجب تسجيل الدخول لمشاهدة القصص والعروض المميزة</p>
                        <Link to="/login" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-bold shadow-md">
                            تسجيل الدخول
                        </Link>
                    </div>
                ) : (
                    <Stories />
                )}
            </div>

            <section id="home" className="relative my-10">
                {/* Hero Banner */}
                <div className="relative">
                    {bannersLoading || !bannersImagesLoaded ? (
                        <div className="relative h-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 overflow-hidden">
                            {/* Enhanced Skeleton Loader */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                                 style={{
                                     backgroundSize: '200% 100%',
                                     animation: 'shimmer 1.5s infinite linear'
                                 }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="relative w-16 h-16 mx-auto mb-4">
                                        <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-gray-600 font-medium animate-pulse">جاري تحميل البانرات...</p>
                                </div>
                            </div>
                        </div>
                    ) : bannersError ? (
                        <div className="relative h-96 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-red-600 mb-4">{bannersError}</p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition"
                                >
                                    إعادة المحاولة
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <Slider {...settings}>
                                {slides.map((slide, index) => (
                                    <div key={slide.id} className="relative">
                                        <div className="relative h-96 overflow-hidden bg-gray-200">
                                            {/* Image with smooth fade-in */}
                                            <img 
                                                src={slide.image || car} 
                                                alt={slide.title} 
                                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                                                style={{ opacity: 1 }}
                                                loading="eager"
                                                fetchPriority={index === 0 ? "high" : "auto"}
                                                onError={(e) => {
                                                    e.target.onerror = null
                                                    e.target.src = car
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-right max-w-96 z-20 animate-slide-in-right">
                                                <h1 className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-loose">{slide.title}</h1>
                                            </div>
                                            {/* Logo overlay */}
                                            <div className="absolute bottom-8 left-8 text-white z-20">
                                                <img src={logo} alt="logo" className="w-30 h-20 drop-shadow-lg" />
                                            </div>
                                            {/* Clickable link overlay */}
                                            {slide.link && (
                                                <a 
                                                    href={slide.link.startsWith('http') ? slide.link : `https://${slide.link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 z-30"
                                                    aria-label={`انتقل إلى ${slide.title}`}
                                                    tabIndex={-1}
                                                    aria-hidden="true"
                                                    role="presentation"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    )}
                </div>
            </section>



            <section className="  py-12 bg-white">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">اقسام فرعية</h2>
                        <p className="text-sm text-gray-500">تسوق احدث المنتجات المميزة المضافة جديد</p>
                    </div>
                    <Link to="/categories" className="flex items-center gap-1 text-sm border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition">
                        عرض الكل
                        <IoIosArrowBack />

                    </Link>
                </div>
                {subCategoriesLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">جاري تحميل الفئات الفرعية...</p>
                        </div>
                    </div>
                ) : subCategoriesError ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{subCategoriesError}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 overflow-x-auto scrollbar-hide">
                            {subCategories.slice(0, 7).map((category) => (
                            <div key={category.id} className="flex flex-col items-center text-center ">
                                <div className="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                                    <img 
                                        src={getImageUrl(category) || phone} 
                                        alt={category.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = phone;
                                        }}
                                    />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-800">{category.name}</h3>
                                <p className="text-xs text-gray-500">{category.adds} إعلان</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Advertising Section - Regular Ads */}
            <section className="py-6 bg-white">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-primary mb-2">إعلانات مقدمه حاليا</h2>
                            <p className="text-gray-600">خدمات واحترافيين موثوقين</p>
                        </div>
                        <Link to={`/products?cat_id=${categoryIds.regular}`} className="flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors duration-300">
                            عرض جميع الإعلانات
                            <IoIosArrowBack />
                        </Link>
                    </div>

                    {/* Business Cards Grid */}
                    <main className="mx-auto py-4">
                        {!user ? (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-12 text-center my-8 shadow-lg">
                                <div className="max-w-md mx-auto">
                                    <div className="text-green-600 mb-4">
                                        <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">سجل دخول لعرض الإعلانات التجارية</h3>
                                    <p className="text-gray-600 mb-6">يجب تسجيل الدخول للوصول إلى الإعلانات التجارية والخدمات</p>
                                    <Link to="/login" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-bold">
                                        تسجيل الدخول
                                    </Link>
                                </div>
                            </div>
                        ) : adsLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-gray-600">جاري تحميل الإعلانات...</p>
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
                        ) : displayedRegularAds.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                لا توجد إعلانات متاحة حالياً
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {displayedRegularAds.map((ad) => {
                                    // Get first image from ad or fallback
                                    const adImage = getImageUrl(ad) || productImage;
                                    
                                    // Get phone numbers - prefer specific fields over general phone
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
                                                    {whatsappNumber ? (
                                                        <a 
                                                            href={`https://wa.me/${whatsappNumber}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
                                                        >
                                                            <FaWhatsapp size={22} />
                                                        </a>
                                                    ) : null}
                                                    {phoneNumber ? (
                                                        <a 
                                                            href={`tel:${phoneNumber}`}
                                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
                                                        >
                                                            <BiPhone size={22} />
                                                        </a>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </section>


            {/* banner */}
            <section className="relative my-10">
                <div className="relative">
                    {secondBannersLoading || !secondBannersImagesLoaded ? (
                        <div className="relative h-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 overflow-hidden">
                            {/* Enhanced Skeleton Loader */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                                 style={{
                                     backgroundSize: '200% 100%',
                                     animation: 'shimmer 1.5s infinite linear'
                                 }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="relative w-16 h-16 mx-auto mb-4">
                                        <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-gray-600 font-medium animate-pulse">جاري تحميل البانرات...</p>
                                </div>
                            </div>
                        </div>
                    ) : secondBannersError ? (
                        <div className="relative h-96 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-red-600 mb-4">{secondBannersError}</p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition"
                                >
                                    إعادة المحاولة
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <Slider {...settings}>
                                {secondSlides.map((slide, index) => (
                                    <div key={slide.id} className="relative">
                                        <div className="relative h-96 overflow-hidden bg-gray-200">
                                            {/* Image with smooth fade-in */}
                                            <img 
                                                src={slide.image || car} 
                                                alt={slide.title} 
                                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                                                style={{ opacity: 1 }}
                                                loading="eager"
                                                fetchPriority={index === 0 ? "high" : "auto"}
                                                onError={(e) => {
                                                    e.target.onerror = null
                                                    e.target.src = car
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-right max-w-96 z-20 animate-slide-in-right">
                                                <h1 className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-loose">{slide.title}</h1>
                                            </div>
                                            {/* Logo overlay */}
                                            <div className="absolute bottom-8 left-8 text-white z-20">
                                                <img src={logo} alt="logo" className="w-30 h-20 drop-shadow-lg" />
                                            </div>
                                            {/* Clickable link overlay */}
                                            {slide.link && (
                                                <a 
                                                    href={slide.link.startsWith('http') ? slide.link : `https://${slide.link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 z-30"
                                                    aria-label={`انتقل إلى ${slide.title}`}
                                                    tabIndex={-1}
                                                    aria-hidden="true"
                                                    role="presentation"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    )}
                </div>
            </section>

            {/* Advertising Section - Commercial Ads */}
            <section className="py-6 bg-white">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-primary mb-2">إعلانات تجاريه</h2>
                            <p className="text-gray-600">خدمات واحترافيين موثوقين</p>
                        </div>
                        <Link to="/advertising" className="flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors duration-300">
                            عرض جميع الإعلانات
                            <IoIosArrowBack />
                        </Link>
                    </div>

                    {/* Business Cards Grid */}
                    <main className="mx-auto py-4">
                        {!user ? (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-12 text-center my-8 shadow-lg">
                                <div className="max-w-md mx-auto">
                                    <div className="text-green-600 mb-4">
                                        <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">سجل دخول لعرض الإعلانات التجارية</h3>
                                    <p className="text-gray-600 mb-6">يجب تسجيل الدخول للوصول إلى الإعلانات والخدمات التجارية</p>
                                    <Link to="/login" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-bold">
                                        تسجيل الدخول
                                    </Link>
                                </div>
                            </div>
                        ) : adsLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-gray-600">جاري تحميل الإعلانات...</p>
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
                        ) : displayedCommercialAds.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                لا توجد إعلانات تجارية متاحة حالياً
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {displayedCommercialAds.map((ad) => {
                                    // Get image from ad or fallback
                                    const adImage = getImageUrl(ad) || productImage;
                                    
                                    // Get phone numbers - prefer specific fields over general phone
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
                                                    {whatsappNumber ? (
                                                        <a 
                                                            href={`https://wa.me/${whatsappNumber}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
                                                        >
                                                            <FaWhatsapp size={22} />
                                                        </a>
                                                    ) : null}
                                                    {phoneNumber ? (
                                                        <a 
                                                            href={`tel:${phoneNumber}`}
                                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
                                                        >
                                                            <BiPhone size={22} />
                                                        </a>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </section>


            {/* category */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">تسوق المنتجات 
                            </h2>
                            <p className="text-sm text-gray-500">تسوق احدث المنتجات المميزة المضافة جديد</p>
                        </div>
                        <Link to={`/products?cat_id=${categoryIds.mobile}`} className="flex items-center gap-1 text-sm border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition">
                            عرض الكل
                            <IoIosArrowBack />
                        </Link>
                    </div>
                    {/* Cards */}
                    {!user ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-12 text-center my-8 shadow-lg">
                            <div className="max-w-md mx-auto">
                                <div className="text-green-600 mb-4">
                                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">سجل دخول لعرض الدراجات النارية</h3>
                                <p className="text-gray-600 mb-6">يجب تسجيل الدخول لمشاهدة المنتجات والعروض المتاحة</p>
                                <Link to="/login" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-bold">
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </div>
                    ) : adsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
                                    <div className="aspect-[4/3] w-full bg-gray-300"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : adsError ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{adsError}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/80 transition"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    ) : displayedMobileAds.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            لا توجد هواتف محمولة متاحة حالياً
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {displayedMobileAds.map((ad) => {
                                const adImage = getImageUrl(ad) || phone;
                                
                                return (
                                    <Link key={ad.id} to={`/product-details/${ad.id}`}>
                                        <article className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
                                    <div className="aspect-[4/3] w-full overflow-hidden">
                                        <img
                                                    src={adImage}
                                                    alt={ad.name}
                                            className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = phone;
                                                    }}
                                        />
                                    </div>

                                    <div className="p-4">
                                                {ad.price && (
                                        <p className="text-primary-600 font-bold text-sm mb-1">
                                                        {ad.price} د.ك
                                        </p>
                                                )}

                                        <h3 className="text-sm font-medium text-gray-900 leading-6 mb-2">
                                                    {ad.name}
                                        </h3>

                                        <div className="text-xs text-gray-500 space-y-1">
                                                    {ad.user?.name && <p>{ad.user.name}</p>}
                                                    {ad.created_at && (
                                                        <p>
                                                            {new Date(ad.created_at).toLocaleDateString('ar-EG', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    )}
                                        </div>
                                    </div>
                                </article>
                            </Link>
                                );
                            })}
                    </div>
                    )}
                </div>
            </section>


            <section className="bg-gray-100 py-20 px-6 md:px-16 rounded-2xl shadow-lg my-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Left Side - Text */}
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Download Our App</h2>
                        <p className="text-gray-600 text-lg">
                            Enjoy all features from your mobile device. Available on iOS, Android, and huawei.
                        </p>
                    </div>

                    {/* Right Side - Download Options */}
                    <div className="flex flex-wrap justify-center md:justify-end gap-4 mt-4 md:mt-0">
                        {/* App Store */}
                        <a
                            href="https://apps.apple.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition transform hover:scale-105"
                        >
                            <img
                                src={appstore}
                                alt="Download on App Store"
                                className="h-12"
                            />
                        </a>

                        {/* Google Play */}
                        <a
                            href="https://play.google.com/store"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition transform hover:scale-105"
                        >
                            <img
                                src={googlePlay}
                                alt="Get it on Google Play"
                                className="h-12"
                            />
                        </a>

                        {/* Huawei AppGallery */}
                        <a
                            href="https://appgallery.huawei.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition transform hover:scale-105"
                        >
                            <img
                                src={huawei}
                                alt="Download on AppGallery"
                                className="h-12"
                            />
                        </a>

                        
                    </div>
                </div>
            </section>

        </>
    )
}

export default Home