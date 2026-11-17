
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Section from '../common/Section';
import { galleryCanvas as fallbackImages } from '../../constants/data';
import { api } from '../../context/AuthContext';

const Gallery = () => {
    const [images, setImages] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchSliderImages = async () => {
        try {
            const { data } = await api.get('/slider-items');
            if (data && data.length > 0) {
                setImages(data.map(item => item.imageUrl));
            } else {
                setImages(fallbackImages);
            }
        } catch (error) {
            console.error('Failed to fetch slider images:', error);
            setImages(fallbackImages);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSliderImages();
    }, []);

    const prevSlide = useCallback(() => {
        setCurrent(current === 0 ? images.length - 1 : current - 1);
    }, [current, images.length]);

    const nextSlide = useCallback(() => {
        setCurrent(current === images.length - 1 ? 0 : current + 1);
    }, [current, images.length]);

    useEffect(() => {
        if (images.length === 0) return;
        const slideInterval = setInterval(nextSlide, 4000);
        return () => clearInterval(slideInterval);
    }, [nextSlide, images.length]);

    if (loading) {
        return (
            <Section className="bg-blue-100 py-6 md:py-6 md:pt-2">
                <div className="max-w-2xl mx-auto h-[400px] bg-white/50 animate-pulse rounded-3xl" />
            </Section>
        );
    }

    return (
        <Section className="bg-blue-100 py-6 md:py-6 md:pt-2">
            <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl group bg-white p-2">
                <div
                    className="flex transition-transform ease-out duration-700"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {images.map((img, i) => (
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
                    className="absolute top-1/2 left-2 md:left-6 transform -translate-y-1/2 bg-black/40 md:bg-white/20 backdrop-blur-sm text-white p-2 md:p-4 rounded-full opacity-70 md:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-105"
                >
                    <ChevronLeft size={20} className="md:w-6 md:h-6" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-2 md:right-6 transform -translate-y-1/2 bg-black/40 md:bg-white/20 backdrop-blur-sm text-white p-2 md:p-4 rounded-full opacity-70 md:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-105"
                >
                    <ChevronRight size={20} className="md:w-6 md:h-6" />
                </button>

                <div className="absolute bottom-3 md:bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                        {images.map((_, i) => (
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

