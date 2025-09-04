import React from 'react'
import Slider from 'react-slick'
import { FiPlus } from "react-icons/fi";
import story1 from "../../assets/story1.jpg"
import story2 from "../../assets/story2.jpg"
import story3 from "../../assets/story3.jpg"
import story4 from "../../assets/story4.jpg"
import story5 from "../../assets/story5.jpg"

const categories = [
    { id: 1, img: story1, add: true },
    { id: 2, img: story2 },
    { id: 3, img: story3 },
    { id: 4, img: story4 },
    { id: 5, img: story5 },
    { id: 6, img: story1 },
    { id: 7, img: story2 },
    { id: 8, img: story3 },
    { id: 9, img: story4 },
    { id: 10, img: story5 },
];

function Stories() {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 8,
        slidesToScroll: 1,
        arrows: true,
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 6,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    return (
        <>
            <div dir="rtl" className="w-full me-auto ">
                <Slider {...settings} >
                    {categories.map((cat) => (
                        <div key={cat.id} className="px-2 py-5">
                            <div
                                className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 mx-auto ${
                                    cat.add
                                        ? "border-dashed border-green-500 p-1"
                                        : "border-green-500"
                                } flex items-center justify-center transition-all duration-300 hover:scale-110`}
                            >
                                <img
                                    src={cat.img}
                                    alt="category"
                                    className="w-full h-full object-cover rounded-full"
                                />
                                {cat.add && (
                                    <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1 text-xs">
                                        <FiPlus />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </>
    )
}

export default Stories