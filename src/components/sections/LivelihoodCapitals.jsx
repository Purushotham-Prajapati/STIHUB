
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { livelihoodCapitals } from '../../constants/data';

const LivelihoodCapitals = () => (
    <Section>
        <SectionTitle subtitle="Sustainable livelihood solutions tailored for rural communities">
            Livelihood Capitals
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {livelihoodCapitals.map((item, index) => (
                <AnimatedCard key={index} delay={index * 100} className="group">
                    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform group-hover:-translate-y-3">
                        <div className="relative overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        <div className="p-8 text-center">
                            <h4 className="font-bold text-xl text-gray-800 mb-3">{item.title}</h4>
                            <p className="text-gray-600 leading-relaxed">{item.description}</p>

                            <div className="mt-6">
                                <button className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium group-hover:translate-x-1 transition-all duration-300">
                                    <span>Learn More</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </AnimatedCard>
            ))}
        </div>
    </Section>
);

export default LivelihoodCapitals;
