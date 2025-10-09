import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { FiPhoneCall } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocation } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import iconchick from "../../assets/icon.svg"
import icon1 from "../../assets/icon1.png"
import icon2 from "../../assets/icon2.png"
import icon3 from "../../assets/icon3.png"
import icon4 from "../../assets/icon4.png"
import icon5 from "../../assets/icon5.png"
import icon6 from "../../assets/icon6.png"
import mapPlaceholder from "../../assets/mapPlaceholder.png"
import phone from '../../assets/phone.png'
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { getJson, postForm } from "../../api";
import RatingModal from "../RatingModal/RatingModal";

// Helper function to get image URL from all possible sources (same as Home.jsx)
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

// Helper function to get all images from advertisement (extract all images from images array)
const getAllImages = (advData) => {
    if (!advData) {
        console.log('⚠️ getAllImages: advData is null/undefined');
        return [phone];
    }
    
    const images = [];
    
    console.log('🔍 getAllImages: Extracting all images from advData:', advData.id);
    
    // Extract ALL images from images array (not just first one)
    if (Array.isArray(advData.images) && advData.images.length > 0) {
        console.log(`📸 Found ${advData.images.length} image objects in advData.images`);
        
        advData.images.forEach((imageObj, index) => {
            let imgUrl = null;
            
            // Try different possible keys (same as getImageUrl but for each image)
            if (imageObj?.img) {
                imgUrl = imageObj.img;
                console.log(`  ✅ Image ${index + 1}: Found in 'img' key:`, imgUrl);
            } else if (imageObj?.image) {
                imgUrl = imageObj.image;
                console.log(`  ✅ Image ${index + 1}: Found in 'image' key:`, imgUrl);
            } else {
                console.log(`  ⚠️ Image ${index + 1}: No valid image URL found`, imageObj);
            }
            
            if (imgUrl) {
                // Ensure full URL (same logic as getImageUrl)
                const fullUrl = imgUrl.startsWith('http') 
                    ? imgUrl 
                    : `https://lay6ofk.com${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
                images.push(fullUrl);
            }
        });
    } else {
        console.log('⚠️ No images array found or empty in advData');
    }
    
    // If no images found, use fallback (same as Home.jsx uses || phone)
    if (images.length === 0) {
        console.log('⚠️ No images extracted, using fallback image');
        images.push(phone);
    } else {
        console.log(`✅ Successfully extracted ${images.length} images`);
    }
    
    return images;
}

const NextArrow = (props) => {
    const { onClick } = props;
    return (
        <div
            onClick={onClick}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-400 text-white p-2 rounded-full cursor-pointer hover:bg-gray-500 z-10"
        >
            <MdArrowForwardIos />
        </div>
    );
};

const PrevArrow = (props) => {
    const { onClick } = props;
    return (
        <div
            onClick={onClick}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-400 text-white p-2 rounded-full cursor-pointer hover:bg-gray-500 z-10"
        >
            <MdArrowBackIosNew />
        </div>
    );
};

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'منذ لحظات';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    return `منذ ${Math.floor(diffInSeconds / 2592000)} شهر`;
};

// Helper function to get adv input value by input_id
const getAdvInputValue = (advInputs, inputId) => {
    if (!Array.isArray(advInputs)) return null;
    const input = advInputs.find(item => item.input_id === inputId);
    return input?.input_value || null;
};

// Helper function to get all values for a specific input_id (for checkboxes)
const getAdvInputValues = (advInputs, inputId) => {
    if (!Array.isArray(advInputs)) return [];
    return advInputs
        .filter(item => item.input_id === inputId)
        .map(item => item.input_value);
};

// Helper function to check if user is verified using is_verified field
const isUserVerified = (user) => {
    if (!user) return false;
    // Check is_verified field (the correct field from API)
    return user.is_verified === 1 || user.is_verified === '1' || user.is_verified === true;
};

function ProductDetails() {
    const { id } = useParams(); // Get product ID from URL
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [advData, setAdvData] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [showRatingModal, setShowRatingModal] = useState(false);

    // Fetch advertisement details from API
    useEffect(() => {
        if (!id) {
            setError('معرف الإعلان غير موجود');
            setLoading(false);
            return;
        }

        const fetchAdvDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch advertisement details
                const response = await getJson(`/api/adv/${id}`);
                
                if (response?.status && response?.data) {
                    setAdvData(response.data);
                    
                    // Fetch related products from same category
                    if (response.data.cat_id) {
                        try {
                            const relatedResponse = await getJson(`/api/adv_by_cat?cat_id=${response.data.cat_id}`);
                            if (relatedResponse?.status && Array.isArray(relatedResponse.data)) {
                                // Filter out current product and limit to 4 products
                                const filtered = relatedResponse.data
                                    .filter(item => item.id !== parseInt(id))
                                    .slice(0, 4);
                                setRelatedProducts(filtered);
                            }
                        } catch (e) {
                            console.warn('Failed to fetch related products:', e);
                        }
                    }
                } else {
                    setError('فشل في تحميل بيانات الإعلان');
                }
            } catch (err) {
                console.error('Error fetching advertisement:', err);
                setError('حدث خطأ أثناء تحميل الإعلان');
            } finally {
                setLoading(false);
            }
        };

        fetchAdvDetails();
    }, [id]);

    // Increase views count every time user opens the advertisement
    useEffect(() => {
        if (!id || !advData) return;

        const increaseViews = async () => {
            try {
                console.log('📊 Increasing view count for ad:', id);
                const response = await postForm('/api/increase-views', {
                    id: id
                });
                
                if (response?.status) {
                    console.log('✅ View count increased successfully');
                    
                    // Update the local view count immediately
                    setAdvData(prev => ({
                        ...prev,
                        views: (prev.views || 0) + 1
                    }));
                } else {
                    console.warn('⚠️ Failed to increase view count:', response);
                }
            } catch (err) {
                console.error('❌ Error increasing view count:', err);
            }
        };

        // Small delay to ensure user actually viewed the content
        const viewTimer = setTimeout(increaseViews, 1000);

        return () => clearTimeout(viewTimer);
    }, [id, advData]);

    // Check if user returned from WhatsApp/Phone call and show rating modal
    useEffect(() => {
        if (!id || !advData) return;

        let userLeftPage = false;
        let blurTime = null;

        const handleWindowBlur = () => {
            console.log('👋 Window blurred - User left the page');
            userLeftPage = true;
            blurTime = Date.now();
        };

        const handleWindowFocus = () => {
            console.log('👁️ Window focused - User returned to the page');
            
            // Only process if user actually left the page (blur was triggered)
            if (!userLeftPage) {
                console.log('⚠️ User never left - probably just a refresh');
                return;
            }
            
            const contactTime = sessionStorage.getItem('whatsapp_visit_time');
            const currentTime = Date.now();
            
            console.log('⏰ Contact time:', contactTime);
            console.log('⏰ Blur time:', blurTime);
            console.log('⏰ Current time:', currentTime);
            
            if (contactTime && blurTime) {
                const timeDiff = currentTime - parseInt(contactTime);
                const awayDuration = currentTime - blurTime;
                
                console.log('⏰ Time since contact click (seconds):', timeDiff / 1000);
                console.log('⏰ Time away from page (seconds):', awayDuration / 1000);
                
                // Check if:
                // 1. Contact button was clicked recently (< 5 minutes)
                // 2. User was away for at least 5 seconds (to ensure real interaction)
                // 3. Total time since click is reasonable (< 5 minutes)
                if (timeDiff > 5000 && timeDiff < 300000 && awayDuration > 5000) {
                    const contactSessionKey = `contact_session_${contactTime}`;
                    const ratingShownForThisSession = sessionStorage.getItem(contactSessionKey);
                    
                    console.log('✅ Should show rating modal:', !ratingShownForThisSession);
                    console.log('🔑 Contact session key:', contactSessionKey);
                    
                    if (!ratingShownForThisSession) {
                        console.log('🌟 Showing rating modal in 1.5 seconds...');
                        setTimeout(() => {
                            setShowRatingModal(true);
                            sessionStorage.setItem(contactSessionKey, 'true');
                            sessionStorage.removeItem('whatsapp_visit_time');
                        }, 1500);
                    } else {
                        console.log('⚠️ Rating already shown for this contact session');
                    }
                } else if (awayDuration <= 5000) {
                    console.log('⚠️ Too quick - user was away for less than 5 seconds');
                } else if (timeDiff <= 5000) {
                    console.log('⚠️ Contact button was clicked too recently');
                } else {
                    console.log('⚠️ Too much time passed (> 5 minutes)');
                    sessionStorage.removeItem('whatsapp_visit_time');
                }
            }
            
            // Reset the flag
            userLeftPage = false;
            blurTime = null;
        };

        // Add window focus/blur listeners
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [id, advData]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الإعلان...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !advData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ في التحميل</h2>
                    <p className="text-gray-600 mb-4">{error || 'لم يتم العثور على الإعلان'}</p>
                    <Link to="/products" className="text-primary hover:underline">
                        العودة إلى المنتجات
                    </Link>
                </div>
            </div>
        );
    }

    // Extract images using the same logic as Home.jsx
    const images = getAllImages(advData);

    // Slider settings - disable navigation if only one image
    const sliderSettings = {
        dots: images.length > 1,
        infinite: images.length > 1,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: images.length > 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        swipe: images.length > 1,
        draggable: images.length > 1,
    };

    // Extract user info
    const userName = advData.user?.name || 'مستخدم';
    const userCreatedAt = advData.user?.created_at;
    const memberSince = userCreatedAt ? new Date(userCreatedAt).getFullYear() : '2020';
    
    // Debug: Log ALL user data to find verification field
    // Verification status check
    console.log('🔍 User verification:', {
        userName: userName,
        is_verified: advData.user?.is_verified,
        suspend: advData.user?.suspend,
        isVerified: isUserVerified(advData.user)
    });

    // Extract category
    const categoryName = advData.category?.name_ar || advData.category?.name_en || 'غير محدد';

    // Build dynamic information items based on adv_inputs with icons from API
    const buildInfoItems = () => {
        const items = [];
        const advInputs = advData.adv_inputs || [];
        
        console.log('🔍 Building info items from', advInputs.length, 'inputs');
        
        // Group inputs by input_id to handle multiple values (checkboxes)
        const groupedInputs = {};
        advInputs.forEach(input => {
            if (!groupedInputs[input.input_id]) {
                groupedInputs[input.input_id] = [];
            }
            groupedInputs[input.input_id].push(input);
        });
        
        console.log('📊 Grouped inputs:', Object.keys(groupedInputs).length, 'unique input types');
        
        // Process each group
        Object.entries(groupedInputs).forEach(([inputId, inputs]) => {
            const firstInput = inputs[0];
            const categoryItem = firstInput.category_item;
            
            if (!categoryItem) {
                console.warn('⚠️ No category_item for input_id:', inputId);
                return;
            }
            
            const label = categoryItem.name_ar || categoryItem.name_en || 'غير محدد';
            const icon = categoryItem.icon || icon1;
            const ordered = categoryItem.ordered || 999;
            const checkBox = categoryItem.check_box;
            
            // Check if multiple values (checkbox type)
            if (inputs.length > 1 || checkBox === 1) {
                // Multiple values - join them
                const values = inputs.map(inp => inp.input_value).filter(Boolean);
                if (values.length > 0) {
                    console.log(`  ✅ ${label}:`, values.join(' • '), `(icon: ${icon ? '✓' : '✗'})`);
                    items.push({
                        label: label,
                        value: values.join(' • '),
                        icon: icon,
                        ordered: ordered,
                        fullWidth: true // Multiple values take full width
                    });
                }
            } else {
                // Single value
                const value = firstInput.input_value;
                if (value) {
                    console.log(`  ✅ ${label}: ${value}`, `(icon: ${icon ? '✓' : '✗'})`);
                    items.push({
                        label: label,
                        value: value,
                        icon: icon,
                        ordered: ordered
                    });
                }
            }
        });
        
        // Sort by ordered field (to match API ordering)
        items.sort((a, b) => a.ordered - b.ordered);
        
        console.log('✅ Built', items.length, 'info items');
        
        return items;
    };

    const infoItems = buildInfoItems();

    return (
        <>
            <div className="">
                <div className="mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-6">
                        {/* Image Slider or Single Image */}
                        <div className="bg-white rounded-lg shadow-sm border p-9 relative">
                            {advData.vip_date > 0 && (
                                <span className="absolute top-3 right-3 bg-yellow-400 text-xs px-4 py-1 rounded z-10">
                                    مميز
                                </span>
                            )}

                            {/* Show single image without slider if only one image */}
                            {images.length === 1 ? (
                                <div className="w-full h-[300px] md:h-[600px] rounded-md overflow-hidden">
                                    <img
                                        src={images[0]}
                                        alt={advData.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = phone;
                                        }}
                                    />
                                </div>
                            ) : (
                                /* Slider for multiple images */
                                <Slider {...sliderSettings} className="rounded-md">
                                    {images.map((src, index) => (
                                        <div key={index} className="w-full h-[300px] md:h-[600px]">
                                            <img
                                                src={src}
                                                alt={`${advData.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = phone;
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Slider>
                            )}
                        </div>

                        {/* Title and Price */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{advData.name}</h1>
                            <div className="flex items-center justify-between">
                                <p className="text-3xl font-bold text-primary">د.ك {advData.price?.toLocaleString()}</p>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">{formatDate(advData.created_at)}</p>
                                    {/* Views Count */}
                                    {advData.views > 0 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span className="text-sm text-gray-500 font-medium">{advData.views} مشاهدة</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        {infoItems.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border overflow-hidden p-4">
                                <h3 className="text-gray-700 font-bold py-4">المعلومات</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    {infoItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`flex justify-between items-center rounded-md ${
                                                index % 2 === 0 ? "bg-gray-100" : "bg-white"
                                            } p-3 ${item.fullWidth ? 'col-span-full' : ''}`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {item.icon && (
                                                    <img 
                                                        src={item.icon} 
                                                        alt={item.label} 
                                                        className="w-5 h-5 flex-shrink-0 object-contain"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <p className="text-gray-500 truncate">{item.label}</p>
                                            </div>
                                            <p className="font-medium text-end text-wrap">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {advData.description && (
                            <div className="bg-white rounded-lg shadow-sm border p-4">
                                <h3 className="text-gray-700 font-bold mb-3">الوصف</h3>
                                <p className="text-sm text-gray-600 leading-6 whitespace-pre-line">
                                    {advData.description}
                                </p>
                            </div>
                        )}

                        {/* Location */}
                        {advData.place_id && (
                            <div className="bg-white rounded-lg shadow-sm border p-4">
                                <h3 className="text-gray-700 font-bold mb-3">الموقع</h3>
                                <p className="text-sm text-gray-600 leading-6 mb-2 flex items-center gap-2">
                                    <IoLocation /> {categoryName}
                                </p>
                                <img 
                                    src={mapPlaceholder} 
                                    alt="map" 
                                    className="w-full h-60 object-cover rounded-md" 
                                />
                            </div>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        {/* Views Count Card */}
                        {advData.views > 0 && (
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <h3 className="font-bold text-gray-700 mb-3">عدد المشاهدات</h3>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="text-2xl font-bold text-primary">{advData.views}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">مشاهدة</p>
                                </div>
                            </div>
                        )}

                        {/* Publisher Card */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="font-bold text-gray-700 mb-3">عن الناشر</h3>
                            <div className="">
                                <div className="flex items-center gap-1">
                                    <p className="text-sm font-medium">{userName}</p>
                                    {/* Show verification icon only if user is verified AND not suspended */}
                                    {isUserVerified(advData.user) && advData.user?.suspend === 0 && (
                                        <img src={iconchick} alt="موثق" title="حساب موثق" className="w-7 h-7" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">عضو منذ {memberSince}</p>
                            </div>
                            
                            {/* WhatsApp Button */}
                            {advData.whatsapp && (
                                <a 
                                    href={`https://wa.me/${advData.whatsapp.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-500 text-white text-sm rounded-lg py-2 mt-2 flex items-center justify-center gap-2 hover:bg-green-600"
                                    onClick={() => {
                                        // Track WhatsApp visit time
                                        const currentTime = Date.now().toString();
                                        sessionStorage.setItem('whatsapp_visit_time', currentTime);
                                        console.log('📱 WhatsApp clicked! Time saved:', currentTime);
                                        console.log('📱 SessionStorage:', sessionStorage.getItem('whatsapp_visit_time'));
                                    }}
                                >
                                    <FaWhatsapp /> واتساب
                                </a>
                            )}
                            
                            {/* Phone Button */}
                            {advData.phone && (
                                <a 
                                    href={`tel:${advData.phone}`}
                                    className="w-full bg-blue-500 text-white text-sm rounded-lg py-2 mt-2 flex items-center justify-center gap-2 hover:bg-blue-600"
                                    onClick={() => {
                                        // Track phone call time
                                        const currentTime = Date.now().toString();
                                        sessionStorage.setItem('whatsapp_visit_time', currentTime);
                                        console.log('📞 Phone clicked! Time saved:', currentTime);
                                        console.log('📞 SessionStorage:', sessionStorage.getItem('whatsapp_visit_time'));
                                    }}
                                >
                                    <FiPhoneCall /> اتصال: {advData.phone}
                                </a>
                            )}
                        </div>

                        {/* Safety Tips */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="font-extrabold text-gray-700 mb-3">سلامتك تهمنا</h3>
                            <ul className="list-disc pr-5 text-sm text-gray-600 space-y-2">
                                <li>قابل البايع في مكان عام زي المترو أو المولات أو محطات البنزين</li>
                                <li>خد حد معاك وانت رايح تقابل البايع أو المشتري</li>
                                <li>لا ترسل أموال قبل التأكد من المنتج</li>
                                <li>افحص المنتج جيداً قبل الشراء</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="py-12">
                    <div className="mx-auto px-4">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{categoryName}</h2>
                                <p className="text-sm text-gray-500">تسوق احدث المنتجات المميزة المضافة جديد</p>
                            </div>
                            <Link 
                                to={`/products/${advData.cat_id}`}
                                className="flex items-center gap-1 text-sm border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition"
                            >
                                عرض الكل
                                <IoIosArrowBack />
                            </Link>
                        </div>
                        
                        {/* Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((item) => {
                                // Use the same getImageUrl function for consistency
                                const itemImage = getImageUrl(item) || phone;
                                return (
                                    <Link to={`/product-details/${item.id}`} key={item.id}>
                                        <article className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
                                            <div className="aspect-[4/3] w-full overflow-hidden">
                                                <img
                                                    src={itemImage}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = phone;
                                                    }}
                                                />
                                            </div>

                                            <div className="p-4">
                                                <p className="text-primary-600 font-bold text-sm mb-1">
                                                    د.ك {item.price?.toLocaleString()}
                                                </p>

                                                <h3 className="text-sm font-medium text-gray-900 leading-6 mb-2">
                                                    {item.name}
                                                </h3>

                                                <div className="text-xs text-gray-500 space-y-1">
                                                    <p>{categoryName}</p>
                                                    <p>{formatDate(item.created_at)}</p>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Rating Modal */}
            {showRatingModal && advData && (
                <RatingModal
                    isOpen={showRatingModal}
                    onClose={() => setShowRatingModal(false)}
                    advertiserId={advData.user?.id}
                    advId={advData.id}
                />
            )}
        </>
    );
}

export default ProductDetails;
