import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, PlayCircle, Video } from 'lucide-react';
import axios from 'axios';
import Section from '../components/common/Section';
import SectionTitle from '../components/common/SectionTitle';
import AnimatedCard from '../components/ui/AnimatedCard';
import SEO from '../components/seo/SEO';
import ImageCanvas from '../components/ui/ImageCanvas';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const getEmbedUrl = (url) => {
    if (!url) return null;
    // YouTube links (watch, share, embed)
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    // Google Drive links
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    return null;
};

const GalleryPage = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [dynamicSections, setDynamicSections] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);

    const gallerySchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stihub-vnrvjiet.in"
        }, {
            "@type": "ListItem", "position": 2, "name": "Gallery", "item": "https://stihub-vnrvjiet.in/gallery"
        }]
    };

    useEffect(() => {
        const fetchGalleryData = async () => {
            try {
                const [galleryRes, sectionsRes] = await Promise.all([
                    axios.get(`${API_BASE}/gallery`),
                    axios.get(`${API_BASE}/sections?targetPage=gallery`)
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

    // Only image items participate in the image canvas lightbox
    const imageItems = galleryItems.filter(item => item.mediaType !== 'video');

    const openLightbox = (globalIndex) => {
        const item = galleryItems[globalIndex];
        if (item?.mediaType === 'video') return;
        const imageIndex = imageItems.findIndex(img => img._id === item._id);
        setSelectedImageIndex(imageIndex >= 0 ? imageIndex : 0);
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
    };

    const openVideoModal = (item) => {
        setSelectedVideo(item);
        document.body.style.overflow = 'hidden';
    };

    const closeVideoModal = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setSelectedVideo(null);
        document.body.style.overflow = 'unset';
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && selectedVideo) {
                closeVideoModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedVideo]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const embedUrl = selectedVideo ? getEmbedUrl(selectedVideo.videoUrl) : null;

    return (
        <div className="pt-24 min-h-screen bg-gray-50">
            <SEO
                title="Gallery - Impact & Initiatives"
                description="Visual journey of STIHUB VNRVJIET's community initiatives, training programs, and sustainable development projects."
                url="/gallery"
                schema={gallerySchema}
            />

            {/* Gallery Sections */}
            {(() => {
                const groups = galleryItems.reduce((acc, item) => {
                    const key = item.sectionName || 'Project Gallery';
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(item);
                    return acc;
                }, {});

                const renderMediaGrid = (images) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[250px]">
                        {images.map((item, index) => {
                            const isVideo = item.mediaType === 'video';
                            const globalIndex = galleryItems.findIndex(g => g._id === item._id);

                            return (
                                <AnimatedCard
                                    key={item._id}
                                    delay={index * 50}
                                    className={`group relative overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-gray-200 ${index % 5 === 0 ? 'md:col-span-2 md:row-span-2 md:h-[516px]' : 'h-full'}`}
                                >
                                    <div
                                        onClick={() => isVideo ? openVideoModal(item) : openLightbox(globalIndex)}
                                        className="h-full w-full relative"
                                    >
                                        {isVideo ? (
                                            /* ---- VIDEO CARD ---- */
                                            <>
                                                {item.thumbnailUrl ? (
                                                    <img
                                                        src={item.thumbnailUrl}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                                                        <Video size={48} className="text-gray-500" />
                                                    </div>
                                                )}

                                                {/* Play button overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-black/40 group-hover:bg-black/60 transition-all duration-300 rounded-full p-1">
                                                        <PlayCircle
                                                            size={56}
                                                            className="text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
                                                            fill="rgba(255,255,255,0.9)"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                        <span className="inline-block px-2 py-1 bg-blue-500/80 text-white text-xs font-bold rounded mb-2 backdrop-blur-sm">
                                                            {item.category}
                                                        </span>
                                                        <h3 className="text-white text-lg font-bold leading-tight mb-1">{item.title}</h3>
                                                        {item.description && (
                                                            <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* VIDEO badge */}
                                                <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-full">
                                                    <Video size={11} />
                                                    VIDEO
                                                </div>

                                                {/* Duration badge */}
                                                {item.videoDuration && (
                                                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded">
                                                        {item.videoDuration}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            /* ---- IMAGE CARD ---- */
                                            <>
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
                                            </>
                                        )}
                                    </div>
                                </AnimatedCard>
                            );
                        })}
                    </div>
                );

                const unifiedSections = [
                    { _id: 'project-gallery-static', title: 'Project Gallery', content: null, order: 0, isStatic: true },
                    ...dynamicSections
                ].sort((a, b) => {
                    if (a.order !== b.order) return a.order - b.order;
                    if (a.isStatic) return 1;
                    if (b.isStatic) return -1;
                    return new Date(a.createdAt) - new Date(b.createdAt);
                });

                return unifiedSections.map((section, idx) => {
                    const sectionImages = groups[section.title] || [];
                    delete groups[section.title];
                    const isProjectGallery = section.isStatic;

                    if (isProjectGallery && sectionImages.length === 0 && galleryItems.length > 0) return null;

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
                                {isProjectGallery && galleryItems.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 italic text-gray-500 mt-6">
                                        The gallery is currently being curated. Check back soon for updates.
                                    </div>
                                ) : (
                                    <div className="mt-6">
                                        {sectionImages.length > 0 && renderMediaGrid(sectionImages)}
                                    </div>
                                )}
                            </div>
                        </Section>
                    );
                }).filter(Boolean).concat(
                    Object.entries(groups).map(([sectionLabel, images]) => (
                        <Section key={sectionLabel} className="py-8">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 whitespace-nowrap">{sectionLabel}</h3>
                                    <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
                                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{images.length} item{images.length !== 1 ? 's' : ''}</span>
                                </div>
                                {renderMediaGrid(images)}
                            </div>
                        </Section>
                    ))
                );
            })()}

            {/* Lightbox / Canvas Component for Images */}
            <ImageCanvas 
                isOpen={selectedImageIndex !== null}
                onClose={closeLightbox}
                images={imageItems}
                currentIndex={selectedImageIndex}
                setCurrentIndex={setSelectedImageIndex}
            />

            {/* ============================================================
                VIDEO MODAL — supports direct HTML5 player, YouTube & Google Drive embeds
            ============================================================ */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) closeVideoModal(); }}
                >
                    {/* Close button */}
                    <button
                        onClick={closeVideoModal}
                        className="absolute top-5 right-5 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
                        title="Close (Esc)"
                    >
                        <X size={28} />
                    </button>

                    <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col lg:flex-row bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mx-4">

                        {/* Video player or Embed */}
                        <div className="flex-grow flex items-center justify-center bg-black lg:w-3/4 min-h-[50vh] lg:min-h-[75vh]">
                            {embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    title={selectedVideo.title}
                                    className="w-full h-full min-h-[50vh] lg:min-h-[75vh] border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    ref={videoRef}
                                    src={selectedVideo.videoUrl}
                                    controls
                                    autoPlay
                                    playsInline
                                    controlsList="nodownload"
                                    className="max-w-full max-h-[75vh] w-full object-contain focus:outline-none"
                                    onContextMenu={(e) => e.preventDefault()}
                                >
                                    Your browser does not support HTML5 video.
                                </video>
                            )}
                        </div>

                        {/* Sidebar info */}
                        <div className="lg:w-1/4 bg-gray-900 border-l border-gray-800 p-8 flex flex-col justify-between overflow-y-auto max-h-[35vh] lg:max-h-none">
                            <div>
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 text-sm font-bold tracking-wider uppercase text-blue-400">
                                        <Video size={16} />
                                        {selectedVideo.category}
                                    </span>
                                    <span className="px-2 py-0.5 bg-blue-600/80 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                                        VIDEO
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-4 leading-snug">{selectedVideo.title}</h2>
                                <div className="w-12 h-1 bg-blue-500 rounded-full mb-6"></div>

                                {selectedVideo.description && (
                                    <p className="text-gray-300 leading-relaxed text-base">{selectedVideo.description}</p>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-800 space-y-2">
                                    {selectedVideo.date && (
                                        <p className="text-gray-500 text-sm">📅 Date: {selectedVideo.date}</p>
                                    )}
                                    {selectedVideo.videoDuration && (
                                        <p className="text-gray-500 text-sm">⏱ Duration: {selectedVideo.videoDuration}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 p-3 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    💡 <strong className="text-gray-400">Tip:</strong> Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd> or click outside to close.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;
