
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import ImageCanvas from '../ui/ImageCanvas';
import { api } from '../../context/AuthContext';

const CommunityEngagement = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Canvas State
    const [canvasOpen, setCanvasOpen] = useState(false);
    const [canvasImages, setCanvasImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [canvasLoading, setCanvasLoading] = useState(false);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const { data } = await api.get('/engagement');
                setCards(data);
            } catch (error) {
                console.error("Fetch engagement cards error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    }, []);

    const handleCardClick = async (category) => {
        setCanvasLoading(true);
        try {
            // Fetch images for this category (FIFO is handled by backend sort: {createdAt: 1})
            const { data } = await api.get(`/gallery?category=${category}`);
            if (data.length > 0) {
                setCanvasImages(data);
                setCurrentImageIndex(0);
                setCanvasOpen(true);
            } else {
                alert("This section is still being curated. Please check back later!");
            }
        } catch (error) {
            console.error("Error fetching category images:", error);
        } finally {
            setCanvasLoading(false);
        }
    };

    if (loading && cards.length === 0) return null;

    return (
        <Section id="outcomes" className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 md:py-6">
            <SectionTitle subtitle="Measuring our impact through comprehensive community engagement initiatives ">
                Community Engagement
            </SectionTitle>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-4">
                {cards.map((item, index) => (
                    <AnimatedCard key={item._id} delay={index * 150} className="group">
                        <div 
                            onClick={() => handleCardClick(item.category)}
                            className={`cursor-pointer group relative overflow-hidden rounded-3xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${item.bgGradient} px-6 py-6 md:px-4 md:py-4 text-white min-h-[300px] md:min-h-[200px] flex flex-col justify-between transform group-hover:-translate-y-1`}
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0 bg-white transform rotate-12 scale-150 -translate-y-1/2"></div>
                            </div>

                            <div className="relative z-10 text-center flex flex-col h-full">
                                <div className="bg-white/20 backdrop-blur-sm rounded-3xl md:rounded-2xl p-6 md:p-3 mb-6 md:mb-3 inline-block group-hover:scale-105 transition-transform duration-300 mx-auto">
                                    <img
                                        src={item.iconUrl}
                                        alt={`${item.title} icon`}
                                        className="w-20 h-20 md:w-12 md:h-12 object-contain mx-auto filter brightness-0 invert"
                                    />
                                </div>

                                <h3 className="text-xl md:text-lg font-bold mb-3 md:mb-2 leading-tight text-white line-clamp-2">{item.title}</h3>
                                <p className="text-white/90 text-sm md:text-xs leading-relaxed mb-4 md:mb-0 line-clamp-3">{item.description}</p>
                            </div>
                            
                            {/* Hover Indicator */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                                View Gallery <span>→</span>
                            </div>
                        </div>
                    </AnimatedCard>
                ))}
            </div>

            {/* Reusable Canvas Component */}
            <ImageCanvas 
                isOpen={canvasOpen}
                onClose={() => setCanvasOpen(false)}
                images={canvasImages}
                currentIndex={currentImageIndex}
                setCurrentIndex={setCurrentImageIndex}
                titleText="Engagement Highlights"
            />
            
            {/* Loading Overlay for Canvas fetch */}
            {canvasLoading && (
                <div className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            )}
        </Section>
    );
};

export default CommunityEngagement;
