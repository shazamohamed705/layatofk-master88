import React from "react";
import Slider from "react-slick";
import { FiPhoneCall, FiChevronLeft } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import story1 from "../../assets/story1.jpg"
import story2 from "../../assets/story2.jpg"
import story3 from "../../assets/story3.jpg"
import { IoLocation } from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import carimage from '../../assets/car.jpg'
import iconchick from "../../assets/icon.svg"
import icon1 from "../../assets/icon1.png"
import icon2 from "../../assets/icon2.png"
import icon3 from "../../assets/icon3.png"
import icon4 from "../../assets/icon4.png"
import icon5 from "../../assets/icon5.png"
import icon6 from "../../assets/icon6.png"
import mapPlaceholder from "../../assets/mapPlaceholder.png"
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { Link } from "react-router-dom";




const NextArrow = (props) => {
    const { onClick } = props;
    return (
        <div
            onClick={onClick}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-400 text-white p-2 rounded-full cursor-pointer hover:bg-gray-500 z-10"
        >
            <MdArrowForwardIos />
        </div>
    );
};

const PrevArrow = (props) => {
    const { onClick } = props;
    return (
        <div
            onClick={onClick}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-400 text-white p-2 rounded-full cursor-pointer hover:bg-gray-500 z-10"
        >
            <MdArrowBackIosNew />
        </div>
    );
};

function ProductDetails() {
    const images = [
        story1,
        story2,
        story3,
    ];

    const items2 = [
        {
            id: 1,
            img: carimage,
            price: "د.ك 12.000",
            title: "ايفون 16 برو ماكس 2 شريحه",
            location: "الكويت",
            time: "منذ 12 ساعة",
        },
        {
            id: 2,
            img: carimage,
            price: "د.ك 12.000",
            title: "ايفون 16 برو ماكس 2 شريحه",
            location: "الكويت",
            time: "منذ 12 ساعة",
        },
        {
            id: 3,
            img: carimage,
            price: "د.ك 12.000",
            title: "ايفون 16 برو ماكس 2 شريحه",
            location: "الكويت",
            time: "منذ 12 ساعة",
        },
        {
            id: 4,
            img: carimage,
            price: "د.ك 12.000",
            title: "ايفون 16 برو ماكس 2 شريحه",
            location: "الكويت",
            time: "منذ 12 ساعة",
        },
    ];

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    return (
        <>
            <div className="">
                <div className="  mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-6">
                        {/* Image Slider */}
                        <div className="bg-white rounded-lg shadow-sm border p-9 relative">
                            <span className="absolute top-3 right-3 bg-yellow-400 text-xs px-4 py-1 rounded z-10">
                                مميز
                            </span>

                            {/* Slider */}
                            <Slider {...sliderSettings} className="rounded-md  ">
                                {images.map((src, index) => (
                                    <div key={index} className="w-full h-[300px] md:h-[600px]  ">
                                        <img
                                            src={src}
                                            alt={`Car ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </Slider>

                        </div>

                        {/*   Info */}
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden p-4">
                            <h3 className="text-gray-700 font-bold py-4">المعلومات</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {/* Each Item */}
                                {[
                                    { label: "الحالة", value: "مستعمل", icon: icon1 },
                                    { label: "النوع", value: "هيونداي", icon: icon2 },
                                    { label: "موديل", value: "سنتافي", icon: icon6 },
                                    { label: "الفئة", value: "Sport 2.0t", icon: icon3 },
                                    { label: "سنة الصنع", value: "2012", icon: icon4 },
                                    { label: "الكيلومترات", value: "+200,000", icon: icon5 },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className={`flex justify-between items-center rounded-md ${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                                            } p-3`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <img src={item.icon} alt="icon" className="w-5 h-5 flex-shrink-0" />
                                            <p className="text-gray-500 truncate">{item.label}</p>
                                        </div>
                                        <p className="font-medium text-end text-nowrap">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>



                        {/* Description */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="text-gray-700 font-bold mb-3">الوصف</h3>
                            <p className="text-sm text-gray-600 leading-6">
                                جديد ماشين ضمان سنة من تاريخ الفحص. <br />
                                يوم قد يعوب استبدال من تاريخ الشراء. <br />
                                الاستلام والموافقة في مقر الشركة بمجرد تمر. <br />
                                الدفع كاش أو فيزا.
                            </p>
                        </div>

                        {/* الموقع */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="text-gray-700 font-bold mb-3">الموقع</h3>
                            <p className="text-sm text-gray-600 leading-6 mb-2 flex items-center gap-2">
                                <IoLocation /> حلوان ، القاهرة

                            </p>
                            <img src={mapPlaceholder} alt="map" className="w-full h-60 object-cover rounded-md" />
                        </div>
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        {/* Publisher Card */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="font-bold text-gray-700 mb-3">عن الناشر</h3>
                            <div className="">
                                <div className="flex items-center gap-1">
                                    <p className="text-sm font-medium">Grand Mobile</p>
                                    <img src={iconchick} alt="icon" className="w-7 h-7" />
                                </div>
                                <p className="text-xs text-gray-500">عضو منذ 2013</p>

                            </div>
                            <button className="w-full bg-green-500 text-white text-sm rounded-lg py-2 mt-2 flex items-center justify-center gap-2 hover:bg-green-600">
                                <FaWhatsapp /> واتساب
                            </button>
                            {/* Send Message Button */}
                            <button className="w-full bg-blue-500 text-white text-sm rounded-lg py-2 mt-2 flex items-center justify-center gap-2 hover:bg-blue-600">
                                ✉ إرسال رسالة
                            </button>
                        </div>

                        {/* Safety Tips */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="font-extrabold text-gray-700 mb-3">سلامتك تهمنا</h3>
                            <ul className="list-disc pr-5 text-sm text-gray-600 space-y-2">
                                <li>قابل البايع في مكان عام زي المترو أو المولات أو
                                    محطات البنزين</li>
                                <li>خد حد معاك وانت رايح تقابل البايع أو المشتري</li>
                                <li>لا ترسل أموال قبل التأكد من المنتج</li>
                                <li>افحص المنتج جيداً قبل الشراء</li>
                            </ul>
                        </div>

                        {/* Add Ad */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border ">
                            <p className="font-extrabold text-gray-700 mb-3">
                                هل تود إضافة إعلان مماثل؟
                            </p>
                            <button className="w-full border border-gray-300 text-sm rounded-lg py-2 flex items-center justify-between px-3 gap-2 hover:bg-gray-100">
                                أضف إعلانك الآن <FiChevronLeft />
                            </button>
                        </div>

                        {/* Rating */}
                        <button className="w-full bg-green-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-600">
                            أضف تقييم ★
                        </button>
                    </aside>
                </div>
            </div>

            {/* category */}
            <section className="py-12">
                <div className="  mx-auto px-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">السيارات
                            </h2>
                            <p className="text-sm text-gray-500">تسوق احدث المنتجات المميزة المضافة جديد</p>
                        </div>
                        <button className="flex items-center gap-1 text-sm border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition">
                            عرض الكل
                            <IoIosArrowBack />

                        </button>
                    </div>
                    {/* Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {items2.map((item) => (
                            <Link to="/product-details" key={item.id}>
                                <article

                                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition"
                                >
                                    <div className="aspect-[4/3] w-full overflow-hidden">
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="p-4">
                                        <p className="text-primary-600 font-bold text-sm mb-1">
                                            {item.price}
                                        </p>

                                        <h3 className="text-sm font-medium text-gray-900 leading-6 mb-2">
                                            {item.title}
                                        </h3>

                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p>{item.location}</p>
                                            <p>{item.time}</p>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export default ProductDetails;
