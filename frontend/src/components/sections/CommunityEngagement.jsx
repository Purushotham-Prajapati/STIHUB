
import React from 'react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { engagementOutcomes } from '../../constants/data';

const CommunityEngagement = () => (
    <Section id="outcomes" className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 md:py-6">
        <SectionTitle subtitle="Measuring our impact through comprehensive community engagement initiatives ">
            Community Engagement
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-4">
            {engagementOutcomes.map((item, index) => (
                <AnimatedCard key={index} delay={index * 150} className="group">
                    <div className={`relative overflow-hidden rounded-3xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${item.bgGradient} px-6 py-6 md:px-4 md:py-4  text-white min-h-[300px] md:min-h-[200px] flex flex-col justify-between transform group-hover:-translate-y-1`}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0 bg-white transform rotate-12 scale-150 -translate-y-1/2"></div>
                        </div>

                        <div className="relative z-10 text-center flex flex-col h-full">
                            <div className="bg-white/20 backdrop-blur-sm rounded-3xl md:rounded-2xl p-6 md:p-3 mb-6 md:mb-3 inline-block group-hover:scale-103 transition-transform duration-300 mx-auto">
                                <img
                                    src={item.icon}
                                    alt={`${item.title} icon`}
                                    className="w-20 h-20 md:w-12 md:h-12 object-contain mx-auto filter brightness-0 invert"
                                />
                            </div>

                            <h3 className="text-xl md:text-lg font-bold mb-3 md:mb-2 leading-tight text-white line-clamp-2">{item.title}</h3>
                            <p className="text-white/90 text-sm md:text-xs leading-relaxed mb-4 md:mb-0 line-clamp-3">{item.description}</p>
                        </div>
                    </div>
                </AnimatedCard>
            ))}
        </div>
    </Section>
);

export default CommunityEngagement;
