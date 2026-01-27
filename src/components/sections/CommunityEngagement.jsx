
import React from 'react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { engagementOutcomes } from '../../constants/data';

const CommunityEngagement = () => (
    <Section id="outcomes" className="bg-gradient-to-br from-gray-50 to-blue-50">
        <SectionTitle subtitle="Measuring our impact through comprehensive community engagement initiatives ">
            Community Engagement Outcomes
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {engagementOutcomes.map((item, index) => (
                <AnimatedCard key={index} delay={index * 150} className="group">
                    <div className={`relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br ${item.bgGradient} px-6 py-2 pt-3 text-white min-h-[300px] flex flex-col justify-between transform group-hover:-translate-y-2`}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0 bg-white transform rotate-12 scale-150 -translate-y-1/2"></div>
                        </div>

                        <div className="relative z-10 text-center">
                            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mb-6 inline-block group-hover:scale-110 transition-transform duration-300">
                                <img
                                    src={item.icon}
                                    alt={`${item.title} icon`}
                                    className="w-20 h-20 object-contain mx-auto filter brightness-0 invert"
                                />
                            </div>

                            <h3 className="text-xl font-bold mb-3 leading-tight">{item.title}</h3>
                            <p className="text-white/90 text-sm leading-relaxed mb-4">{item.description}</p>
                        </div>

                        {/* <div className="relative z-10 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <p className="text-2xl font-bold">{item.stats}</p>
                <p className="text-white/80 text-sm">Achievement</p>
              </div>
            </div> */}
                    </div>
                </AnimatedCard>
            ))}
        </div>
    </Section>
);

export default CommunityEngagement;
