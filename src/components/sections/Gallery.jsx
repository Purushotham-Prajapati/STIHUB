
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import { galleryImages } from '../../constants/data';

const Gallery = () => {
    const [current, setCurrent] = useState(0);

    const prevSlide = useCallback(() => {
        setCurrent(current === 0 ? galleryImages.length - 1 : current - 1);
    }, [current]);

    const nextSlide = useCallback(() => {
        setCurrent(current === galleryImages.length - 1 ? 0 : current + 1);
    }, [current]);

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 4000); // Changed to 3 seconds
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    return (
        <Section className="bg-gray-50 py-6 md:py-16">
            <SectionTitle subtitle="Capturing moments from our community engagement and project activities">
                Photo Gallery
            </SectionTitle>

            <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl group bg-white p-2">
                <div
                    className="flex transition-transform ease-out duration-700"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {galleryImages.map((img, i) => (
                        <div key={i} className="w-full flex-shrink-0 relative">
                            <div className="aspect-[4/3] md:aspect-[16/9] relative">
                                <img
                                    src={img}
                                    alt={`Gallery item ${i + 1}`}
                                    className="w-full h-full object-contain md:object-cover rounded-xl md:rounded-2xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl md:rounded-2xl"></div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-2 md:left-6 transform -translate-y-1/2 bg-black/40 md:bg-white/20 backdrop-blur-sm text-white p-2 md:p-4 rounded-full opacity-70 md:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110"
                >
                    <ChevronLeft size={20} className="md:w-6 md:h-6" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-2 md:right-6 transform -translate-y-1/2 bg-black/40 md:bg-white/20 backdrop-blur-sm text-white p-2 md:p-4 rounded-full opacity-70 md:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110"
                >
                    <ChevronRight size={20} className="md:w-6 md:h-6" />
                </button>

                <div className="absolute bottom-3 md:bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                        {galleryImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`transition-all duration-300 rounded-full ${current === i
                                        ? 'w-8 md:w-12 h-2 md:h-3 bg-white'
                                        : 'w-2 md:w-3 h-2 md:h-3 bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Gallery;
