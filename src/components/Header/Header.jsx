import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import logo from "../../assets/logo.png";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);


  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

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
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <FiUser className="text-primary" size={18} />
                  <span className="max-w-28 truncate text-sm">{user.name || 'الحساب'}</span>
                </button>
                <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                  <Link to="/" className="block px-4 py-2 text-sm hover:bg-gray-50">الملف الشخصي</Link>
                  <button onClick={handleLogout} className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50">تسجيل الخروج</button>
                </div>
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
              <NavLink to="/blog" className="nav-link" >
                المدونة
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
          <Link to="/blog" className="text-white nav-link" onClick={closeMenu} >
            المدونة
          </Link>
          <NavLink to="/advertising" className="nav-link" >
            إعلانات تجاريه
          </NavLink>
          <Link to="/contact" className="text-white nav-link" onClick={closeMenu} >
            تواصل معنا
          </Link>
        </div>
      </div>
    </>
  );
}

export default Header;
