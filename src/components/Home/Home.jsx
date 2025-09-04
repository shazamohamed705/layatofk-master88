import React, { useState } from 'react'
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

function Home() {

    const [hoveredCategory, setHoveredCategory] = useState(null);

    // Navigation categories with dropdown data
    const navigationCategories = [

        {
            id: 'real-estate',
            name: 'عقارات',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'شقق للبيع',
                'شقق للإيجار',
                'فيلات للبيع',
                'فيلات للإيجار',
                'أراضي للبيع',
                'مكاتب تجارية',
                'محلات تجارية'
            ]
        },
        {
            id: 'services',
            name: 'خدمات',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'خدمات منزلية',
                'خدمات تجارية',
                'خدمات تعليمية',
                'خدمات طبية',
                'خدمات قانونية',
                'خدمات سياحية'
            ]
        },
        {
            id: 'vehicles',
            name: 'محركات',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'سيارات للبيع',
                'سيارات للإيجار',
                'دراجات نارية',
                'قوارب ويخوت',
                'قطع غيار سيارات',
                'خدمات صيانة'
            ]
        },
        {
            id: 'car-agencies',
            name: 'وكالات السيارات',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'وكالات رسمية',
                'معارض سيارات',
                'سيارات جديدة',
                'سيارات مستعملة',
                'خدمات التمويل',
                'خدمات التأمين'
            ]
        },
        {
            id: 'security',
            name: 'كاميرات مراقبة',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'أنظمة مراقبة منزلية',
                'أنظمة مراقبة تجارية',
                'كاميرات IP',
                'كاميرات لاسلكية',
                'أجهزة تسجيل',
                'خدمات التركيب'
            ]
        },
        {
            id: 'contractors',
            name: 'مقاولات وحرف',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'مقاولات بناء',
                'مقاولات كهرباء',
                'مقاولات سباكة',
                'مقاولات دهان',
                'مقاولات بلاط',
                'مقاولات نجارة'
            ]
        },
        {
            id: 'ac',
            name: 'تكييف',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'تكييف مركزي',
                'تكييف سبليت',
                'تكييف شباك',
                'صيانة تكييف',
                'تنظيف تكييف',
                'قطع غيار تكييف'
            ]
        },
        {
            id: 'inspection',
            name: 'أعمال ومعاينة',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'معاينة عقارات',
                'معاينة سيارات',
                'فحص جودة',
                'تقارير فنية',
                'استشارات هندسية',
                'تقييم أصول'
            ]
        },
        {
            id: 'cleaning',
            name: 'التنظيف',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'تنظيف منازل',
                'تنظيف مكاتب',
                'تنظيف سجاد',
                'تنظيف نوافذ',
                'تنظيف خزانات',
                'خدمات تنظيف صناعية'
            ]
        },
        {
            id: 'curtains',
            name: 'ستائر',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'ستائر منزلية',
                'ستائر مكتبية',
                'ستائر رول',
                'ستائر فينيسيا',
                'ستائر رومانية',
                'خدمات التركيب'
            ]
        },
        {
            id: 'moving',
            name: 'نقل عفش',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'نقل منازل',
                'نقل مكاتب',
                'نقل أثاث',
                'تغليف أثاث',
                'تخزين أثاث',
                'خدمات التحميل والتفريغ'
            ]
        },
        {
            id: 'furniture',
            name: 'أثاث',
            href: '#',
            hasDropdown: true,
            subcategories: [
                'أثاث غرف نوم',
                'أثاث غرف معيشة',
                'أثاث مطابخ',
                'أثاث مكاتب',
                'أثاث حدائق',
                'أثاث مستعمل'
            ]
        }
    ];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,

    }

    const slides = [
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

    const categories = [
        { name: "Earbuds", icon: <img src={image1} alt="image1" className="w-36 h-36" />, items: 150 },
        { name: "Laptops", icon: <img src={image2} alt="image2" className="w-36 h-36" />, items: 150 },
        { name: "Headphones", icon: <img src={image3} alt="image3" className="w-36 h-36" />, items: 150 },
        { name: "Smart Watches", icon: <img src={image4} alt="image4" className="w-36 h-36" />, items: 150 },
        { name: "Mobiles", icon: <img src={image5} alt="image5" className="w-36 h-36" />, items: 150 },
        { name: "Monitors", icon: <img src={image6} alt="image6" className="w-36 h-36" />, items: 150 },
        { name: "Earbuds", icon: <img src={image1} alt="image1" className="w-36 h-36" />, items: 150 },
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


    // Advertising data for home page
    const homeBusinessCards = [
        {
            id: 1,
            title: "صيانة تكييف مركزي",
            subtitle: "و وحدات - فك وتركيب",
            description: "خدمة سريعة 24 ساعة",
            phone: "98974837",
            bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
            image: productImage,
        },
        {
            id: 2,
            title: "نشتري السيارات",
            subtitle: "الجديدة و المستعملة",
            description: "أفضل الأسعار - سرعة بالتحويل",
            phone: "65888793",
            phone2: "66936886",
            bgColor: "bg-gradient-to-br from-red-500 to-red-700",
            image: productImage,
        },
        {
            id: 3,
            title: "تصليح بكمالة",
            subtitle: "غسالات أوتوماتيك وعادي",
            description: "ثلاجات - في باكستان - في هندي",
            phone: "99741313",
            bgColor: "bg-gradient-to-br from-teal-500 to-blue-600",
            image: productImage,
        },
        {
            id: 4,
            title: "صيانة التكييف المركزي",
            subtitle: "تنظيف جميع أنواع التكييف المركزي والمنزلي من الداخل",
            description: "صيانة وتنظيف تكييف مركزي وصيانة وحدات التكييف وتعبئة غاز",
            phone: "97114270",
            image: productImage,
        },
    ];

    return (
        <>

            {/* Navigation */}
            <nav className="  flex flex-wrap md:flex-nowrap space-x-reverse px-2 md:px-8  relative">
                {navigationCategories.map((category) => (
                    <div
                        key={category.id}
                        className="relative"
                        onMouseEnter={() => setHoveredCategory(category.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        <a
                            href={category.href}
                            className="text-gray-700 hover:text-primary px-1 py-3 md:px-3 md:py-8 flex items-center gap-1 transition-colors duration-300"
                        >
                            {category.name}
                            {category.hasDropdown && (
                                <IoIosArrowDown className={`text-sm transition-transform duration-300 ${hoveredCategory === category.id ? 'rotate-180' : ''}`} />
                            )}
                        </a>

                        {/* Dropdown Menu */}
                        {category.hasDropdown && hoveredCategory === category.id && (
                            <div className="absolute top-3/4 left-1/2 -translate-x-1/2  mt-1 w-32 text-center bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="py-2">
                                    {category.subcategories.map((subcategory, index) => (
                                        <a
                                            key={index}
                                            href="#"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors duration-200"
                                        >
                                            {subcategory}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <Stories />


            <section id="home" className="relative  my-10 ">
                {/* Hero Banner */}
                <div className="relative ">
                    <Slider {...settings}>
                        {slides.map((slide) => (
                            <div key={slide.id} className="relative">
                                <div className="relative h-96 bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden">
                                    <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-right max-w-96">
                                        <h1 className="text-4xl md:text-7xl font-black text-white mb-4 animate-fade-in leading-loose">{slide.title}</h1>
                                    </div>
                                    {/* Logo overlay */}
                                    <div className="absolute bottom-8 left-8 text-white">
                                        <img src={logo} alt="logo" className="w-30 h-20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </section>

            <section className="  py-12 bg-white">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">تسوق حسب الفئات</h2>
                        <p className="text-sm text-gray-500">تسوق احدث المنتجات المميزة المضافة جديد</p>
                    </div>
                    <Link to="/categories" className="flex items-center gap-1 text-sm border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition">
                        عرض الكل
                        <IoIosArrowBack />

                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 overflow-x-auto scrollbar-hide">
                    {categories.map((category, index) => (
                        <div key={index} className="flex flex-col items-center text-center ">
                            <div className="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                {category.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">{category.name}</h3>
                            <p className="text-xs text-gray-500">{category.items} items</p>
                        </div>
                    ))}
                </div>
            </section>


            {/* Advertising Section */}
            <section className="py-6 bg-white">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-primary mb-2">إعلانات مقدمه حاليا</h2>
                            <p className="text-gray-600">خدمات واحترافيين موثوقين</p>
                        </div>
                        <Link to="/advertising" className="flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors duration-300">
                            عرض جميع الإعلانات
                            <IoIosArrowBack />
                        </Link>
                    </div>

                    {/* Business Cards Grid */}
                    <main className=" mx-auto py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {homeBusinessCards.map((card) => (
                                <div key={card.id} className={`rounded-2xl p-6 text-white shadow-lg`}>
                                    <div className="flex flex-col h-full">
                                        {/* Content */}
                                        <div className="flex-1">

                                            {/* Image */}
                                            <div className="mb-4">
                                                <img
                                                    src={card.image || productImage}
                                                    alt={card.title}
                                                    width={200}
                                                    height={120}
                                                    className="rounded-lg object-cover w-full"
                                                />
                                            </div>
                                        </div>


                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors">
                                                <FaWhatsapp size={20} />
                                            </button>
                                            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors">
                                                <BiPhone size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 overflow-x-auto scrollbar-hide">
                    {categories.map((category, index) => (
                        <div key={index} className="flex flex-col items-center text-center ">
                            <div className="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                {category.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">{category.name}</h3>
                            <p className="text-xs text-gray-500">{category.items} items</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* banner */}
            <section className="relative  my-10 ">
                <div className="relative ">

                    <div className="relative">
                        <div className="relative h-96 bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden">
                            <img src={car || "/placeholder.svg"} alt="بيع سيارتك القديمة" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-right max-w-96">
                                <h1 className="text-4xl md:text-7xl font-black text-white mb-4 animate-fade-in leading-loose">بيع سيارتك القديمة</h1>
                            </div>
                            {/* Logo overlay */}
                            <div className="absolute bottom-8 left-8 text-white">
                                <img src={logo} alt="logo" className="w-30 h-20" />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Advertising Section */}
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
                    <main className=" mx-auto py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {homeBusinessCards.map((card) => (
                                <div key={card.id} className={`rounded-2xl p-6 text-white shadow-lg`}>
                                    <div className="flex flex-col h-full">
                                        {/* Content */}
                                        <div className="flex-1">

                                            {/* Image */}
                                            <div className="mb-4">
                                                <img
                                                    src={card.image || productImage}
                                                    alt={card.title}
                                                    width={200}
                                                    height={120}
                                                    className="rounded-lg object-cover w-full"
                                                />
                                            </div>
                                        </div>


                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors">
                                                <FaWhatsapp size={20} />
                                            </button>
                                            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors">
                                                <BiPhone size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </section>


            {/* category */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">الهواتف المحمولة
                            </h2>
                            <p className="text-sm text-gray-500">تسوق احدث المنتجات المميزة المضافة جديد</p>
                        </div>
                        <Link to="/products" className="flex items-center gap-1 text-sm border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition">
                            عرض الكل
                            <IoIosArrowBack />

                        </Link>
                    </div>
                    {/* Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <Link to="/product-details">
                                <article
                                    key={item.id}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition"
                                >
                                    <div className="aspect-[4/3] w-full overflow-hidden">
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="p-4">
                                        <p className="text-primary-600 font-bold text-sm mb-1">
                                            {item.price}
                                        </p>

                                        <h3 className="text-sm font-medium text-gray-900 leading-6 mb-2">
                                            {item.title}
                                        </h3>

                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p>{item.location}</p>
                                            <p>{item.time}</p>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="  py-12 bg-white">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">تسوق حسب الفئات</h2>
                        <p className="text-sm text-gray-500">تسوق احدث المنتجات المميزة المضافة جديد</p>
                    </div>
                    <Link to="/categories" className="flex items-center gap-1 text-sm border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition">
                        عرض الكل
                        <IoIosArrowBack />

                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 overflow-x-auto scrollbar-hide">
                    {categories.slice(0, 5).map((category, index) => (
                        <div key={index} className="flex flex-col items-center text-center ">
                            <div className="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                {category.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800">{category.name}</h3>
                            <p className="text-xs text-gray-500">{category.items} items</p>
                        </div>
                    ))}
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