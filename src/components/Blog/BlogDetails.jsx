import React from 'react';
import {  Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram } from "react-icons/fa";
import blog1 from '../../assets/blog1.avif'
import blog2 from '../../assets/blog2.avif'
import blog3 from '../../assets/blog3.jpg'
import banner from '../../assets/banner.png'
import { IoIosArrowBack } from 'react-icons/io';
const BlogDetails = () => {
  
 
  // Blog data for home page
  const homeBlogPosts = [
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


  // Sample blog data - you can replace this with your actual data
  const blogPost = {
    id: 1,
    title: "كيفية فحص تكييف مستعمل قبل الشراء .. وسعره كام",
    category: "تكييفات ومراوح",
    timeAgo: "16 ساعة مضت",
    author: "أحمد محمد",
    heroImage: blog3, // Using local asset
    content: `
      <div class="mb-8">
        <p class="text-gray-700 leading-relaxed mb-4">
          أسعار التكييفات حاليا بقت عالية، ومع الاحتياج للتكييف لأنه يعتبر من الأساسيات مش رفاهية بسبب درجات الحرارة العالية في مصر، كتير من الناس بيفكروا في شراء تكييف مستعمل بدل الجديد.
        </p>
        <p class="text-gray-700 leading-relaxed mb-4">
          بس لازم تكون حذر جداً وتعرف إزاي تفحص تكييف مستعمل، وفي المقال ده من فورسواب هنقولك خطوات فحص تكييف مستعمل قبل الشراء وسعره للتكييفات المستعملة 2025. وأيضاً إزاي تبيع تكييفات مستعملة أونلاين.
        </p>
      </div>

      <div class="bg-yellow-100 border-r-4 border-yellow-500 p-4 mb-8">
        <p class="text-gray-800 font-medium">
          لو عندك تكييف قديم أو أي جهاز منزلي مستعمل ومش محتاجه تقدر تبيعه أو تبدله على فورسواب، سجل مجاني في اللينك ده وضيف إعلانات فوراً بدون عمولة!
        </p>
      </div>
      <div className="mb-8">
        <img src="${banner}" alt="banner" class="w-full h-auto" />
      </div>

      <div class="mb-8">
        <h2 class="text-xl md:text-3xl font-bold text-gray-800 mb-4">كيفية فحص تكييف مستعمل؟</h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
            <div>
              <h3 class="font-bold text-gray-800 mb-2">التأكد من حالة التكييف</h3>
              <p class="text-gray-700 leading-relaxed">
                تأكد من عدم وجود تآكل أو صدأ أو خدوش في الوحدة الخارجية والداخلية. تأكد من أن التكييف يبرد بشكل جيد ولا يوجد تسريب في الفريون أو مشاكل في الكمبروسر.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
            <div>
              <h3 class="font-bold text-gray-800 mb-2">فحص استهلاك الكهرباء للتكييف المستعمل</h3>
              <p class="text-gray-700 leading-relaxed">
                تحقق من كفاءة استهلاك الطاقة. التكييفات القديمة أقل كفاءة في استهلاك الكهرباء من الموديلات الجديدة.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
            <div>
              <h3 class="font-bold text-gray-800 mb-2">الاستماع إلى صوت التكييف</h3>
              <p class="text-gray-700 leading-relaxed">
                استمع إلى الأصوات غير العادية التي قد تشير إلى مشاكل في المروحة أو الوحدة الداخلية.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">4</span>
            <div>
              <h3 class="font-bold text-gray-800 mb-2">تجربة التبريد في درجات حرارة مختلفة</h3>
              <p class="text-gray-700 leading-relaxed">
                جرب تغيير درجة الحرارة للتأكد من استجابة الوحدة للتغييرات.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">أهم نصائح عند شراء تكييف مستعمل</h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
            <div>
              <h3 class="font-bold text-gray-800 mb-2">اتأكد أن مكيف الهواء المستعمل متوافق مع الإعداد الحالي لمنزلك</h3>
              <p class="text-gray-700 leading-relaxed">
                تأكد من أن حجم الغرفة وقدرة التبريد متوافقان مع احتياجاتك.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
            <div>
              <h3 class="font-bold text-gray-800 mb-2">قارن سعر التكييف المستعمل بالجديد</h3>
              <p class="text-gray-700 leading-relaxed">
                قارن الأسعار ولا تستعجل في الشراء، قد يكون التكييف الجديد أفضل من المستعمل.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">إزاي تبيع تكييف مستعمل أونلاين على فورسواب 2025؟</h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
            <div>
              <p class="text-gray-700 leading-relaxed">سجل على موقع فورسواب أو من خلال الأبليكشن.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
            <div>
              <p class="text-gray-700 leading-relaxed">صور التكييف كويس: خد صور واضحة من كل الزوايا توضح حالتها.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
            <div>
              <p class="text-gray-700 leading-relaxed">اكتب وصف شامل للتكييف: وضّح حالة التكييف بالتفصيل.. الموديل والمواصفات.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">4</span>
            <div>
              <p class="text-gray-700 leading-relaxed">حدد السعر المناسب: شوف أسعار التكييفات المستعملة في السوق واختار سعر تنافسي.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">5</span>
            <div>
              <p class="text-gray-700 leading-relaxed">انشر الإعلان: اختار فئة "تكييفات ومراوح" على فورسواب وضيف إعلانك مجاني.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">6</span>
            <div>
              <p class="text-gray-700 leading-relaxed">تواصل مع المشترين: تابع الرسائل والتعليقات عشان ترد بسرعة وتوصل لأفضل عرض.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">أكتر أسئلة شائعة عن التكييفات المستعملة</h2>
        <div class="space-y-6">
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-bold text-gray-800 mb-2">إزاي أشتري تكييف مستعمل؟</h3>
            <p class="text-gray-700 leading-relaxed">
              تأكد من فحص الكمبروسر والوحدة الداخلية والخارجية وجودة التبريد وصوت الموتور والمواسير والفلتر مع فني متخصص.
            </p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-bold text-gray-800 mb-2">سعر تكييف يونيون إير 1.5 حصان بارد فقط مستعمل كام؟</h3>
            <p class="text-gray-700 leading-relaxed">
              سعر تكييف يونيون إير 1.5 حصان بارد فقط مستعمل في مصر حالياً من 6,000 إلى 9,000 جنيه أو أكثر حسب الحالة وسنة الصنع والبائع.
            </p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-bold text-gray-800 mb-2">ما هي أرخص أسعار التكييف؟</h3>
            <p class="text-gray-700 leading-relaxed">
              أرخص أسعار التكييفات تبدأ من 3,000 جنيه للتكييفات المستعملة و8,000 جنيه للتكييفات الجديدة حسب الماركة والقدرة.
            </p>
          </div>
         
        </div>
      </div>
    `,
    tags: ["تأثيث", "تجديد", "ديكور", "غرف سفرة"]
  };

  // Sample related ads
  const relatedAds = [
    { id: 1, title: "تكييف شارب", price: "17000 جم", image: blog1, location: "القاهرة", time: "منذ ١٤ ساعة" },
    { id: 2, title: "تكييف كارير اوبتماكس ١.٥ حصان بارد", price: "24500 جم", image: blog2, location: "الإسكندرية", time: "منذ ١٦ ساعة" },
    { id: 3, title: "تكييف كارير اوبتماكس ٣ حصان جديد", price: "42500 جم", image: blog3, location: "الجيزة", time: "منذ 17 ساعة" },
    { id: 4, title: "تكييف يورك", price: "20000 جم", image: blog1, location: "القاهرة", time: "منذ 19 ساعة" },
    { id: 5, title: "هاير 1.5 حصان - بارد فقط", price: "21500 جم", image: blog2, location: "الإسكندرية", time: "منذ يوم واحد" }
  ];

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={blogPost.heroImage}
          alt={blogPost.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="inline-block px-4 py-2 rounded-lg bg-orange-500 text-white font-bold mb-2">
              طريقة فحص
            </div>
            <div className="text-2xl font-bold">
              تكييف مستعمل
            </div>
          </div>
        </div>
      </div>

      {/* Main Content and Sidebar */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Blog Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-3 md:p-8">
              {/* Category Tag */}
              <div className="mb-4">
                <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm">
                  {blogPost.category}
                </span>
              </div>

              {/* Blog Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {blogPost.title}
              </h1>

              {/* Publication Time */}
              <p className="text-gray-500 mb-6">
                {blogPost.timeAgo}
              </p>

              {/* Content */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: blogPost.content }}
              />
              <div className="">
                <div class="mt-8 pt-8 border-t border-gray-200">
                  <h3 class="text-lg font-bold text-primary mb-4">شارك المقال:</h3>
                  <div class="flex gap-4 flex-wrap">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors duration-300">
                      <FaFacebookF />  
                    </button>
                    <button class="bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-500 transition-colors duration-300">
                      <FaTwitter />  
                    </button>
                    <button class="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors duration-300">
                      <FaWhatsapp />  
                    </button>
                    <button class="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-600 transition-colors duration-300">
                      <FaInstagram />  
                    </button>
                  </div>
                </div>
              </div>

              {/* Comment Section */}
              <div className="mt-8">
                <button className="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors">
                  اترك تعليق
                </button>
              </div>

               
            </div>
          </div>

          {/* Sidebar - Related Ads */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6">إعلانات ذات صلة</h3>
              <div className="space-y-4">
                {relatedAds.map((ad) => (
                  <Link
                    key={ad.id}
                    to={`/product-details`}
                    className="block group"
                  >
                    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <img
                          src={ad.image}
                          alt={ad.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">{ad.time}</p>
                          <h4 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                            {ad.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-primary font-bold text-sm">
                              {ad.price}
                            </span>
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                              كاش
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Blog Section */}
        <section className="py-12 ">
                <div className="w-full mx-auto ">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-primary mb-2">مقالات ذات صلة</h2>
                         </div>
                        <Link to="/blog" className="flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors duration-300">
                            عرض جميع المقالات
                            <IoIosArrowBack />
                        </Link>
                    </div>

                    {/* Blog Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {homeBlogPosts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.id}`}
                                className="group block"
                            >
                                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
                                    {/* Blog Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />

                                        {/* Overlay with Text */}
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <div className={`inline-block px-3 py-1 rounded-lg ${post.color} text-white font-bold mb-1 text-sm`}>
                                                    {post.shortTitle}
                                                </div>
                                                <div className="text-xs font-medium">
                                                    {post.subtitle}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Blog Info */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                                            <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                                                {post.category}
                                            </span>
                                            <span>{post.timeAgo}</span>
                                        </div>

                                        {/* Blog Title */}
                                        <h3 className="text-base font-bold text-gray-800 leading-tight group-hover:text-primary transition-colors duration-300">
                                            {post.title}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
      </div>
    </div>
  );
};

export default BlogDetails; 