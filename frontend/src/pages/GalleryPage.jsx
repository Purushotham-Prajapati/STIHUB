import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    ZoomIn,
    PlayCircle,
    Video,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Share2,
    Check,
    Play,
    Clock,
    Calendar,
    Film
} from 'lucide-react';
import axios from 'axios';
import Section from '../components/common/Section';
import SectionTitle from '../components/common/SectionTitle';
import AnimatedCard from '../components/ui/AnimatedCard';
import SEO from '../components/seo/SEO';
import ImageCanvas from '../components/ui/ImageCanvas';
import CustomVideoPlayer from '../components/ui/CustomVideoPlayer';

const getApiBase = () => {
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }
    }
    return '/api';
};

const API_BASE = getApiBase();

const getEmbedUrl = (url) => {
    if (!url) return null;
    // YouTube links (watch, share, embed) require an iframe embed
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    return null;
};

const getVideoDirectSrc = (video) => {
    if (!video) return '';
    // YouTube links use the iframe embedUrl instead
    if (video.videoUrl && video.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)) {
        return '';
    }
    // Google Drive hosted videos stream directly via backend range proxy (no transcoding wait)
    if (video.googleDriveFileId) {
        return `${API_BASE}/gallery/stream-drive/${video.googleDriveFileId}`;
    }
    const driveMatch = video.videoUrl?.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
        return `${API_BASE}/gallery/stream-drive/${driveMatch[1]}`;
    }
    // Direct ImageKit / MP4 URL
    return video.videoUrl || '';
};

const GalleryPage = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [dynamicSections, setDynamicSections] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [linkCopied, setLinkCopied] = useState(false);
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

                // Deep-link: automatically open video modal if ?video=<id> in query params
                const params = new URLSearchParams(window.location.search);
                const queryVideoId = params.get('video');
                if (queryVideoId) {
                    const targetVid = galleryRes.data.find(item => item._id === queryVideoId && item.mediaType === 'video');
                    if (targetVid) {
                        setSelectedVideo(targetVid);
                        document.body.style.overflow = 'hidden';
                    }
                }
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
    const allVideos = galleryItems.filter(item => item.mediaType === 'video');

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
        try {
            window.history.replaceState(null, '', `?video=${item._id}`);
        } catch {
            // ignore
        }
    };

    const closeVideoModal = () => {
        setSelectedVideo(null);
        document.body.style.overflow = 'unset';
        try {
            window.history.replaceState(null, '', window.location.pathname);
        } catch {
            // ignore
        }
    };

    // Video navigation controls
    const currentVideoIdx = selectedVideo ? allVideos.findIndex(v => v._id === selectedVideo._id) : -1;
    const handlePrevVideo = () => {
        if (allVideos.length <= 1) return;
        const prevIdx = (currentVideoIdx - 1 + allVideos.length) % allVideos.length;
        openVideoModal(allVideos[prevIdx]);
    };

    const handleNextVideo = () => {
        if (allVideos.length <= 1) return;
        const nextIdx = (currentVideoIdx + 1) % allVideos.length;
        openVideoModal(allVideos[nextIdx]);
    };

    const handleShareVideo = () => {
        if (!selectedVideo) return;
        const shareUrl = `${window.location.origin}${window.location.pathname}?video=${selectedVideo._id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2200);
        }).catch(() => {
            prompt('Copy this link to share:', shareUrl);
        });
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
    const directVideoSrc = selectedVideo ? getVideoDirectSrc(selectedVideo) : null;

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
                    if (!isProjectGallery && sectionImages.length === 0 && !section.content) return null;

                    const sectionSubtitle = isProjectGallery
                        ? "Visual milestones of our journey in transforming lives"
                        : section.title.toLowerCase().includes('video')
                            ? "Watch our community initiatives, impact stories, and field demonstrations"
                            : (section.subtitle || "Updates & Initiatives");

                    return (
                        <Section key={section._id} className={idx === 0 ? "pt-12 pb-4" : "py-8"}>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <SectionTitle subtitle={sectionSubtitle}>
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
                        images.length > 0 && (
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
                        )
                    )).filter(Boolean)
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

                    <div className="relative w-full max-w-7xl max-h-[94vh] flex flex-col lg:flex-row bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mx-4 border border-white/10">

                        {/* Video player or Embed */}
                        <div className="relative flex-grow flex items-center justify-center bg-black lg:w-3/4 min-h-[50vh] lg:min-h-[75vh]">
                            {embedUrl ? (
                                <iframe
                                    src={embedUrl}
                                    title={selectedVideo.title}
                                    className="w-full h-full min-h-[50vh] lg:min-h-[75vh] border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                                    allowFullScreen
                                />
                            ) : (
                                <CustomVideoPlayer
                                    key={selectedVideo._id}
                                    src={directVideoSrc}
                                    poster={selectedVideo.thumbnailUrl || undefined}
                                    title={selectedVideo.title}
                                    autoPlay={true}
                                    onEnded={handleNextVideo}
                                    className="w-full h-full min-h-[50vh] lg:min-h-[75vh]"
                                />
                            )}

                            {/* Previous & Next overlay buttons */}
                            {allVideos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handlePrevVideo(); }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95"
                                        title="Previous Video"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleNextVideo(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95"
                                        title="Next Video"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Sidebar: Details & Playlist */}
                        <div className="lg:w-1/4 bg-gray-900 border-l border-gray-800 p-6 flex flex-col justify-between overflow-y-auto max-h-[42vh] lg:max-h-none scrollbar-thin">
                            <div className="space-y-4">
                                {/* Header badges */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 bg-blue-600/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                                            <Video size={11} /> {selectedVideo.category}
                                        </span>
                                        <span className="text-[11px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                                            {selectedVideo.sectionName || 'Videos'}
                                        </span>
                                    </div>

                                    {/* Share Button */}
                                    <button
                                        type="button"
                                        onClick={handleShareVideo}
                                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all shadow-sm"
                                        title="Share Direct Video Link"
                                    >
                                        {linkCopied ? (
                                            <>
                                                <Check size={13} className="text-green-400" />
                                                <span className="text-green-400 font-bold">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Share2 size={13} />
                                                <span>Share</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-white leading-snug">{selectedVideo.title}</h2>
                                    <div className="w-10 h-0.5 bg-blue-500 rounded-full mt-2 mb-3"></div>
                                    {selectedVideo.description && (
                                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-4">{selectedVideo.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-400 border-y border-gray-800/80 py-2.5">
                                    {selectedVideo.date && (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={13} className="text-gray-500" /> {selectedVideo.date}
                                        </span>
                                    )}
                                    {selectedVideo.videoDuration && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} className="text-gray-500" /> {selectedVideo.videoDuration}
                                        </span>
                                    )}
                                    {selectedVideo.googleDriveFileId && (
                                        <a
                                            href={`https://drive.google.com/file/d/${selectedVideo.googleDriveFileId}/view`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-auto inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            <ExternalLink size={11} /> Drive
                                        </a>
                                    )}
                                </div>

                                {/* Up Next / More Videos Playlist */}
                                {allVideos.length > 1 && (
                                    <div className="pt-2">
                                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                            <span>More Videos ({allVideos.length - 1})</span>
                                            <span className="text-[10px] text-gray-500 font-normal">Click to play</span>
                                        </h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                                            {allVideos.filter(v => v._id !== selectedVideo._id).map(v => (
                                                <div
                                                    key={v._id}
                                                    onClick={() => openVideoModal(v)}
                                                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-white/10 group"
                                                >
                                                    <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-black shrink-0">
                                                        {v.thumbnailUrl ? (
                                                            <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                                <Film size={16} />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Play size={14} fill="white" className="text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-blue-400 transition-colors">{v.title}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                                                            <span>{v.category}</span>
                                                            {v.videoDuration && <span>• {v.videoDuration}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Keyboard Shortcuts Hint */}
                            <div className="mt-4 pt-3 border-t border-gray-800 text-[10px] text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                                <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px] text-gray-400 font-mono">Space</kbd> Play/Pause</span>
                                <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px] text-gray-400 font-mono">← / →</kbd> ±10s</span>
                                <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px] text-gray-400 font-mono">M</kbd> Mute</span>
                                <span><kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px] text-gray-400 font-mono">F</kbd> Fullscreen</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;
