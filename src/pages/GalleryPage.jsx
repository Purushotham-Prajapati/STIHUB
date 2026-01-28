
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon } from 'lucide-react';
import Section from '../components/common/Section';
import SectionTitle from '../components/common/SectionTitle';
import AnimatedCard from '../components/ui/AnimatedCard';
import { galleryImages } from '../constants/data';

// Extended gallery data with captions (mapping from existing simple array)
const galleryItems = galleryImages.map((img, index) => ({
    id: index,
    src: img,
    title: `Community Initiative ${index + 1}`,
    category: index % 2 === 0 ? 'Outreach' : 'Training',
    description: index % 3 === 0
        ? "Empowering local communities through sustainable technology interventions and capacity building workshops."
        : "Showcasing the impact of our science and technology hub in rural development and skill enhancement.",
    date: "2023-2024"
}));

const GalleryPage = () => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const openLightbox = (index) => {
        setSelectedImageIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
        document.body.style.overflow = 'unset';
    };

    const navigateImage = useCallback((direction, e) => {
        if (e) e.stopPropagation();

        if (selectedImageIndex === null) return;

        if (direction === 'next') {
            setSelectedImageIndex((prev) => (prev + 1) % galleryItems.length);
        } else {
            setSelectedImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
        }
    }, [selectedImageIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedImageIndex === null) return;

            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') navigateImage('next');
            if (e.key === 'ArrowLeft') navigateImage('prev');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, navigateImage]);

    const currentImage = selectedImageIndex !== null ? galleryItems[selectedImageIndex] : null;

    return (
        <div className="pt-24 min-h-screen bg-gray-50">
            <Section className="py-12">
                <SectionTitle subtitle="Visual milestones of our journey in transforming lives">
                    Project Gallery
                </SectionTitle>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[250px]">
                        {galleryItems.map((item, index) => (
                            <AnimatedCard
                                key={item.id}
                                delay={index * 50}
                                className={`group relative overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-gray-200 ${index % 5 === 0 ? 'md:col-span-2 md:row-span-2 md:h-[516px]' : 'h-full'}`}
                            >
                                <div onClick={() => openLightbox(index)} className="h-full w-full relative">
                                    <img
                                        src={item.src}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />

                                    {/* Overlay Effect - Amrita Style */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <span className="inline-block px-2 py-1 bg-blue-500/80 text-white text-xs font-bold rounded mb-2 backdrop-blur-sm">
                                                {item.category}
                                            </span>
                                            <h3 className="text-white text-lg font-bold leading-tight mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-300 text-sm line-clamp-2">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Icon overlay on hover */}
                                    <div className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition-colors">
                                            <ZoomIn size={20} />
                                        </div>
                                    </div>
                                </div>
                            </AnimatedCard>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Lightbox / Canvas */}
            {selectedImageIndex !== null && currentImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 text-white/70 hover:text-white z-50 p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={32} />
                    </button>

                    {/* Main Content Container */}
                    <div className="relative w-full max-w-7xl max-h-[90vh] flex flex-col lg:flex-row bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">

                        {/* Image Section */}
                        <div className="relative flex-grow flex items-center justify-center bg-black lg:w-3/4 min-h-[50vh] lg:min-h-[80vh]">
                            <img
                                src={currentImage.src}
                                alt={currentImage.title}
                                className="max-w-full max-h-[80vh] object-contain"
                            />

                            {/* Navigation Buttons (Overlay on Image) */}
                            <button
                                onClick={(e) => navigateImage('prev', e)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={(e) => navigateImage('next', e)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Sidebar / Message Canvas */}
                        <div className="lg:w-1/4 bg-gray-900 border-l border-gray-800 p-8 flex flex-col justify-between overflow-y-auto max-h-[30vh] lg:max-h-auto">
                            <div>
                                <div className="flex items-center space-x-3 text-blue-400 mb-4">
                                    <ImageIcon size={20} />
                                    <span className="text-sm font-bold tracking-wider uppercase">{currentImage.category}</span>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
                                    {currentImage.title}
                                </h2>

                                <div className="w-12 h-1 bg-blue-500 rounded-full mb-6"></div>

                                <p className="text-gray-300 leading-relaxed text-base">
                                    {currentImage.description}
                                </p>

                                <div className="mt-6 pt-6 border-t border-gray-800 text-gray-500 text-sm">
                                    Captured: {currentImage.date}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between items-center text-sm text-gray-500">
                                <span>{selectedImageIndex + 1} / {galleryItems.length}</span>
                                <span>STI HUB Gallery</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;
