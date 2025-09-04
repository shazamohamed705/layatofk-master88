import React from 'react'
import { Link } from 'react-router-dom'
import { IoIosArrowBack } from "react-icons/io"
import image1 from '../../assets/Image1.png'
import image2 from '../../assets/Image2.png'
import image3 from '../../assets/Image3.png'
import image4 from '../../assets/Image4.png'
import image5 from '../../assets/Image5.png'
import image6 from '../../assets/Image6.png'

function Categories() {
  const categories = [
    { 
      id: 'earbuds',
      name: "سماعات لاسلكية", 
      icon: <img src={image1} alt="سماعات لاسلكية" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 150,
      description: "سماعات لاسلكية عالية الجودة بأفضل الأسعار"
    },
    { 
      id: 'laptops',
      name: "لابتوبات", 
      icon: <img src={image2} alt="لابتوبات" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 89,
      description: "لابتوبات جديدة ومستعملة بجميع الماركات"
    },
    { 
      id: 'headphones',
      name: "سماعات رأس", 
      icon: <img src={image3} alt="سماعات رأس" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 234,
      description: "سماعات رأس احترافية للاستماع والمكالمات"
    },
    { 
      id: 'smartwatches',
      name: "ساعات ذكية", 
      icon: <img src={image4} alt="ساعات ذكية" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 67,
      description: "ساعات ذكية متطورة مع أحدث التقنيات"
    },
    { 
      id: 'mobiles',
      name: "هواتف محمولة", 
      icon: <img src={image5} alt="هواتف محمولة" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 456,
      description: "هواتف ذكية جديدة ومستعملة بجميع الماركات"
    },
    { 
      id: 'monitors',
      name: "شاشات", 
      icon: <img src={image6} alt="شاشات" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 123,
      description: "شاشات كمبيوتر بأحجام مختلفة ودقة عالية"
    },
    { 
      id: 'cars',
      name: "سيارات", 
      icon: <img src={image1} alt="سيارات" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 78,
      description: "سيارات جديدة ومستعملة بجميع الماركات"
    },
    { 
      id: 'furniture',
      name: "أثاث", 
      icon: <img src={image2} alt="أثاث" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 345,
      description: "أثاث منزلي ومكتبي بأفضل الأسعار"
    },
    { 
      id: 'fashion',
      name: "أزياء", 
      icon: <img src={image3} alt="أزياء" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 567,
      description: "ملابس وأحذية وإكسسوارات عصرية"
    },
    { 
      id: 'books',
      name: "كتب", 
      icon: <img src={image4} alt="كتب" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 234,
      description: "كتب تعليمية وترفيهية بجميع اللغات"
    },
    { 
      id: 'sports',
      name: "رياضة", 
      icon: <img src={image5} alt="رياضة" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 189,
      description: "معدات رياضية وملابس رياضية"
    },
    { 
      id: 'beauty',
      name: "جمال", 
      icon: <img src={image6} alt="جمال" className="w-20 h-20 md:w-36 md:h-36" />, 
      items: 298,
      description: "مستحضرات تجميل وعناية بالبشرة"
    }
  ]

  return (
    <div className="min-h-screen  pt-10 pb-10">
      <div className=" w-full mx-auto  ">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">الفئات</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            تصفح المنتجات حسب الفئات المختلفة وابحث عن ما تحتاجه بسهولة
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-lg p-2 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Category Icon */}
                <div className="w-20 h-20 md:w-36 md:h-36 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/10 transition-colors duration-300">
                  {category.icon}
                </div>
                
                {/* Category Info */}
                <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors duration-300">
                  {category.name}
                </h3>
                
                <p className="text-sm md:text-base text-gray-500 mb-3 line-clamp-2">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-center gap-2">
                  <span className="text-primary font-bold text-lg md:text-xl">
                    {category.items}
                  </span>
                  <span className="text-gray-500 text-sm md:text-base">منتج</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Categories Section */}
        <div className="mt-16 w-11/12 mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">الفئات المميزة</h2>
            <p className="text-gray-600">اكتشف أكثر الفئات شعبية وطلباً</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.slice(0, 6).map((category, index) => (
              <Link 
                key={`featured-${category.id}`} 
                to={`/products?category=${category.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  {/* Category Image */}
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                      {category.icon}
                    </div>
                  </div>
                  
                  {/* Category Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold text-lg">
                        {category.items} منتج
                      </span>
                      <IoIosArrowBack className="text-primary text-xl group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">إحصائيات الموقع</h2>
            <p className="text-gray-600">أرقام وإحصائيات تعكس نشاط موقعنا</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {categories.reduce((total, cat) => total + cat.items, 0)}
              </div>
              <p className="text-gray-600">إجمالي المنتجات</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {categories.length}
              </div>
              <p className="text-gray-600">عدد الفئات</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                1,234
              </div>
              <p className="text-gray-600">مستخدم نشط</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                5,678
              </div>
              <p className="text-gray-600">صفقة مكتملة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories 