import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { livelihoodCapitals as staticFallback } from '../../constants/data';

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

// Skeleton card for loading state
const SkeletonCard = () => (
    <div className="bg-white rounded-3xl md:rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col animate-pulse">
        <div className="h-64 md:h-40 bg-gray-200 flex-shrink-0" />
        <div className="p-8 md:p-5 flex flex-col flex-grow gap-3">
            <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-8 bg-gray-100 rounded w-28 mx-auto mt-auto" />
        </div>
    </div>
);

const LivelihoodCapitals = () => {
    const [cards, setCards] = useState([]);
    const [sectionHeader, setSectionHeader] = useState({
        title: 'Livelihood Capitals',
        subtitle: 'Sustainable livelihood solutions tailored for rural communities',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLivelihoods = async () => {
            try {
                const res = await fetch(`${API_BASE}/livelihoods`);
                if (!res.ok) throw new Error('API error');
                const data = await res.json();
                // Only show active items
                setCards((data.items || []).filter(item => item.active));
                if (data.header?.title) setSectionHeader(data.header);
            } catch {
                // Graceful fallback to static data
                setCards(staticFallback.map(item => ({
                    ...item,
                    imageUrl: item.image,
                    buttonText: 'Learn More',
                    link: '#',
                    target: '_self',
                    active: true,
                })));
            } finally {
                setLoading(false);
            }
        };
        fetchLivelihoods();
    }, []);

    return (
        <Section className="py-8 md:py-6">
            <SectionTitle subtitle={sectionHeader.subtitle}>
                {sectionHeader.title}
            </SectionTitle>

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-4">
                    {loading ? (
                        // Loading skeletons
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                                <SkeletonCard />
                            </div>
                        ))
                    ) : cards.length === 0 ? (
                        <div className="col-span-4 text-center py-12 text-gray-400 italic">
                            No livelihood capitals to display yet.
                        </div>
                    ) : (
                        cards.map((item, index) => (
                            <AnimatedCard key={item._id || index} delay={index * 100} className="group">
                                <div className="bg-white rounded-3xl md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform group-hover:-translate-y-1 h-full flex flex-col border border-gray-100">
                                    {/* Image */}
                                    <div className="relative overflow-hidden h-64 md:h-40 flex-shrink-0">
                                        <img
                                            src={item.imageUrl || item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 md:p-5 text-center flex flex-col flex-grow">
                                        <h4 className="font-bold text-xl md:text-lg text-gray-800 mb-3 md:mb-2 line-clamp-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-gray-600 leading-relaxed text-sm md:text-xs flex-grow line-clamp-3">
                                            {item.description}
                                        </p>

                                        <div className="mt-6 md:mt-3 pt-3 md:pt-0">
                                            <a
                                                href={item.link || '#'}
                                                target={item.target || '_self'}
                                                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                                                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium md:text-sm group-hover:translate-x-1 transition-all duration-300 bg-blue-50 md:bg-transparent px-4 py-2 md:px-0 md:py-0 rounded-lg md:rounded-none"
                                            >
                                                <span>{item.buttonText || 'Learn More'}</span>
                                                <ArrowRight size={16} className="md:w-3 md:h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedCard>
                        ))
                    )}
                </div>
            </div>
        </Section>
    );
};

export default LivelihoodCapitals;
