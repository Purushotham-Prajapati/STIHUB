
import React from 'react';
import { Calendar, FileText, ArrowRight } from 'lucide-react';
import Section from '../common/Section';
import SectionTitle from '../common/SectionTitle';
import AnimatedCard from '../ui/AnimatedCard';
import { newsItems } from '../../constants/data';

const News = () => (
    <Section className="bg-gray-50 py-8 md:py-8">
        <SectionTitle subtitle="Stay updated with our latest developments and announcements">
            News & Reports
        </SectionTitle>

        <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {newsItems.map((item, index) => (
                    <AnimatedCard key={index} delay={index * 100} className="group">
                        <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-300 overflow-hidden h-full flex flex-col">
                            <div className="p-5 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                    <div className="flex items-center text-gray-400 text-xs font-medium">
                                        <Calendar size={12} className="mr-1" />
                                        {item.date}
                                    </div>
                                </div>

                                <a href={item.link} target={item.target} className='hover:underline block mb-2'>
                                    <h3 className="text-base font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                </a>

                                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">{item.excerpt}</p>

                                <a
                                    href={item.link} target={item.target}
                                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-semibold group-hover:translate-x-1 transition-all duration-300 mt-auto"
                                >
                                    <FileText size={14} />
                                    <span>Read More</span>
                                    <ArrowRight size={14} />
                                </a>
                            </div>
                        </article>
                    </AnimatedCard>
                ))}
            </div>
        </div>
    </Section>
);

export default News;
