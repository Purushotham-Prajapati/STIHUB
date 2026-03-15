
import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import Section from '../components/common/Section';
import SectionTitle from '../components/common/SectionTitle';
import AnimatedCard from '../components/ui/AnimatedCard';
import SEO from '../components/seo/SEO';

const GalleryPage = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [dynamicSections, setDynamicSections] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [loading, setLoading] = useState(true);

    const gallerySchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://stihub-vnrvjiet.in"
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": "Gallery",
            "item": "https://stihub-vnrvjiet.in/gallery"
        }]
    };

    useEffect(() => {
        const fetchGalleryData = async () => {
            try {
                const [galleryRes, sectionsRes] = await Promise.all([
                    axios.get(import.meta.env.PROD ? '/api/gallery' : 'http://localhost:5000/api/gallery'),
                    axios.get(import.meta.env.PROD ? '/api/sections?targetPage=gallery' : 'http://localhost:5000/api/sections?targetPage=gallery')
                ]);
                setGalleryItems(galleryRes.data);
                setDynamicSections(sectionsRes.data);
            } catch (error) {
                console.error("Error fetching gallery data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGalleryData();
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
    }, [selectedImageIndex, galleryItems.length]);

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

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="pt-24 min-h-screen bg-gray-50">
            <SEO
                title="Gallery - Impact & Initiatives"
                description="Visual journey of STIHUB VNRVJIET's community initiatives, training programs, and sustainable development projects."
                url="/gallery"
                schema={gallerySchema}
            />

            {/* Dynamic Sections */}
            {(() => {
                const groups = galleryItems.reduce((acc, item) => {
                    const key = item.sectionName || 'Project Gallery';
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(item);
                    return acc;
                }, {});

                // Helper to render image grid
                const renderImageGrid = (images) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[250px]">
                        {images.map((item, index) => {
                            const globalIndex = galleryItems.indexOf(item);
                            return (
                                <AnimatedCard
                                    key={item._id}
                                    delay={index * 50}
                                    className={`group relative overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-gray-200 ${index % 5 === 0 ? 'md:col-span-2 md:row-span-2 md:h-[516px]' : 'h-full'}`}
                                >
                                    <div onClick={() => openLightbox(globalIndex)} className="h-full w-full relative">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <span className="inline-block px-2 py-1 bg-blue-500/80 text-white text-xs font-bold rounded mb-2 backdrop-blur-sm">
                                                    {item.category}
                                                </span>
                                                <h3 className="text-white text-lg font-bold leading-tight mb-1">{item.title}</h3>
                                                <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition-colors">
                                                <ZoomIn size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedCard>
                            );
                        })}
                    </div>
                );

                // Synthesize the Project Gallery section and unify
                const unifiedSections = [
                    {
                        _id: 'project-gallery-static',
                        title: 'Project Gallery',
                        content: null,
                        order: 0, // Base order, so append at last (order: 10) goes after it
                        isStatic: true
                    },
                    ...dynamicSections
                ].sort((a, b) => {
                    if (a.order !== b.order) return a.order - b.order;
                    // Tie-breaker: dynamic sections go before static if they have the same order (e.g. Insert First = 0)
                    if (a.isStatic) return 1;
                    if (b.isStatic) return -1;
                    return new Date(a.createdAt) - new Date(b.createdAt);
                });

                return unifiedSections.map((section, idx) => {
                    const sectionImages = groups[section.title] || [];
                    delete groups[section.title]; // Mark as consumed

                    const isProjectGallery = section.isStatic;

                    // Skip the static block if there are absolutely no images for it AND the overall gallery is populated
                    if (isProjectGallery && sectionImages.length === 0 && galleryItems.length > 0) {
                        return null; // Don't show an empty 'Project Gallery' if they moved everything to dynamic sections
                    }

                    return (
                        <Section key={section._id} className={idx === 0 ? "pt-12 pb-4" : "py-8"}>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <SectionTitle subtitle={isProjectGallery ? "Visual milestones of our journey in transforming lives" : "Updates"}>
                                    {section.title}
                                </SectionTitle>

                                {section.content && (
                                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 mt-6 mb-8 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {section.content}
                                    </div>
                                )}

                                {/* If it's the Project Gallery and global items are 0, show empty state */}
                                {isProjectGallery && galleryItems.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 italic text-gray-500 mt-6">
                                        The gallery is currently being curated. Check back soon for updates.
                                    </div>
                                ) : (
                                    /* Render images belonging to this section */
                                    <div className="mt-6">
                                        {sectionImages.length > 0 && renderImageGrid(sectionImages)}
                                    </div>
                                )}
                            </div>
                        </Section>
                    );
                }).filter(Boolean).concat(
                    // Render any leftover groups that didn't have a matching section
                    Object.entries(groups).map(([sectionLabel, images]) => (
                        <Section key={sectionLabel} className="py-8">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 whitespace-nowrap">{sectionLabel}</h3>
                                    <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
                                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                                </div>
                                {renderImageGrid(images)}
                            </div>
                        </Section>
                    ))
                );
            })()}

            {/* Lightbox / Canvas */}
            {selectedImageIndex !== null && currentImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
                    <button
                        onClick={closeLightbox}
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
                                className="max-w-full max-h-[80vh] object-contain"
                            />

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
