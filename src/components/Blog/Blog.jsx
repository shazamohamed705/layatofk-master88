import React from 'react'
import { Link } from 'react-router-dom';
import blog1 from '../../assets/blog1.avif'
import blog2 from '../../assets/blog2.avif'
import blog3 from '../../assets/blog3.jpg'
function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "إزاي تحول غرفة سفرة مستعملة قديمة لتحفة جديدة",
      shortTitle: "إزاي تحول",
      subtitle: "سفرة مستعملة الجديدة",
      category: "غرف سفرة",
      timeAgo: "4 أيام مضت",
      image: blog1,
      color: "bg-yellow-500"
    },
    {
      id: 2,
      title: "أرخص أماكن لشراء قطع غيار سيارات مستعملة في مصر",
      shortTitle: "أرخص أماكن",
      subtitle: "قطع غيار سيارات مستعملة",
      category: "قطع غيار",
      timeAgo: "3 أيام مضت",
      image: blog2,
      color: "bg-purple-500"
    },
    {
      id: 3,
      title: "كيفية فحص تكييف مستعمل قبل الشراء .. وسعره كام",
      shortTitle: "طريقة فحص",
      subtitle: "تكييف مستعمل",
      category: "تكييفات ومراوح",
      timeAgo: "16 ساعة مضت",
      image: blog3,
      color: "bg-orange-500"
    }
  ];

  return (
    <>
       <div className="min-h-screen   pt-0 pb-10">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">المدونة</h1>
          <p className="text-gray-600 text-lg">اكتشف أحدث المقالات والنصائح المفيدة</p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.id}`}
              className="group block"
            >
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
                {/* Blog Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay with Text */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className={`inline-block px-4 py-2 rounded-lg ${post.color} text-white font-bold mb-2`}>
                        {post.shortTitle}
                      </div>
                      <div className="text-sm font-medium">
                        {post.subtitle}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blog Info */}
                <div className="p-4">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs">
                      {post.category}
                    </span>
                    <span>{post.timeAgo}</span>
                  </div>
                  
                  {/* Blog Title */}
                  <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
       </div>
    </div>
    </>
  )
}

export default Blog