import React, { useState, useEffect } from 'react';

// Import your gallery images
import gallery1 from '../assets/images/gallery-1.jpg';
import gallery2 from '../assets/images/gallery-2.jpg';
import gallery3 from '../assets/images/gallery-3.jpg';
import gallery4 from '../assets/images/gallery-4.jpg';

const galleryImages = [gallery1, gallery2, gallery3, gallery4];

const PhotoGallery = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = () => {
        const isLastSlide = currentIndex === galleryImages.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? galleryImages.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };
    
    // Auto-play functionality
    useEffect(() => {
        const timer = setInterval(() => {
            goToNext();
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(timer); // Cleanup timer on component unmount
    }, [currentIndex]);


    return (
        <section className="my-8 px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Photo Gallery</h2>
            <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-3xl shadow-2xl" role="region" aria-label="Photo Gallery Carousel">
                <div className="relative w-full h-auto flex transition-transform ease-in-out duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {galleryImages.map((image, index) => (
                        <div key={index} className="w-full flex-shrink-0">
                            <img src={image} alt={`Gallery Image ${index + 1}`} className="w-full h-auto object-cover" loading="lazy" />
                        </div>
                    ))}
                </div>

                {/* Previous Button */}
                <button
                    onClick={goToPrevious}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                    aria-label="Previous Slide"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Next Button */}
                <button
                    onClick={goToNext}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                    aria-label="Next Slide"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <p className="text-center mt-4 text-gray-400 text-sm select-none">Use arrow buttons to navigate</p>
        </section>
    );
};

export default PhotoGallery;