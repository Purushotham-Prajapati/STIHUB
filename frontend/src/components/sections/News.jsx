import React, { useState, useEffect } from 'react';
import { Calendar, FileText, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { api } from '../../context/AuthContext';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const { data } = await api.get('/news');
                setNews(data);
            } catch (error) {
                console.error('Fetch news error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const nextSlide = () => {
        if (currentIndex < news.length - 3) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (loading && news.length === 0) return null;

    return (
        <Section className="bg-gray-50 py-12 md:py-16">
            <SectionTitle subtitle="Stay updated with our latest developments and announcements">
                News & Reports
            </SectionTitle>

            <div className="max-w-7xl mx-auto px-4 relative group">
                {/* Carousel Container */}
                <div className="overflow-hidden">
                    <div 
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
                    >
                        {news.map((item, index) => (
                            <div key={item._id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3">
                                <AnimatedCard delay={index * 100} className="h-full">
                                    <article className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden h-full flex flex-col group/card">
                                        <div className="p-6 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                    {item.category}
                                                </span>
                                                <div className="flex items-center text-gray-400 text-xs font-semibold">
                                                    <Calendar size={14} className="mr-1.5" />
                                                    {item.date}
                                                </div>
                                            </div>

                                            <div className='block mb-3'>
                                                <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover/card:text-blue-600 transition-colors line-clamp-2">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                                                {item.description}
                                            </p>

                                            {item.link ? (
                                                <a
                                                    href={item.link} 
                                                    target={item.target || '_blank'}
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-bold group-hover/card:translate-x-1 transition-all duration-300 mt-auto w-fit"
                                                >
                                                    <FileText size={16} />
                                                    <span>Read More</span>
                                                    <ArrowRight size={16} />
                                                </a>
                                            ) : (
                                                <div className="inline-flex items-center space-x-2 text-gray-400 text-sm font-bold mt-auto cursor-default">
                                                    <FileText size={16} />
                                                    <span>Read More</span>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </AnimatedCard>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                {news.length > 3 && (
                    <>
                        <button
                            onClick={prevSlide}
                            disabled={currentIndex === 0}
                            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 p-3 rounded-full bg-white shadow-lg border border-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-all z-10 disabled:opacity-0 disabled:pointer-events-none`}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={currentIndex >= news.length - 3}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 p-3 rounded-full bg-white shadow-lg border border-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-all z-10 disabled:opacity-0 disabled:pointer-events-none`}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>
        </Section>
    );
};

export default News;
