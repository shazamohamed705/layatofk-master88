import React from 'react';

const About = () => {
  const values = [
    {
      icon: "🎯",
      title: "التميز",
      description: "نسعى دائماً للتميز في كل ما نقدمه من خدمات وحلول"
    },
    {
      icon: "🤝",
      title: "الثقة",
      description: "نبنى علاقات طويلة الأمد مبنية على الثقة والشفافية"
    },
    {
      icon: "💡",
      title: "الابتكار",
      description: "نطور حلول مبتكرة ومتطورة لمواجهة التحديات الحديثة"
    },
    {
      icon: "⚡",
      title: "الكفاءة",
      description: "نضمن تقديم خدمات عالية الجودة في الوقت المحدد"
    }
  ];

  const teamStats = [
    { number: "25+", label: "خبير متخصص" },
    { number: "100+", label: "مشروع مكتمل" },
    { number: "98%", label: "رضا العملاء" },
    { number: "24/7", label: "دعم متواصل" }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="text-right">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              من نحن
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              نحن فريق متخصص من الخبراء والمحترفين، نعمل بجد لمساعدة عملائنا في تحقيق أهدافهم وبناء مستقبلهم. 
              لدينا سنوات من الخبرة في مختلف المجالات ونفخر بتقديم خدمات عالية الجودة.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              نؤمن بقوة الابتكار والتطوير المستمر، ونسعى دائماً لتقديم حلول مبتكرة ومتطورة تلبي احتياجات عملائنا 
              وتساعدهم على النمو والتطور في عالم الأعمال التنافسي.
            </p>

            {/* Values */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              {values.map((value, index) => (
                <div key={index} className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {value.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image/Stats */}
          <div className="space-y-8">
            {/* Main Image */}
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-2xl font-bold mb-2">فريق متخصص</h3>
                  <p className="text-blue-100">نعمل معاً لتحقيق النجاح</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl">💪</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {teamStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-6">
              🎯
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">مهمتنا</h3>
            <p className="text-gray-600 leading-relaxed">
              نسعى لتمكين عملائنا من تحقيق أهدافهم من خلال تقديم حلول مبتكرة وخدمات عالية الجودة، 
              مع التركيز على الابتكار والتميز في كل ما نقدمه.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl mb-6">
              👁️
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">رؤيتنا</h3>
            <p className="text-gray-600 leading-relaxed">
              أن نكون الشريك الموثوق به في رحلة نجاح عملائنا، وأن نكون الخيار الأول في مجال الخدمات 
              الاستشارية والحلول الرقمية في المنطقة.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 