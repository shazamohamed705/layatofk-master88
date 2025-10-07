import React from 'react';
import logo from '../../assets/logo.png'
import { Link } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Footer = () => {
  const { darkMode } = useDarkMode();
  
  return (
    <footer className={`${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>

      {/* Footer Links */}
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="text-right">
              <div className="flex items-center mb-4">
                <img src={logo} alt="logo" className=" h-16 w-36" />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                منصة رائدة في بيع وشراء المنتجات المستعملة
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-right">
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>روابط سريعة</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className={`${darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}>الرئيسية</Link></li>
                <li><Link to="/products" className={`${darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}>المنتجات</Link></li>
                <li><Link to="/categories" className={`${darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}>الفئات</Link></li>
                <li><Link to="/contact" className={`${darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}>تواصل معنا</Link></li>
                <li><Link to="/privacy" className={`${darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}>سياسة الخصوصية </Link></li>
                <li><Link to="/blog" className="text-gray-600 hover:text-purple-600 transition-colors">المدونة </Link></li>
              </ul>
            </div>

            {/* Services */}
            <div className="text-right">
              <h3 className="font-semibold text-gray-900 mb-4">الخدمات</h3>
              <ul className="space-y-2 text-sm">
                <li><span  className="text-gray-600 hover:text-purple-600 transition-colors">الإعلانات المميزة</span></li>
                <li> <span  className="text-gray-600 hover:text-purple-600 transition-colors">إعلانات السيارات</span></li>
                <li> <span  className="text-gray-600 hover:text-purple-600 transition-colors">إعلانات العقارات</span></li>  
                <li> <span  className="text-gray-600 hover:text-purple-600 transition-colors">إعلانات الأجهزة</span></li>
                <li> <span  className="text-gray-600 hover:text-purple-600 transition-colors">إعلانات الوظائف</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="text-right">
              <h3 className="font-semibold text-gray-900 mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-600">البريد الإلكتروني: info@laytofak.com</li>
                <li className="text-gray-600">الهاتف: +965 1234 5678</li>
                <li className="text-gray-600">العنوان: الكويت</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 لا يطوفك. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 