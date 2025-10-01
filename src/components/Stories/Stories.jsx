import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import Slider from 'react-slick'
import { FiPlus, FiX, FiUpload, FiHeart, FiVideo, FiImage } from "react-icons/fi";
import { postMultipart, postForm, getJson } from '../../api'
import story1 from "../../assets/story1.jpg"
import story2 from "../../assets/story2.jpg"
import story3 from "../../assets/story3.jpg"
import story4 from "../../assets/story4.jpg"
import story5 from "../../assets/story5.jpg"

// Default stories for fallback
const defaultStories = [
    { id: 2, img: story2 },
    { id: 3, img: story3 },
    { id: 4, img: story4 },
    { id: 5, img: story5 },
];

// Constants - optimized for performance
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const STORY_CACHE_KEY = 'stories_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function Stories({ userId = null, showAddButton = true }) {
    // userId: if provided, show only this user's stories (for profile page)
    // showAddButton: whether to show "Add Story" button (default: true for home page)
    
    // State management
    const [stories, setStories] = useState([])
    const [myStories, setMyStories] = useState([]) // User's own stories
    const [loading, setLoading] = useState(false)
    const [myStoriesLoading, setMyStoriesLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [mediaType, setMediaType] = useState('image')
    const [error, setError] = useState('')
    const [selectedStory, setSelectedStory] = useState(null)
    const [showStoryViewer, setShowStoryViewer] = useState(false)
    const [likedStories, setLikedStories] = useState(new Set())
    const [liking, setLiking] = useState(false)
    const [storyTitle, setStoryTitle] = useState('')
    const [storyDescription, setStoryDescription] = useState('')
    
    // Categories state for dynamic selection
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [categoriesLoading, setCategoriesLoading] = useState(false)
    
    // Refs
    const fileInputRef = useRef(null)
    const abortControllerRef = useRef(null)

    // Get user ID and token from localStorage - Optimized with memoization
    const getUserInfo = useCallback(() => {
        try {
            const userData = localStorage.getItem('user')
            const token = localStorage.getItem('api_token')
            
            if (userData && token) {
                const parsed = JSON.parse(userData)
                return {
                    userId: parsed.id || null,
                    token: token.trim(),
                    userName: parsed.name || 'مستخدم',
                    isLoggedIn: true
                }
            }
        } catch (e) {
            console.error('Error parsing user data:', e)
        }
        return {
            userId: null,
            token: null,
            userName: null,
            isLoggedIn: false
        }
    }, [])
    
    // Memoized user info - prevents unnecessary re-renders
    const userInfo = useMemo(() => getUserInfo(), [getUserInfo])
    
    // Fetch categories from API
    const fetchCategories = useCallback(async () => {
        setCategoriesLoading(true)
        try {
            const response = await getJson('/api/categories')
            if (response?.status && Array.isArray(response.data)) {
                setCategories(response.data)
                // Set first category as default if exists
                if (response.data.length > 0) {
                    setSelectedCategory(response.data[0].id.toString())
                }
            }
        } catch (err) {
            console.error('Error fetching categories:', err)
        } finally {
            setCategoriesLoading(false)
        }
    }, [])
    
    // Fetch user's own stories (or specific user if userId provided)
    const fetchMyStories = useCallback(async () => {
        // If viewing specific user profile, don't fetch current user stories
        if (userId) {
            setMyStories([])
            return
        }
        
        const userInfo = getUserInfo()
        
        if (!userInfo.isLoggedIn) {
            setMyStories([])
            return
        }
        
        setMyStoriesLoading(true)
        try {
            // Use GET method to fetch user's stories (requires authentication)
            const response = await getJson('/api/stories/user')
            
            if (response.status && response.stories?.data) {
                const storiesData = response.stories.data
                
                // Transform user stories
                const transformedStories = storiesData.map(story => ({
                    id: story.id,
                    img: story.media_url || story.thumbnail_url,
                    title: story.title_ar || story.title_en,
                    description_ar: story.description_ar,
                    description_en: story.description_en,
                    user: story.user,
                    category: story.category,
                    expires_at: story.expires_at,
                    created_at: story.created_at,
                    media_type: story.media_type || 'image',
                    views_count: story.views_count || 0,
                    likes_count: story.likes_count || 0,
                    shares_count: story.shares_count || 0,
                    isMyStory: true
                }))
                
                setMyStories(transformedStories)
            } else {
                setMyStories([])
            }
        } catch (err) {
            console.error('Error fetching my stories:', err)
            setMyStories([])
        } finally {
            setMyStoriesLoading(false)
        }
    }, [getUserInfo, userId])

    // Fetch stories from API - Optimized with better error handling
    const fetchStories = useCallback(async (forceRefresh = false) => {
        setLoading(true)
        setError('')
        
        try {
            let response;
            
            if (userId) {
                // Fetch specific user's stories
                response = await postForm('/api/stories', { user_id: userId })
            } else {
                // Fetch all stories from all users using POST method
                response = await postForm('/api/stories', {})
            }
            
            if (response.status && response.stories?.data) {
                const storiesData = response.stories.data
                
                // Transform stories data with full details - optimized
                const transformedStories = storiesData.map(story => ({
                    id: story.id,
                    img: story.media_url || story.thumbnail_url,
                    title: story.title_ar || story.title_en,
                    description_ar: story.description_ar,
                    description_en: story.description_en,
                    user: story.user,
                    category: story.category,
                    expires_at: story.expires_at,
                    created_at: story.created_at,
                    media_type: story.media_type || 'image',
                    views_count: story.views_count || 0,
                    likes_count: story.likes_count || 0,
                    shares_count: story.shares_count || 0,
                    isAddButton: false
                }))
                
                setStories(transformedStories)
            } else {
                // Fallback to default stories
                setStories(defaultStories)
            }
        } catch (err) {
            console.error('Error fetching stories:', err)
            setError('فشل في جلب القصص. يرجى المحاولة مرة أخرى')
            // Fallback to default stories
            setStories(defaultStories)
        } finally {
            setLoading(false)
        }
    }, [userId])

    // Validate file
    const validateFile = useCallback((file) => {
        if (!file) return { valid: false, error: 'لم يتم اختيار ملف' }
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'حجم الملف كبير جداً (الحد الأقصى 50 ميجابايت)' }
        }
        
        // Check file type
        const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type)
        const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type)
        
        if (!isImage && !isVideo) {
            return { valid: false, error: 'نوع الملف غير مدعوم. استخدم صور (JPG, PNG, GIF, WEBP) أو فيديو (MP4, WEBM, OGG)' }
        }
        
        return { valid: true, mediaType: isImage ? 'image' : 'video' }
    }, [])

    // Upload new story with progress
    const uploadStory = useCallback(async () => {
        if (!selectedFile) return

        const userInfo = getUserInfo()
        
        // Check if user is logged in
        if (!userInfo.isLoggedIn) {
            setError('يجب تسجيل الدخول أولاً لرفع قصة')
            return
        }

        // Validate file
        const validation = validateFile(selectedFile)
        if (!validation.valid) {
            setError(validation.error)
            return
        }

        setUploading(true)
        setUploadProgress(0)
        setError('')
        
        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController()
        
        try {
            const formData = new FormData()
            formData.append('media', selectedFile)
            formData.append('media_type', mediaType)
            
            // Use selected category dynamically
            if (selectedCategory) {
                formData.append('category_id', selectedCategory)
            } else if (categories.length > 0) {
                // Fallback to first category if none selected
                formData.append('category_id', categories[0].id.toString())
            } else {
                // Last fallback
                setError('يرجى اختيار تصنيف للقصة')
                setUploading(false)
                return
            }
            
            // Optional: Add title and description if provided
            if (storyTitle.trim()) {
                formData.append('title_ar', storyTitle.trim())
            }
            if (storyDescription.trim()) {
                formData.append('description_ar', storyDescription.trim())
            }

            // Simulate progress (since fetch doesn't support upload progress without XMLHttpRequest)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) return prev
                    return prev + 10
                })
            }, 200)

            const response = await postMultipart('/api/stories/create', formData)
            
            clearInterval(progressInterval)
            setUploadProgress(100)
            
            if (response.status && response.story) {
                // Refresh both my stories and all stories after successful upload
                await Promise.all([
                    fetchMyStories(),
                    fetchStories()
                ])
                
                // Reset form
                resetUploadForm()
                setShowModal(false)
            } else {
                setError(response.msg || 'فشل في رفع القصة')
            }
        } catch (err) {
            console.error('Error uploading story:', err)
            
            // Check if it's an abort
            if (err.name === 'AbortError') {
                setError('تم إلغاء الرفع')
            } else if (err.message.includes('التوكن مطلوب') || err.message.includes('Token required')) {
                setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى')
            } else {
                setError(err.message || 'فشل في رفع القصة')
            }
        } finally {
            setUploading(false)
            setUploadProgress(0)
            abortControllerRef.current = null
        }
    }, [selectedFile, mediaType, storyTitle, storyDescription, fetchStories, fetchMyStories, getUserInfo, validateFile, selectedCategory, categories])
    
    // Reset upload form
    const resetUploadForm = useCallback(() => {
        setSelectedFile(null)
        setPreview(null)
        setStoryTitle('')
        setStoryDescription('')
        setMediaType('image')
        setUploadProgress(0)
        setError('')
        // Reset to first category if available
        if (categories.length > 0) {
            setSelectedCategory(categories[0].id.toString())
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [categories])
    
    // Cancel upload
    const cancelUpload = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        setUploading(false)
        setUploadProgress(0)
    }, [])

    // Handle file selection
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0]
        if (!file) return
        
        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
            setError(validation.error)
            setSelectedFile(null)
            setPreview(null)
            return
        }
        
        setError('')
        setSelectedFile(file)
        setMediaType(validation.mediaType)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(file)
    }, [validateFile])

    // Handle like story
    const handleLikeStory = useCallback(async (storyId) => {
        if (!storyId || storyId === 'add') return

        setLiking(true)
        setError('')
        
        try {
            const userInfo = getUserInfo()
            if (!userInfo.isLoggedIn) {
                setError('يجب تسجيل الدخول أولاً للإعجاب بالقصة')
                return
            }

            const response = await postForm(`/api/stories/${storyId}/like`, {})
            
            if (response.status) {
                // Toggle like state
                setLikedStories(prev => {
                    const newSet = new Set(prev)
                    if (newSet.has(storyId)) {
                        newSet.delete(storyId)
                    } else {
                        newSet.add(storyId)
                    }
                    return newSet
                })
            } else {
                setError(response.msg || 'فشل في الإعجاب بالقصة')
            }
        } catch (err) {
            console.error('Error liking story:', err)
            setError('فشل في الإعجاب بالقصة: ' + err.message)
        } finally {
            setLiking(false)
        }
    }, [getUserInfo])

    // Handle story click
    const handleStoryClick = useCallback((story) => {
        if (story.add) {
            const userInfo = getUserInfo()
            if (!userInfo.isLoggedIn) {
                setError('يجب تسجيل الدخول أولاً لإضافة قصة')
                return
            }
            // Fetch categories when opening modal if not loaded
            if (categories.length === 0) {
                fetchCategories()
            }
            setShowModal(true)
        } else {
            setSelectedStory(story)
            setShowStoryViewer(true)
        }
    }, [getUserInfo, categories.length, fetchCategories])

    // Load stories on component mount and when user changes
    useEffect(() => {
        fetchStories()
        fetchMyStories() // Load user's own stories if logged in
    }, [fetchStories, fetchMyStories])

    // Listen for storage changes (login/logout) - Enhanced
    useEffect(() => {
        const handleStorageChange = (e) => {
            // Refresh when user logs in or out
            if (e.key === 'user' || e.key === 'api_token') {
                console.log('User auth changed, refreshing stories...')
                fetchStories()
                fetchMyStories() // Refresh user's stories
            }
        }
        
        // Also listen for custom login event
        const handleLoginEvent = () => {
            console.log('Login event detected, refreshing stories...')
            setTimeout(() => {
                fetchStories()
                fetchMyStories()
            }, 500) // Small delay to ensure token is saved
        }
        
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('userLoggedIn', handleLoginEvent)
        window.addEventListener('userLoggedOut', handleLoginEvent)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('userLoggedIn', handleLoginEvent)
            window.removeEventListener('userLoggedOut', handleLoginEvent)
        }
    }, [fetchStories, fetchMyStories])
    
    // Force re-render when user info changes
    useEffect(() => {
        console.log('User info updated:', userInfo.isLoggedIn ? 'Logged in' : 'Logged out')
    }, [userInfo])

    // Slider settings - memoized for performance
    const settings = useMemo(() => ({
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 8,
        slidesToScroll: 1,
        arrows: true,
        rtl: true,
        initialSlide: 0,
        swipeToSlide: true,
        variableWidth: false,
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 6,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            }
        ]
    }), []);

    // Check if user is logged in - memoized with proper dependency
    const isUserLoggedIn = useMemo(() => {
        return userInfo.isLoggedIn
    }, [userInfo])
    
    // Combine user stories with add button at the start - Fixed logic with debugging
    const combinedStories = useMemo(() => {
        const allStories = []
        
        console.log('=== Combining Stories ===')
        console.log('showAddButton:', showAddButton)
        console.log('userId:', userId)
        console.log('isUserLoggedIn:', userInfo.isLoggedIn)
        console.log('myStories count:', myStories.length)
        console.log('stories count:', stories.length)
        
        // Add "Add Story" button ALWAYS for home page (not profile view)
        // This button should ALWAYS appear when on home page
        if (showAddButton && !userId) {
            console.log('✅ Adding "Add Story" button')
            allStories.push({ 
                id: 'add', 
                add: true, 
                isAddButton: true, 
                img: story1,
                user: { name: userInfo.userName || 'أضف قصة' }
            })
        } else {
            console.log('❌ NOT adding "Add Story" button - conditions not met')
        }
        
        // Add user's own stories (only for home page, not profile view)
        if (!userId && myStories.length > 0) {
            console.log(`✅ Adding ${myStories.length} user stories`)
            allStories.push(...myStories)
        }
        
        // Add all other stories (filter out any duplicate add buttons)
        const otherStories = stories.filter(s => !s.isAddButton && s.id !== 'add')
        console.log(`✅ Adding ${otherStories.length} other stories`)
        allStories.push(...otherStories)
        
        console.log('Total combined stories:', allStories.length)
        console.log('======================')
        
        return allStories
    }, [stories, myStories, showAddButton, userId, userInfo])

    return (
        <>
            <div dir="rtl" className="w-full me-auto">
                {(loading || myStoriesLoading) ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                ) : combinedStories.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                        <p className="text-gray-500">لا توجد قصص متاحة</p>
                    </div>
                ) : (
                    <Slider {...settings} key={`slider-${combinedStories.length}-${isUserLoggedIn ? 'logged' : 'guest'}`}>
                        {combinedStories.map((story, index) => (
                            <div key={`${story.id}-${index}`} className="px-2 py-5">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-[3px] mx-auto ${
                                            story.add
                                                ? "border-dashed border-green-600 bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:from-green-100 hover:to-green-200 shadow-lg hover:shadow-2xl"
                                                : story.isMyStory
                                                ? "border-blue-500 border-4 cursor-pointer shadow-lg hover:border-blue-600"
                                                : "border-green-500 cursor-pointer hover:border-green-600"
                                        } flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                                        onClick={() => handleStoryClick(story)}
                                        title={story.add ? "أضف قصة جديدة" : story.user?.name || ""}
                                    >
                                        {story.add ? (
                                            // Add Story Button - Enhanced Design
                                            <div className="flex items-center justify-center w-full h-full rounded-full relative">
                                                <FiPlus size={48} className="text-green-600 animate-pulse" strokeWidth={3} />
                                                {isUserLoggedIn && (
                                                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                                                        +
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // Regular Story
                                            <>
                                                <img
                                                    src={story.img}
                                                    alt={story.title || story.user?.name || "story"}
                                                    className="w-full h-full object-cover rounded-full"
                                                    onError={(e) => {
                                                        e.target.src = story1 // Fallback image
                                                    }}
                                                />
                                                {/* Video indicator */}
                                                {story.media_type === 'video' && (
                                                    <div className="absolute top-0 left-0 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                                                        <FiVideo size={14} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {/* Display user name below story */}
                                    {story.add ? (
                                        <p className="text-xs text-green-600 mt-2 text-center font-medium">
                                            أضف قصة
                                        </p>
                                    ) : story.isMyStory ? (
                                        <p className="text-xs text-blue-600 mt-2 text-center font-bold">
                                            قصتك
                                        </p>
                                    ) : story.user?.name ? (
                                        <p className="text-xs text-gray-700 mt-2 text-center truncate max-w-[80px] sm:max-w-[96px] font-medium">
                                            {story.user.name}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </Slider>
                )}
                
                {error && (
                    <div className="text-center text-red-500 text-sm py-2">
                        {error}
                        {error.includes('تسجيل الدخول') && (
                            <div className="mt-2">
                                <a 
                                    href="/login" 
                                    className="text-green-500 hover:text-green-600 underline"
                                >
                                    تسجيل الدخول
                                </a>
                            </div>
                        )}
                        {!error.includes('تسجيل الدخول') && (
                            <div className="mt-2">
                                <button
                                    onClick={fetchStories}
                                    className="text-green-500 hover:text-green-600 underline"
                                >
                                    إعادة المحاولة
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Story Viewer Modal - Full Screen Gallery with Video Support */}
            {showStoryViewer && selectedStory && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    {/* Header with user info and close button */}
                    <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black to-transparent">
                        {/* User info */}
                        {selectedStory.user && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shadow-lg">
                                    {selectedStory.user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{selectedStory.user.name}</p>
                                    {selectedStory.expires_at && (
                                        <p className="text-gray-300 text-xs">
                                            {new Date(selectedStory.expires_at).toLocaleDateString('ar-EG')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setShowStoryViewer(false)
                                setSelectedStory(null)
                            }}
                            className="bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-full p-3 hover:bg-opacity-20 transition-all"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Main content area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        {/* Story media - takes most of the screen */}
                        <div className="w-full max-w-4xl h-full flex items-center justify-center">
                            {selectedStory.media_type === 'video' ? (
                                <video
                                    src={selectedStory.img}
                                    controls
                                    autoPlay
                                    loop
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    onError={(e) => {
                                        console.error('Video load error')
                                        e.target.poster = story1
                                    }}
                                >
                                    المتصفح لا يدعم تشغيل الفيديو
                                </video>
                            ) : (
                                <img
                                    src={selectedStory.img}
                                    alt={selectedStory.title || selectedStory.user?.name || "story"}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    onError={(e) => {
                                        e.target.src = story1 // Fallback image
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer with title, description and like button */}
                    <div className="bg-gradient-to-t from-black to-transparent p-6">
                        {/* Story title and description */}
                        {(selectedStory.title || selectedStory.description_ar) && (
                            <div className="text-center mb-4 max-w-2xl mx-auto">
                                {selectedStory.title && (
                                    <h4 className="text-white text-xl font-bold mb-2">{selectedStory.title}</h4>
                                )}
                                {selectedStory.description_ar && (
                                    <p className="text-gray-300 text-sm">{selectedStory.description_ar}</p>
                                )}
                            </div>
                        )}
                        
                        {/* Like button - separate and prominent */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => handleLikeStory(selectedStory.id)}
                                disabled={liking}
                                className={`px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-3 shadow-xl ${
                                    likedStories.has(selectedStory.id)
                                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-105'
                                        : 'bg-white bg-opacity-20 backdrop-blur-sm text-white hover:bg-opacity-30'
                                } ${liking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                            >
                                <FiHeart 
                                    size={28} 
                                    className={`transition-all duration-300 ${
                                        likedStories.has(selectedStory.id) ? 'fill-current animate-pulse' : ''
                                    }`}
                                />
                                <span className="text-lg font-bold">
                                    {liking ? 'جاري الإعجاب...' : 
                                     likedStories.has(selectedStory.id) ? 'تم الإعجاب' : 'إعجاب'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal - Enhanced */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-xl">
                            <h3 className="text-xl font-bold text-gray-800">إضافة قصة جديدة</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    resetUploadForm()
                                }}
                                disabled={uploading}
                                className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {!selectedFile ? (
                                // File Selection Area
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-all">
                                    <div className="flex justify-center gap-4 mb-4">
                                        <FiImage className="text-green-500" size={40} />
                                        <FiVideo className="text-green-500" size={40} />
                                    </div>
                                    <p className="text-gray-700 font-medium mb-2">اختر صورة أو فيديو للقصة</p>
                                    <p className="text-gray-500 text-sm mb-4">
                                        الصور: JPG, PNG, GIF, WEBP<br/>
                                        الفيديو: MP4, WEBM, OGG<br/>
                                        الحد الأقصى: 50 ميجابايت
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="story-upload"
                                    />
                                    <label
                                        htmlFor="story-upload"
                                        className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-green-600 transition-all transform hover:scale-105"
                                    >
                                        <FiUpload size={20} />
                                        <span className="font-medium">اختر ملف</span>
                                    </label>
                                </div>
                            ) : (
                                // Preview and Upload Form
                                <div className="space-y-4">
                                    {/* Preview */}
                                    <div className="relative rounded-xl overflow-hidden bg-gray-100">
                                        {mediaType === 'image' ? (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-full h-64 object-cover"
                                            />
                                        ) : (
                                            <video
                                                src={preview}
                                                controls
                                                className="w-full h-64 object-cover"
                                            />
                                        )}
                                        {!uploading && (
                                            <button
                                                onClick={resetUploadForm}
                                                className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all shadow-lg"
                                            >
                                                <FiX size={20} />
                                            </button>
                                        )}
                                        {/* Media Type Badge */}
                                        <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                            {mediaType === 'image' ? <FiImage size={16} /> : <FiVideo size={16} />}
                                            <span>{mediaType === 'image' ? 'صورة' : 'فيديو'}</span>
                                        </div>
                                    </div>

                                    {/* Category Selection - Required */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            التصنيف <span className="text-red-500">*</span>
                                        </label>
                                        {categoriesLoading ? (
                                            <div className="flex items-center justify-center py-3 text-gray-500">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 ml-2"></div>
                                                جاري تحميل التصنيفات...
                                            </div>
                                        ) : categories.length > 0 ? (
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                disabled={uploading}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name_ar || cat.name_en || cat.name || `تصنيف ${cat.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-red-500 text-sm text-center py-2">
                                                فشل في تحميل التصنيفات
                                                <button
                                                    onClick={fetchCategories}
                                                    className="text-green-500 hover:text-green-600 underline mr-2"
                                                >
                                                    إعادة المحاولة
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Title Input (Optional) */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            العنوان (اختياري)
                                        </label>
                                        <input
                                            type="text"
                                            value={storyTitle}
                                            onChange={(e) => setStoryTitle(e.target.value)}
                                            placeholder="أضف عنواناً لقصتك..."
                                            disabled={uploading}
                                            maxLength={100}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1 text-right">
                                            {storyTitle.length}/100
                                        </p>
                                    </div>

                                    {/* Description Input (Optional) */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            الوصف (اختياري)
                                        </label>
                                        <textarea
                                            value={storyDescription}
                                            onChange={(e) => setStoryDescription(e.target.value)}
                                            placeholder="أضف وصفاً لقصتك..."
                                            disabled={uploading}
                                            maxLength={500}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1 text-right">
                                            {storyDescription.length}/500
                                        </p>
                                    </div>

                                    {/* Upload Progress */}
                                    {uploading && uploadProgress > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>جاري الرفع...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-green-500 h-full transition-all duration-300 ease-out"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload/Cancel Buttons */}
                                    <div className="flex gap-3">
                                        {uploading ? (
                                            <button
                                                onClick={cancelUpload}
                                                className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-all font-medium"
                                            >
                                                إلغاء الرفع
                                            </button>
                                        ) : (
                                            <button
                                                onClick={uploadStory}
                                                className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 font-medium shadow-lg"
                                            >
                                                نشر القصة
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Stories