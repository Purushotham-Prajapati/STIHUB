import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const ImageCanvas = ({ 
    isOpen, 
    onClose, 
    images, 
    currentIndex, 
    setCurrentIndex,
    titleText = "STI HUB Gallery"
}) => {
    
    const navigateImage = useCallback((direction, e) => {
        if (e) e.stopPropagation();
        if (currentIndex === null) return;

        if (direction === 'next') {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        } else {
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    }, [currentIndex, images.length, setCurrentIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') navigateImage('next');
            if (e.key === 'ArrowLeft') navigateImage('prev');
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, navigateImage]);

    if (!isOpen || currentIndex === null || !images[currentIndex]) return null;

    const currentImage = images[currentIndex];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white z-50 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <X size={32} />
            </button>

            <div className="relative w-full max-w-7xl max-h-[90vh] flex flex-col lg:flex-row bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">

                {/* Image Section */}
                <div className="relative flex-grow flex items-center justify-center bg-black lg:w-3/4 min-h-[50vh] lg:min-h-[80vh]">
                    <img
                        src={currentImage.imageUrl}
                        alt={currentImage.title}
                        className="max-w-full max-h-[80vh] object-contain transition-all duration-500"
                        key={currentImage._id}
                    />

                    {images.length > 1 && (
                        <>
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
                        </>
                    )}
                </div>

                {/* Sidebar / Info Canvas */}
                <div className="lg:w-1/4 bg-gray-900 border-l border-gray-800 p-8 flex flex-col justify-between overflow-y-auto max-h-[40vh] lg:max-h-none">
                    <div>
                        <div className="flex items-center space-x-3 text-blue-400 mb-4">
                            <ImageIcon size={20} />
                            <span className="text-sm font-bold tracking-wider uppercase">{currentImage.category}</span>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
                            {currentImage.title}
                        </h2>

                        <div className="w-12 h-1 bg-blue-500 rounded-full mb-6"></div>

                        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                            {currentImage.description}
                        </p>

                        <div className="mt-6 pt-6 border-t border-gray-800 text-gray-500 text-sm">
                            Captured: {currentImage.date || 'Visual Journey'}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center text-sm text-gray-500">
                        <span>{currentIndex + 1} / {images.length}</span>
                        <span className="font-medium">{titleText}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCanvas;
