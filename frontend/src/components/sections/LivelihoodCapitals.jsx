
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { livelihoodCapitals } from '../../constants/data';

const LivelihoodCapitals = () => (
    <Section className="py-8 md:py-6">
        <SectionTitle subtitle="Sustainable livelihood solutions tailored for rural communities">
            Livelihood Capitals
        </SectionTitle>

        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-4">
                {livelihoodCapitals.map((item, index) => (
                    <AnimatedCard key={index} delay={index * 100} className="group">
                        <div className="bg-white rounded-3xl md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform group-hover:-translate-y-1 h-full flex flex-col border border-gray-100">
                            <div className="relative overflow-hidden h-64 md:h-40 flex-shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            <div className="p-8 md:p-5 text-center flex flex-col flex-grow">
                                <h4 className="font-bold text-xl md:text-lg text-gray-800 mb-3 md:mb-2 line-clamp-1">{item.title}</h4>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-xs flex-grow line-clamp-3">{item.description}</p>

                                <div className="mt-6 md:mt-3 pt-3 md:pt-0">
                                    <button className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium md:text-sm group-hover:translate-x-1 transition-all duration-300 bg-blue-50 md:bg-transparent px-4 py-2 md:px-0 md:py-0 rounded-lg md:rounded-none">
                                        <span>Learn More</span>
                                        <ArrowRight size={16} className="md:w-3 md:h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </AnimatedCard>
                ))}
            </div>
        </div>
    </Section>
);

export default LivelihoodCapitals;
