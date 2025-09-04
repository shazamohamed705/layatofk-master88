import React, { useState } from 'react'
import productImage from "../../assets/product1.jpg"
import { BiPhone } from 'react-icons/bi'
import { FaWhatsapp } from 'react-icons/fa'
import { IoIosArrowDown } from "react-icons/io";

function Advertising() {
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

    const businessCards = [
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
      ]

  return (
    <>
      <div className="min-h-screen"  >
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="w-full mx-auto px-4">
          <div className="h-16">
            {/* Logo/Title */}
            <div className="px-6 py-2 rounded-full">
              <h1 className="text-3xl font-bold">إعلانات تجارية</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-reverse  relative">
                {navigationCategories.map((category) => (
                    <div 
                        key={category.id}
                        className="relative"
                        onMouseEnter={() => setHoveredCategory(category.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                    >
                        <a 
                            href={category.href} 
                            className="text-gray-700 hover:text-primary px-3 py-8 flex items-center gap-1 transition-colors duration-300"
                        >
                            {category.name}
                            {category.hasDropdown && (
                                <IoIosArrowDown className={`text-sm transition-transform duration-300 ${hoveredCategory === category.id ? 'rotate-180' : ''}`} />
                            )}
                        </a>
                        
                        {/* Dropdown Menu */}
                        {category.hasDropdown && hoveredCategory === category.id && (
                            <div className="absolute top-3/4 left-1/2 -translate-x-1/2  mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
          </div>
        </div>
      </header>

      {/* Business Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 my-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessCards.map((card) => (
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
    </>
  )
}

export default Advertising