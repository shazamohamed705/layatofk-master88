import React from 'react'
import { BiShield, BiLock, BiUser, BiData, BiCookie } from 'react-icons/bi'
import { GiSecurityGate } from 'react-icons/gi'

function Privacy() {
  const privacySections = [
    {
      icon: <BiShield className="text-3xl" />,
      title: "حماية البيانات",
      content: "نحن نلتزم بحماية خصوصية بياناتك الشخصية وضمان أمانها. نستخدم أحدث التقنيات والمعايير الأمنية لحماية معلوماتك من الوصول غير المصرح به أو الاستخدام الخاطئ."
    },
    {
      icon: <BiLock className="text-3xl" />,
      title: "تشفير البيانات",
      content: "جميع البيانات التي يتم نقلها بين متصفحك وخوادمنا مشفرة باستخدام تقنية SSL/TLS المتقدمة. هذا يضمن أن معلوماتك تبقى آمنة أثناء النقل."
    },
    {
      icon: <BiUser className="text-3xl" />,
      title: "الخصوصية الشخصية",
      content: "نحن نحترم خصوصيتك الشخصية ولن نشارك معلوماتك مع أي طرف ثالث دون موافقتك الصريحة، إلا في الحالات التي يقتضيها القانون."
    }
  ]

  const dataTypes = [
    {
      title: "المعلومات الشخصية",
      items: [
        "الاسم الكامل",
        "عنوان البريد الإلكتروني",
        "رقم الهاتف",
        "عنوان الإقامة"
      ]
    },
    {
      title: "معلومات الحساب",
      items: [
        "اسم المستخدم",
        "كلمة المرور (مشفرة)",
        "تاريخ التسجيل",
        "آخر تسجيل دخول"
      ]
    },
    {
      title: "معلومات الاستخدام",
      items: [
        "تاريخ ووقت الزيارات",
        "الصفحات التي تمت زيارتها",
        "الروابط التي تم النقر عليها",
        "معلومات المتصفح"
      ]
    }
  ]

  const rights = [
    "الحق في الوصول إلى بياناتك الشخصية",
    "الحق في تصحيح البيانات غير الدقيقة",
    "الحق في حذف بياناتك الشخصية",
    "الحق في تقييد معالجة بياناتك",
    "الحق في نقل البيانات",
    "الحق في الاعتراض على المعالجة"
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">سياسة الخصوصية</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            نحن نلتزم بحماية خصوصيتك وضمان أمان بياناتك الشخصية. تعرف على كيفية جمعنا واستخدامنا وحماية معلوماتك.
          </p>
        </div>
         
        {/* Privacy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {privacySections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-primary mb-4 flex justify-center">
                {section.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h3>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Information We Collect */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
                <BiData className="text-2xl" />
                المعلومات التي نجمعها
              </h2>
              <div className="space-y-6">
                {dataTypes.map((type, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{type.title}</h3>
                    <ul className="space-y-2">
                      {type.items.map((item, idx) => (
                        <li key={idx} className="text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">كيفية استخدام معلوماتك</h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  نستخدم المعلومات التي نجمعها للأغراض التالية:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">تقديم خدماتنا وتحسينها</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">التواصل معك بخصوص حسابك أو خدماتنا</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">إرسال تحديثات وإشعارات مهمة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">تحليل استخدام الموقع لتحسين تجربة المستخدم</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">منع الاحتيال وحماية أمن الموقع</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">مشاركة البيانات</h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض تجارية. قد نشارك معلوماتك في الحالات التالية فقط:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">بموافقتك الصريحة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">لتقديم خدماتنا (مثل مزودي الدفع والخدمات السحابية)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">للامتثال للقوانين والأنظمة المعمول بها</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">لحماية حقوقنا وممتلكاتنا أو حقوق وممتلكات الآخرين</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Cookies */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
                <BiCookie className="text-2xl" />
                ملفات تعريف الارتباط (Cookies)
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. هذه الملفات تساعدنا في:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">تذكر تفضيلاتك وإعداداتك</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">تحليل حركة المرور واستخدام الموقع</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">تقديم محتوى مخصص وإعلانات ذات صلة</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">ضمان أمان الموقع ومنع الاحتيال</span>
                  </li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك. يرجى ملاحظة أن تعطيل بعض ملفات تعريف الارتباط قد يؤثر على وظائف الموقع.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rights */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-4">حقوقك</h3>
              <div className="space-y-3">
                {rights.map((right, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600 text-sm">{right}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Measures */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <GiSecurityGate className="text-xl" />
                إجراءات الأمان
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-600 text-sm">تشفير البيانات أثناء النقل والتخزين</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-600 text-sm">مراقبة مستمرة للأنظمة</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-600 text-sm">نسخ احتياطية منتظمة</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-600 text-sm">تحديثات أمنية دورية</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-4">تواصل معنا</h3>
              <p className="text-gray-600 text-sm mb-4">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا:
              </p>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  <strong>البريد الإلكتروني:</strong><br />
                  privacy@laytofak.com
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>الهاتف:</strong><br />
                  +965 1234 5678
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-primary mb-3">ملاحظة مهمة</h3>
          <p className="text-gray-600 leading-relaxed">
            قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية من خلال إرسال إشعار عبر البريد الإلكتروني أو نشر إشعار على موقعنا. نوصي بمراجعة هذه السياسة بانتظام للبقاء على اطلاع بأحدث الممارسات.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Privacy