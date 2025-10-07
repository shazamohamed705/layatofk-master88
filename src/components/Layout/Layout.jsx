import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../Footer/Footer";
// import ScrollToTop from "../ScrollToTop/ScrollToTop";
// import WhatsappButton from "../WhatsappButton/WhatsappButton";
import Header from "../Header/Header";
import { FiSearch } from "react-icons/fi";
import { useDarkMode } from "../../contexts/DarkModeContext";


function Layout() {
    const { pathname } = useLocation();
    const { darkMode } = useDarkMode();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    
    return (
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} min-h-screen transition-colors duration-300`}>
            <header className="h-20">
                <Header />
            </header>
            <main dir='rtl' className="overflow-hidden w-11/12 mx-auto">
                {/* Search Bar */}
                <div className="relative w-3/4 max-w-3/4 me-auto my-3">
                    <input
                        type="text"
                        placeholder="البحث عن منتجات"
                        className={`w-full border ${darkMode ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'} rounded-full py-2 pl-10 pr-4 text-right text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors`}
                    />
                    <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-lg`} />
                </div>

                <Outlet />
            </main>
            <footer>
                <Footer />
            </footer>
            {/* <ScrollToTop />  */}
        </div>
    );
}

export default Layout;
