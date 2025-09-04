import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {  IoIosSearch } from "react-icons/io"
import phone from '../../assets/phone.png'
import carimage from '../../assets/car.jpg'

function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'phones', name: 'هواتف محمولة' },
    { id: 'cars', name: 'سيارات' },
    { id: 'electronics', name: 'إلكترونيات' },
    { id: 'furniture', name: 'أثاث' },
    { id: 'fashion', name: 'أزياء' }
  ]

  // Sample products data - you can replace with your actual data
  const allProducts = [
    {
      id: 1,
      title: "ايفون 16 برو ماكس 2 شريحه",
      price: "د.ك 12.000",
      location: "الكويت",
      time: "منذ 12 ساعة",
      category: "phones",
      image: phone,
      condition: "جديد"
    },
    {
      id: 2,
      title: "ايفون 15 برو ماكس 256 جيجا",
      price: "د.ك 10.500",
      location: "الكويت",
      time: "منذ يوم واحد",
      category: "phones",
      image: phone,
      condition: "مستعمل"
    },
    {
      id: 3,
      title: "سيارة تويوتا كامري 2023",
      price: "د.ك 8.500",
      location: "الكويت",
      time: "منذ يومين",
      category: "cars",
      image: carimage,
      condition: "جديد"
    },
    {
      id: 4,
      title: "سيارة هوندا سيفيك 2022",
      price: "د.ك 6.200",
      location: "الكويت",
      time: "منذ 3 أيام",
      category: "cars",
      image: carimage,
      condition: "مستعمل"
    },
    {
      id: 5,
      title: "لابتوب ماك بوك برو 14 بوصة",
      price: "د.ك 15.000",
      location: "الكويت",
      time: "منذ 4 أيام",
      category: "electronics",
      image: phone,
      condition: "جديد"
    },
    {
      id: 6,
      title: "طاولة سفرة خشبية كلاسيك",
      price: "د.ك 1.500",
      location: "الكويت",
      time: "منذ أسبوع",
      category: "furniture",
      image: carimage,
      condition: "مستعمل"
    },
    {
      id: 7,
      title: "ساعة آبل ووتش سيريس 9",
      price: "د.ك 2.800",
      location: "الكويت",
      time: "منذ أسبوع",
      category: "electronics",
      image: phone,
      condition: "جديد"
    },
    {
      id: 8,
      title: "جوال سامسونج جالكسي S24",
      price: "د.ك 9.500",
      location: "الكويت",
      time: "منذ أسبوع",
      category: "phones",
      image: phone,
      condition: "جديد"
    }
  ]

  // Filter and search products
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, ''))
      case 'price-high':
        return parseFloat(b.price.replace(/[^\d.]/g, '')) - parseFloat(a.price.replace(/[^\d.]/g, ''))
      case 'newest':
        return new Date(b.time) - new Date(a.time)
      case 'oldest':
        return new Date(a.time) - new Date(b.time)
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen pt-10 pb-10">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">المنتجات</h1>
          <p className="text-gray-600 text-lg">اكتشف مجموعة واسعة من المنتجات المميزة</p>
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
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Link key={product.id} to={`/product-details`}>
              <article className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105">
                {/* Product Image */}
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                  {/* Condition Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      product.condition === 'جديد' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {product.condition}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-primary font-bold text-lg mb-2">
                    {product.price}
                  </p>

                  <h3 className="text-sm font-medium text-gray-900 leading-6 mb-2 line-clamp-2">
                    {product.title}
                  </h3>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{product.location}</p>
                    <p>{product.time}</p>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500">جرب تغيير معايير البحث أو الفلترة</p>
          </div>
        )}

        
      </div>
    </div>
  )
}

export default Products 