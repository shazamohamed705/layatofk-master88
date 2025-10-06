import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import logo from "../../assets/logo.png";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  // Read user from localStorage on mount and on storage changes
  useEffect(() => {
    const readUser = () => {
      try {
        const raw = localStorage.getItem('user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch (_) {
        setUser(null);
      }
    };
    readUser();
    const onStorage = (e) => {
      if (e.key === 'user' || e.key === 'api_token') readUser();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('api_token');
      localStorage.removeItem('user');
    } catch (_) {}
    // Minimal rerender: update state and redirect
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      {/* Header */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300  border-b border-gray-200  bg-white `}
      >
        <div className=" mx-auto flex items-center justify-between px-4 lg:px-10 py-2">
          {/* Right controls */}
          <div className="flex gap-2 md:gap-4 items-center">
            {/* Post Ad Button */}
            <Link to="/share-ad">
              <button className="block px-1 py-2 md:px-6 md:py-3 text-xs md:text-base font-bold transition-all duration-300 bg-primary text-white border-2 border-primary rounded-lg hover:bg-white hover:text-primary">
                انشر اعلانك
              </button>
            </Link>

            {user ? (
              <div className="relative user-menu-container">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center justify-center w-10 h-10 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
                >
                  {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
                </button>
                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="px-4 py-3 text-sm border-b border-gray-100 text-gray-700 font-medium">
                      <p className="truncate" title={user.email}>{user.email || 'الحساب'}</p>
                    </div>
                    <Link 
                      to="/" 
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      الملف الشخصي
                    </Link>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }} 
                      className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50 text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="block px-1 py-2 md:px-6 md:py-3 text-xs md:text-base  font-bold transition-transform hover:scale-105 border-primary text-primary border-2 rounded-lg">
                    تسجيل الدخول
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Logo & Links Container */}
          <div className="flex items-center gap-5 lg:gap-10">
            {/* Desktop Links */}
            <div className="hidden md:flex gap-4 lg:gap-8 mx-3 lg:mx-9">
              <NavLink to="/contact" className="nav-link" >
                تواصل معنا
              </NavLink>
              <NavLink to="/advertising" className="nav-link" >
                إعلانات تجاريه
              </NavLink>
              <NavLink to="/products" className="nav-link" >
                المنتجات
              </NavLink>
              <NavLink to="/categories" className="nav-link" >
                الفئات
              </NavLink>
              <NavLink to="/" className="nav-link" >
                الرئيسيه
              </NavLink>
            </div>

            {/* Logo */}
            <Link to="/">
              <img
                src={logo}
                alt="Logo"
                className="w-24 h-14 md:w-32"
              />
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <button className="md:hidden text-2xl" onClick={toggleMenu} aria-label="Open menu">
            <FaBars />
          </button>
        </div>
      </nav>

      {/* Overlay when Mobile Menu is Open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/60 z-40"
          onClick={closeMenu}
          aria-label="close menu"
        ></div>
      )}

      {/* Mobile Menu (Sliding from Right) */}
      <div
        className={`fixed top-0 right-0 w-full h-screen bg-white text-primary p-6 z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <button
          className="absolute top-5 left-5 text-2xl  "
          onClick={closeMenu}
          aria-label="close menu"
        >
          <FaTimes />
        </button>

        {/* Mobile Navigation Links */}
        <div className="mt-12 flex flex-col space-y-6 text-lg text-white ">
          <Link to="/" className="text-white nav-link" onClick={closeMenu}  >
            الرئيسيه
          </Link>
          <Link to="/categories" className="text-white nav-link" onClick={closeMenu} >
            الفئات
          </Link>
          <Link to="/products" className="text-white nav-link" onClick={closeMenu} >
            المنتجات
          </Link>
          <NavLink to="/advertising" className="nav-link" >
            إعلانات تجاريه
          </NavLink>
          <Link to="/contact" className="text-white nav-link" onClick={closeMenu} >
            تواصل معنا
          </Link>
          
          {/* Post Ad Button for Mobile */}
          <Link to="/share-ad" onClick={closeMenu}>
            <button className="w-full py-3 px-6 text-base font-bold transition-all duration-300 bg-white text-primary border-2 border-white rounded-lg hover:bg-primary hover:text-white">
              انشر اعلانك
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Header;
